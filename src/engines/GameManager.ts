// GameManager - Gerenciador central para múltiplos tipos de jogos

import { GameEngine } from './base/GameEngine';
import { 
  GameRoom, 
  BasePlayer, 
  ActionValidation
} from '../types/platform';

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
  players: [];
  winner?: string;
  updatedAt?: Date;
}

// Definir tipos localmente para evitar problemas de importação
interface ActionResult {
  success: boolean;
  newState?: undefined;
  error?: string;
  logs?: [];
}

// Importações dos engines específicos
import { DeathSpaceEngine } from './deathspace/DeathSpaceEngine';
import { MunchkinEngine } from './munchkin/MunchkinEngine';

export class GameManager {
  private static instance: GameManager;
  private gameEngines: Map<string, GameEngine> = new Map(); // roomId -> engine
  private engineFactories: Map<GameType, (roomId: string, initialState: BaseGameState) => GameEngine> = new Map();

  private constructor() {
    this.registerEngineFactories();
  }

  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  // Registra as factories dos engines de cada jogo
  private registerEngineFactories(): void {
    this.engineFactories.set('deathspace', (roomId, initialState) => 
      new DeathSpaceEngine(roomId, initialState)
    );
    this.engineFactories.set('munchkin', (roomId, initialState) => 
      new MunchkinEngine(roomId, initialState)
    );
  }

  // Cria um novo jogo
  public async createGame(
    room: GameRoom, 
    players: BasePlayer[], 
    settings?: Record<string, unknown>
  ): Promise<GameEngine> {
    const factory = this.engineFactories.get(room.gameType);
    if (!factory) {
      throw new Error(`No engine factory registered for game type: ${room.gameType}`);
    }

    // Criar estado inicial baseado no tipo de jogo
    const initialState: BaseGameState = {
      roomId: room.id,
      gameType: room.gameType,
      status: 'waiting',
      players: players,
      updatedAt: new Date()
    };

    const engine = factory(room.id, initialState);
    
    // Inicializar o jogo
    await engine.initializeGame(players, settings);
    
    // Armazenar o engine
    this.gameEngines.set(room.id, engine);
    
    // Configurar listeners para eventos do jogo
    this.setupEngineListeners(engine, room.id);
    
    return engine;
  }

  // Obtém o engine de um jogo específico
  public getGameEngine(roomId: string): GameEngine | undefined {
    return this.gameEngines.get(roomId);
  }

