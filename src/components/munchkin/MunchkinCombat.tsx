import React from 'react';
import type { MunchkinGameState, MunchkinPlayer } from '../../types/munchkin';
import { Badge, Button, Progress, Card } from '@chakra-ui/react';
import { 
  Sword, 
  Heart, 
  Skull,
  Users,
  Zap,
  ArrowRight,
  Plus,
  Minus,
  Target,
  AlertTriangle
} from 'lucide-react';

interface MunchkinCombatProps {
  gameState: MunchkinGameState;
  currentPlayer: MunchkinPlayer;
  onAction: (action: string, data?: Record<string, unknown>) => void;
}

export const MunchkinCombat: React.FC<MunchkinCombatProps> = ({
  gameState,
  currentPlayer,
  onAction
}) => {

  
  const combat = gameState.currentCombat;
  const isInCombat = !!combat;
  const isCurrentPlayerInCombat = combat?.player.id === currentPlayer.id;
  const canHelp = isInCombat && !isCurrentPlayerInCombat && !combat.helpers.some(h => h.id === currentPlayer.id);
  const canInterfere = isInCombat && !isCurrentPlayerInCombat;

  const handleHelp = () => {
    if (!combat) return;
    onAction('help_combat', { 
      combatId: combat.id,
      helperId: currentPlayer.id 
    });
  };

  const handleInterfere = () => {
    if (!combat) return;
    onAction('interfere_combat', { 
      combatId: combat.id,
      interfererId: currentPlayer.id 
    });
  };

  const handleRunAway = () => {
    if (!combat) return;
    onAction('run_away', { combatId: combat.id });
  };

  const handlePlayCombatCard = (cardId: string) => {
    if (!combat) return;
    onAction('play_combat_card', { 
      combatId: combat.id,
      cardId 
    });
  };

  const calculateTotalPlayerPower = () => {
    if (!combat) return 0;
    let total = combat.playerPower;
    
    // Adicionar poder dos ajudantes
    combat.helpers.forEach(helper => {
      total += helper.level;
      // Adicionar bônus de equipamentos dos ajudantes
      const equipment = [
        helper.equipment?.armor,
        helper.equipment?.helmet,
        helper.equipment?.footgear,
        ...(helper.equipment?.hands || []),
        ...(helper.equipment?.big || [])
      ].filter(Boolean);
      
      equipment.forEach(item => {
        if (item?.bonus) total += item.bonus;
      });
    });
    
    return total;
  };

  const calculateTotalMonsterPower = () => {
    if (!combat) return 0;
    return combat.monsterPower + (combat.monsterBonuses || 0);
  };

  const getWinChance = () => {
    const playerPower = calculateTotalPlayerPower();
    const monsterPower = calculateTotalMonsterPower();
    
    if (playerPower > monsterPower) return 100;
    if (playerPower === monsterPower) return 50;
    return Math.max(0, Math.round((playerPower / monsterPower) * 100));
  };

  if (!isInCombat) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Sword className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="text-2xl font-bold text-white mb-2">Nenhum Combate</h2>
          <p className="text-gray-400">
            Não há combates acontecendo no momento. Chute uma porta ou procure encrenca para começar uma batalha!
          </p>
        </Card>
      </div>
    );
  }

  const playerPower = calculateTotalPlayerPower();
  const monsterPower = calculateTotalMonsterPower();
  const winChance = getWinChance();
  const isWinning = playerPower > monsterPower;

  return (
    <div className="h-full space-y-6">
      {/* Combat Header */}
      <Card className={`p-6 ${isWinning ? 'bg-green-900/30 border-green-500' : 'bg-red-900/30 border-red-500'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Sword className="w-6 h-6 mr-2" />
            Combate em Andamento!
          </h2>
          
          <Badge className={`${isWinning ? 'bg-green-600' : 'bg-red-600'} text-white`}>
            {isWinning ? 'Vencendo' : 'Perdendo'}
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Player Side */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-5 h-5 mr-2 text-blue-400" />
              <h3 className="font-bold text-white">{combat.player.name}</h3>
            </div>
            
            <div className="text-3xl font-bold text-blue-400 mb-1">
              {playerPower}
            </div>
            
            <div className="text-sm text-gray-300">
              Base: {combat.player.level}
              {combat.helpers.length > 0 && (
                <div className="text-xs text-green-400">
                  +{combat.helpers.length} ajudante(s)
                </div>
              )}
            </div>
          </div>
          
          {/* VS */}
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">VS</div>
            <Progress value={winChance} className="w-full" />
            <div className="text-sm text-gray-300 mt-1">
              {winChance}% chance de vitória
            </div>
          </div>
          
          {/* Monster Side */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Skull className="w-5 h-5 mr-2 text-red-400" />
              <h3 className="font-bold text-white">{combat.monster.name}</h3>
            </div>
            
            <div className="text-3xl font-bold text-red-400 mb-1">
              {monsterPower}
            </div>
            
            <div className="text-sm text-gray-300">
              Nível: {combat.monster.level}
              {combat.monsterBonuses && combat.monsterBonuses > 0 && (
                <div className="text-xs text-red-400">
                  +{combat.monsterBonuses} bônus
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Side - Combat Actions */}
        <div className="space-y-4">
          {/* Player Actions (if in combat) */}
          {isCurrentPlayerInCombat && (
            <Card className="p-4">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Suas Ações
              </h3>
              
              <div className="space-y-2">
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={handleRunAway}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Fugir do Combate
                </Button>
                
                {/* Combat Cards */}
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Cartas de Combate</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {currentPlayer.hand.treasure
                      .filter(card => card.effects.some(e => e.type === 'combat_bonus'))
                      .map(card => (
                        <Button
                          key={card.id}
                          size="sm"
                          variant="outline"
                          className="text-xs p-2 h-auto"
                          onClick={() => handlePlayCombatCard(card.id)}
                        >
                          <div className="text-center">
                            <div className="font-semibold">{card.name}</div>
                            <div className="text-xs text-green-400">+{card.bonus}</div>
                          </div>
                        </Button>
                      ))
                    }
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Help/Interfere Actions */}
          {!isCurrentPlayerInCombat && (
            <Card className="p-4">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Interferir no Combate
              </h3>
              
              <div className="space-y-2">
                {canHelp && (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleHelp}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajudar {combat.player.name}
                  </Button>
                )}
                
                {canInterfere && (
                  <Button 
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    onClick={handleInterfere}
                  >
                    <Minus className="w-4 h-4 mr-2" />
                    Interferir contra {combat.player.name}
                  </Button>
                )}
                
                {!canHelp && !canInterfere && (
                  <div className="text-center text-gray-400 py-4">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Você já está participando deste combate</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Side - Combat Details */}
        <div className="space-y-4">
          {/* Helpers */}
          {combat.helpers.length > 0 && (
            <Card className="p-4">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                Ajudantes ({combat.helpers.length})
              </h3>
              
              <div className="space-y-2">
                {combat.helpers.map(helper => (
                  <div key={helper.id} className="flex items-center justify-between bg-green-900/30 rounded-lg p-2">
                    <div>
                      <p className="font-semibold text-white">{helper.name}</p>
                      <p className="text-sm text-gray-300">Nível {helper.level}</p>
                    </div>
                    <Badge className="bg-green-600">
                      +{helper.level}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Monster Details */}
          <Card className="p-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Skull className="w-5 h-5 mr-2" />
              Detalhes do Monstro
            </h3>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-white">{combat.monster.name}</h4>
                <p className="text-sm text-gray-300">{combat.monster.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Nível</p>
                  <p className="font-bold text-red-400">{combat.monster.level}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Recompensa</p>
                  <p className="font-bold text-yellow-400">
                    {combat.monster.treasureReward} tesouro(s)
                  </p>
                </div>
              </div>
              
              {combat.monster.badStuff && (
                <div className="bg-red-900/30 rounded-lg p-3">
                  <h5 className="font-semibold text-red-400 mb-1 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Coisa Ruim
                  </h5>
                  <p className="text-sm text-gray-300">{combat.monster.badStuff}</p>
                </div>
              )}
              
              {combat.monster.effects.length > 0 && (
                <div>
                  <h5 className="font-semibold text-white mb-2">Efeitos Especiais</h5>
                  <div className="space-y-1">
                    {combat.monster.effects.map((effect, index) => (
                      <div key={index} className="text-sm text-gray-300">
                        • {effect.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Combat History */}
          <Card className="p-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Histórico do Combate
            </h3>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {combat.events?.map((event, index) => (
                <div key={index} className="text-sm text-gray-300 bg-black/20 rounded p-2">
                  {event.description}
                </div>
              )) || (
                <p className="text-sm text-gray-400 italic">Nenhum evento ainda...</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};