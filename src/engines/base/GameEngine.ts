// Classe abstrata base para todos os engines de jogos

// Definir GameType localmente
type GameType = 'deathspace' | 'munchkin';

// Definir GameAction localmente
interface GameAction {
  id: string;
  roomId: string;
  userId: string;
  actionType: string;
  actionData: Record<string, unknown>;
  timestamp: Date;
}



// Definir tipos base localmente
interface BaseGameState {
  roomId?: string;
  gameType: string;
  status: 'waiting' | 'playing' | 'finished';
  currentPlayer?: string;
  players: BasePlayer[];
  winner?: string;
  updatedAt?: Date;
}

interface BasePlayer {
  id: string;
  name: string;
  photoURL?: string;
  isActive: boolean;
}

// Definir tipos localmente para evitar problemas de importação
interface ActionResult {
  success: boolean;
  newState?: BaseGameState;
  error?: string;
  logs?: GameLog[];
}

interface ActionValidation {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

interface GameLog {
  id: string;
  roomId: string;
  playerId: string;
  action: string;
  details: Record<string, unknown>;
  timestamp: Date;
}

export abstract class GameEngine<
  TGameState extends BaseGameState = BaseGameState,
  TPlayer extends BasePlayer = BasePlayer,
  TAction extends GameAction = GameAction
> {
  protected gameType: GameType;
  protected gameState: TGameState;
  protected eventListeners: Map<string, ((data: unknown) => void)[]> = new Map();

  constructor(gameType: GameType, initialState: TGameState) {
    this.gameType = gameType;
    this.gameState = initialState;
  }

  // Métodos abstratos que devem ser implementados por cada jogo
  abstract validateAction(action: TAction): ActionValidation;
  abstract executeAction(action: TAction): Promise<ActionResult>;
  abstract getValidActions(playerId: string): string[];
  abstract checkWinCondition(): { hasWinner: boolean; winner?: string };
  abstract initializeGame(players: TPlayer[], settings?: Record<string, unknown>): Promise<void>;
  abstract getPlayerState(playerId: string): Record<string, unknown>;
  abstract canPlayerJoin(playerId: string): boolean;

  // Métodos comuns para todos os jogos
  public getGameState(): TGameState {
    return { ...this.gameState };
  }

  public getGameType(): GameType {
    return this.gameType;
  }

  public getPlayers(): TPlayer[] {
    return [...this.gameState.players];
  }

  public getPlayer(playerId: string): TPlayer | undefined {
    return this.gameState.players.find(p => p.id === playerId);
  }

  public isGameFinished(): boolean {
    return this.gameState.status === 'finished';
  }

  public getCurrentPlayer(): string | undefined {
    return this.gameState.currentPlayer;
  }

  // Sistema de eventos
  public addEventListener(event: string, callback: (data: unknown) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public removeEventListener(event: string, callback: (data: unknown) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  protected emitEvent(event: string, data: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Métodos utilitários
  protected updateGameState(updates: Partial<TGameState>): void {
    this.gameState = {
      ...this.gameState,
      ...updates,
      updatedAt: new Date()
    };
    this.emitEvent('stateUpdated', this.gameState);
  }

  protected addPlayer(player: TPlayer): void {
    if (!this.gameState.players.find(p => p.id === player.id)) {
      this.gameState.players.push(player);
      this.updateGameState({ players: this.gameState.players });
      this.emitEvent('playerJoined', { player });
    }
  }

  protected removePlayer(playerId: string): void {
    const playerIndex = this.gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex > -1) {
      const removedPlayer = this.gameState.players.splice(playerIndex, 1)[0];
      this.updateGameState({ players: this.gameState.players });
      this.emitEvent('playerLeft', { player: removedPlayer });
    }
  }

  protected createLog(playerId: string, action: string, details: Record<string, unknown>): GameLog {
    return {
      id: crypto.randomUUID(),
      roomId: this.gameState.roomId,
      playerId,
      action,
      details,
      timestamp: new Date()
    };
  }

  // Métodos para validação comum
  protected isPlayerTurn(playerId: string): boolean {
    return this.gameState.currentPlayer === playerId;
  }

  protected isPlayerActive(playerId: string): boolean {
    const player = this.getPlayer(playerId);
    return player ? player.isActive : false;
  }

  protected isGameActive(): boolean {
    return this.gameState.status === 'playing';
  }

  // Método para serialização
  public serialize(): string {
    return JSON.stringify({
      gameType: this.gameType,
      gameState: this.gameState
    });
  }

  // Método para deserialização (deve ser implementado por cada engine)
  public static deserialize(/* _data: string */): GameEngine {
    throw new Error('deserialize method must be implemented by each game engine');
  }

  // Método para limpeza de recursos
  public dispose(): void {
    this.eventListeners.clear();
    this.emitEvent('disposed', { gameType: this.gameType, roomId: this.gameState.roomId });
  }

  // Métodos para debug e desenvolvimento
  public getDebugInfo(): Record<string, unknown> {
    return {
      gameType: this.gameType,
      status: this.gameState.status,
      playersCount: this.gameState.players.length,
      currentPlayer: this.gameState.currentPlayer,
      lastUpdate: this.gameState.updatedAt
    };
  }

  // Método para validar integridade do estado
  public validateGameState(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.gameState.roomId) {
      errors.push('Game state missing roomId');
    }

    if (!this.gameState.gameType) {
      errors.push('Game state missing gameType');
    }

    if (!Array.isArray(this.gameState.players)) {
      errors.push('Game state players is not an array');
    }

    if (!['waiting', 'playing', 'finished'].includes(this.gameState.status)) {
      errors.push('Invalid game status');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}