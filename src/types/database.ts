export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          photo_url: string | null
          role: 'member' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          photo_url?: string | null
          role?: 'member' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          photo_url?: string | null
          role?: 'member' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      game_rooms: {
        Row: {
          id: string
          game_type: 'death_space' | 'munchkin'
          name: string
          description: string | null
          max_players: number
          current_players: number
          status: 'waiting' | 'playing' | 'finished'
          settings: Json
          game_state: Json
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          game_type: 'death_space' | 'munchkin'
          name: string
          description?: string | null
          max_players: number
          current_players?: number
          status?: 'waiting' | 'playing' | 'finished'
          settings: Json
          game_state: Json
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          game_type?: 'death_space' | 'munchkin'
          name?: string
          description?: string | null
          max_players?: number
          current_players?: number
          status?: 'waiting' | 'playing' | 'finished'
          settings?: Json
          game_state?: Json
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      room_players: {
        Row: {
          id: string
          room_id: string
          user_id: string
          player_data: Json
          joined_at: string
          is_ready: boolean
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          player_data: Json
          joined_at?: string
          is_ready?: boolean
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          player_data?: Json
          joined_at?: string
          is_ready?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "room_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_players_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      game_actions: {
        Row: {
          id: string
          room_id: string
          user_id: string
          action_type: string
          action_data: Json
          timestamp: string
          processed: boolean
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          action_type: string
          action_data: Json
          timestamp?: string
          processed?: boolean
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          action_type?: string
          action_data?: Json
          timestamp?: string
          processed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "game_actions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          id: string
          room_id: string
          user_id: string
          message: string
          message_type: 'chat' | 'system' | 'action'
          timestamp: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          message: string
          message_type?: 'chat' | 'system' | 'action'
          timestamp?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          message?: string
          message_type?: 'chat' | 'system' | 'action'
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}