import { supabase } from '../config/supabase';
import type { Database } from '../types/database';
import type { 
  GameRoom, 
  RoomPlayer, 
  GameAction, 
  ChatMessage, 
  PlatformUser,
  GameType 
} from '../types/platform';

type Tables = Database['public']['Tables'];
type GameRoomRow = Tables['game_rooms']['Row'];
type RoomPlayerRow = Tables['room_players']['Row'];
type GameActionRow = Tables['game_actions']['Row'];
type ChatMessageRow = Tables['chat_messages']['Row'];
type UserRow = Tables['users']['Row'];

export class DataService {
  // User operations
  static async createUser(user: Omit<PlatformUser, 'created_at' | 'updated_at'>): Promise<PlatformUser> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        name: user.name,
        photo_url: user.photo_url || null,
        role: user.role || 'member'
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapUserRowToPlatformUser(data);
  }

  static async getUser(userId: string): Promise<PlatformUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return this.mapUserRowToPlatformUser(data);
  }

  static async updateUser(userId: string, updates: Partial<PlatformUser>): Promise<PlatformUser> {
    const { data, error } = await supabase
      .from('users')
      .update({
        email: updates.email,
        name: updates.name,
        photo_url: updates.photo_url,
        role: updates.role
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return this.mapUserRowToPlatformUser(data);
  }

  // Game Room operations
  static async createGameRoom(room: Omit<GameRoom, 'id' | 'created_at' | 'updated_at'>): Promise<GameRoom> {
    const { data, error } = await supabase
      .from('game_rooms')
      .insert({
        game_type: room.game_type,
        name: room.name,
        description: room.description || null,
        max_players: room.max_players,
        current_players: room.current_players || 0,
        status: room.status || 'waiting',
        settings: room.settings as Record<string, unknown>,
        game_state: room.game_state as Record<string, unknown>,
        created_by: room.created_by
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapGameRoomRowToGameRoom(data);
  }

  static async getGameRoom(roomId: string): Promise<GameRoom | null> {
    const { data, error } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return this.mapGameRoomRowToGameRoom(data);
  }

  static async getGameRooms(gameType?: GameType, status?: string): Promise<GameRoom[]> {
    let query = supabase.from('game_rooms').select('*');
    
    if (gameType) {
      query = query.eq('game_type', gameType);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    
    return data.map(this.mapGameRoomRowToGameRoom);
  }

  static async updateGameRoom(roomId: string, updates: Partial<GameRoom>): Promise<GameRoom> {
    const { data, error } = await supabase
      .from('game_rooms')
      .update({
        name: updates.name,
        description: updates.description,
        max_players: updates.max_players,
        current_players: updates.current_players,
        status: updates.status,
        settings: updates.settings as Record<string, unknown>,
        game_state: updates.game_state as Record<string, unknown>
      })
      .eq('id', roomId)
      .select()
      .single();

    if (error) throw error;
    return this.mapGameRoomRowToGameRoom(data);
  }

  static async deleteGameRoom(roomId: string): Promise<void> {
    const { error } = await supabase
      .from('game_rooms')
      .delete()
      .eq('id', roomId);

    if (error) throw error;
  }

  // Room Player operations
  static async joinRoom(roomId: string, userId: string, playerData: Record<string, unknown>): Promise<RoomPlayer> {
    const { data, error } = await supabase
      .from('room_players')
      .insert({
        room_id: roomId,
        user_id: userId,
        player_data: playerData as Record<string, unknown>,
        is_ready: false
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapRoomPlayerRowToRoomPlayer(data);
  }

  static async leaveRoom(roomId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('room_players')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  static async getRoomPlayers(roomId: string): Promise<RoomPlayer[]> {
    const { data, error } = await supabase
      .from('room_players')
      .select('*')
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return data.map(this.mapRoomPlayerRowToRoomPlayer);
  }

  static async updatePlayerData(roomId: string, userId: string, playerData: Record<string, unknown>, isReady?: boolean): Promise<RoomPlayer> {
    const updates: Record<string, unknown> = { player_data: playerData };
    if (isReady !== undefined) {
      updates.is_ready = isReady;
    }

    const { data, error } = await supabase
      .from('room_players')
      .update(updates)
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return this.mapRoomPlayerRowToRoomPlayer(data);
  }

  // Game Action operations
  static async createGameAction(action: Omit<GameAction, 'id' | 'timestamp' | 'processed'>): Promise<GameAction> {
    const { data, error } = await supabase
      .from('game_actions')
      .insert({
        room_id: action.room_id,
        user_id: action.user_id,
        action_type: action.action_type,
        action_data: action.action_data as Record<string, unknown>,
        processed: false
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapGameActionRowToGameAction(data);
  }

  static async getUnprocessedActions(roomId: string): Promise<GameAction[]> {
    const { data, error } = await supabase
      .from('game_actions')
      .select('*')
      .eq('room_id', roomId)
      .eq('processed', false)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data.map(this.mapGameActionRowToGameAction);
  }

  static async markActionProcessed(actionId: string): Promise<void> {
    const { error } = await supabase
      .from('game_actions')
      .update({ processed: true })
      .eq('id', actionId);

    if (error) throw error;
  }

  // Chat Message operations
  static async createChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: message.room_id,
        user_id: message.user_id,
        message: message.message,
        message_type: message.message_type || 'chat'
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapChatMessageRowToChatMessage(data);
  }

  static async getChatMessages(roomId: string, limit: number = 50): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data.reverse().map(this.mapChatMessageRowToChatMessage);
  }

  // Realtime subscriptions
  static subscribeToRoom(roomId: string, callback: (payload: Record<string, unknown>) => void) {
    return supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'game_rooms', filter: `id=eq.${roomId}` },
        callback
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` },
        callback
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'game_actions', filter: `room_id=eq.${roomId}` },
        callback
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
        callback
      )
      .subscribe();
  }

  // Global subscription for all Munchkin rooms and players
  static subscribeToMunchkinRooms(callback: (payload: Record<string, unknown>) => void) {
    console.log('🚀 Setting up global Munchkin subscription...');
    
    const channel = supabase.channel('munchkin-rooms-global');
    
    // Subscribe to room_players changes (all rooms)
    channel.on('postgres_changes',
      { event: '*', schema: 'public', table: 'room_players' },
      (payload) => {
        console.log('🔔 Global room_players event received:', {
          eventType: payload.eventType,
          table: payload.table,
          new: payload.new,
          old: payload.old
        });
        callback({ ...payload, table: 'room_players' });
      }
    );
    
    // Subscribe to game_rooms changes (munchkin only)
    channel.on('postgres_changes',
      { event: '*', schema: 'public', table: 'game_rooms', filter: 'game_type=eq.munchkin' },
      (payload) => {
        console.log('🔔 Global game_rooms event received:', {
          eventType: payload.eventType,
          table: payload.table,
          new: payload.new,
          old: payload.old
        });
        callback({ ...payload, table: 'game_rooms' });
      }
    );
    
    return channel.subscribe((status, err) => {
      console.log('📡 Global subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Global subscription is now active!');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Global subscription error!', err);
        // Tentar reconectar após um delay
        setTimeout(() => {
          console.log('🔄 Attempting to reconnect global subscription...');
          channel.unsubscribe();
          // Recriar a subscription
          DataService.subscribeToMunchkinRooms(callback);
        }, 5000);
      } else if (status === 'CLOSED') {
        console.warn('⚠️ Global subscription closed');
      }
    });
  }

  // Mapping functions
  private static mapUserRowToPlatformUser(row: UserRow): PlatformUser {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      photo_url: row.photo_url || undefined,
      role: row.role as 'member' | 'admin',
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  private static mapGameRoomRowToGameRoom(row: GameRoomRow): GameRoom {
    return {
      id: row.id,
      game_type: row.game_type as GameType,
      name: row.name,
      description: row.description || undefined,
      max_players: row.max_players,
      current_players: row.current_players,
      status: row.status as 'waiting' | 'playing' | 'finished',
      settings: row.settings as Record<string, unknown>,
      game_state: row.game_state as Record<string, unknown>,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  private static mapRoomPlayerRowToRoomPlayer(row: RoomPlayerRow): RoomPlayer {
    return {
      id: row.id,
      room_id: row.room_id,
      user_id: row.user_id,
      player_data: row.player_data as Record<string, unknown>,
      joined_at: row.joined_at,
      is_ready: row.is_ready
    };
  }

  private static mapGameActionRowToGameAction(row: GameActionRow): GameAction {
    return {
      id: row.id,
      room_id: row.room_id,
      user_id: row.user_id,
      action_type: row.action_type,
      action_data: row.action_data as Record<string, unknown>,
      timestamp: row.timestamp,
      processed: row.processed
    };
  }

  private static mapChatMessageRowToChatMessage(row: ChatMessageRow): ChatMessage {
    return {
      id: row.id,
      room_id: row.room_id,
      user_id: row.user_id,
      message: row.message,
      message_type: row.message_type as 'chat' | 'system' | 'action',
      timestamp: row.timestamp
    };
  }
}