  // Executa uma ação em um jogo
  public async executeAction(roomId: string, action: GameAction): Promise<ActionResult> {
    const engine = this.gameEngines.get(roomId);
    if (!engine) {
      return {
        success: false,
        error: `No game engine found for room: ${roomId}`
      };
    }

    // Validar a ação
    const validation = engine.validateAction(action);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error || 'Invalid action'
      };
    }

    // Executar a ação
    try {
      const result = await engine.executeAction(action);
      
      // Verificar condição de vitória após cada ação
      const winCondition = engine.checkWinCondition();
      if (winCondition.hasWinner) {
        await this.endGame(roomId, winCondition.winner);
      }
      
      return result;
    } catch (error) {
      console.error(`Error executing action in room ${roomId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Valida uma ação sem executá-la
  public validateAction(roomId: string, action: GameAction): ActionValidation {
    const engine = this.gameEngines.get(roomId);
    if (!engine) {
      return {
        isValid: false,
        error: `No game engine found for room: ${roomId}`
      };
    }

    return engine.validateAction(action);
  }

  // Obtém as ações válidas para um jogador
  public getValidActions(roomId: string, playerId: string): string[] {
    const engine = this.gameEngines.get(roomId);
    if (!engine) {
      return [];
    }

    return engine.getValidActions(playerId);
  }

  // Obtém o estado de um jogo
  public getGameState(roomId: string): BaseGameState | undefined {
    const engine = this.gameEngines.get(roomId);
    return engine?.getGameState();
  }

  // Obtém o estado de um jogador específico
  public getPlayerState(roomId: string, playerId: string): Record<string, unknown> | undefined {
    const engine = this.gameEngines.get(roomId);
    return engine?.getPlayerState(playerId);
  }

  // Adiciona um jogador a um jogo existente
  public async addPlayerToGame(roomId: string, player: BasePlayer): Promise<boolean> {
    const engine = this.gameEngines.get(roomId);
    if (!engine) {
      return false;
    }

    if (!engine.canPlayerJoin(player.id)) {
      return false;
    }

    try {
      // O método addPlayer será implementado em cada engine específico
      // engine.addPlayer(player);
      return true;
    } catch (error) {
      console.error(`Error adding player to game ${roomId}:`, error);
      return false;
    }
  }

  // Remove um jogador de um jogo
  public async removePlayerFromGame(roomId: string, /* _playerId: string */): Promise<boolean> {
    const engine = this.gameEngines.get(roomId);
    if (!engine) {
      return false;
    }

    try {
      // O método removePlayer será implementado em cada engine específico
      // engine.removePlayer(playerId);
      return true;
    } catch (error) {
      console.error(`Error removing player from game ${roomId}:`, error);
      return false;
    }
  }

  // Finaliza um jogo
  public async endGame(roomId: string, winner?: string): Promise<void> {
    const engine = this.gameEngines.get(roomId);
    if (!engine) {
      return;
    }

    try {
      // Atualizar estado para finalizado
      const currentState = engine.getGameState();
      const finalState = {
        ...currentState,
        status: 'finished' as const,
        winner,
        updatedAt: new Date()
      };

      // Emitir evento de fim de jogo
      engine.addEventListener('gameEnded', { winner, finalState });
      
      // Limpar recursos
      engine.dispose();
      
    } catch (error) {
      console.error(`Error ending game ${roomId}:`, error);
    }
  }

  // Remove um jogo da memória
  public destroyGame(roomId: string): void {
    const engine = this.gameEngines.get(roomId);
    if (engine) {
      engine.dispose();
      this.gameEngines.delete(roomId);
    }
  }

  // Configura listeners para eventos do engine
  private setupEngineListeners(engine: GameEngine, roomId: string): void {
    engine.addEventListener('stateUpdated', (/* _state: BaseGameState */) => {
      // Aqui podemos adicionar lógica para sincronizar com o banco de dados
      console.log(`Game state updated for room ${roomId}`);
    });

    engine.addEventListener('playerJoined', (data: { player: BasePlayer }) => {
      console.log(`Player ${data.player.name} joined room ${roomId}`);
    });

    engine.addEventListener('playerLeft', (data: { player: BasePlayer }) => {
      console.log(`Player ${data.player.name} left room ${roomId}`);
    });

    engine.addEventListener('gameEnded', (data: { winner?: string }) => {
      console.log(`Game ended in room ${roomId}. Winner: ${data.winner || 'None'}`);
      // Remover o jogo após um tempo
      setTimeout(() => {
        this.destroyGame(roomId);
      }, 60000); // 1 minuto
    });
  }

  // Obtém estatísticas dos jogos ativos
  public getActiveGamesStats(): {
    totalGames: number;
    gamesByType: Record<GameType, number>;
    totalPlayers: number;
  } {
    const stats = {
      totalGames: this.gameEngines.size,
      gamesByType: {} as Record<GameType, number>,
      totalPlayers: 0
    };

    this.gameEngines.forEach(engine => {
      const gameType = engine.getGameType();
      stats.gamesByType[gameType] = (stats.gamesByType[gameType] || 0) + 1;
      stats.totalPlayers += engine.getPlayers().length;
    });

    return stats;
  }

  // Obtém informações de debug de todos os jogos
  public getDebugInfo(): Record<string, unknown>[] {
    const debugInfo: Record<string, unknown>[] = [];
    
    this.gameEngines.forEach((engine, roomId) => {
      debugInfo.push({
        roomId,
        ...engine.getDebugInfo()
      });
    });

    return debugInfo;
  }

  // Limpa todos os jogos (útil para testes)
  public clearAllGames(): void {
    this.gameEngines.forEach(engine => engine.dispose());
    this.gameEngines.clear();
  }
}

// Exportar instância singleton
export const gameManager = GameManager.getInstance();