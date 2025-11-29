/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChange } from "../config/supabase";
import type {
  GameRoom
} from "../types/platform";
import type {
  ShipType,
  DeathSpacePlayer
} from "../types/deathspace";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface GameContextType {
  currentRoom: GameRoom | null;
  currentPlayer: DeathSpacePlayer | null;
  playerRooms: GameRoom[];
  isMyTurn: boolean;
  createRoom: (
    name: string,
    shipType: ShipType
  ) => Promise<void>;
  setCurrentRoom: (room: GameRoom | null) => void;
  joinRoom: () => Promise<void>;
  performAction: () => Promise<void>;
  voteInCouncil: () => Promise<void>;
  sendRoomMessage: () => Promise<void>;
  sendCouncilMessage: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
};



export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<DeathSpacePlayer | null>(null);
  const [playerRooms, setPlayerRooms] = useState<GameRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const isMyTurn = false; // Simplificado para o mock

  const createRoom = async (
    name: string,
    shipType: ShipType
  ) => {
    if (!currentPlayer) {
      toast.error("Você precisa estar logado para criar uma sala");
      return;
    }

    setLoading(true);
    try {
      // Mock implementation - em produção usaria DataService
      const mockRoom: GameRoom = {
        id: crypto.randomUUID(),
        name,
        game_type: 'death_space',
        status: 'waiting',
        max_players: 8,
        current_players: 1,
        host_id: currentPlayer.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        game_state: {
          ships: [{
            id: crypto.randomUUID(),
            playerId: currentPlayer.id,
            type: shipType,
            position: { x: 0, y: 0 },
            health: 100,
            maxHealth: 100,
            actionPoints: 3,
            isAlive: true
          }],
          debris: [],
          council: {
            memberIds: [],
            votes: [],
            lastVoteTime: new Date()
          },
          logs: []
        }
      };
      
      setCurrentRoom(mockRoom);
      setPlayerRooms(prev => [...prev, mockRoom]);
      toast.success("Sala criada com sucesso!");
    } catch (err) {
      console.error("Error creating room:", err);
      toast.error("Erro ao criar sala");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!currentPlayer) {
      toast.error("Você precisa estar logado para entrar em uma sala");
      return;
    }

    setLoading(true);
    try {
      // Mock implementation
      toast.success("Entrou na sala com sucesso!");
    } catch (err) {
      console.error("Error joining room:", err);
      toast.error("Erro ao entrar na sala");
    } finally {
      setLoading(false);
    }
  };

  const performAction = async () => {
    if (!currentRoom || !currentPlayer) return;

    try {
      // Mock implementation
      toast.success("Ação realizada com sucesso!");
    } catch (err) {
      console.error("Error performing action:", err);
      toast.error("Erro ao realizar ação");
    }
  };

  const voteInCouncil = async () => {
    if (!currentRoom || !currentPlayer) return;

    try {
      // Mock implementation
      toast.success("Voto computado com sucesso!");
    } catch (err) {
      console.error("Error voting:", err);
      toast.error("Erro ao votar");
    }
  };

  const sendRoomMessage = async () => {
    if (!currentRoom || !currentPlayer) return;

    try {
      // Mock implementation
      toast.success("Mensagem enviada!");
    } catch (err) {
      console.error("Error sending room message:", err);
      toast.error("Erro ao enviar mensagem na sala.");
    }
  };

  const sendCouncilMessage = async () => {
    if (!currentRoom || !currentPlayer) return;

    try {
      // Mock implementation
      toast.success("Mensagem do conselho enviada!");
    } catch (err) {
      console.error("Error sending council message:", err);
      toast.error("Erro ao enviar mensagem do conselho.");
    }
  };

  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange(async (user) => {
      if (user) {
        // Converter User para DeathSpacePlayer
        const deathSpacePlayer: DeathSpacePlayer = {
          id: user.id,
          name: user.name || "Player",
          email: user.email,
          photo_url: user.photo_url,
          role: user.role || 'member',
          actionPoints: 3,
          ships: [],
          lastPointGain: new Date(),
          isAlive: true,
          votes: 0
        };
        setCurrentPlayer(deathSpacePlayer);
      } else {
        setCurrentPlayer(null);
        setCurrentRoom(null);
        setPlayerRooms([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: GameContextType = {
    currentRoom,
    currentPlayer,
    playerRooms,
    isMyTurn,
    createRoom,
    setCurrentRoom,
    joinRoom,
    performAction,
    voteInCouncil,
    sendRoomMessage,
    sendCouncilMessage,
    loading,
    error,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </GameContext.Provider>
  );
};