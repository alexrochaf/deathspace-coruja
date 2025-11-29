import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChange } from '../config/supabase';
import { MunchkinEngine } from '../engines/munchkin/MunchkinEngine';
import type { MunchkinGameState, MunchkinPlayer, MunchkinActionType } from '../types/munchkin';
import { DataService } from '../services/dataService';
import type { GameRoom, RoomPlayer, ChatMessage } from '../types/platform';
import { toast } from 'react-toastify';

interface MunchkinRoom {
  id: string;
  name: string;
  hostId: string;
  players: MunchkinPlayer[];
  gameState: MunchkinGameState;
  status: 'waiting' | 'playing' | 'finished';
  maxPlayers: number;
  createdAt: string;
  updatedAt: string;
  // Additional fields to match GameRoom
  gameType: 'munchkin';
  currentPlayers: number;
  description?: string;
  settings: Record<string, unknown>;
}

interface MunchkinContextType {
  currentRoom: MunchkinRoom | null;
  currentPlayer: MunchkinPlayer | null;
  availableRooms: MunchkinRoom[];
  gameEngine: MunchkinEngine | null;
  loading: boolean;
  error: string | null;
  chatMessages: ChatMessage[];
  createRoom: (name: string, maxPlayers: number) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  performGameAction: (action: string, data?: Record<string, unknown>) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  loadChatMessages: () => Promise<void>;
}

const MunchkinContext = createContext<MunchkinContextType | null>(null);

export const useMunchkin = () => {
  const context = useContext(MunchkinContext);
  if (!context) {
    throw new Error('useMunchkin must be used within a MunchkinProvider');
  }
  return context;
};

