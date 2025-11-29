// Tipos comuns compartilhados entre diferentes módulos

// Interface base para jogadores de qualquer jogo
export interface BasePlayer {
  id: string;
  name: string;
  photoURL?: string;
  isActive: boolean;
}

// Interface base para estado de jogo
export interface BaseGameState {
  roomId?: string;
  gameType: string;
  status: 'waiting' | 'playing' | 'finished';
  currentPlayer?: string;
  players: BasePlayer[];
  winner?: string;
  updatedAt?: Date;
}

export interface ActionResult {
  success: boolean;
  newState?: BaseGameState;
  error?: string;
  logs?: GameLog[];
}

export interface ActionValidation {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export interface GameLog {
  id: string;
  roomId: string;
  playerId: string;
  action: string;
  details: Record<string, unknown>;
  timestamp: Date;
}