// Exportações centralizadas dos engines de jogos

export { GameEngine } from './base/GameEngine';
export { GameManager } from './GameManager';
export { DeathSpaceEngine } from './deathspace/DeathSpaceEngine';
export { MunchkinEngine } from './munchkin/MunchkinEngine';

// Tipos relacionados aos engines
export {
  BaseGameState,
  BasePlayer,
  GameAction,
  ChatMessage,
  GameRoom,
  GameType
} from '../types/platform';
export {
  ActionValidation,
  ActionResult,
  GameLog
} from '../types/actions';

export type {
  DeathSpaceGameState,
  DeathSpacePlayer,
  DeathSpaceAction
} from '../types/deathspace';

export type {
  MunchkinGameState,
  MunchkinPlayer,
  MunchkinAction
} from '../types/munchkin';