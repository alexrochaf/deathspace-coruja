// Engine específico para o jogo Death Space

import { GameEngine } from '../base/GameEngine';
import {
  DeathSpaceGameState,
  DeathSpacePlayer,
  DeathSpaceAction,
  Ship,
  ShipType,
  Position,
  Debris,
  Council,
  DEATH_SPACE_CONSTANTS,
  DeathSpaceRuleValidation
} from '../../types/deathspace';


// Definir tipos localmente para evitar problemas de importação
interface ActionResult {
  success: boolean;
  newState?: DeathSpaceGameState;
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

export class DeathSpaceEngine extends GameEngine<
  DeathSpaceGameState,
  DeathSpacePlayer,
  DeathSpaceAction
> {
  private ruleValidator: DeathSpaceRuleValidation;

  constructor(roomId: string, initialState: DeathSpaceGameState) {
    super('deathspace', initialState);
    this.ruleValidator = this.createRuleValidator();
  }

  // Implementação dos métodos abstratos
  public validateAction(action: DeathSpaceAction): ActionValidation {
    if (!this.isGameActive()) {
      return { isValid: false, error: 'Game is not active' };
    }

    if (!this.isPlayerTurn(action.playerId)) {
      return { isValid: false, error: 'Not your turn' };
    }

    const player = this.getPlayer(action.playerId);
    if (!player || !player.isActive) {
      return { isValid: false, error: 'Player not found or inactive' };
    }

    const ship = this.gameState.ships.find(s => s.id === action.shipId);
    if (!ship || ship.playerId !== action.playerId) {
      return { isValid: false, error: 'Ship not found or not owned by player' };
    }

    if (ship.health <= 0) {
      return { isValid: false, error: 'Ship is destroyed' };
    }

    if (ship.actionPoints <= 0) {
      return { isValid: false, error: 'Ship has no action points' };
    }

    // Validações específicas por tipo de ação
    switch (action.type) {
      case 'MOVE':
        return this.validateMoveAction(ship, action.target as Position);
      case 'ATTACK':
        return this.validateAttackAction(ship, action.target as Position);
      case 'DONATE':
        return this.validateDonateAction(ship, action.target as string, action.points || 0);
      case 'RECOVER':
        return this.validateRecoverAction(ship);
      case 'IMPROVE':
        return this.validateImproveAction(ship, action.points || 0);
      default:
        return { isValid: false, error: 'Unknown action type' };
    }
  }

  public async executeAction(action: DeathSpaceAction): Promise<ActionResult> {
    const validation = this.validateAction(action);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const ship = this.gameState.ships.find(s => s.id === action.shipId)!;
    const logs: GameLog[] = [];

    try {
      switch (action.type) {
        case 'MOVE':
          await this.executeMoveAction(ship, action.target as Position, logs);
          break;
        case 'ATTACK':
          await this.executeAttackAction(ship, action.target as Position, logs);
          break;
        case 'DONATE':
          await this.executeDonateAction(ship, action.target as string, action.points!, logs);
          break;
        case 'RECOVER':
          await this.executeRecoverAction(ship, logs);
          break;
        case 'IMPROVE':
          await this.executeImproveAction(ship, action.points!, logs);
          break;
      }

      // Consumir ponto de ação
      ship.actionPoints -= 1;

      // Atualizar estado do jogo
      this.updateGameState({
        ships: [...this.gameState.ships],
        logs: [...(this.gameState.logs || []), ...logs]
      });

      // Verificar se o turno deve passar para o próximo jogador
      this.checkTurnEnd();

      return {
        success: true,
        newState: this.getGameState(),
        logs
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public getValidActions(playerId: string): string[] {
    if (!this.isPlayerTurn(playerId)) {
      return [];
    }

    const player = this.getPlayer(playerId);
    if (!player || !player.isActive) {
      return [];
    }

    const playerShips = this.gameState.ships.filter(
      s => s.playerId === playerId && s.health > 0 && s.actionPoints > 0
    );

    if (playerShips.length === 0) {
      return [];
    }

    return ['MOVE', 'ATTACK', 'DONATE', 'RECOVER', 'IMPROVE'];
  }

  public checkWinCondition(): { hasWinner: boolean; winner?: string } {
    const alivePlayers = this.gameState.players.filter(player =>
      this.gameState.ships.some(
        ship => ship.playerId === player.id && ship.health > 0
      )
    );

    if (alivePlayers.length <= DEATH_SPACE_CONSTANTS.WIN_CONDITION.SURVIVORS) {
      // Se há 4 ou menos jogadores, o jogo termina
      // O vencedor pode ser determinado por consenso ou outros critérios
      return {
        hasWinner: true,
        winner: alivePlayers.length === 1 ? alivePlayers[0].id : undefined
      };
    }

    return { hasWinner: false };
  }

  public async initializeGame(players: DeathSpacePlayer[], settings?: Record<string, unknown>): Promise<void> {
    // Configurar grid e debris
    const gridSize = settings?.gridSize || { width: 20, height: 20 };
    const debris = this.generateDebris(gridSize, settings?.debrisCount);
    
    // Posicionar naves dos jogadores
    const ships = this.generateInitialShips(players, gridSize, debris);
    
    // Configurar conselho (inicialmente vazio)
    const council: Council = {
      memberIds: [],
      votes: [],
      lastVoteTime: new Date()
    };

    this.updateGameState({
      status: 'playing',
      players,
      gridSize,
      debris,
      ships,
      council,
      currentPlayer: players[0]?.id,
      logs: [],
      gameSettings: {
        gridWidth: gridSize.width,
        gridHeight: gridSize.height,
        maxPlayers: settings?.maxPlayers || 8,
        pointDistributionInterval: 24,
        enableCouncil: true,
        enableChat: true,
        actionTimeWindows: settings?.actionTimeWindows || [],
        debrisCount: settings?.debrisCount || { asteroids: 10, satellites: 5 }
      }
    });

    this.emitEvent('gameInitialized', { players, settings });
  }

  public getPlayerState(playerId: string): Record<string, unknown> | null {
    const player = this.getPlayer(playerId);
    if (!player) return null;

    const playerShips = this.gameState.ships.filter(s => s.playerId === playerId);
    
    return {
      player,
      ships: playerShips,
      isMyTurn: this.isPlayerTurn(playerId),
      validActions: this.getValidActions(playerId),
      isCouncilMember: this.gameState.council.memberIds.includes(playerId)
    };
  }

  public canPlayerJoin(playerId: string): boolean {
    if (this.gameState.status !== 'waiting') {
      return false;
    }

    if (this.gameState.players.length >= (this.gameState.gameSettings?.maxPlayers || 8)) {
      return false;
    }

    return !this.gameState.players.some(p => p.id === playerId);
  }

  // Métodos específicos do Death Space
  public async voteInCouncil(voterId: string, targetPlayerId: string): Promise<ActionResult> {
    if (!this.gameState.council.memberIds.includes(voterId)) {
      return { success: false, error: 'Player is not a council member' };
    }

    if (this.gameState.council.votes.some(v => v.playerId === voterId)) {
      return { success: false, error: 'Player has already voted' };
    }

    const voteWeight = this.gameState.council.memberIds[0] === voterId ? 
      DEATH_SPACE_CONSTANTS.COUNCIL_VOTE_WEIGHT.FIRST_DEAD : 
      DEATH_SPACE_CONSTANTS.COUNCIL_VOTE_WEIGHT.OTHERS;

    const newVote = {
      playerId: voterId,
      votedFor: targetPlayerId,
      voteWeight
    };

    const updatedVotes = [...this.gameState.council.votes, newVote];
    
    this.updateGameState({
      council: {
        ...this.gameState.council,
        votes: updatedVotes
      }
    });

    // Verificar se todos votaram
    if (updatedVotes.length === this.gameState.council.memberIds.length) {
      await this.processCouncilVotes();
    }

    return { success: true, newState: this.getGameState() };
  }

  private async processCouncilVotes(): Promise<void> {
    const voteCount = new Map<string, number>();
    
    this.gameState.council.votes.forEach(vote => {
      const currentCount = voteCount.get(vote.votedFor) || 0;
      voteCount.set(vote.votedFor, currentCount + vote.voteWeight);
    });

    const logs: GameLog[] = [];
    
    // Dar 1 PA extra para jogadores com 3+ votos
    voteCount.forEach((votes, playerId) => {
      if (votes >= 3) {
        const ship = this.gameState.ships.find(
          s => s.playerId === playerId && s.health > 0
        );
        if (ship) {
          ship.actionPoints += 1;
          logs.push(this.createLog(playerId, 'POINT_DISTRIBUTION', {
            points: 1,
            type: 'council_vote'
          }));
        }
      }
    });

    // Limpar votos
    this.updateGameState({
      council: {
        ...this.gameState.council,
        votes: [],
        lastVoteTime: new Date()
      },
      logs: [...(this.gameState.logs || []), ...logs]
    });
  }

  // Métodos de validação específicos
  private validateMoveAction(ship: Ship, target: Position): ActionValidation {
    if (!target || typeof target.x !== 'number' || typeof target.y !== 'number') {
      return { isValid: false, error: 'Invalid target position' };
    }

    if (!this.ruleValidator.canMove(ship, target)) {
      return { isValid: false, error: 'Cannot move to that position' };
    }

    return { isValid: true };
  }

  private validateAttackAction(ship: Ship, target: Position): ActionValidation {
    if (!target || typeof target.x !== 'number' || typeof target.y !== 'number') {
      return { isValid: false, error: 'Invalid target position' };
    }

    if (!this.ruleValidator.canAttack(ship, target)) {
      return { isValid: false, error: 'Cannot attack that position' };
    }

    return { isValid: true };
  }

  private validateDonateAction(ship: Ship, targetShipId: string, points: number): ActionValidation {
    if (!targetShipId || points <= 0) {
      return { isValid: false, error: 'Invalid donation parameters' };
    }

    const targetShip = this.gameState.ships.find(s => s.id === targetShipId);
    if (!targetShip) {
      return { isValid: false, error: 'Target ship not found' };
    }

    if (!this.ruleValidator.canDonate(ship, targetShip, points)) {
      return { isValid: false, error: 'Cannot donate to that ship' };
    }

    return { isValid: true };
  }

  private validateRecoverAction(ship: Ship): ActionValidation {
    if (!this.ruleValidator.canRecover(ship)) {
      return { isValid: false, error: 'Cannot recover at this time' };
    }

    return { isValid: true };
  }

  private validateImproveAction(ship: Ship, points: number): ActionValidation {
    if (points <= 0) {
      return { isValid: false, error: 'Invalid improvement points' };
    }

    if (!this.ruleValidator.canImprove(ship, points)) {
      return { isValid: false, error: 'Cannot improve ship' };
    }

    return { isValid: true };
  }

  // Métodos de execução de ações
  private async executeMoveAction(ship: Ship, target: Position, logs: GameLog[]): Promise<void> {
    const oldPosition = { ...ship.position };
    ship.position = target;
    
    logs.push(this.createLog(ship.playerId, 'MOVE', {
      fromPosition: oldPosition,
      toPosition: target,
      shipId: ship.id
    }));

    this.emitEvent('shipMoved', { ship, oldPosition, newPosition: target });
  }

  private async executeAttackAction(ship: Ship, target: Position, logs: GameLog[]): Promise<void> {
    // Implementar lógica de ataque
    const targetShip = this.gameState.ships.find(
      s => s.position.x === target.x && s.position.y === target.y && s.health > 0
    );
    
    const targetDebris = this.gameState.debris.find(
      d => d.position.x === target.x && d.position.y === target.y
    );

    if (targetShip) {
      const damage = 25; // Dano base
      targetShip.health -= damage;
      
      if (targetShip.health <= 0) {
        targetShip.health = 0;
        // Adicionar ao conselho se morreu
        if (!this.gameState.council.memberIds.includes(targetShip.playerId)) {
          this.gameState.council.memberIds.push(targetShip.playerId);
        }
        
        logs.push(this.createLog(ship.playerId, 'DESTROY', {
          targetShipId: targetShip.id,
          damage
        }));
      } else {
        logs.push(this.createLog(ship.playerId, 'ATTACK', {
          targetShipId: targetShip.id,
          damage
        }));
      }
    } else if (targetDebris) {
      const damage = 25;
      targetDebris.health -= damage;
      
      if (targetDebris.health <= 0) {
        const debrisIndex = this.gameState.debris.indexOf(targetDebris);
        this.gameState.debris.splice(debrisIndex, 1);
      }
      
      logs.push(this.createLog(ship.playerId, 'ATTACK', {
        targetDebrisId: targetDebris.id,
        damage
      }));
    }
  }

  private async executeDonateAction(ship: Ship, targetShipId: string, points: number, logs: GameLog[]): Promise<void> {
    const targetShip = this.gameState.ships.find(s => s.id === targetShipId)!;
    
    ship.actionPoints -= points;
    targetShip.actionPoints += points;
    
    logs.push(this.createLog(ship.playerId, 'DONATE', {
      targetShipId,
      points
    }));
  }

  private async executeRecoverAction(ship: Ship, logs: GameLog[]): Promise<void> {
    const recovery = 25;
    ship.health = Math.min(ship.health + recovery, DEATH_SPACE_CONSTANTS.SHIP_STATS[ship.type].health);
    
    logs.push(this.createLog(ship.playerId, 'RECOVER', {
      shipId: ship.id,
      recovery
    }));
  }

  private async executeImproveAction(ship: Ship, points: number, logs: GameLog[]): Promise<void> {
    // Implementar melhoria da nave
    ship.reach += 1; // Exemplo: aumentar alcance
    
    logs.push(this.createLog(ship.playerId, 'IMPROVE', {
      shipId: ship.id,
      improvement: 'reach',
      points
    }));
  }

  // Métodos utilitários
  private createRuleValidator(): DeathSpaceRuleValidation {
    return {
      canMove: (ship: Ship, target: Position) => {
        const distance = Math.max(
          Math.abs(target.x - ship.position.x),
          Math.abs(target.y - ship.position.y)
        );
        return distance <= ship.reach && 
               !this.ruleValidator.isPositionOccupied(target, this.gameState.ships, this.gameState.debris);
      },
      
      canAttack: (ship: Ship, target: Position) => {
        const distance = Math.max(
          Math.abs(target.x - ship.position.x),
          Math.abs(target.y - ship.position.y)
        );
        return distance <= ship.reach;
      },
      
      canDonate: (donor: Ship, recipient: Ship, points: number) => {
        return donor.actionPoints >= points && recipient.health > 0;
      },
      
      canRecover: (ship: Ship) => {
        return ship.health < DEATH_SPACE_CONSTANTS.SHIP_STATS[ship.type].health;
      },
      
      canImprove: (ship: Ship, points: number) => {
        return ship.actionPoints >= points;
      },
      
      isInRange: (from: Position, to: Position, range: number) => {
        const distance = Math.max(
          Math.abs(to.x - from.x),
          Math.abs(to.y - from.y)
        );
        return distance <= range;
      },
      
      isPositionOccupied: (position: Position, ships: Ship[], debris: Debris[]) => {
        return ships.some(s => s.position.x === position.x && s.position.y === position.y && s.health > 0) ||
               debris.some(d => d.position.x === position.x && d.position.y === position.y);
      }
    };
  }

  private generateDebris(gridSize: { width: number; height: number }, debrisCount?: { asteroids?: number; satellites?: number }): Debris[] {
    const debris: Debris[] = [];
    const asteroidCount = debrisCount?.asteroids || 10;
    const satelliteCount = debrisCount?.satellites || 5;
    
    // Gerar asteroides
    for (let i = 0; i < asteroidCount; i++) {
      debris.push({
        id: crypto.randomUUID(),
        type: 'asteroid',
        position: this.generateRandomPosition(gridSize, []),
        health: DEATH_SPACE_CONSTANTS.DEBRIS_HEALTH.asteroid
      });
    }
    
    // Gerar satélites
    for (let i = 0; i < satelliteCount; i++) {
      debris.push({
        id: crypto.randomUUID(),
        type: 'satellite',
        position: this.generateRandomPosition(gridSize, debris.map(d => d.position)),
        health: DEATH_SPACE_CONSTANTS.DEBRIS_HEALTH.satellite
      });
    }
    
    return debris;
  }

  private generateInitialShips(players: DeathSpacePlayer[], gridSize: { width: number; height: number }, debris: Debris[]): Ship[] {
    const ships: Ship[] = [];
    const occupiedPositions = debris.map(d => d.position);
    
    players.forEach(player => {
      // Assumir que cada jogador tem uma nave inicial (pode ser configurável)
      const shipType: ShipType = 'fighter'; // Padrão, pode ser escolhido pelo jogador
      const stats = DEATH_SPACE_CONSTANTS.SHIP_STATS[shipType];
      
      const ship: Ship = {
        id: crypto.randomUUID(),
        type: shipType,
        position: this.generateRandomPosition(gridSize, occupiedPositions),
        health: stats.health,
        actionPoints: stats.actionPoints,
        reach: stats.reach,
        playerId: player.id
      };
      
      ships.push(ship);
      occupiedPositions.push(ship.position);
    });
    
    return ships;
  }

  private generateRandomPosition(gridSize: { width: number; height: number }, occupiedPositions: Position[]): Position {
    let position: Position;
    do {
      position = {
        x: Math.floor(Math.random() * gridSize.width),
        y: Math.floor(Math.random() * gridSize.height)
      };
    } while (occupiedPositions.some(pos => pos.x === position.x && pos.y === position.y));
    
    return position;
  }

  private checkTurnEnd(): void {
    const currentPlayer = this.getPlayer(this.gameState.currentPlayer!);
    if (!currentPlayer) return;

    const playerShips = this.gameState.ships.filter(
      s => s.playerId === currentPlayer.id && s.health > 0
    );

    const hasActionsLeft = playerShips.some(s => s.actionPoints > 0);
    
    if (!hasActionsLeft) {
      this.nextTurn();
    }
  }

  private nextTurn(): void {
    const activePlayers = this.gameState.players.filter(p => p.isActive);
    const currentIndex = activePlayers.findIndex(p => p.id === this.gameState.currentPlayer);
    const nextIndex = (currentIndex + 1) % activePlayers.length;
    
    this.updateGameState({
      currentPlayer: activePlayers[nextIndex].id
    });
    
    this.emitEvent('turnChanged', { 
      previousPlayer: this.gameState.currentPlayer,
      currentPlayer: activePlayers[nextIndex].id 
    });
  }
}