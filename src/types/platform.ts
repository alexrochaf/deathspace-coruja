// Tipos base da plataforma para múltiplos jogos

export type GameType = 'deathspace' | 'munchkin';

export interface PlatformUser {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  role: 'member' | 'admin';
  stats: UserStats;
  createdAt: Date;
}

export interface UserStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  totalPlayTime: number; // em minutos
  favoriteGame?: GameType;
  achievements: string[];
}

export interface GameRoom {
  id: string;
  name: string;
  gameType: GameType;
  status: 'waiting' | 'playing' | 'finished';
  maxPlayers: number;
  isPrivate: boolean;
  creatorId: string;
  settings: GameSettings;
  players: RoomPlayer[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomPlayer {
  id: string;
  roomId: string;
  userId: string;
  status: 'active' | 'eliminated' | 'spectator';
  playerData: Record<string, unknown>; // Dados específicos do jogo
  joinedAt: Date;
}

export interface GameSettings {
  [key: string]: unknown; // Configurações específicas de cada jogo
}

export interface GameAction {
  id: string;
  roomId: string;
  userId: string;
  actionType: string;
  actionData: Record<string, unknown>;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  message: string;
  channel: 'general' | 'council' | 'private';
  timestamp: Date;
}

// Re-exportar tipos comuns
export type { ActionResult, ActionValidation, GameLog } from './actions';
export type { BasePlayer, BaseGameState } from './common';

// Tipos para administração
export interface AdminDashboard {
  activeRooms: GameRoom[];
  totalUsers: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  resourceUsage: ResourceUsage;
  alerts: Alert[];
}

export interface ResourceUsage {
  storageUsed: number; // MB
  bandwidthUsed: number; // GB
  activeUsers: number;
  dailyActiveUsers: number;
  errorRate: number;
  responseTime: number;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  resolved: boolean;
}