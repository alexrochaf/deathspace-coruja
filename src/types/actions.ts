export interface ActionResult {
  success: boolean;
  newState?: Record<string, unknown>;
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