export const MunchkinProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRoom, setCurrentRoom] = useState<MunchkinRoom | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<MunchkinPlayer | null>(null);
  const [availableRooms, setAvailableRooms] = useState<MunchkinRoom[]>([]);
  const [gameEngine, setGameEngine] = useState<MunchkinEngine | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomSubscription, setRoomSubscription] = useState<{ unsubscribe: () => void } | null>(null);
  const [globalSubscription, setGlobalSubscription] = useState<{ unsubscribe: () => void } | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Load chat messages from Supabase
  const loadChatMessages = async () => {
    if (!currentRoom) return;
    
    try {
      const messages = await DataService.getChatMessages(currentRoom.id);
      setChatMessages(messages);
    } catch (err) {
      console.error('Error loading chat messages:', err);
    }
  };

  // Helper function to convert GameRoom to MunchkinRoom
  const convertToMunchkinRoom = async (gameRoom: GameRoom): Promise<MunchkinRoom> => {
    const players = await DataService.getRoomPlayers(gameRoom.id);
    const munchkinPlayers: MunchkinPlayer[] = players.map(convertToMunchkinPlayer);
    
    return {
      id: gameRoom.id,
      name: gameRoom.name,
      hostId: gameRoom.created_by,
      players: munchkinPlayers,
      gameState: gameRoom.game_state as MunchkinGameState,
      status: gameRoom.status,
      maxPlayers: gameRoom.max_players,
      createdAt: gameRoom.created_at,
      updatedAt: gameRoom.updated_at,
      gameType: 'munchkin',
      currentPlayers: gameRoom.current_players,
      description: gameRoom.description,
      settings: gameRoom.settings as Record<string, unknown>
    };
  };

  // Helper function to convert RoomPlayer to MunchkinPlayer
  const convertToMunchkinPlayer = (roomPlayer: RoomPlayer): MunchkinPlayer => {
    const playerData = roomPlayer.player_data as Record<string, unknown> || {};
    
    // Ensure hand structure is always properly initialized
    const hand = playerData.hand && typeof playerData.hand === 'object' && playerData.hand.door && playerData.hand.treasure
      ? {
          door: Array.isArray(playerData.hand.door) ? playerData.hand.door : [],
          treasure: Array.isArray(playerData.hand.treasure) ? playerData.hand.treasure : []
        }
      : { door: [], treasure: [] };
    
    return {
      id: roomPlayer.user_id,
      name: playerData.name || 'Jogador',
      level: playerData.level || 1,
      combatPower: playerData.combatPower || 1,
      runAwayPower: playerData.runAwayPower || 1,
      hand,
      equippedItems: playerData.equippedItems || {
        headgear: null,
        armor: null,
        footgear: null,
        oneHandItems: [],
        twoHandItem: null
      },
      class: playerData.class || null,
      race: playerData.race || null,
      gender: playerData.gender || 'male',
      temporaryBonuses: playerData.temporaryBonuses || [],
      isAlive: playerData.isAlive ?? true
    };
  };

  // Load available rooms from Supabase
  const loadAvailableRooms = async () => {
    try {
      setLoading(true);
      const rooms = await DataService.getGameRooms('munchkin', 'waiting');
      const munchkinRooms: MunchkinRoom[] = await Promise.all(
        rooms.map(convertToMunchkinRoom)
      );
      setAvailableRooms(munchkinRooms);
    } catch (err) {
      console.error('Error loading rooms:', err);
      setError('Erro ao carregar salas');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is already in a room and reconnect
  const checkAndReconnectToRoom = async (userId: string) => {
    try {
      // Get all rooms where user is a player
      const allRooms = await DataService.getGameRooms('munchkin');
      
      for (const room of allRooms) {
        const players = await DataService.getRoomPlayers(room.id);
        const userInRoom = players.find(p => p.user_id === userId);
        
        if (userInRoom) {
          // User is in this room, reconnect
          const munchkinPlayers: MunchkinPlayer[] = players.map(convertToMunchkinPlayer);
          
          const reconnectingRoom: MunchkinRoom = {
            id: room.id,
            name: room.name,
            hostId: room.created_by,
            players: munchkinPlayers,
            gameState: room.game_state as MunchkinGameState,
            status: room.status as 'waiting' | 'playing' | 'finished',
            maxPlayers: room.max_players,
            createdAt: room.created_at,
            updatedAt: room.updated_at,
            gameType: 'munchkin',
            currentPlayers: room.current_players,
            description: room.description,
            settings: room.settings as Record<string, unknown>
          };
          
          setCurrentRoom(reconnectingRoom);
          
          // Ensure hostId is preserved in gameState during reconnection
          const gameStateWithHost = {
            ...reconnectingRoom.gameState,
            hostId: reconnectingRoom.gameState.hostId || room.created_by
          };
          
          const engine = new MunchkinEngine(room.id, gameStateWithHost);
          setGameEngine(engine);
          
          // Subscribe to room updates
          const subscription = DataService.subscribeToRoom(room.id, handleRoomUpdate);
          setRoomSubscription(subscription);
          
          // Load chat messages for the room
          await loadChatMessages();
          
          toast.success('Reconectado automaticamente à sala!');
          return; // Exit after reconnecting to first found room
        }
      }
    } catch (err) {
      console.error('Error checking for existing room:', err);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange(async (user) => {
      if (user) {
        const munchkinPlayer: MunchkinPlayer = {
          id: user.id,
          name: user.name || user.email || 'Jogador',
          level: 1,
          combatPower: 1,
          runAwayPower: 1,
          hand: { door: [], treasure: [] },
          equippedItems: {
            headgear: null,
            armor: null,
            footgear: null,
            oneHandItems: [],
            twoHandItem: null
          },
          class: null,
          race: null,
          gender: 'male',
          temporaryBonuses: [],
          isAlive: true
        };
        setCurrentPlayer(munchkinPlayer);
        
        // Check if user is already in a room and reconnect
        await checkAndReconnectToRoom(user.id);
      } else {
        setCurrentPlayer(null);
        setCurrentRoom(null);
        setGameEngine(null);
      }
    });

    loadAvailableRooms();

    // Setup global subscription for all Munchkin rooms
    console.log('Setting up global subscription in useEffect...');
    const globalSub = DataService.subscribeToMunchkinRooms(handleGlobalRoomUpdate);
    setGlobalSubscription(globalSub);
    console.log('Global subscription configured:', globalSub);

    return () => {
      subscription.unsubscribe();
      // Cleanup room subscriptions on unmount
      if (roomSubscription) {
        roomSubscription.unsubscribe();
      }
      // Cleanup global subscription
      if (globalSubscription) {
        globalSubscription.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createRoom = async (name: string, maxPlayers: number) => {
    if (!currentPlayer) {
      toast.error('Você precisa estar logado para criar uma sala');
      return;
    }

    setLoading(true);
    try {
      // Create room in Supabase
      const roomData = {
        game_type: 'munchkin' as const,
        name,
        max_players: maxPlayers,
        current_players: 0,
        status: 'waiting' as const,
        settings: {},
        game_state: {},
        created_by: currentPlayer.id
      };
      
      const createdRoom = await DataService.createGameRoom(roomData);
      
      // Create initial player data
      const playerData = {
        name: currentPlayer.name || currentPlayer.email || 'Jogador',
        level: 1,
        combatPower: 1,
        runAwayPower: 1,
        hand: { door: [], treasure: [] },
        equippedItems: {
          headgear: null,
          armor: null,
          footgear: null,
          oneHandItems: [],
          twoHandItem: null
        },
        class: null,
        race: null,
        gender: 'male',
        temporaryBonuses: [],
        isAlive: true
      };
      
      // Join the room as the creator
      await DataService.joinRoom(createdRoom.id, currentPlayer.id, playerData);
      
      // Initialize game engine with empty state for waiting rooms
      const engine = new MunchkinEngine(createdRoom.id);
      const initialState = {
        ...engine.getGameState(),
        hostId: currentPlayer.id
      };
      
      // Update room with initial game state
      await DataService.updateGameRoom(createdRoom.id, {
        game_state: initialState
      });
      
      const newRoom: MunchkinRoom = {
        id: createdRoom.id,
        name: createdRoom.name,
        hostId: createdRoom.created_by,
        players: [{
          id: currentPlayer.id,
          ...playerData
        }],
        gameState: initialState,
        status: 'waiting',
        maxPlayers: createdRoom.max_players,
        createdAt: createdRoom.created_at,
        updatedAt: createdRoom.updated_at,
        gameType: 'munchkin',
        currentPlayers: 1,
        description: createdRoom.description,
        settings: createdRoom.settings as Record<string, unknown>
      };
      
      setCurrentRoom(newRoom);
      setGameEngine(engine);
      
      // Subscribe to room updates
      const subscription = DataService.subscribeToRoom(createdRoom.id, handleRoomUpdate);
      setRoomSubscription(subscription);
      
      // Load chat messages for the room
      await loadChatMessages();
      
      // Reload available rooms
      await loadAvailableRooms();
      
      toast.success('Sala criada com sucesso!');
    } catch (err) {
      console.error('Error creating room:', err);
      toast.error('Erro ao criar sala');
      setError('Erro ao criar sala');
    } finally {
      setLoading(false);
    }
  };

  // Handle global room updates (for lobby)
  const handleGlobalRoomUpdate = async (payload: Record<string, unknown>) => {
    console.log('🔄 handleGlobalRoomUpdate called with payload:', JSON.stringify(payload, null, 2));
    try {
      // Check if it's a room_players event (someone joined/left)
      if (payload.table === 'room_players') {
        console.log('👥 Global player update detected:', payload.eventType, 'Room:', payload.new?.room_id || payload.old?.room_id);
        console.log('🔄 Reloading available rooms due to player change...');
        await loadAvailableRooms();
        console.log('✅ Available rooms reloaded successfully');
      }
      
      // Check if it's a game_rooms event for munchkin
      if (payload.table === 'game_rooms' && (payload.new as Record<string, unknown>)?.game_type === 'munchkin') {
        console.log('🏠 Global room update detected:', payload.eventType, 'Room:', (payload.new as Record<string, unknown>)?.id);
        console.log('🔄 Reloading available rooms due to room change...');
        await loadAvailableRooms();
        console.log('✅ Available rooms reloaded successfully');
      }
    } catch (err) {
      console.error('❌ Error handling global room update:', err);
    }
  };

  // Handle real-time room updates
  const handleRoomUpdate = async (payload: Record<string, unknown>) => {
    console.log('handleRoomUpdate called:', payload);
    try {
      // Handle different types of updates more efficiently
      if (payload.table === 'chat_messages' && payload.new?.room_id === currentRoom?.id) {
        // Only reload chat messages for current room
        await loadChatMessages();
        return;
      }
      
      if (payload.table === 'game_rooms') {
        console.log('Room update detected:', { currentRoomId: currentRoom?.id, payloadRoomId: payload.new?.id, newStatus: payload.new?.status });
        // Handle room updates
        if (currentRoom && payload.new?.id === currentRoom.id) {
          // Update current room data
          const players = await DataService.getRoomPlayers(currentRoom.id);
          const munchkinPlayers: MunchkinPlayer[] = players.map(convertToMunchkinPlayer);
          
          const updatedMunchkinRoom: MunchkinRoom = {
            id: payload.new.id,
            name: payload.new.name,
            hostId: payload.new.created_by,
            players: munchkinPlayers,
            gameState: payload.new.game_state as MunchkinGameState,
            status: payload.new.status as 'waiting' | 'playing' | 'finished',
            maxPlayers: payload.new.max_players,
            createdAt: payload.new.created_at,
            updatedAt: payload.new.updated_at,
            gameType: 'munchkin',
            currentPlayers: payload.new.current_players,
            description: payload.new.description,
            settings: payload.new.settings as Record<string, unknown>
          };
          
          console.log('Updating current room with new status:', updatedMunchkinRoom.status);
          setCurrentRoom(updatedMunchkinRoom);
          
          // Update game engine if needed
          if (gameEngine && updatedMunchkinRoom.gameState) {
            // Ensure hostId is preserved when updating game state
            const gameStateWithHost = {
              ...updatedMunchkinRoom.gameState,
              hostId: updatedMunchkinRoom.gameState.hostId || payload.new.created_by
            };
            console.log('Updating game engine state:', gameStateWithHost.status);
            gameEngine.updateGameState(gameStateWithHost);
          }
        }
        
        // Only reload available rooms if not in a room or if it's a room list change
        if (!currentRoom || payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
          await loadAvailableRooms();
        }
      }
      
      if (payload.table === 'room_players' && currentRoom && payload.new?.room_id === currentRoom.id) {
        console.log('Player update detected for room:', currentRoom.id, 'Event:', payload.eventType);
        // Handle player join/leave for current room
        const players = await DataService.getRoomPlayers(currentRoom.id);
        const munchkinPlayers: MunchkinPlayer[] = players.map(convertToMunchkinPlayer);
        
        console.log('Updated players list:', munchkinPlayers.map(p => ({ id: p.id, name: p.name })));
        
        setCurrentRoom(prev => prev ? {
          ...prev,
          players: munchkinPlayers,
          currentPlayers: munchkinPlayers.length
        } : null);
      }
      
      // Also handle room_players events for rooms we're not in (for DELETE events)
      if (payload.table === 'room_players' && payload.eventType === 'DELETE' && payload.old?.room_id) {
        console.log('Player left room:', payload.old.room_id);
        // Reload available rooms when someone leaves any room
        await loadAvailableRooms();
      }
    } catch (err) {
      console.error('Error handling room update:', err);
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!currentPlayer) {
      toast.error('Você precisa estar logado para entrar em uma sala');
      return;
    }

    setLoading(true);
    try {
      // Check if room exists and has space
      const rooms = await DataService.getGameRooms('munchkin');
      const room = rooms.find(r => r.id === roomId);
      if (!room) {
        throw new Error('Sala não encontrada');
      }

      if (room.current_players >= room.max_players) {
        throw new Error('Sala está cheia');
      }

      // Check if player is already in room
      const existingPlayers = await DataService.getRoomPlayers(roomId);
      const isAlreadyInRoom = existingPlayers.some(p => p.user_id === currentPlayer.id);
      
      if (isAlreadyInRoom) {
        // Player already in room, just rejoin
        const munchkinPlayers: MunchkinPlayer[] = existingPlayers.map(convertToMunchkinPlayer);
        
        const gameStateForRejoining = room.game_state as MunchkinGameState;
        const rejoiningRoom: MunchkinRoom = {
          id: room.id,
          name: room.name,
          hostId: room.created_by,
          players: munchkinPlayers,
          gameState: {
            ...gameStateForRejoining,
            hostId: room.created_by
          },
          status: room.status as 'waiting' | 'playing' | 'finished',
          maxPlayers: room.max_players,
          createdAt: room.created_at,
          updatedAt: room.updated_at,
          gameType: 'munchkin',
          currentPlayers: room.current_players,
          description: room.description,
          settings: room.settings as Record<string, unknown>
        };
        
        setCurrentRoom(rejoiningRoom);
        const engine = new MunchkinEngine(roomId, rejoiningRoom.gameState);
        setGameEngine(engine);
        
        // Subscribe to room updates
        const subscription = DataService.subscribeToRoom(roomId, handleRoomUpdate);
        setRoomSubscription(subscription);
        
        toast.success('Reconectado à sala!');
        return;
      }

      // Add player to room
      const playerData = {
        name: currentPlayer.name || currentPlayer.email || 'Jogador',
        level: 1,
        combatPower: 1,
        runAwayPower: 1,
        hand: { door: [], treasure: [] },
        equippedItems: {
          headgear: null,
          armor: null,
          footgear: null,
          oneHandItems: [],
          twoHandItem: null
        },
        class: null,
        race: null,
        gender: 'male',
        temporaryBonuses: [],
        isAlive: true
      };
      
      await DataService.joinRoom(roomId, currentPlayer.id, playerData);
      
      // Get updated room data
      const updatedPlayers = await DataService.getRoomPlayers(roomId);
      const munchkinPlayers: MunchkinPlayer[] = updatedPlayers.map(convertToMunchkinPlayer);
      
      const gameState = room.game_state as MunchkinGameState;
      const joinedRoom: MunchkinRoom = {
        id: room.id,
        name: room.name,
        hostId: room.created_by,
        players: munchkinPlayers,
        gameState: {
          ...gameState,
          hostId: room.created_by
        },
        status: room.status as 'waiting' | 'playing' | 'finished',
        maxPlayers: room.max_players,
        createdAt: room.created_at,
        updatedAt: room.updated_at,
        gameType: 'munchkin',
        currentPlayers: room.current_players,
        description: room.description,
        settings: room.settings as Record<string, unknown>
      };
      
      setCurrentRoom(joinedRoom);
      
      // Initialize or update game engine
      const engine = new MunchkinEngine(roomId, joinedRoom.gameState);
      // Note: Auto-start removed - game should only start when host explicitly clicks start
      // if (joinedRoom.status === 'waiting' && munchkinPlayers.length >= 2) {
      //   await engine.initializeGame(munchkinPlayers);
      //   const initialState = engine.getGameState();
      //   await DataService.updateGameRoom(roomId, {
      //     game_state: initialState,
      //     status: 'playing'
      //   });
      //   joinedRoom.gameState = initialState;
      //   joinedRoom.status = 'playing';
      // }
      setGameEngine(engine);
      
      // Subscribe to room updates
      const subscription = DataService.subscribeToRoom(roomId, handleRoomUpdate);
      setRoomSubscription(subscription);
      
      // Load chat messages for the room
      await loadChatMessages();
      
      // Reload available rooms
      await loadAvailableRooms();
      
      toast.success('Entrou na sala com sucesso!');
    } catch (err) {
      console.error('Error joining room:', err);
      toast.error(err instanceof Error ? err.message : 'Erro ao entrar na sala');
      setError(err instanceof Error ? err.message : 'Erro ao entrar na sala');
    } finally {
      setLoading(false);
    }
  };

  const leaveRoom = async () => {
    if (!currentRoom || !currentPlayer) {
      return;
    }
    
    try {
      await DataService.leaveRoom(currentRoom.id, currentPlayer.id);
      
      // Cleanup subscriptions
      if (roomSubscription) {
        roomSubscription.unsubscribe();
        setRoomSubscription(null);
      }
      
      setCurrentRoom(null);
      setGameEngine(null);
      setChatMessages([]);
      
      // Reload available rooms
      await loadAvailableRooms();
      
      toast.info('Você saiu da sala');
    } catch (err) {
      console.error('Error leaving room:', err);
      toast.error('Erro ao sair da sala');
    }
  };

  // Função para converter ações de string para MunchkinActionType
  const convertActionType = (action: string): MunchkinActionType => {
    const actionMap: Record<string, MunchkinActionType> = {
      'start_game': 'START_GAME',
      'kick_door': 'KICK_DOOR',
      'look_for_trouble': 'LOOK_FOR_TROUBLE',
      'loot_room': 'LOOT_ROOM',
      'charity': 'CHARITY',
      'play_card': 'PLAY_CARD',
      'discard_cards': 'DISCARD_CARDS',
      'equip_item': 'EQUIP_ITEM',
      'sell_items': 'SELL_ITEMS',
      'help_combat': 'HELP_COMBAT',
      'interfere_combat': 'INTERFERE_COMBAT',
      'escape_combat': 'ESCAPE_COMBAT',
      'end_turn': 'END_TURN'
    };
    
    return actionMap[action.toLowerCase()] || action.toUpperCase() as MunchkinActionType;
  };

  const performGameAction = async (action: string, data?: Record<string, unknown>) => {
    console.log('performGameAction called:', { 
      action, 
      data, 
      hasEngine: !!gameEngine, 
      hasRoom: !!currentRoom, 
      hasPlayer: !!currentPlayer,
      roomStatus: currentRoom?.status,
      gameState: gameEngine?.getGameState()
    });
    
    if (!gameEngine || !currentRoom || !currentPlayer) {
      console.error('Missing dependencies:', { gameEngine: !!gameEngine, currentRoom: !!currentRoom, currentPlayer: !!currentPlayer });
      toast.error('Jogo não inicializado');
      return;
    }

    // Converter ação para o tipo correto
    const actionType = convertActionType(action);
    console.log('Action converted:', action, '->', actionType);

    // Para ações que não sejam START_GAME, verificar se o jogo já foi iniciado
    if (actionType !== 'START_GAME' && currentRoom.status === 'waiting') {
      console.warn('Tentativa de executar ação antes do jogo iniciar:', actionType);
      toast.error('O jogo ainda não foi iniciado');
      return;
    }

    try {
      setLoading(true);
      console.log('Starting action execution for:', actionType);
      
      // Create game action in database
      await DataService.createGameAction({
        room_id: currentRoom.id,
        user_id: currentPlayer.id,
        action_type: actionType,
        action_data: data || {}
      });
      
      // Perform action using game engine
      const actionData: MunchkinAction & { players?: MunchkinPlayer[] } = {
        type: actionType,
        playerId: currentPlayer.id,
        cardId: data?.cardId as string,
        cardIds: data?.cardIds as string[],
        targetPlayerId: data?.targetPlayerId as string
      };
      
      // Para START_GAME, incluir os jogadores da sala
      if (actionType === 'START_GAME') {
        actionData.players = currentRoom.players;
        console.log('Adding players to START_GAME action:', currentRoom.players.length);
      }
      
      const result = await gameEngine.executeAction(actionData);

      if (result.success) {
        // Update room state in database
        const newGameState = gameEngine.getGameState();
        const updateData: { game_state: MunchkinGameState; status?: string } = {
          game_state: newGameState
        };
        
        // If START_GAME was successful, update room status to playing
        if (actionType === 'START_GAME') {
          updateData.status = 'playing';
          console.log('START_GAME successful, updating room status to playing');
        }
        
        await DataService.updateGameRoom(currentRoom.id, updateData);
        
        // Update local state
        const updatedRoom = {
          ...currentRoom,
          gameState: newGameState,
          status: actionType === 'START_GAME' ? 'playing' as const : currentRoom.status,
          updatedAt: new Date().toISOString()
        };
        setCurrentRoom(updatedRoom);
        
        console.log('Room updated after action:', actionType, 'New status:', updatedRoom.status);
        
        if (result.message) {
          toast.success(result.message);
        }
      } else {
        console.error('Action failed:', {
          action: actionType,
          data,
          result,
          currentPlayer: currentPlayer?.id,
          gameState: gameEngine?.getGameState()
        });
        
        // Mensagens de erro mais específicas
        let errorMessage = result.error || 'Ação inválida';
        
        if (actionType === 'PLAY_CARD' && !result.error) {
          errorMessage = 'Não é possível jogar esta carta agora';
        } else if (actionType === 'DISCARD_CARDS' && !result.error) {
          errorMessage = 'Não é possível descartar cartas agora';
        } else if (actionType === 'END_TURN' && !result.error) {
          errorMessage = 'Não é o seu turno ou não é possível terminar o turno agora';
        }
        
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error('Error performing action:', err);
      toast.error('Erro ao executar ação');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string) => {
    if (!currentRoom || !currentPlayer) {
      toast.error('Você precisa estar em uma sala para enviar mensagens');
      return;
    }

    try {
      await DataService.createChatMessage({
        room_id: currentRoom.id,
        user_id: currentPlayer.id,
        message,
        message_type: 'chat'
      });
      
      // Message will be received via real-time subscription
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Erro ao enviar mensagem');
    }
  };

  const value: MunchkinContextType = {
    currentRoom,
    currentPlayer,
    availableRooms,
    gameEngine,
    loading,
    error,
    chatMessages,
    createRoom,
    joinRoom,
    leaveRoom,
    performGameAction,
    sendMessage,
    loadChatMessages
  };

  return (
    <MunchkinContext.Provider value={value}>
      {children}
    </MunchkinContext.Provider>
  );
};

export default MunchkinProvider;