/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { db, auth } from "../config/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  addDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import type {
  GameRoom,
  Player,
  GameAction,
  Ship,
  ShipType,
  Position,
  Debris,
  DebrisType,
  ActionTimeWindow,
  GameLog,
} from "../types/game";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface GameContextType {
  currentRoom: GameRoom | null;
  currentPlayer: Player | null;
  playerRooms: GameRoom[];
  isMyTurn: boolean;
  createRoom: (
    name: string,
    shipType: ShipType,
    actionTimeWindows: ActionTimeWindow[]
  ) => Promise<void>;
  setCurrentRoom: (room: GameRoom | null) => void;
  joinRoom: (roomId: string, shipType: ShipType) => Promise<void>;
  performAction: (action: GameAction) => Promise<void>;
  voteInCouncil: (targetPlayerId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
};

const generateRandomPosition = (
  gridSize: { width: number; height: number },
  occupiedPositions: Position[]
): Position => {
  let position: Position;
  do {
    position = {
      x: Math.floor(Math.random() * gridSize.width),
      y: Math.floor(Math.random() * gridSize.height),
    };
  } while (
    occupiedPositions.some(
      (pos) => pos.x === position.x && pos.y === position.y
    )
  );
  return position;
};

const createDebris = (type: DebrisType, position: Position): Debris => ({
  id: crypto.randomUUID(),
  type,
  position,
  health: type === "asteroid" ? 50 : 30,
});

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const checkGameEnd = async (roomData: GameRoom) => {
    const alivePlayers = roomData.players.filter((player) =>
      roomData.ships.some(
        (ship) => ship.playerId === player.id && ship.health > 0
      )
    );

    // Verificar condição de 4 jogadores restantes
    if (alivePlayers.length <= 4) {
      await updateDoc(doc(db, "rooms", roomData.id!), {
        status: "finished",
      });
      return;
    }

    // Verificar condição de Morte Súbita (todos votaram)
    if (roomData.council?.votes.length === roomData.council?.members.length) {
      const voteCount = new Map<string, number>();

      // Contar votos ponderados
      roomData.council.votes.forEach((vote) => {
        const currentCount = voteCount.get(vote.votedFor) || 0;
        voteCount.set(vote.votedFor, currentCount + vote.voteWeight);
      });

      // Encontrar jogador com mais votos
      let maxVotes = 0;
      let mostVotedPlayer = "";
      voteCount.forEach((votes, playerId) => {
        if (votes > maxVotes) {
          maxVotes = votes;
          mostVotedPlayer = playerId;
        }
      });

      // Eliminar jogador mais votado
      if (mostVotedPlayer) {
        const updatedShips = roomData.ships.map((ship) =>
          ship.playerId === mostVotedPlayer ? { ...ship, health: 0 } : ship
        );

        await updateDoc(doc(db, "rooms", roomData.id!), {
          ships: updatedShips,
          "council.votes": [],
          "council.lastVoteTime": new Date(),
        });
      }
    }
  };

  const voteInCouncil = async (targetPlayerId: string) => {
    if (!currentRoom || !currentPlayer) return;

    // Verificar se o jogador está no conselho
    if (!currentRoom.council?.members.includes(currentPlayer)) {
      toast.error("Apenas membros do Conselho podem votar");
      return;
    }

    // Verificar se já votou
    if (
      currentRoom.council.votes.some((v) => v.playerId === currentPlayer.id)
    ) {
      toast.error("Você já votou nesta rodada");
      return;
    }

    // Calcular peso do voto (primeiro a morrer tem peso 3)
    const voteWeight = currentRoom.council.members[0] === currentPlayer ? 3 : 1;

    const updatedVotes = [
      ...currentRoom.council.votes,
      { playerId: currentPlayer.id, votedFor: targetPlayerId, voteWeight },
    ];

    await updateDoc(doc(db, "rooms", currentRoom.id!), {
      "council.votes": updatedVotes,
    });

    // Verificar condições de fim de jogo após o voto
    await checkGameEnd({
      ...currentRoom,
      council: { ...currentRoom.council, votes: updatedVotes },
    });
  };

  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [playerRooms, setPlayerRooms] = useState<GameRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentPlayer({
          id: user.uid,
          name: user.displayName || "Jogador Anônimo",
          actionPoints: 0,
          ships: [],
          lastPointGain: new Date(),
          isAlive: true,
          votes: 0,
        });
      } else {
        setCurrentPlayer(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentPlayer) {
      const unsubscribeRooms = onSnapshot(
        collection(db, "rooms"),
        (snapshot) => {
          const rooms = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
            createdAt: doc.data().createdAt,
            ships: doc.data().ships || [],
          })) as GameRoom[];

          // Filtrar apenas as salas onde o jogador está participando
          const playerRooms = rooms.filter((room) =>
            room.players.some((player) => player.id === currentPlayer.id)
          );

          setPlayerRooms(playerRooms);
        }
      );

      return () => unsubscribeRooms();
    }
  }, [currentPlayer]);

  const timeWindows = [{ start: "00:00", end: "23:59" }];

  // Liberdade para explorar as possibilidades do jogo referente as naves (trazer diversidade)
  const getShipStats = (
    shipType: ShipType
  ): { health: number; actionPoints: number; reach: number } => {
    switch (shipType) {
      case "destroyer":
        return {
          health: 3,
          actionPoints: 1,
          reach: 2,
        };
      case "scout":
        return {
          health: 3,
          actionPoints: 1,
          reach: 2,
        };
      case "cruiser":
        return {
          health: 3,
          actionPoints: 1,
          reach: 2,
        };
      case "fighter":
        return {
          health: 3,
          actionPoints: 1,
          reach: 2,
        };
      default:
        return {
          health: 3,
          actionPoints: 1,
          reach: 2,
        };
    }
  };

  const createRoom = async (
    name: string,
    shipType: ShipType,
    actionTimeWindows: ActionTimeWindow[]
  ) => {
    if (!currentPlayer) {
      toast.error("Você precisa estar autenticado para criar uma sala");
      return;
    }

    if (!auth.currentUser) {
      toast.error("Aguarde a inicialização da autenticação");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const gridSize = { width: 15, height: 15 };
      const occupiedPositions: Position[] = [];

      // Posicionar nave do jogador aleatoriamente
      const initialPosition = generateRandomPosition(
        gridSize,
        occupiedPositions
      );
      occupiedPositions.push(initialPosition);

      const newShip: Ship = {
        id: crypto.randomUUID(),
        type: shipType,
        position: initialPosition,
        ...getShipStats(shipType),
        playerId: currentPlayer.id,
      };

      // Gerar detritos espaciais aleatórios
      const debris: Debris[] = [];
      const numDebris = Math.floor(Math.random() * 3) + 2; // 2-4 detritos

      for (let i = 0; i < numDebris; i++) {
        const debrisPosition = generateRandomPosition(
          gridSize,
          occupiedPositions
        );
        occupiedPositions.push(debrisPosition);

        const debrisType: DebrisType =
          Math.random() > 0.5 ? "asteroid" : "satellite";
        debris.push(createDebris(debrisType, debrisPosition));
      }

      const roomRef = await addDoc(collection(db, "rooms"), {
        name,
        players: [currentPlayer],
        gridSize,
        status: "waiting",
        createdAt: serverTimestamp(),
        currentTurn: currentPlayer.id,
        ships: [newShip],
        debris,
        actionTimeWindows: timeWindows,
      });

      setCurrentRoom({
        id: roomRef.id,
        name,
        players: [currentPlayer],
        gridSize,
        status: "waiting",
        createdAt: new Date(),
        currentTurn: currentPlayer.id,
        debris,
        ships: [newShip],
        actionTimeWindows,
        council: {
          members: [],
          votes: [],
          lastVoteTime: new Date(),
        },
        logs: [],
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar sala"
      );
      console.error("Erro ao criar sala:", error);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (roomId: string, shipType?: ShipType) => {
    try {
      setLoading(true);
      if (!currentPlayer) throw new Error("No player authenticated");
      if (!shipType) throw new Error("É necessário selecionar uma nave");

      const roomRef = doc(db, "rooms", roomId);
      const roomDoc = await getDoc(roomRef);

      if (!roomDoc.exists()) {
        setError("Room not found");
        return;
      }

      const roomData = roomDoc.data() as GameRoom;

      // Verificar se o jogador já está na sala
      if (!roomData.players.some((player) => player.id === currentPlayer.id)) {
        // Criar nova nave para o jogador se ele não tiver nave na sala
        const gridSize = roomData.gridSize;
        const occupiedPositions = [
          ...(roomData.ships || []).map((ship) => ship.position),
          ...(roomData.debris || []).map((debris) => debris.position),
        ];

        const initialPosition = generateRandomPosition(
          gridSize,
          occupiedPositions
        );

        const newShip: Ship = {
          id: crypto.randomUUID(),
          type: shipType,
          position: initialPosition,
          ...getShipStats(shipType),
          playerId: currentPlayer.id,
        };

        // Atualizar a sala com a nova nave
        const updatedRoom = {
          ...roomData,
          players: [...roomData.players, currentPlayer],
          ships: [...(roomData.ships || []), newShip],
        };

        await updateDoc(roomRef, {
          players: updatedRoom.players,
          ships: updatedRoom.ships,
        });

        // Atualizar o estado local imediatamente
        setCurrentRoom({
          ...updatedRoom,
          id: roomRef.id,
          createdAt: roomData.createdAt,
        });

        // Atualizar o jogador com a nova nave
        await updateDoc(doc(db, "players", currentPlayer.id), {
          ships: arrayUnion(newShip),
        });
      }

      // Configurar listener para atualizações da sala
      const unsubscribe = onSnapshot(roomRef, (snapshot) => {
        if (snapshot.exists()) {
          const updatedRoomData = snapshot.data() as GameRoom;
          setCurrentRoom({
            ...updatedRoomData,
            id: snapshot.id,
            createdAt: updatedRoomData.createdAt,
            ships: updatedRoomData.ships || [],
          });
        } else {
          setError("Room was deleted");
          setCurrentRoom(null);
        }
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Erro ao entrar na sala:", err);
      toast.error(
        err instanceof Error ? err.message : "Falha ao entrar na sala"
      );
    } finally {
      setLoading(false);
    }
  };

  const isWithinActionWindow = (timeWindows: ActionTimeWindow[]): boolean => {
    const now = new Date();
    const currentTime =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");

    return timeWindows.some((window) => {
      return currentTime >= window.start && currentTime <= window.end;
    });
  };

  const createActionLog = (action: GameAction, roomData: GameRoom): GameLog => {
    const ship = roomData.ships.find((s) => s.id === action.shipId);
    let targetId: string | null = null;

    // Garantir que todos os campos tenham valores válidos
    const details: Record<string, unknown> = {};

    if (action.points !== undefined) {
      details.points = action.points;
    }

    if (typeof action.target === "object" && action.target !== null) {
      details.position = action.target;
      const targetPosition = action.target as Position;
      const targetShip = roomData.ships.find(
        (s) =>
          s.position.x === targetPosition.x && s.position.y === targetPosition.y
      );
      const targetDebris = roomData.debris.find(
        (d) =>
          d.position.x === targetPosition.x && d.position.y === targetPosition.y
      );

      if (targetShip) {
        targetId = targetShip.id;
      } else if (targetDebris) {
        targetId = targetDebris.id;
      }
    }

    if (ship?.type) {
      details.type = ship.type;
    }

    return {
      timestamp: new Date(),
      action: action.type,
      playerId: action.playerId,
      targetId: targetId,
      details: Object.keys(details).length > 0 ? details : null,
    };
  };

  const performAction = async (action: GameAction) => {
    try {
      setLoading(true);
      if (!currentRoom) throw new Error("Nenhuma sala ativa");
      if (!currentPlayer) throw new Error("Jogador não autenticado");

      // Verificar se está dentro do horário permitido
      if (!isWithinActionWindow(currentRoom.actionTimeWindows)) {
        throw new Error(
          "Ações só podem ser realizadas nos horários permitidos"
        );
      }

      const roomRef = doc(db, "rooms", currentRoom.id!);
      const roomDoc = await getDoc(roomRef);
      if (!roomDoc.exists()) throw new Error("Sala não encontrada");

      const roomData = roomDoc.data() as GameRoom;
      const ship = roomData.ships.find((s) => s.id === action.shipId);
      if (!ship) throw new Error("Nave não encontrada");
      if (ship.playerId !== currentPlayer.id)
        throw new Error("Esta nave não pertence a você");
      if (ship.actionPoints <= 0) throw new Error("Nave sem pontos de ação");

      const updatedShips = [...roomData.ships];
      const shipIndex = updatedShips.findIndex((s) => s.id === action.shipId);

      // Criar o log da ação antes de executá-la
      const logsToAdd: GameLog[] = [createActionLog(action, roomData)];

      // Atualizar o estado local imediatamente antes de executar a ação
      const updateLocalState = (ships: Ship[]) => {
        setCurrentRoom((prev) =>
          prev
            ? {
                ...prev,
                ships,
              }
            : null
        );
      };

      switch (action.type) {
        case "MOVE": {
          if (!action.target) throw new Error("Posição alvo não especificada");
          const targetPos = action.target as Position;

          // Verificar se o movimento está dentro do alcance da nave
          const xDiff = Math.abs(targetPos.x - ship.position.x);
          const yDiff = Math.abs(targetPos.y - ship.position.y);
          // Usar o maior valor entre xDiff e yDiff para criar um quadrado
          const distance = Math.max(xDiff, yDiff);
          if (distance > ship.reach)
            throw new Error(
              `Movimento inválido: deve estar dentro de ${ship.reach} células de alcance`
            );

          // Verificar se a posição está ocupada
          const isOccupied =
            roomData.ships.some(
              (s) =>
                s.id !== ship.id &&
                s.position.x === targetPos.x &&
                s.position.y === targetPos.y
            ) ||
            roomData.debris.some(
              (d) =>
                d.position.x === targetPos.x && d.position.y === targetPos.y
            );
          if (isOccupied) throw new Error("Posição ocupada");

          updatedShips[shipIndex] = {
            ...ship,
            position: targetPos,
            actionPoints: ship.actionPoints - 1,
          };
          updateLocalState(updatedShips);
          break;
        }
        case "ATTACK": {
          if (!action.target) throw new Error("Alvo não especificado");
          const targetPosition = action.target as Position;

          // Verificar alcance do ataque
          const xDiff = Math.abs(targetPosition.x - ship.position.x);
          const yDiff = Math.abs(targetPosition.y - ship.position.y);
          // Usar o maior valor entre xDiff e yDiff para criar um quadrado
          const attackDistance = Math.max(xDiff, yDiff);
          if (attackDistance > ship.reach)
            throw new Error("Alvo fora de alcance");

          // Procurar por naves ou detritos na posição alvo
          const targetShip = roomData.ships.find(
            (s) =>
              s.position.x === targetPosition.x &&
              s.position.y === targetPosition.y
          );
          const targetDebris = roomData.debris.find(
            (d) =>
              d.position.x === targetPosition.x &&
              d.position.y === targetPosition.y
          );

          if (targetShip) {
            if(targetShip.health <= 0) throw new Error("Nave já destruída");

            const targetIndex = updatedShips.findIndex(
              (s) => s.id === targetShip.id
            );
            updatedShips[targetIndex] = {
              ...targetShip,
              health: Math.max(0, targetShip.health - 1),
            };

            // Se a nave foi destruída
            if (updatedShips[targetIndex].health <= 0) {
              const destroyLog = logsToAdd[0];
              // Adiciona log de destruição
              destroyLog.action = "DESTROY";
              destroyLog.targetId = targetShip.id;

              // Se o alvo destruído tiver pontos de ação, transfira-os
              if (targetShip.actionPoints > 0) {
                const pointsTransferred = targetShip.actionPoints;
                updatedShips[shipIndex].actionPoints += pointsTransferred;

                // Adicionar log de transferência de PA
                const transferLog: GameLog = {
                  timestamp: new Date(),
                  action: "TRANSFER_AP",
                  playerId: currentPlayer.id,
                  targetId: targetShip.playerId,
                  details: {
                    points: pointsTransferred,
                    fromShip: targetShip.id,
                    toShip: ship.id,
                  },
                };
                logsToAdd.push(transferLog);
              }

              // Adicionar jogador ao conselho se for sua última nave
              const targetPlayer = roomData.players.find(
                (player) => player.id === targetShip.playerId
              );
              if (!targetPlayer) throw new Error("Target player not found");
              const hasOtherShips = updatedShips.some(
                (s) =>
                  s.playerId === targetPlayer.id &&
                  s.id !== targetShip.id &&
                  s.health > 0
              );

              if (!hasOtherShips) {
                const updatedRoom = {
                  ...roomData,
                  council: roomData.council || {
                    members: [],
                    votes: [],
                    lastVoteTime: new Date(),
                  },
                };

                if (!updatedRoom.council.members.includes(targetPlayer)) {
                  updatedRoom.council.members.push(targetPlayer);
                  await updateDoc(roomRef, {
                    council: updatedRoom.council,
                  });
                }
              }
            }
          } else if (targetDebris) {
            throw new Error("Ataque não permitido em detritos");
            // const updatedDebris = [...roomData.debris];
            // const debrisIndex = updatedDebris.findIndex(d => d.id === targetDebris.id);
            // updatedDebris[debrisIndex] = {
            //   ...targetDebris,
            //   health: Math.max(0, targetDebris.health - 1)
            // };

            // if (updatedDebris[debrisIndex].health <= 0) {
            //   updatedDebris.splice(debrisIndex, 1);
            // }

            // await updateDoc(roomRef, {
            //   debris: updatedDebris
            // });
          } else {
            throw new Error("Nenhum alvo encontrado na posição");
          }

          updatedShips[shipIndex] = {
            ...ship,
            actionPoints: ship.actionPoints - 1,
          };
          updateLocalState(updatedShips);
          break;
        }
        case "DONATE": {
          if (!action.target) throw new Error("Nave alvo não especificada");
          const targetPosition = action.target as Position;

          const targetShipIndex = updatedShips.findIndex(
            (s) =>
              s.position.x === targetPosition.x &&
              s.position.y === targetPosition.y
          );
          if (targetShipIndex === -1)
            throw new Error("Nave alvo não encontrada");
            
          // Check if player is trying to donate to their own ship
          if (updatedShips[targetShipIndex].playerId === currentPlayer.id) {
            throw new Error("Não é possível doar pontos para suas próprias naves");
          }

          const targetShipForDonation = updatedShips[targetShipIndex];

          const xDiff = Math.abs(targetShipForDonation.position.x - ship.position.x);
          const yDiff = Math.abs(targetShipForDonation.position.y - ship.position.y);
          const donateDistance = Math.max(xDiff, yDiff);
          if (donateDistance > ship.reach)
            throw new Error("Nave alvo fora de alcance para doação");
          updatedShips[targetShipIndex] = {
            ...updatedShips[targetShipIndex],
            actionPoints: updatedShips[targetShipIndex].actionPoints + 1,
          };

          updatedShips[shipIndex] = {
            ...ship,
            actionPoints: ship.actionPoints - 1,
          };
          break;
        }
        case "RECOVER":
          if (ship.actionPoints < 3)
            throw new Error("Pontos de ação insuficientes");
          if (ship.health >= 3) throw new Error("Nave já está com vida máxima");

          updatedShips[shipIndex] = {
            ...ship,
            health: Math.min(3, ship.health + 1),
            actionPoints: ship.actionPoints - 3,
          };
          updateLocalState(updatedShips);
          break;

        case "IMPROVE":
          if (ship.actionPoints < 3)
            throw new Error("Pontos de ação insuficientes");

          updatedShips[shipIndex] = {
            ...ship,
            reach: ship.reach + 1,
            actionPoints: ship.actionPoints - 3,
          };
          updateLocalState(updatedShips);
          break;
      }

      // Atualizar a sala com as novas informações
      await updateDoc(roomRef, {
        ships: updatedShips,
        logs: arrayUnion(...logsToAdd),
      });

      // Verificar condições de fim de jogo após cada ação
      // await checkGameEnd({
      //   ...roomData,
      //   ships: updatedShips
      // });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao executar ação");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentRoom?.id) return;

    const unsubscribe = onSnapshot(doc(db, "rooms", currentRoom.id), (doc) => {
      if (doc.exists()) {
        setCurrentRoom({
          ...(doc.data() as GameRoom),
          id: doc.id,
        });
      }
    });

    return () => unsubscribe();
  }, [currentRoom?.id]);

  const [isDistributing, setIsDistributing] = useState(false);

  const checkAndDistributePoints = async () => {
    if (!currentRoom || isDistributing) return;

    try {
      const roomRef = doc(db, "rooms", currentRoom.id!);
      const roomDoc = await getDoc(roomRef);
      if (!roomDoc.exists()) return;

      const roomData = roomDoc.data() as GameRoom;
      const now = new Date();
      const lastDistribution = roomData.lastPointDistribution
        ? new Date(roomData.lastPointDistribution.seconds * 1000)
        : new Date(0);

      const timeDiff = now.getTime() - lastDistribution.getTime();
      const daysPassed = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      if (daysPassed >= 1) {
        setIsDistributing(true);

        const pointsToDistribute = daysPassed;
        const newLastDistribution = new Date(lastDistribution.getTime() + daysPassed * 24 * 60 * 60 * 1000);

        // Primeiro, atualiza o timestamp da última distribuição
        await updateDoc(roomRef, {
          lastPointDistribution: newLastDistribution,
        });

        // Depois, distribui os pontos
        const updatedShips = roomData.ships.map((ship) => ({
          ...ship,
          actionPoints: ship.actionPoints + pointsToDistribute,
        }));

        const pointDistributionLogs = updatedShips.map((ship) => ({
          timestamp: new Date(),
          action: "POINT_DISTRIBUTION",
          playerId: ship.playerId,
          targetId: null,
          details: {
            points: pointsToDistribute,
            type: ship.type,
          },
        }));

        await updateDoc(roomRef, {
          ships: updatedShips,
          logs: arrayUnion(...pointDistributionLogs),
        });

        toast.success(`${pointsToDistribute} ponto(s) de ação distribuído(s) para todas as naves.`);
      }
    } catch (error) {
      console.error("Erro ao distribuir pontos:", error);
      toast.error("Falha ao distribuir pontos de ação");
    } finally {
      setIsDistributing(false);
    }
  };

  useEffect(() => {
    if (!currentRoom) return;
    checkAndDistributePoints();
  }, [currentRoom]);

  const isMyTurn = currentRoom?.currentTurn === currentPlayer?.id;

  return (
    <GameContext.Provider
      value={{
        currentRoom,
        currentPlayer,
        playerRooms,
        isMyTurn,
        createRoom,
        setCurrentRoom,
        joinRoom,
        performAction,
        voteInCouncil,
        loading,
        error,
      }}
    >
      {children}
      <ToastContainer position="bottom-center" autoClose={5000} />
    </GameContext.Provider>
  );
};
