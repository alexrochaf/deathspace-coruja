// Tipos específicos do jogo Munchkin

// Interfaces base
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

// Interfaces principais do Munchkin
export interface CardEffect {
  type: 'combat_bonus' | 'level_bonus' | 'special_ability' | 'curse' | 'one_shot' | 'bad_stuff' | 'incompatible';
  value?: number;
  bonusType?: 'combat' | 'level' | 'escape';
  condition?: string;
  description: string;
  target?: 'self' | 'monster' | 'all_players' | 'other_players';
}

export interface Requirement {
  type: 'class' | 'race' | 'level' | 'gender' | 'big';
  value: string | number;
  operator?: 'equals' | 'greater' | 'less' | 'not_equals';
}

export interface Card {
  id: string;
  name: string;
  type: 'door' | 'treasure';
  subtype: 'monster' | 'class' | 'race' | 'curse' | 'equipment' | 'item' | 'bonus' | string;
  level?: number;
  bonus?: number;
  goldValue?: number;
  description: string;
  flavorText?: string;
  imageUrl?: string;
  effects: CardEffect[];
  requirements?: Requirement[];
  rewards?: {
    levels?: number;
    treasures?: number;
  };
}

export interface Bonus {
  id: string;
  type: 'combat' | 'level' | 'escape';
  value: number;
  source: string;
  duration: 'permanent' | 'combat' | 'turn';
  description: string;
}

export interface MunchkinPlayer extends BasePlayer {
  level: number;
  class?: string;
  race?: string;
  gender?: string;
  hand: {
    door: Card[];
    treasure: Card[];
  };
  equipment: {
    helmet?: Card;
    armor?: Card;
    footgear?: Card;
    hands: Card[];
    big: Card[];
  };
  temporaryBonuses: Bonus[];
  isDead: boolean;
  goldValue: number;
}

export interface Combat {
  id: string;
  player: MunchkinPlayer;
  monster: Card;
  helpers: {
    playerId: string;
    agreedReward?: string;
  }[];
  interferors: {
    playerId: string;
    cards: Card[];
  }[];
  bonusCards: Card[];
  totalPlayerStrength: number;
  totalMonsterStrength: number;
  status: 'ongoing' | 'player_wins' | 'monster_wins' | 'escaped';
  canEscape: boolean;
  escapeRoll?: number;
}

export interface MunchkinSettings {
  maxLevel: number;
  enableTimer: boolean;
  turnTimeLimit: number;
  allowSpectators: boolean;
  customRules: string[];
  deckConfiguration: 'basic' | 'expanded';
}

export interface MunchkinGameState extends BaseGameState {
  gameType: 'munchkin';
  hostId?: string;
  players: MunchkinPlayer[];
  doorDeck: Card[];
  treasureDeck: Card[];
  doorDiscard: Card[];
  treasureDiscard: Card[];
  currentCombat?: Combat;
  turnPhase: 1 | 2 | 3 | 4;
  turnTimer?: number;
  gameSettings: MunchkinSettings;
}

export type MunchkinActionType = 
  | 'START_GAME'
  | 'KICK_DOOR'
  | 'LOOK_FOR_TROUBLE'
  | 'LOOT_ROOM'
  | 'CHARITY'
  | 'PLAY_CARD'
  | 'DISCARD_CARDS'
  | 'EQUIP_ITEM'
  | 'SELL_ITEMS'
  | 'HELP_COMBAT'
  | 'INTERFERE_COMBAT'
  | 'ESCAPE_COMBAT'
  | 'END_TURN';

export interface MunchkinAction {
  id: string;
  roomId: string;
  userId: string;
  actionType: string;
  actionData: Record<string, unknown>;
  timestamp: Date;
  type: MunchkinActionType;
  playerId: string;
  cardId?: string;
  cardIds?: string[];
  targetPlayerId?: string;
  equipmentSlot?: 'helmet' | 'armor' | 'footgear' | 'hand1' | 'hand2' | 'big';
  sellItems?: string[];
  helpAgreement?: string;
  data?: Record<string, unknown>;
}

export interface DeckConfiguration {
  doorCards: CardTemplate[];
  treasureCards: CardTemplate[];
}

export interface CardTemplate {
  name: string;
  type: 'door' | 'treasure';
  subtype: string;
  level?: number;
  bonus?: number;
  goldValue?: number;
  description: string;
  flavorText?: string;
  effects: CardEffect[];
  requirements?: Requirement[];
  quantity: number;
}

export interface MunchkinRuleValidation {
  canKickDoor: boolean;
  canLookForTrouble: boolean;
  canPlayCard: (_card: Card) => boolean;
  canEquipItem: (_item: Card, _slot: string) => boolean;
  canSellItems: () => boolean;
  canHelpInCombat: () => boolean;
  canInterfereInCombat: () => boolean;
  canEscape: () => boolean;
}

export interface MunchkinGameEvent {
  type: 'CARD_DRAWN' | 'COMBAT_STARTED' | 'COMBAT_ENDED' | 'LEVEL_GAINED' | 'PLAYER_DIED' | 'GAME_WON';
  playerId?: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

export const MUNCHKIN_CONSTANTS = {
  MAX_HAND_SIZE: 5,
  STARTING_LEVEL: 1,
  WINNING_LEVEL: 10,
  GOLD_PER_LEVEL: 1000,
  ESCAPE_SUCCESS: [5, 6],
  TURN_PHASES: {
    KICK_DOOR: 1,
    LOOK_FOR_TROUBLE: 2,
    LOOT_ROOM: 3,
    CHARITY: 4
  }
} as const;
