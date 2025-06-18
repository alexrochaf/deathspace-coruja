/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { db, auth } from '../config/firebase';
import { collection, doc, getDoc, onSnapshot, addDoc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import type { GameRoom, Player, GameAction, Ship, ShipType, Position, Debris, DebrisType, ActionTimeWindow } from '../types/game';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  loading: boolean;
  error: string | null;
}

export const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};

const generateRandomPosition = (gridSize: { width: number; height: number }, occupiedPositions: Position[]): Position => {
  let position: Position;
  do {
    position = {
      x: Math.floor(Math.random() * gridSize.width),
      y: Math.floor(Math.random() * gridSize.height)
    };
  } while (occupiedPositions.some(pos => pos.x === position.x && pos.y === position.y));
  return position;
};

const createDebris = (type: DebrisType, position: Position): Debris => ({
  id: crypto.randomUUID(),
  type,
  position,
  health: type === 'asteroid' ? 50 : 30
});

export const GameProvider = ({ children }: { children: ReactNode }) => {
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
          name: user.displayName || `Player ${user.uid.slice(0, 4)}`,
          actionPoints: 10,
          ships: [],
          lastPointGain: new Date()
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
        collection(db, 'rooms'),
        (snapshot) => {
          const rooms = snapshot.docs
            .map(doc => ({
              ...doc.data(),
              id: doc.id,
              createdAt: doc.data().createdAt,
              ships: doc.data().ships || []
            })) as GameRoom[];
          
          // Filtrar apenas as salas onde o jogador está participando
          const playerRooms = rooms.filter(room => 
            room.players.includes(currentPlayer.id)
          );
          
          setPlayerRooms(playerRooms);
        }
      );

      return () => unsubscribeRooms();
    }
  }, [currentPlayer]);

  const timeWindows = [
    { start: "00:00", end: "23:59" }
  ];

  const createRoom = async (name: string, shipType: ShipType, actionTimeWindows: ActionTimeWindow[]) => {
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
      
      const gridSize = { width: 10, height: 10 };
      const occupiedPositions: Position[] = [];
  
      // Posicionar nave do jogador aleatoriamente
      const initialPosition = generateRandomPosition(gridSize, occupiedPositions);
      occupiedPositions.push(initialPosition);
  
      const newShip: Ship = {
        id: crypto.randomUUID(),
        type: shipType,
        position: initialPosition,
        health: shipType === 'fighter' ? 80 : 120,
        actionPoints: shipType === 'fighter' ? 3 : 2,
        playerId: currentPlayer.id // Adicionando o ID do jogador à nave
      };
  
      // Gerar detritos espaciais aleatórios
      const debris: Debris[] = [];
      const numDebris = Math.floor(Math.random() * 3) + 2; // 2-4 detritos
  
      for (let i = 0; i < numDebris; i++) {
        const debrisPosition = generateRandomPosition(gridSize, occupiedPositions);
        occupiedPositions.push(debrisPosition);
        
        const debrisType: DebrisType = Math.random() > 0.5 ? 'asteroid' : 'satellite';
        debris.push(createDebris(debrisType, debrisPosition));
      }
  
      const roomRef = await addDoc(collection(db, 'rooms'), {
        name,
        players: [currentPlayer.id],
        gridSize,
        status: 'waiting',
        createdAt: serverTimestamp(),
        currentTurn: currentPlayer.id,
        ships: [newShip],
        debris,
        actionTimeWindows: timeWindows // adicionar os horários de ações
      });
  
      // await updateDoc(doc(db, 'players', currentPlayer.id), {
      //   ships: arrayUnion(newShip)
      // });
  
      setCurrentRoom({
        id: roomRef.id,
        name,
        players: [currentPlayer.id],
        gridSize,
        status: 'waiting',
        createdAt: new Date(),
        currentTurn: currentPlayer.id,
        debris,
        ships: [newShip],
        actionTimeWindows // Adicionar os horários de ações aqui também
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar sala");
      console.error("Erro ao criar sala:", error);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (roomId: string, shipType?: ShipType) => {
    try {
      setLoading(true);
      if (!currentPlayer) throw new Error('No player authenticated');
      if (!shipType) throw new Error('É necessário selecionar uma nave');

      const roomRef = doc(db, 'rooms', roomId);
      const roomDoc = await getDoc(roomRef);

      if (!roomDoc.exists()) {
        setError('Room not found');
        return;
      }

      const roomData = roomDoc.data() as GameRoom;
      
      // Verificar se o jogador já está na sala
      if (!roomData.players.includes(currentPlayer.id)) {
        // Criar nova nave para o jogador se ele não tiver nave na sala
        const gridSize = roomData.gridSize;
        const occupiedPositions = [
          ...(roomData.ships || []).map(ship => ship.position),
          ...(roomData.debris || []).map(debris => debris.position)
        ];

        const initialPosition = generateRandomPosition(gridSize, occupiedPositions);
        
        const newShip: Ship = {
          id: crypto.randomUUID(),
          type: shipType,
          position: initialPosition,
          health: shipType === 'fighter' ? 80 : 120,
          actionPoints: shipType === 'fighter' ? 3 : 2,
          playerId: currentPlayer.id // Adicionar o ID do jogador à nave
        };

        // Atualizar a sala com a nova nave
        const updatedRoom = {
          ...roomData,
          players: [...roomData.players, currentPlayer.id],
          ships: [...(roomData.ships || []), newShip]
        };

        await updateDoc(roomRef, {
          players: updatedRoom.players,
          ships: updatedRoom.ships
        });

        // Atualizar o estado local imediatamente
        setCurrentRoom({
          ...updatedRoom,
          id: roomRef.id,
          createdAt: roomData.createdAt
        });

        // Atualizar o jogador com a nova nave
        await updateDoc(doc(db, 'players', currentPlayer.id), {
          ships: arrayUnion(newShip)
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
            ships: updatedRoomData.ships || []
          });
        } else {
          setError('Room was deleted');
          setCurrentRoom(null);
        }
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Erro ao entrar na sala:', err);
      toast.error(err instanceof Error ? err.message : 'Falha ao entrar na sala');
    } finally {
      setLoading(false);
    }
  };

  const isWithinActionWindow = (timeWindows: ActionTimeWindow[]): boolean => {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                     now.getMinutes().toString().padStart(2, '0');

    return timeWindows.some(window => {
      return currentTime >= window.start && currentTime <= window.end;
    });
  };
  
  const performAction = async (action: GameAction) => {
    try {
      setLoading(true);
      if (!currentRoom) throw new Error('Nenhuma sala ativa');
      if (!currentPlayer) throw new Error('Jogador não autenticado');
      
      // Verificar se está dentro do horário permitido
      if (!isWithinActionWindow(currentRoom.actionTimeWindows)) {
        throw new Error('Ações só podem ser realizadas nos horários permitidos');
      }
      
      const roomRef = doc(db, 'rooms', currentRoom.id);
      const roomDoc = await getDoc(roomRef);
      if (!roomDoc.exists()) throw new Error('Sala não encontrada');
      
      const roomData = roomDoc.data() as GameRoom;
      const ship = roomData.ships.find(s => s.id === action.shipId);
      if (!ship) throw new Error('Nave não encontrada');
      if (ship.playerId !== currentPlayer.id) throw new Error('Esta nave não pertence a você');
      if (ship.actionPoints <= 0) throw new Error('Nave sem pontos de ação');
      
      const updatedShips = [...roomData.ships];
      const shipIndex = updatedShips.findIndex(s => s.id === action.shipId);
      
      // Atualizar o estado local imediatamente antes de executar a ação
      const updateLocalState = (ships: Ship[]) => {
        setCurrentRoom(prev => prev ? {
          ...prev,
          ships
        } : null);
      };
  
      switch (action.type) {
        case 'MOVE':
          if (!action.target) throw new Error('Posição alvo não especificada');
          const targetPos = action.target as Position;
          
          // Check if movement is valid (can move in any direction)
          const xDiff = Math.abs(targetPos.x - ship.position.x);
          const yDiff = Math.abs(targetPos.y - ship.position.y);
          if (xDiff > 1 || yDiff > 1) throw new Error('Invalid movement: must move to an adjacent cell');
          
          // Verificar se a posição está ocupada
          const isOccupied = roomData.ships.some(s => s.id !== ship.id && s.position.x === targetPos.x && s.position.y === targetPos.y) ||
                            roomData.debris.some(d => d.position.x === targetPos.x && d.position.y === targetPos.y);
          if (isOccupied) throw new Error('Posição ocupada');
          
          updatedShips[shipIndex] = {
            ...ship,
            position: targetPos,
            actionPoints: ship.actionPoints - 1
          };
          updateLocalState(updatedShips); // Atualização local imediata
          break;
          
        case 'ATTACK':
          if (!action.target) throw new Error('Alvo não especificado');
          const targetPosition = action.target as Position;
          
          // Verificar alcance do ataque (distância de 1 célula)
          const attackDistance = Math.abs(targetPosition.x - ship.position.x) + Math.abs(targetPosition.y - ship.position.y);
          if (attackDistance > 2) throw new Error('Alvo fora de alcance'); // Aumentado para 2 células de alcance
          
          // Procurar por naves ou detritos na posição alvo
          const targetShip = roomData.ships.find(s => s.position.x === targetPosition.x && s.position.y === targetPosition.y);
          const targetDebris = roomData.debris.find(d => d.position.x === targetPosition.x && d.position.y === targetPosition.y);
          
          if (targetShip) {
            const damage = ship.type === 'fighter' ? 30 : 20;
            const targetIndex = updatedShips.findIndex(s => s.id === targetShip.id);
            updatedShips[targetIndex] = {
              ...targetShip,
              health: Math.max(0, targetShip.health - damage)
            };
          } else if (targetDebris) {
            const damage = ship.type === 'fighter' ? 30 : 20;
            const updatedDebris = [...roomData.debris];
            const debrisIndex = updatedDebris.findIndex(d => d.id === targetDebris.id);
            updatedDebris[debrisIndex] = {
              ...targetDebris,
              health: Math.max(0, targetDebris.health - damage)
            };
            
            if (updatedDebris[debrisIndex].health <= 0) {
              updatedDebris.splice(debrisIndex, 1);
            }
            
            await updateDoc(roomRef, {
              debris: updatedDebris
            });
          } else {
            throw new Error('Nenhum alvo encontrado na posição');
          }
          
          updatedShips[shipIndex] = {
            ...ship,
            actionPoints: ship.actionPoints - 1
          };
          updateLocalState(updatedShips);
          break;
          
        case 'DONATE':
          if (!action.target) throw new Error('Nave alvo não especificada');
          if (!action.points || action.points <= 0) throw new Error('Quantidade de pontos inválida');
          if (action.points > ship.actionPoints) throw new Error('Pontos de ação insuficientes');
          
          const targetShipId = action.target as string;
          const targetShipIndex = updatedShips.findIndex(s => s.id === targetShipId);
          if (targetShipIndex === -1) throw new Error('Nave alvo não encontrada');
          
          const targetShipForDonation = updatedShips[targetShipIndex];
          
          // Verificar se a nave alvo está no alcance (2 células)
          const donateDistance = Math.abs(targetShipForDonation.position.x - ship.position.x) + 
                          Math.abs(targetShipForDonation.position.y - ship.position.y);
          if (donateDistance > 2) throw new Error('Nave alvo fora de alcance para doação');
          
          updatedShips[targetShipIndex] = {
            ...updatedShips[targetShipIndex],
            actionPoints: updatedShips[targetShipIndex].actionPoints + action.points
          };
          
          updatedShips[shipIndex] = {
            ...ship,
            actionPoints: ship.actionPoints - action.points
          };
          break;
      }
      
      // Atualizar a sala com as novas informações
      await updateDoc(roomRef, {
        ships: updatedShips
      });
      
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao executar ação');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentRoom || !currentRoom.id) return;

    const unsubscribe = onSnapshot(doc(db, 'rooms', currentRoom.id), (doc) => {
      if (doc.exists()) {
        setCurrentRoom({
          ...doc.data() as GameRoom,
          id: doc.id
        });
      }
    });

    return () => unsubscribe();
  }, [currentRoom, currentRoom?.id]);


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
        loading,
        error
      }}
    >
      {children}
      <ToastContainer position="bottom-center" autoClose={5000} />
    </GameContext.Provider>
  );
};