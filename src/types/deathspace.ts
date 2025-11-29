// Tipos específicos do jogo Death Space adaptados para a nova arquitetura

// Definir tipos base localmente
interface BasePlayer {
  id: string;
  name: string;
  photoURL?: string;
  isActive: boolean;
}

interface BaseGameState {
  roomId?: string;
  gameType: string;
  status: 'waiting' | 'playing' | 'finished';
  currentPlayer?: string;
  players: BasePlayer[];
  winner?: string;
  updatedAt?: Date;
}

interface GameAction {
  id: string;
  roomId: string;
  userId: string;
  actionType: string;
  actionData: Record<string, unknown>;
  timestamp: Date;
}
import { Timestamp } from 'firebase/firestore';

export interface DeathSpacePlayer extends BasePlayer {
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

export type DeathSpaceActionType = 'MOVE' | 'ATTACK' | 'DONATE' | 'IMPROVE' | 'RECOVER';
export type LogActionType = DeathSpaceActionType | 'DESTROY' | 'TRANSFER_AP' | 'POINT_DISTRIBUTION';

export interface DeathSpaceAction extends GameAction {
  type: DeathSpaceActionType;
  shipId: string;
  target?: Position | string;
  points?: number;
}

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

export interface DeathSpaceGameLog {
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

export interface DeathSpaceChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date | Timestamp;
}

export interface Council {
  memberIds: string[];
  votes: {
    playerId: string;
    votedFor: string;
    voteWeight: number;
  }[];
  lastVoteTime: Date;
}

export interface DeathSpaceGameState extends BaseGameState {
  gameType: 'deathspace';
  players: DeathSpacePlayer[];
  gridSize: {
    width: number;
    height: number;
  };
  debris: Debris[];
  ships: Ship[];
  actionTimeWindows: ActionTimeWindow[];
  lastPointDistribution?: Timestamp;
  council: Council;
  logs: DeathSpaceGameLog[];
  roomChat?: DeathSpaceChatMessage[];
  councilChat?: DeathSpaceChatMessage[];
  gameSettings: DeathSpaceSettings;
}

export interface DeathSpaceSettings {
  gridWidth: number;
  gridHeight: number;
  maxPlayers: number;
  pointDistributionInterval: number; // em horas
  enableCouncil: boolean;
  enableChat: boolean;
  actionTimeWindows: ActionTimeWindow[];
  debrisCount: {
    asteroids: number;
    satellites: number;
  };
}

// Tipos para validação de regras específicas do Death Space
export interface DeathSpaceRuleValidation {
  canMove: (ship: Ship, target: Position) => boolean;
  canAttack: (attacker: Ship, target: Position) => boolean;
  canDonate: (donor: Ship, recipient: Ship, points: number) => boolean;
  canRecover: (ship: Ship) => boolean;
  canImprove: (ship: Ship, points: number) => boolean;
  isInRange: (from: Position, to: Position, range: number) => boolean;
  isPositionOccupied: (position: Position, ships: Ship[], debris: Debris[]) => boolean;
}

// Constantes do Death Space
export const DEATH_SPACE_CONSTANTS = {
  SHIP_STATS: {
    fighter: { health: 100, actionPoints: 3, reach: 2 },
    cruiser: { health: 150, actionPoints: 2, reach: 3 },
    destroyer: { health: 200, actionPoints: 1, reach: 4 },
    scout: { health: 75, actionPoints: 4, reach: 2 }
  },
  DEBRIS_HEALTH: {
    asteroid: 50,
    satellite: 30
  },
  POINT_DISTRIBUTION_INTERVAL: 24, // horas
  COUNCIL_VOTE_WEIGHT: {
    FIRST_DEAD: 3,
    OTHERS: 1
  },
  WIN_CONDITION: {
    SURVIVORS: 4
  }
} as const;

// Tipos para eventos específicos do Death Space
export interface DeathSpaceGameEvent {
  type: 'SHIP_MOVED' | 'SHIP_ATTACKED' | 'SHIP_DESTROYED' | 'POINTS_DONATED' | 'COUNCIL_VOTE' | 'GAME_WON';
  playerId: string;
  shipId?: string;
  targetId?: string;
  position?: Position;
  points?: number;
  timestamp: Date;
}

// Interface para migração dos dados existentes
export interface LegacyGameRoom {
  id?: string;
  name: string;
  players: Record<string, unknown>[]; // Tipo antigo
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
  council: Council;
  logs: DeathSpaceGameLog[];
  roomChat?: DeathSpaceChatMessage[];
  councilChat?: DeathSpaceChatMessage[];
}

// Função utilitária para converter dados legados
export function convertLegacyToNewFormat(legacyRoom: LegacyGameRoom): DeathSpaceGameState {
  const players: DeathSpacePlayer[] = legacyRoom.players.map(p => ({
    id: p.id,
    name: p.name,
    photoURL: p.photoURL,
    isActive: p.isAlive,
    actionPoints: p.actionPoints,
    ships: p.ships || [],
    lastPointGain: p.lastPointGain,
    isAlive: p.isAlive,
    votes: p.votes,
    votedFor: p.votedFor
  }));

  return {
    roomId: legacyRoom.id || '',
    gameType: 'deathspace',
    status: legacyRoom.status,
    currentPlayer: legacyRoom.currentTurn,
    players,
    gridSize: legacyRoom.gridSize,
    debris: legacyRoom.debris,
    ships: legacyRoom.ships,
    actionTimeWindows: legacyRoom.actionTimeWindows,
    lastPointDistribution: legacyRoom.lastPointDistribution,
    council: legacyRoom.council,
    logs: legacyRoom.logs,
    roomChat: legacyRoom.roomChat,
    councilChat: legacyRoom.councilChat,
    updatedAt: new Date(),
    gameSettings: {
      gridWidth: legacyRoom.gridSize.width,
      gridHeight: legacyRoom.gridSize.height,
      maxPlayers: 8,
      pointDistributionInterval: 24,
      enableCouncil: true,
      enableChat: true,
      actionTimeWindows: legacyRoom.actionTimeWindows,
      debrisCount: {
        asteroids: legacyRoom.debris.filter(d => d.type === 'asteroid').length,
        satellites: legacyRoom.debris.filter(d => d.type === 'satellite').length
      }
    }
  };
}