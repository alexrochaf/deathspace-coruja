// Engine específico para o jogo Munchkin

import { GameEngine } from '../base/GameEngine';
import type {
  MunchkinGameState,
  MunchkinPlayer,
  MunchkinAction,
  Card,
  Combat,
  MunchkinRuleValidation,
  Bonus
} from '../../types/munchkin';
import { MUNCHKIN_CONSTANTS } from '../../types/munchkin';
// Definir tipos localmente para evitar problemas de importação
interface ActionResult {
  success: boolean;
  newState?: MunchkinGameState;
  error?: string;
}

interface ActionValidation {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}



import { generateDeck, shuffleDeck } from '../../data/munchkinCards';

export class MunchkinEngine extends GameEngine<
  MunchkinGameState,
  MunchkinPlayer,
  MunchkinAction
> {
  private ruleValidator: MunchkinRuleValidation;

  constructor(roomId: string, initialState?: Partial<MunchkinGameState>) {
    const defaultState: MunchkinGameState = {
      gameType: 'munchkin',
      status: 'waiting',
      currentPlayer: '',
      players: [],
      turnPhase: 1,
      doorDeck: [],
      treasureDeck: [],
      doorDiscard: [],
      treasureDiscard: [],
      gameSettings: {
        maxLevel: 10,
        enableTimer: false,
        turnTimeLimit: 300,
        allowSpectators: true,
        customRules: [],
        deckConfiguration: 'basic'
      },
      ...initialState
    };
    super('munchkin', defaultState);
    this.ruleValidator = this.createRuleValidator();
  }

  // Implementação dos métodos abstratos
  public validateAction(action: MunchkinAction): ActionValidation {
    const state = this.getGameState();
    
    // START_GAME é um caso especial - não precisa verificar se o jogador existe no gameState
    // pois os jogadores ainda não foram inicializados no estado do jogo
    if (action.type === 'START_GAME') {
      console.log('[MunchkinEngine] Validating START_GAME action for player:', action.playerId);
      return this.validateStartGame(state, action.playerId);
    }
    
    // Para outras ações, verificar se o jogador existe no estado do jogo
    const player = state.players.find(p => p.id === action.playerId);
    
    if (!player) {
      console.log('[MunchkinEngine] Player not found in game state:', action.playerId);
      return { isValid: false, error: 'Jogador não encontrado' };
    }

    // Verificar se é o turno do jogador (exceto para certas ações)
    const actionsAllowedOutOfTurn = ['HELP_COMBAT', 'INTERFERE_COMBAT'];
    if (state.currentPlayer !== action.playerId && !actionsAllowedOutOfTurn.includes(action.type)) {
      return { isValid: false, error: 'Não é seu turno' };
    }

    switch (action.type) {
      case 'KICK_DOOR':
        return this.validateKickDoor(state);
      case 'LOOK_FOR_TROUBLE':
        return this.validateLookForTrouble(state);
      case 'PLAY_CARD':
        return this.validatePlayCard(state, player, action.cardId!);
      case 'EQUIP_ITEM':
        return this.validateEquipItem(state, player, action.cardId!);
      case 'SELL_ITEMS':
        return this.validateSellItems(state, player, action.cardIds || []);
      case 'DISCARD_CARDS':
        return this.validateDiscardCards(state, player, action.cardIds || []);
      case 'HELP_COMBAT':
        return this.validateHelpCombat(state, player);
      case 'INTERFERE_COMBAT':
        return this.validateInterfereCombat(state, player);
      case 'ESCAPE_COMBAT':
        return this.validateEscapeCombat(state, player);
      case 'END_TURN':
        return this.validateEndTurn(state, player);
      default:
        console.warn('[MunchkinEngine] Ação não reconhecida:', action.type);
        return { isValid: false, error: `Ação '${action.type}' não é válida ou não está implementada` };
    }
  }

  public async executeAction(action: MunchkinAction): Promise<ActionResult> {
    const validation = this.validateAction(action);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const state = this.getGameState();
    let newState = { ...state };

    try {
      switch (action.type) {
        case 'START_GAME': {
          // Para START_GAME, precisamos dos jogadores da sala
          const startGameAction = action as MunchkinAction & { players?: MunchkinPlayer[] };
          const players = startGameAction.players || [];
          console.log('[MunchkinEngine] executeAction START_GAME with players:', players.length);
          newState = await this.executeStartGame(newState, players);
          break;
        }
        case 'KICK_DOOR':
          newState = await this.executeKickDoor(newState, action.playerId);
          break;
        case 'LOOK_FOR_TROUBLE':
          newState = await this.executeLookForTrouble(newState, action.playerId, action.cardId!);
          break;
        case 'PLAY_CARD':
          newState = await this.executePlayCard(newState, action.playerId, action.cardId!);
          break;
        case 'EQUIP_ITEM': {
          const equipResult = await this.equipItem(action.playerId, action.cardId!);
          if (!equipResult.success) {
            throw new Error(equipResult.error);
          }
          newState = equipResult.newState || newState;
          break;
        }
        case 'SELL_ITEMS': {
          const sellResult = await this.sellItems(action.playerId, action.cardIds || []);
          if (!sellResult.success) {
            throw new Error(sellResult.error);
          }
          newState = sellResult.newState || newState;
          break;
        }
        case 'HELP_COMBAT':
          newState = await this.executeHelpCombat(newState, action.playerId);
          break;
        case 'INTERFERE_COMBAT':
          newState = await this.executeInterfereCombat(newState, action.playerId, action.cardId!);
          break;
        case 'ESCAPE_COMBAT':
          newState = await this.executeEscapeCombat(newState, action.playerId);
          break;
        case 'DISCARD_CARDS':
          newState = await this.executeDiscardCards(newState, action.playerId, action.cardIds || []);
          break;
        case 'END_TURN':
          newState = await this.executeEndTurn(newState, action.playerId);
          break;
      }

      this.updateGameState(newState);
      return { success: true, newState };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  public getValidActions(playerId: string): string[] {
    const state = this.getGameState();
    const player = state.players.find(p => p.id === playerId);
    
    if (!player || state.currentPlayer !== playerId) {
      return [];
    }

    const actions: string[] = [];

    switch (state.turnPhase) {
      case 1: // Fase de Chutar a Porta
        actions.push('KICK_DOOR');
        break;
      case 2: // Fase de Procurar Encrenca
        if (!state.currentCombat) {
          actions.push('LOOK_FOR_TROUBLE');
        }
        break;
      case 3: // Fase de Saquear
        actions.push('PLAY_CARD');
        // Adicionar ações de equipar e vender itens
        if (player.hand.treasure.some(c => c.subtype === 'equipment')) {
          actions.push('EQUIP_ITEM');
        }
        if (player.hand.treasure.some(c => c.goldValue && c.goldValue > 0) || 
            Object.values(player.equipment).some(c => c && c.goldValue && c.goldValue > 0)) {
          actions.push('SELL_ITEMS');
        }
        actions.push('END_TURN');
        break;
      case 4: // Fase de Caridade
        if (player.hand.door.length + player.hand.treasure.length > 5) {
          actions.push('DISCARD_CARDS');
        }
        actions.push('END_TURN');
        break;
    }

    // Ações sempre disponíveis durante o turno (exceto durante combate)
    if (!state.currentCombat) {
      // Permitir equipar itens em qualquer fase do turno
      if (player.hand.treasure.some(c => c.subtype === 'equipment')) {
        if (!actions.includes('EQUIP_ITEM')) {
          actions.push('EQUIP_ITEM');
        }
      }
      // Permitir vender itens em qualquer fase do turno
      if (player.hand.treasure.some(c => c.goldValue && c.goldValue > 0) || 
          Object.values(player.equipment).some(c => c && c.goldValue && c.goldValue > 0)) {
        if (!actions.includes('SELL_ITEMS')) {
          actions.push('SELL_ITEMS');
        }
      }
    }

    // Ações disponíveis durante combate
    if (state.currentCombat) {
      if (state.currentCombat.player.id === playerId) {
        actions.push('ESCAPE_COMBAT');
      } else {
        actions.push('HELP_COMBAT', 'INTERFERE_COMBAT');
      }
    }

    return actions;
  }

  public checkWinCondition(): { hasWinner: boolean; winner?: string } {
    const state = this.getGameState();
    const winner = state.players.find(p => p.level >= state.gameSettings.maxLevel);
    
    return {
      hasWinner: !!winner,
      winner: winner?.id
    };
  }

  // Métodos do sistema de níveis e progressão
  public async levelUp(playerId: string, method: 'combat' | 'sell'): Promise<ActionResult> {
    const state = this.getGameState();
    const player = state.players.find(p => p.id === playerId);
    
    if (!player) {
      return { success: false, error: 'Jogador não encontrado' };
    }

    if (player.level >= state.gameSettings.maxLevel) {
      return { success: false, error: 'Jogador já está no nível máximo' };
    }

    const newState = { ...state };
    const newPlayer = newState.players.find(p => p.id === playerId)!;

    if (method === 'combat') {
      // Subir nível por combate (já implementado no handleCombatVictory)
      newPlayer.level += 1;
    } else if (method === 'sell') {
      // Verificar se pode subir nível vendendo itens
      const canLevelUp = this.canLevelUpBySelling(newPlayer);
      if (!canLevelUp.canLevel) {
        return { success: false, error: canLevelUp.reason };
      }
      
      // Subir nível vendendo itens
      newPlayer.level += 1;
    }

    // Verificar condição de vitória
    const winCondition = this.checkWinCondition();
    if (winCondition.hasWinner) {
      newState.status = 'finished';
      this.emitEvent('gameEnded', {
        winner: winCondition.winner,
        reason: 'level_victory'
      });
    }

    this.updateGameState(newState);
    this.emitEvent('playerLeveledUp', {
      playerId,
      newLevel: newPlayer.level,
      method
    });

    return { success: true, newState };
  }

  public async sellItems(playerId: string, itemIds: string[]): Promise<ActionResult> {
    const state = this.getGameState();
    const player = state.players.find(p => p.id === playerId);
    
    if (!player) {
      return { success: false, error: 'Jogador não encontrado' };
    }

    const newState = { ...state };
    const newPlayer = newState.players.find(p => p.id === playerId)!;
    
    let totalValue = 0;
    const soldItems: Card[] = [];

    // Verificar e vender itens da mão
    for (const itemId of itemIds) {
      const treasureItem = newPlayer.hand.treasure.find(c => c.id === itemId);
      if (treasureItem && (treasureItem.subtype === 'equipment' || treasureItem.goldValue)) {
        const itemValue = treasureItem.goldValue || 100; // Valor padrão
        totalValue += itemValue;
        soldItems.push(treasureItem);
        newPlayer.hand.treasure = newPlayer.hand.treasure.filter(c => c.id !== itemId);
        newState.treasureDiscard.push(treasureItem);
      }
    }

    // Verificar e vender itens equipados
    for (const itemId of itemIds) {
      const equipmentSlots = Object.keys(newPlayer.equipment) as (keyof typeof newPlayer.equipment)[];
      for (const slot of equipmentSlots) {
        const equippedItem = newPlayer.equipment[slot];
        if (Array.isArray(equippedItem)) {
          // Para slots que são arrays (hands, big)
          const itemIndex = equippedItem.findIndex(item => item?.id === itemId);
          if (itemIndex !== -1) {
            const item = equippedItem[itemIndex];
            if (item && item.goldValue) {
              totalValue += item.goldValue;
              soldItems.push(item);
              equippedItem.splice(itemIndex, 1);
              newState.treasureDiscard.push(item);
            }
          }
        } else if (equippedItem?.id === itemId) {
          // Para slots únicos (armor, helmet, boots, etc.)
          if (equippedItem.goldValue) {
            totalValue += equippedItem.goldValue;
            soldItems.push(equippedItem);
            (newPlayer.equipment as Record<string, Card | null | Card[]>)[slot] = null;
            newState.treasureDiscard.push(equippedItem);
          }
        }
      }
    }

    if (soldItems.length === 0) {
      return { success: false, error: 'Nenhum item válido foi encontrado para venda' };
    }

    // Verificar se pode subir nível (1000 moedas de ouro = 1 nível)
    const levelsGained = Math.floor(totalValue / 1000);
    const remainingGold = totalValue % 1000;
    let message = `Vendeu ${soldItems.length} item(s) por ${totalValue} moedas de ouro.`;

    if (levelsGained > 0) {
      const maxLevelGain = state.gameSettings.maxLevel - newPlayer.level;
      const actualLevelsGained = Math.min(levelsGained, maxLevelGain);
      newPlayer.level += actualLevelsGained;
      message += ` Subiu ${actualLevelsGained} nível(s)!`;

      // Verificar condição de vitória
      const winCondition = this.checkWinCondition();
      if (winCondition.hasWinner) {
        newState.status = 'finished';
        this.emitEvent('gameEnded', {
          winner: winCondition.winner,
          reason: 'level_victory'
        });
      }
    }

    this.updateGameState(newState);
    this.emitEvent('itemsSold', {
      playerId,
      soldItems: soldItems.map(i => i.name),
      totalValue,
      levelsGained: levelsGained || 0,
      remainingGold
    });

    return { success: true, newState, message };
  }

  private canLevelUpBySelling(player: MunchkinPlayer): { canLevel: boolean; reason?: string } {
    // Calcular valor total dos itens vendáveis
    const treasureItems = player.hand.treasure.filter(c => c.subtype === 'equipment');
    const totalValue = treasureItems.reduce((sum, item) => sum + (item.goldValue || 100), 0);
    
    if (totalValue < 1000) {
      return {
        canLevel: false,
        reason: `Valor insuficiente. Tem ${totalValue} moedas, precisa de 1000.`
      };
    }

    return { canLevel: true };
  }

  public getPlayerProgression(playerId: string): {
    currentLevel: number;
    maxLevel: number;
    progressToNext: number;
    canSellForLevel: boolean;
    sellableValue: number;
  } | null {
    const state = this.getGameState();
    const player = state.players.find(p => p.id === playerId);
    
    if (!player) return null;

    const treasureItems = player.hand.treasure.filter(c => c.subtype === 'equipment');
    const sellableValue = treasureItems.reduce((sum, item) => sum + (item.goldValue || 100), 0);
    const progressToNext = sellableValue / 1000;

    return {
      currentLevel: player.level,
      maxLevel: state.gameSettings.maxLevel,
      progressToNext: Math.min(progressToNext, 1),
      canSellForLevel: sellableValue >= 1000,
      sellableValue
    };
  }

  // Método para aplicar bônus temporários
  public async applyTemporaryBonus(playerId: string, bonus: Bonus): Promise<ActionResult> {
    const state = this.getGameState();
    const player = state.players.find(p => p.id === playerId);
    
    if (!player) {
      return { success: false, error: 'Jogador não encontrado' };
    }

    const newState = { ...state };
    const newPlayer = newState.players.find(p => p.id === playerId)!;
    
    // Adicionar bônus temporário
    newPlayer.temporaryBonuses.push(bonus);

    this.updateGameState(newState);
    this.emitEvent('bonusApplied', {
      playerId,
      bonus
    });

    return { success: true, newState };
  }

  // Método para limpar bônus expirados
  public cleanExpiredBonuses(): void {
    const state = this.getGameState();
    const newState = { ...state };
    
    newState.players.forEach(player => {
      player.temporaryBonuses = player.temporaryBonuses.filter(bonus => {
        if (bonus.duration === 'turn') {
          return false; // Remove bônus de turno
        } else if (bonus.duration === 'combat' && !newState.currentCombat) {
          return false; // Remove bônus de combate quando não há combate
        }
        return true;
      });
    });

    this.updateGameState(newState);
  }

  public async initializeGame(players: MunchkinPlayer[], settings?: Partial<MunchkinGameState['gameSettings']>): Promise<void> {
    const { doorCards, treasureCards } = generateDeck();
    
    const newState: MunchkinGameState = {
      ...this.getGameState(),
      players: players.map(p => ({
        ...p,
        level: 1,
        hand: { door: [], treasure: [] },
        equipment: { hands: [], big: [] },
        temporaryBonuses: [],
        isDead: false
      })),
      doorDeck: shuffleDeck(doorCards),
      treasureDeck: shuffleDeck(treasureCards),
      doorDiscard: [],
      treasureDiscard: [],
      currentPlayer: players[0]?.id || '',
      turnPhase: 1,
      status: 'playing',
      gameSettings: {
        ...this.getGameState().gameSettings,
        ...settings
      }
    };

    // Distribuir cartas iniciais
    newState.players.forEach(player => {
      player.hand.door = newState.doorDeck.splice(0, 4);
      player.hand.treasure = newState.treasureDeck.splice(0, 4);
    });

    this.updateGameState(newState);
    this.emitEvent('gameInitialized', { players, settings });
  }

  public getPlayerState(playerId: string): Record<string, unknown> {
    const state = this.getGameState();
    const player = state.players.find(p => p.id === playerId);
    return player ? { ...player } : {};
  }

  public canPlayerJoin(playerId: string): boolean {
    const state = this.getGameState();
    return state.status === 'waiting' && 
           state.players.length < 6 && 
           !state.players.some(p => p.id === playerId);
  }

  // Métodos de validação específicos
  private validateKickDoor(state: MunchkinGameState): ActionValidation {
    if (state.turnPhase !== 1) {
      return { isValid: false, error: 'Só pode chutar a porta na fase 1' };
    }
    if (state.doorDeck.length === 0) {
      return { isValid: false, error: 'Baralho de porta vazio' };
    }
    return { isValid: true };
  }

  private validateLookForTrouble(state: MunchkinGameState): ActionValidation {
    if (state.turnPhase !== 2) {
      return { isValid: false, error: 'Só pode procurar encrenca na fase 2' };
    }
    if (state.currentCombat) {
      return { isValid: false, error: 'Já há um combate em andamento' };
    }
    return { isValid: true };
  }

  private validatePlayCard(state: MunchkinGameState, player: MunchkinPlayer, cardId: string): ActionValidation {
    const card = [...player.hand.door, ...player.hand.treasure].find(c => c.id === cardId);
    if (!card) {
      return { isValid: false, error: 'Carta não encontrada na mão' };
    }

    // Verificar se a carta pode ser jogada na fase atual
    if (card.type === 'monster') {
      // Monstros podem ser jogados na fase da porta ou como "Look for Trouble"
      if (state.phase !== 'door' && state.phase !== 'loot') {
        return { isValid: false, error: 'Monstros só podem ser jogados na fase da porta ou saque' };
      }
    }

    if (card.type === 'item') {
      // Itens podem ser equipados fora de combate ou como cartas de combate durante combate
      // Permitir sempre, a lógica específica será tratada na execução
    }

    if (card.type === 'curse') {
      // Maldições podem ser jogadas em outros jogadores, mas não durante combate próprio
      if (state.currentCombat && state.currentCombat.player.id === player.id) {
        return { isValid: false, error: 'Não pode jogar maldições durante seu próprio combate' };
      }
    }

    return { isValid: true };
  }

  private validateHelpCombat(state: MunchkinGameState, player: MunchkinPlayer): ActionValidation {
    if (!state.currentCombat) {
      return { isValid: false, error: 'Não há combate em andamento' };
    }
    if (state.currentCombat.player.id === player.id) {
      return { isValid: false, error: 'Não pode ajudar a si mesmo' };
    }
    return { isValid: true };
  }

  private validateInterfereCombat(state: MunchkinGameState, player: MunchkinPlayer): ActionValidation {
    if (!state.currentCombat) {
      return { isValid: false, error: 'Não há combate em andamento' };
    }
    if (state.currentCombat.player.id === player.id) {
      return { isValid: false, error: 'Não pode interferir em seu próprio combate' };
    }
    return { isValid: true };
  }

  private validateEscapeCombat(state: MunchkinGameState, player: MunchkinPlayer): ActionValidation {
    if (!state.currentCombat) {
      return { isValid: false, error: 'Não há combate em andamento' };
    }
    if (state.currentCombat.player.id !== player.id) {
      return { isValid: false, error: 'Só pode fugir do próprio combate' };
    }
    return { isValid: true };
  }

  private validateEquipItem(state: MunchkinGameState, player: MunchkinPlayer, itemId: string): ActionValidation {
    const item = player.hand.treasure.find(c => c.id === itemId);
    if (!item) {
      return { isValid: false, error: 'Item não encontrado na mão' };
    }
    if (item.subtype !== 'equipment') {
      return { isValid: false, error: 'Item não é um equipamento' };
    }
    
    const canEquip = this.canEquipItem(player, item);
    if (!canEquip.canEquip) {
      return { isValid: false, error: canEquip.reason || 'Não pode equipar este item' };
    }
    
    return { isValid: true };
  }

  private validateSellItems(state: MunchkinGameState, player: MunchkinPlayer, itemIds: string[]): ActionValidation {
    if (itemIds.length === 0) {
      return { isValid: false, error: 'Nenhum item selecionado para venda' };
    }
    
    for (const itemId of itemIds) {
      const item = player.hand.treasure.find(c => c.id === itemId) || 
                   Object.values(player.equipment).find(c => c?.id === itemId);
      if (!item) {
        return { isValid: false, error: `Item ${itemId} não encontrado` };
      }
      if (!item.goldValue || item.goldValue <= 0) {
        return { isValid: false, error: `Item ${item.name} não pode ser vendido` };
      }
    }
    
    return { isValid: true };
  }

  private validateDiscardCards(state: MunchkinGameState, player: MunchkinPlayer, cardIds: string[]): ActionValidation {
    if (cardIds.length === 0) {
      return { isValid: false, error: 'Nenhuma carta selecionada para descartar' };
    }

    // Verificar se todas as cartas estão na mão do jogador
    const allCards = [...player.hand.door, ...player.hand.treasure];
    for (const cardId of cardIds) {
      if (!allCards.find(c => c.id === cardId)) {
        return { isValid: false, error: 'Uma ou mais cartas não estão na sua mão' };
      }
    }

    // Verificar se o jogador precisa descartar cartas (mais de 5 na mão)
    const totalCards = player.hand.door.length + player.hand.treasure.length;
    if (totalCards <= 5) {
      return { isValid: false, error: 'Você não precisa descartar cartas (máximo 5 na mão)' };
    }

    return { isValid: true };
  }

  private validateEndTurn(state: MunchkinGameState, player: MunchkinPlayer): ActionValidation {
    if (state.currentCombat && state.currentCombat.player.id === player.id) {
      return { isValid: false, error: 'Não pode terminar turno durante combate' };
    }

    // Verificar se o jogador tem mais de 5 cartas na mão
    const totalCards = player.hand.door.length + player.hand.treasure.length;
    if (totalCards > 5) {
      return { isValid: false, error: 'Você deve descartar cartas antes de terminar o turno (máximo 5 na mão)' };
    }

    return { isValid: true };
  }

  private validateStartGame(state: MunchkinGameState, playerId: string): ActionValidation {
    console.log('[MunchkinEngine] validateStartGame - state.status:', state.status);
    console.log('[MunchkinEngine] validateStartGame - state.hostId:', state.hostId);
    console.log('[MunchkinEngine] validateStartGame - playerId:', playerId);
    console.log('[MunchkinEngine] validateStartGame - players count:', state.players.length);
    
    if (state.status !== 'waiting') {
      console.log('[MunchkinEngine] Game already started, status:', state.status);
      return { isValid: false, error: 'O jogo já foi iniciado' };
    }
    
    // Para START_GAME, os jogadores podem ainda não estar no gameState
    // A validação de número de jogadores será feita no executeStartGame
    
    // Verificar se é o host usando o hostId do estado
    const isHost = state.hostId === playerId;
    console.log('[MunchkinEngine] Is host check:', isHost);
    
    if (!isHost) {
      console.log('[MunchkinEngine] Only host can start game. Host:', state.hostId, 'Player:', playerId);
      return { isValid: false, error: 'Apenas o host pode iniciar o jogo' };
    }
    
    console.log('[MunchkinEngine] START_GAME validation passed');
    return { isValid: true };
  }

  // Métodos de execução específicos
  private async executeKickDoor(state: MunchkinGameState, playerId: string): Promise<MunchkinGameState> {
    const newState = { ...state };
    const player = newState.players.find(p => p.id === playerId)!;
    const drawnCard = newState.doorDeck.shift()!;

    if (drawnCard.subtype === 'monster') {
      // Iniciar combate
      newState.currentCombat = {
        id: `combat_${Date.now()}`,
        player,
        monster: drawnCard,
        helpers: [],
        interferors: [],
        bonusCards: [],
        totalPlayerStrength: this.calculatePlayerStrength(player),
        totalMonsterStrength: drawnCard.level || 1,
        status: 'ongoing',
        canEscape: true
      };
    } else if (drawnCard.subtype === 'curse') {
      // Aplicar maldição
      await this.applyCurse(newState, player, drawnCard);
      newState.doorDiscard.push(drawnCard);
    } else {
      // Adicionar à mão
      player.hand.door.push(drawnCard);
    }

    newState.turnPhase = 2;
    return newState;
  }

  private async executeLookForTrouble(state: MunchkinGameState, playerId: string, cardId: string): Promise<MunchkinGameState> {
    const newState = { ...state };
    const player = newState.players.find(p => p.id === playerId)!;
    const monsterCard = player.hand.door.find(c => c.id === cardId && c.subtype === 'monster');

    if (monsterCard) {
      // Remover carta da mão e iniciar combate
      player.hand.door = player.hand.door.filter(c => c.id !== cardId);
      newState.currentCombat = {
        id: `combat_${Date.now()}`,
        player,
        monster: monsterCard,
        helpers: [],
        interferors: [],
        bonusCards: [],
        totalPlayerStrength: this.calculatePlayerStrength(player),
        totalMonsterStrength: monsterCard.level || 1,
        status: 'ongoing',
        canEscape: false // Não pode fugir quando procura encrenca
      };
    } else {
      // Pegar carta do baralho
      if (newState.doorDeck.length > 0) {
        const drawnCard = newState.doorDeck.shift()!;
        player.hand.door.push(drawnCard);
      }
    }

    newState.turnPhase = 3;
    return newState;
  }

  private async executePlayCard(state: MunchkinGameState, playerId: string, cardId: string): Promise<MunchkinGameState> {
    const newState = { ...state };
    const player = newState.players.find(p => p.id === playerId)!;
    const card = [...player.hand.door, ...player.hand.treasure].find(c => c.id === cardId);

    if (!card) return newState;

    // Remover carta da mão
    if (card.type === 'door') {
      player.hand.door = player.hand.door.filter(c => c.id !== cardId);
    } else {
      player.hand.treasure = player.hand.treasure.filter(c => c.id !== cardId);
    }

    // Aplicar efeito da carta baseado no tipo
    switch (card.subtype) {
      case 'monster':
        // Iniciar combate com o monstro
        if (!newState.currentCombat) {
          newState.currentCombat = {
            id: `combat_${Date.now()}`,
            player: player,
            monster: card,
            helpers: [],
            interferors: [],
            totalPlayerStrength: this.calculatePlayerStrength(player),
            totalMonsterStrength: card.level || 1
          };
          this.emitEvent('combatStarted', {
            playerId,
            monster: card,
            combatId: newState.currentCombat.id
          });
        }
        break;
      case 'class':
        // Aplicar classe ao jogador
        player.class = card.name;
        this.emitEvent('classChanged', { playerId, className: card.name });
        break;
      case 'race':
        // Aplicar raça ao jogador
        player.race = card.name;
        this.emitEvent('raceChanged', { playerId, raceName: card.name });
        break;
      case 'equipment':
        // Equipar item automaticamente
        await this.equipItem(playerId, cardId);
        break;
      case 'curse':
        // Aplicar maldição
        await this.applyCurse(newState, player, card);
        break;
      default:
        // Aplicar efeito genérico da carta
        await this.applyCardEffect(newState, player, card);
        break;
    }

    return newState;
  }

  private async executeHelpCombat(state: MunchkinGameState, playerId: string): Promise<MunchkinGameState> {
    const newState = { ...state };
    const helper = newState.players.find(p => p.id === playerId)!;
    
    if (newState.currentCombat) {
      newState.currentCombat.helpers.push({
        playerId: helper.id,
        agreedReward: undefined // Será definido na negociação
      });
      
      // Recalcular força total
      newState.currentCombat.totalPlayerStrength = this.calculateCombatStrength(newState.currentCombat);
    }

    return newState;
  }

  private async executeInterfereCombat(state: MunchkinGameState, playerId: string, cardId: string): Promise<MunchkinGameState> {
    const newState = { ...state };
    const interferer = newState.players.find(p => p.id === playerId)!;
    const card = [...interferer.hand.door, ...interferer.hand.treasure].find(c => c.id === cardId);

    if (card && newState.currentCombat) {
      // Remover carta da mão
      if (card.type === 'door') {
        interferer.hand.door = interferer.hand.door.filter(c => c.id !== cardId);
      } else {
        interferer.hand.treasure = interferer.hand.treasure.filter(c => c.id !== cardId);
      }

      // Adicionar interferência
      const existingInterferer = newState.currentCombat.interferors.find(i => i.playerId === playerId);
      if (existingInterferer) {
        existingInterferer.cards.push(card);
      } else {
        newState.currentCombat.interferors.push({
          playerId,
          cards: [card]
        });
      }

      // Recalcular força do monstro
      newState.currentCombat.totalMonsterStrength = this.calculateMonsterStrength(newState.currentCombat);
    }

    return newState;
  }

  private async executeEscapeCombat(state: MunchkinGameState, playerId: string): Promise<MunchkinGameState> {
    const newState = { ...state };
    const player = newState.players.find(p => p.id === playerId)!;

    if (newState.currentCombat) {
      const escapeRoll = Math.floor(Math.random() * 6) + 1;
      const escapeBonus = this.calculateEscapeBonus(player);
      const escapeSuccess = (escapeRoll + escapeBonus) >= 5;

      newState.currentCombat.escapeRoll = escapeRoll;

      if (escapeSuccess) {
        // Fuga bem-sucedida
        this.emitEvent('combatEscaped', { 
          playerId, 
          combatId: newState.currentCombat.id,
          escapeRoll,
          escapeBonus 
        });
        newState.currentCombat = undefined;
        newState.turnPhase = 3;
      } else {
        // Fuga falhou, aplicar "Coisa Ruim"
        await this.applyBadStuff(newState, player, newState.currentCombat.monster);
        this.emitEvent('combatLost', { 
          playerId, 
          combatId: newState.currentCombat.id,
          monster: newState.currentCombat.monster 
        });
        newState.currentCombat = undefined;
        newState.turnPhase = 3;
      }
    }

    return newState;
  }

  private async executeDiscardCards(state: MunchkinGameState, playerId: string, cardIds: string[]): Promise<MunchkinGameState> {
    const newState = { ...state };
    const player = newState.players.find(p => p.id === playerId)!;
    
    // Remover cartas da mão do jogador
    for (const cardId of cardIds) {
      const doorCardIndex = player.hand.door.findIndex(c => c.id === cardId);
      if (doorCardIndex !== -1) {
        const card = player.hand.door.splice(doorCardIndex, 1)[0];
        newState.doorDiscard.push(card);
        continue;
      }
      
      const treasureCardIndex = player.hand.treasure.findIndex(c => c.id === cardId);
      if (treasureCardIndex !== -1) {
        const card = player.hand.treasure.splice(treasureCardIndex, 1)[0];
        newState.treasureDiscard.push(card);
      }
    }
    
    // Emitir evento de descarte
    this.emitEvent('cardsDiscarded', {
      playerId,
      cardIds,
      remainingCards: player.hand.door.length + player.hand.treasure.length
    });
    
    return newState;
  }

  private async executeStartGame(state: MunchkinGameState, players: MunchkinPlayer[]): Promise<MunchkinGameState> {
    console.log('[MunchkinEngine] executeStartGame - received players:', players.length);
    console.log('[MunchkinEngine] executeStartGame - players:', players.map(p => ({ id: p.id, name: p.name })));
    
    // Validar número de jogadores antes de inicializar
    if (players.length < 2) {
      console.log('[MunchkinEngine] Not enough players to start game:', players.length);
      throw new Error('Mínimo de 2 jogadores necessário');
    }
    
    if (players.length > 6) {
      console.log('[MunchkinEngine] Too many players to start game:', players.length);
      throw new Error('Máximo de 6 jogadores permitido');
    }
    
    console.log('[MunchkinEngine] Initializing game with', players.length, 'players');
    
    // Inicializar o jogo com os jogadores da sala
    await this.initializeGame(players);
    
    console.log('[MunchkinEngine] Game initialized successfully');
    console.log('[MunchkinEngine] New game state status:', this.gameState.status);
    console.log('[MunchkinEngine] New game state players:', this.gameState.players.length);
    
    // Retornar o estado inicializado
    return this.gameState;
  }

  // Método para resolver combate automaticamente
  public async resolveCombat(combatId: string): Promise<ActionResult> {
    const state = this.getGameState();
    if (!state.currentCombat || state.currentCombat.id !== combatId) {
      return { success: false, error: 'Combate não encontrado' };
    }

    const combat = state.currentCombat;
    const playerStrength = this.calculateCombatStrength(combat);
    const monsterStrength = this.calculateMonsterStrength(combat);

    let newState = { ...state };

    if (playerStrength > monsterStrength) {
      // Vitória no combate
      newState = await this.handleCombatVictory(newState, combat);
    } else {
      // Derrota no combate
      newState = await this.handleCombatDefeat(newState, combat);
    }

    this.updateGameState(newState);
    return { success: true, newState };
  }

  private async handleCombatVictory(state: MunchkinGameState, combat: Combat): Promise<MunchkinGameState> {
    const newState = { ...state };
    const player = combat.player;
    const monster = combat.monster;

    // Ganhar níveis
    const levelsGained = monster.rewards?.levels || 1;
    player.level = Math.min(player.level + levelsGained, newState.gameSettings.maxLevel);

    // Ganhar tesouros
    const treasuresGained = monster.rewards?.treasures || 1;
    for (let i = 0; i < treasuresGained && newState.treasureDeck.length > 0; i++) {
      const treasure = newState.treasureDeck.shift()!;
      player.hand.treasure.push(treasure);
    }

    // Distribuir recompensas para ajudantes
    for (const helper of combat.helpers) {
      const helperPlayer = newState.players.find(p => p.id === helper.playerId);
      if (helperPlayer && helper.agreedReward) {
        if (helper.agreedReward === 'treasure' && newState.treasureDeck.length > 0) {
          const treasure = newState.treasureDeck.shift()!;
          helperPlayer.hand.treasure.push(treasure);
        } else if (helper.agreedReward === 'level') {
          helperPlayer.level = Math.min(helperPlayer.level + 1, newState.gameSettings.maxLevel);
        }
      }
    }

    // Descartar monstro
    newState.doorDiscard.push(monster);

    // Emitir evento de vitória
    this.emitEvent('combatWon', {
      playerId: player.id,
      combatId: combat.id,
      monster,
      levelsGained,
      treasuresGained,
      helpers: combat.helpers
    });

    // Limpar combate
    newState.currentCombat = undefined;
    newState.turnPhase = 3;

    return newState;
  }

  private async handleCombatDefeat(state: MunchkinGameState, combat: Combat): Promise<MunchkinGameState> {
    const newState = { ...state };
    const player = combat.player;
    const monster = combat.monster;

    // Aplicar "Coisa Ruim" para o jogador principal
    await this.applyBadStuff(newState, player, monster);

    // Aplicar penalidades para ajudantes (se houver)
    for (const helper of combat.helpers) {
      const helperPlayer = newState.players.find(p => p.id === helper.playerId);
      if (helperPlayer) {
        // Ajudantes também sofrem "Coisa Ruim" reduzida
        await this.applyReducedBadStuff(newState, helperPlayer, monster);
      }
    }

    // Devolver monstro ao baralho (embaralhar)
    newState.doorDeck.push(monster);
    newState.doorDeck = shuffleDeck(newState.doorDeck);

    // Emitir evento de derrota
    this.emitEvent('combatLost', {
      playerId: player.id,
      combatId: combat.id,
      monster,
      helpers: combat.helpers
    });

    // Limpar combate
    newState.currentCombat = undefined;
    newState.turnPhase = 3;

    return newState;
  }

  private async applyReducedBadStuff(state: MunchkinGameState, player: MunchkinPlayer, monster: Card): Promise<void> {
    // Versão reduzida da "Coisa Ruim" para ajudantes
    const badStuffEffect = monster.effects.find(e => e.type === 'bad_stuff');
    if (badStuffEffect) {
      if (badStuffEffect.description.includes('nível')) {
        // Ajudantes perdem apenas 1 nível, independente do monstro
        player.level = Math.max(1, player.level - 1);
      } else if (badStuffEffect.description.includes('carta')) {
        // Ajudantes descartam apenas 1 carta
        const totalCards = player.hand.door.length + player.hand.treasure.length;
        if (totalCards > 0) {
          if (player.hand.treasure.length > 0) {
            const discarded = player.hand.treasure.pop()!;
            state.treasureDiscard.push(discarded);
          } else {
            const discarded = player.hand.door.pop()!;
            state.doorDiscard.push(discarded);
          }
        }
      }
    }
  }

  // Método para negociar ajuda em combate
  public async negotiateHelp(combatId: string, helperId: string, reward: { type: 'treasure' | 'level' | 'gold'; amount?: number }): Promise<ActionResult> {
    const state = this.getGameState();
    if (!state.currentCombat || state.currentCombat.id !== combatId) {
      return { success: false, error: 'Combate não encontrado' };
    }

    const helper = state.currentCombat.helpers.find(h => h.playerId === helperId);
    if (!helper) {
      return { success: false, error: 'Ajudante não encontrado no combate' };
    }

    // Atualizar recompensa acordada
    helper.agreedReward = reward.type;

    this.emitEvent('helpNegotiated', {
      combatId,
      helperId,
      reward
    });

    return { success: true, newState: state };
  }

  // Método para jogar carta de bônus no combate
  public async playCombatCard(playerId: string, cardId: string, target: 'player' | 'monster'): Promise<ActionResult> {
    const state = this.getGameState();
    if (!state.currentCombat) {
      return { success: false, error: 'Não há combate em andamento' };
    }

    const player = state.players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, error: 'Jogador não encontrado' };
    }

    const card = [...player.hand.door, ...player.hand.treasure].find(c => c.id === cardId);
    if (!card) {
      return { success: false, error: 'Carta não encontrada' };
    }

    // Verificar se a carta pode ser jogada no combate
    const combatEffect = card.effects.find(e => e.type === 'combat_bonus');
    if (!combatEffect) {
      return { success: false, error: 'Carta não pode ser usada em combate' };
    }

    const newState = { ...state };
    const newPlayer = newState.players.find(p => p.id === playerId)!;

    // Remover carta da mão
    if (card.type === 'door') {
      newPlayer.hand.door = newPlayer.hand.door.filter(c => c.id !== cardId);
    } else {
      newPlayer.hand.treasure = newPlayer.hand.treasure.filter(c => c.id !== cardId);
    }

    // Adicionar carta ao combate
    if (target === 'player') {
      newState.currentCombat!.bonusCards.push(card);
      newState.currentCombat!.totalPlayerStrength = this.calculateCombatStrength(newState.currentCombat!);
    } else {
      // Adicionar como interferência
      const existingInterferer = newState.currentCombat!.interferors.find(i => i.playerId === playerId);
      if (existingInterferer) {
        existingInterferer.cards.push(card);
      } else {
        newState.currentCombat!.interferors.push({
          playerId,
          cards: [card]
        });
      }
      newState.currentCombat!.totalMonsterStrength = this.calculateMonsterStrength(newState.currentCombat!);
    }

    this.updateGameState(newState);
    this.emitEvent('combatCardPlayed', {
      playerId,
      cardId,
      target,
      combatId: newState.currentCombat!.id
    });

    return { success: true, newState };
  }

  private async executeEndTurn(state: MunchkinGameState, playerId: string): Promise<MunchkinGameState> {
    const newState = { ...state };
    const player = newState.players.find(p => p.id === playerId)!;

    // Fase de caridade - máximo 5 cartas na mão
    const totalCards = player.hand.door.length + player.hand.treasure.length;
    if (totalCards > MUNCHKIN_CONSTANTS.MAX_HAND_SIZE) {
      // Encontrar jogador de menor nível para dar cartas
      const lowestLevelPlayer = newState.players
        .filter(p => p.id !== playerId)
        .reduce((lowest, current) => current.level < lowest.level ? current : lowest);
      
      const excessCards = totalCards - MUNCHKIN_CONSTANTS.MAX_HAND_SIZE;
      // Por simplicidade, dar cartas de tesouro primeiro
      const cardsToGive = player.hand.treasure.splice(0, Math.min(excessCards, player.hand.treasure.length));
      lowestLevelPlayer.hand.treasure.push(...cardsToGive);
      
      // Se ainda há cartas em excesso, dar cartas de porta
      if (cardsToGive.length < excessCards) {
        const remainingCards = player.hand.door.splice(0, excessCards - cardsToGive.length);
        lowestLevelPlayer.hand.door.push(...remainingCards);
      }
    }

    // Passar para o próximo jogador
    const currentIndex = newState.players.findIndex(p => p.id === playerId);
    const nextIndex = (currentIndex + 1) % newState.players.length;
    newState.currentPlayer = newState.players[nextIndex].id;
    newState.turnPhase = 1;

    // Limpar bônus temporários
    player.temporaryBonuses = player.temporaryBonuses.filter(b => b.duration !== 'turn');

    return newState;
  }

  // Métodos auxiliares
  private calculatePlayerStrength(player: MunchkinPlayer): number {
    let strength = player.level;
    
    // Bônus de equipamentos
    Object.values(player.equipment).flat().forEach(item => {
      if (item && item.bonus) {
        strength += item.bonus;
      }
    });

    // Bônus temporários
    player.temporaryBonuses.forEach(bonus => {
      if (bonus.type === 'combat') {
        strength += bonus.value;
      }
    });

    return strength;
  }

  private calculateCombatStrength(combat: Combat): number {
    let totalStrength = this.calculatePlayerStrength(combat.player);
    
    // Adicionar força dos ajudantes
    combat.helpers.forEach(helper => {
      const helperPlayer = this.getGameState().players.find(p => p.id === helper.playerId);
      if (helperPlayer) {
        totalStrength += this.calculatePlayerStrength(helperPlayer);
      }
    });

    // Adicionar bônus de cartas jogadas no combate
    combat.bonusCards.forEach(card => {
      const combatEffect = card.effects.find(e => e.type === 'combat_bonus');
      if (combatEffect && combatEffect.value) {
        totalStrength += combatEffect.value;
      }
    });

    return totalStrength;
  }

  private calculateMonsterStrength(combat: Combat): number {
    let monsterStrength = combat.monster.level || 1;
    
    // Adicionar modificadores de interferência
    combat.interferors.forEach(interferer => {
      interferer.cards.forEach(card => {
        const combatEffect = card.effects.find(e => e.type === 'combat_bonus');
        if (combatEffect && combatEffect.value) {
          monsterStrength += combatEffect.value;
        }
      });
    });

    return monsterStrength;
  }

  private calculateEscapeBonus(player: MunchkinPlayer): number {
    let escapeBonus = 0;
    
    // Verificar equipamentos que dão bônus de fuga
    Object.values(player.equipment).flat().forEach(item => {
      if (item) {
        const escapeEffect = item.effects.find(e => e.description.includes('fuga'));
        if (escapeEffect && escapeEffect.value) {
          escapeBonus += escapeEffect.value;
        }
      }
    });

    return escapeBonus;
  }

  private async applyCurse(state: MunchkinGameState, player: MunchkinPlayer, curse: Card): Promise<void> {
    // Implementar efeitos de maldição baseado na carta
    const curseEffect = curse.effects.find(e => e.type === 'curse');
    if (curseEffect) {
      if (curseEffect.description.includes('nível')) {
        player.level = Math.max(1, player.level - 1);
      } else if (curseEffect.description.includes('armadura')) {
        if (player.equipment.armor) {
          state.treasureDiscard.push(player.equipment.armor);
          player.equipment.armor = undefined;
        }
      }
    }
  }

  private async applyCardEffect(state: MunchkinGameState, player: MunchkinPlayer, card: Card): Promise<void> {
    switch (card.subtype) {
      case 'class':
        player.class = card.name;
        break;
      case 'race':
        player.race = card.name;
        break;
      case 'equipment': {
        // Para equipamentos, tentar equipar diretamente no estado atual
        const equipResult = await this.performEquipItem(player, card);
        if (equipResult.replacedItem) {
          // Se um item foi substituído, adicionar à mão
          if (equipResult.replacedItem.type === 'door') {
            player.hand.door.push(equipResult.replacedItem);
          } else {
            player.hand.treasure.push(equipResult.replacedItem);
          }
        }
        break;
      }
      default:
        // Adicionar à pilha de descarte
        if (card.type === 'door') {
          state.doorDiscard.push(card);
        } else {
          state.treasureDiscard.push(card);
        }
    }
  }

  // Sistema de equipamentos e tesouros
  public async equipItem(playerId: string, itemId: string): Promise<ActionResult> {
    const state = this.getGameState();
    const player = state.players.find(p => p.id === playerId);
    
    if (!player) {
      return { success: false, error: 'Jogador não encontrado' };
    }

    const item = player.hand.treasure.find(c => c.id === itemId);
    if (!item || item.subtype !== 'equipment') {
      return { success: false, error: 'Item não encontrado ou não é equipamento' };
    }

    // Verificar restrições do item
    const canEquip = this.canEquipItem(player, item);
    if (!canEquip.canEquip) {
      return { success: false, error: canEquip.reason };
    }

    const newState = { ...state };
    const newPlayer = newState.players.find(p => p.id === playerId)!;
    
    // Remover item da mão
    newPlayer.hand.treasure = newPlayer.hand.treasure.filter(c => c.id !== itemId);
    
    // Equipar item no slot apropriado
    const equipResult = await this.performEquipItem(newPlayer, item);
    if (equipResult.replacedItem) {
      // Item substituído volta para a mão
      newPlayer.hand.treasure.push(equipResult.replacedItem);
    }

    this.updateGameState(newState);
    this.emitEvent('itemEquipped', {
      playerId,
      itemId,
      itemName: item.name,
      slot: equipResult.slot,
      replacedItem: equipResult.replacedItem?.name
    });

    return { success: true, newState };
  }

  public async unequipItem(playerId: string, slot: string, itemId?: string): Promise<ActionResult> {
    const state = this.getGameState();
    const player = state.players.find(p => p.id === playerId);
    
    if (!player) {
      return { success: false, error: 'Jogador não encontrado' };
    }

    const newState = { ...state };
    const newPlayer = newState.players.find(p => p.id === playerId)!;
    
    let unequippedItem: Card | undefined;

    switch (slot) {
      case 'armor':
        unequippedItem = newPlayer.equipment.armor;
        newPlayer.equipment.armor = undefined;
        break;
      case 'helmet':
        unequippedItem = newPlayer.equipment.helmet;
        newPlayer.equipment.helmet = undefined;
        break;
      case 'footgear':
        unequippedItem = newPlayer.equipment.footgear;
        newPlayer.equipment.footgear = undefined;
        break;
      case 'hands':
        if (itemId) {
          const itemIndex = newPlayer.equipment.hands.findIndex(item => item?.id === itemId);
          if (itemIndex !== -1) {
            unequippedItem = newPlayer.equipment.hands[itemIndex];
            newPlayer.equipment.hands.splice(itemIndex, 1);
          }
        } else {
          unequippedItem = newPlayer.equipment.hands.pop();
        }
        break;
      case 'big':
        if (itemId) {
          const itemIndex = newPlayer.equipment.big.findIndex(item => item?.id === itemId);
          if (itemIndex !== -1) {
            unequippedItem = newPlayer.equipment.big[itemIndex];
            newPlayer.equipment.big.splice(itemIndex, 1);
          }
        } else {
          unequippedItem = newPlayer.equipment.big.pop();
        }
        break;
      default:
        return { success: false, error: 'Slot inválido' };
    }

    if (!unequippedItem) {
      return { success: false, error: 'Nenhum item encontrado no slot especificado' };
    }

    // Verificar se há espaço na mão
    const totalCards = newPlayer.hand.door.length + newPlayer.hand.treasure.length;
    if (totalCards >= MUNCHKIN_CONSTANTS.MAX_HAND_SIZE) {
      return { success: false, error: 'Mão cheia, não é possível desequipar' };
    }

    // Adicionar item de volta à mão
    newPlayer.hand.treasure.push(unequippedItem);

    this.updateGameState(newState);
    this.emitEvent('itemUnequipped', {
      playerId,
      itemId: unequippedItem.id,
      itemName: unequippedItem.name,
      slot
    });

    return { success: true, newState };
  }

  private canEquipItem(player: MunchkinPlayer, item: Card): { canEquip: boolean; reason?: string } {
    // Verificar restrições de classe
    if (item.requirements?.some(req => req.type === 'class') && player.class !== item.requirements.find(req => req.type === 'class')?.value) {
      return {
        canEquip: false,
        reason: `Requer classe ${item.requirements.find(req => req.type === 'class')?.value}`
      };
    }

    // Verificar restrições de raça
    if (item.requirements?.some(req => req.type === 'race') && player.race !== item.requirements.find(req => req.type === 'race')?.value) {
      return {
        canEquip: false,
        reason: `Requer raça ${item.requirements.find(req => req.type === 'race')?.value}`
      };
    }

    // Verificar restrições de nível
    if (item.requirements?.some(req => req.type === 'level') && player.level < Number(item.requirements.find(req => req.type === 'level')?.value)) {
      return {
        canEquip: false,
        reason: `Requer nível ${item.requirements.find(req => req.type === 'level')?.value}`
      };
    }

    // Verificar restrições de gênero (se aplicável)
    if (item.requirements?.some(req => req.type === 'gender') && player.gender !== item.requirements.find(req => req.type === 'gender')?.value) {
      return {
        canEquip: false,
        reason: `Requer gênero ${item.requirements.find(req => req.type === 'gender')?.value}`
      };
    }

    // Verificar se é item "Big" e se há espaço
    if (item.requirements?.some(req => req.type === 'big')) {
      const totalHandItems = player.equipment.hands.length;
      if (totalHandItems >= 2) {
        return {
          canEquip: false,
          reason: 'Itens Big requerem duas mãos livres'
        };
      }
    }

    return { canEquip: true };
  }

  private async performEquipItem(player: MunchkinPlayer, item: Card): Promise<{ slot: string; replacedItem?: Card }> {
    let replacedItem: Card | undefined;
    let slot: string;

    // Determinar slot baseado no tipo do item
    if (item.name.toLowerCase().includes('armadura') || item.name.toLowerCase().includes('armor')) {
      slot = 'armor';
      replacedItem = player.equipment.armor;
      player.equipment.armor = item;
    } else if (item.name.toLowerCase().includes('capacete') || item.name.toLowerCase().includes('helmet')) {
      slot = 'helmet';
      replacedItem = player.equipment.helmet;
      player.equipment.helmet = item;
    } else if (item.name.toLowerCase().includes('botas') || item.name.toLowerCase().includes('boots')) {
      slot = 'footgear';
      replacedItem = player.equipment.footgear;
      player.equipment.footgear = item;
    } else if (item.requirements?.some(req => req.type === 'big')) {
      slot = 'big';
      player.equipment.big.push(item);
    } else {
      // Item de mão
      slot = 'hands';
      if (player.equipment.hands.length < 2) {
        player.equipment.hands.push(item);
      } else {
        // Substituir primeiro item de mão
        replacedItem = player.equipment.hands[0];
        player.equipment.hands[0] = item;
      }
    }

    return { slot, replacedItem };
  }

  // Método para calcular bônus total de equipamentos
  public calculateEquipmentBonus(player: MunchkinPlayer): {
    combatBonus: number;
    escapeBonus: number;
    specialEffects: string[];
  } {
    let combatBonus = 0;
    let escapeBonus = 0;
    const specialEffects: string[] = [];

    // Verificar todos os equipamentos
    const allEquipment = [
      player.equipment.armor,
      player.equipment.helmet,
      player.equipment.footgear,
      ...player.equipment.hands,
      ...player.equipment.big
    ].filter(Boolean) as Card[];

    allEquipment.forEach(item => {
      // Bônus de combate
      if (item.bonus) {
        combatBonus += item.bonus;
      }

      // Efeitos especiais
      item.effects.forEach(effect => {
        if (effect.type === 'combat_bonus' && effect.value && effect.bonusType === 'combat') {
          combatBonus += effect.value;
        } else if (effect.type === 'combat_bonus' && effect.value && effect.bonusType === 'escape') {
          escapeBonus += effect.value;
        } else if (effect.type === 'special_ability') {
          specialEffects.push(effect.description);
        }
      });
    });

    return { combatBonus, escapeBonus, specialEffects };
  }

  // Método para verificar compatibilidade de equipamentos
  public checkEquipmentCompatibility(player: MunchkinPlayer): {
    conflicts: string[];
    warnings: string[];
  } {
    const conflicts: string[] = [];
    const warnings: string[] = [];

    const allEquipment = [
      player.equipment.armor,
      player.equipment.helmet,
      player.equipment.footgear,
      ...player.equipment.hands,
      ...player.equipment.big
    ].filter(Boolean) as Card[];

    // Verificar conflitos entre itens
    for (let i = 0; i < allEquipment.length; i++) {
      for (let j = i + 1; j < allEquipment.length; j++) {
        const item1 = allEquipment[i];
        const item2 = allEquipment[j];

        // Verificar se itens são incompatíveis
        const incompatible1 = item1.effects.find(e => 
          e.type === 'incompatible' && e.bonusType === 'combat' && e.description.includes(item2.name)
        );
        const incompatible2 = item2.effects.find(e => 
          e.type === 'incompatible' && e.bonusType === 'combat' && e.description.includes(item1.name)
        );

        if (incompatible1 || incompatible2) {
          conflicts.push(`${item1.name} é incompatível com ${item2.name}`);
        }
      }
    }

    // Verificar se jogador tem muitos itens Big
    const bigItems = player.equipment.big.length;
    const handItems = player.equipment.hands.length;
    if (bigItems > 0 && handItems > 0) {
      warnings.push('Itens Big ocupam ambas as mãos');
    }

    return { conflicts, warnings };
  }



  private async applyBadStuff(state: MunchkinGameState, player: MunchkinPlayer, monster: Card): Promise<void> {
    // Implementar "Coisa Ruim" baseado no monstro
    const badStuffEffect = monster.effects.find(e => e.type === 'bad_stuff');
    
    if (badStuffEffect) {
      if (badStuffEffect.description.includes('morte')) {
        // Morte - jogador perde todos os itens e volta ao nível 1
        player.level = 1;
        player.equipment = { hands: [], big: [] };
        player.equipment.armor = undefined;
        player.equipment.helmet = undefined;
        player.equipment.footgear = undefined;
        player.isDead = true;
        
        // Todos os equipamentos vão para descarte
        Object.values(player.equipment).flat().forEach(item => {
          if (item) state.treasureDiscard.push(item);
        });
        
        this.emitEvent('playerDied', { playerId: player.id, monster: monster.name });
      } else if (badStuffEffect.description.includes('nível')) {
        // Perder níveis
        const levelsLost = badStuffEffect.value || 1;
        player.level = Math.max(1, player.level - levelsLost);
      } else if (badStuffEffect.description.includes('carta')) {
        // Descartar cartas
        const cardsToDiscard = badStuffEffect.value || 1;
        const totalCards = player.hand.door.length + player.hand.treasure.length;
        const actualDiscard = Math.min(cardsToDiscard, totalCards);
        
        for (let i = 0; i < actualDiscard; i++) {
          if (player.hand.treasure.length > 0) {
            const discarded = player.hand.treasure.pop()!;
            state.treasureDiscard.push(discarded);
          } else if (player.hand.door.length > 0) {
            const discarded = player.hand.door.pop()!;
            state.doorDiscard.push(discarded);
          }
        }
      } else if (badStuffEffect.description.includes('equipamento')) {
        // Perder equipamento específico
        if (badStuffEffect.description.includes('armadura') && player.equipment.armor) {
          state.treasureDiscard.push(player.equipment.armor);
          player.equipment.armor = undefined;
        } else if (badStuffEffect.description.includes('capacete') && player.equipment.helmet) {
          state.treasureDiscard.push(player.equipment.helmet);
          player.equipment.helmet = undefined;
        } else if (badStuffEffect.description.includes('botas') && player.equipment.footgear) {
          state.treasureDiscard.push(player.equipment.footgear);
          player.equipment.footgear = undefined;
        } else if (player.equipment.hands.length > 0) {
          // Perder item de mão aleatório
          const randomIndex = Math.floor(Math.random() * player.equipment.hands.length);
          const lostItem = player.equipment.hands.splice(randomIndex, 1)[0];
          state.treasureDiscard.push(lostItem);
        }
      } else {
        // Efeito padrão - perder 1 nível
        player.level = Math.max(1, player.level - 1);
      }
    } else {
      // Sem efeito específico - perder 1 nível
      player.level = Math.max(1, player.level - 1);
    }
    
    this.emitEvent('badStuffApplied', {
      playerId: player.id,
      monster: monster.name,
      effect: badStuffEffect?.description || 'Perder 1 nível'
    });
  }

  private createRuleValidator(): MunchkinRuleValidation {
    return {
      canKickDoor: true,
      canLookForTrouble: true,
      canPlayCard: () => {
        return true; // Implementar validações específicas
      },
      canEquipItem: () => {
        return true; // Implementar validações de equipamento
      },
      canSellItems: () => {
        return true; // Implementar validações de venda
      },
      canHelpInCombat: () => {
        return true; // Implementar validações de ajuda
      },
      canInterfereInCombat: () => {
        return true; // Implementar validações de interferência
      },
      canEscape: () => {
        return true; // Implementar validações de fuga
      }
    };
  }
}