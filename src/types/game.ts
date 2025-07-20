export interface Player {
  id: string;
  name: string;
  photoURL?: string;
  actionPoints: number;
  ships: Ship[];
  lastPointGain: Date;
  isAlive: boolean;
  votes: number;
  votedFor?: string;
}

export type ShipType = 'fighter' | 'cruiser' | 'destroyer' | 'scout';

export interface Ship {
  id: string;
  type: ShipType;
  position: Position;
  health: number;
  actionPoints: number;
  reach: number;
  playerId: string;
}

export interface Position {
  x: number;
  y: number;
}

export type PlayerActionType = 'MOVE' | 'ATTACK' | 'DONATE' | 'IMPROVE' | 'RECOVER';
export type LogActionType = PlayerActionType | 'DESTROY' | 'TRANSFER_AP' | 'POINT_DISTRIBUTION';

export type GameAction = {
  type: PlayerActionType;
  shipId: string;
  playerId: string;
  target?: Position | string;
  points?: number;
};

export type DebrisType = 'asteroid' | 'satellite';

export interface Debris {
  id: string;
  type: DebrisType;
  position: Position;
  health: number;
}

export interface ActionTimeWindow {
  start: string;
  end: string;
}

export interface GameLog {
  timestamp: Date | Timestamp;
  action: LogActionType;
  playerId: string;
  targetId?: string | null;
  details?: {
    points?: number;
    position?: Position;
    type?: string;
    fromShip?: string;
    toShip?: string;
  } | null;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date | Timestamp;
}

import { Timestamp } from 'firebase/firestore';

export interface GameRoom {
  id?: string;
  name: string;
  players: Player[];
  gridSize: {
    width: number;
    height: number;
  };
  status: 'waiting' | 'playing' | 'finished';
  createdAt: Date;
  currentTurn: string;
  debris: Debris[];
  ships: Ship[];
  actionTimeWindows: ActionTimeWindow[];
  lastPointDistribution?: Timestamp;
  council: {
    memberIds: string[];
    votes: {
      playerId: string;
      votedFor: string;
      voteWeight: number;
    }[];
    lastVoteTime: Date;
  };
  logs: GameLog[];
  roomChat?: ChatMessage[];
  councilChat?: ChatMessage[];
}