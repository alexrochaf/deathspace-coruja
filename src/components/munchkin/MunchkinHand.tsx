import React, { useState } from 'react';
import type { MunchkinPlayer, Card as MunchkinCard } from '../../types/munchkin';
import { Badge, Button, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import { 
  Shield, 
  Crown, 
  Zap, 
  Skull,
  Star,
  Package,
  Play
} from 'lucide-react';

interface MunchkinHandProps {
  player: MunchkinPlayer;
  selectedCards: string[];
  onCardSelect: (cardId: string) => void;
  onAction: (action: string, data?: Record<string, unknown>) => void;
}

interface CardDisplayProps {
  card: MunchkinCard;
  isSelected: boolean;
  onSelect: () => void;
  onPlay?: () => void;
  onEquip?: () => void;
}

const CardDisplay: React.FC<CardDisplayProps> = ({ 
  card, 
  isSelected, 
  onSelect, 
  onPlay, 
  onEquip 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getCardIcon = () => {
    switch (card.type) {
      case 'monster': return <Skull className="w-4 h-4" />;
      case 'class': return <Crown className="w-4 h-4" />;
      case 'race': return <Star className="w-4 h-4" />;
      case 'curse': return <Zap className="w-4 h-4" />;
      case 'equipment': return <Shield className="w-4 h-4" />;
      case 'treasure': return <Package className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  const getCardColor = () => {
    switch (card.type) {
      case 'monster': return 'from-red-600 to-red-800 border-red-400';
      case 'class': return 'from-purple-600 to-purple-800 border-purple-400';
      case 'race': return 'from-green-600 to-green-800 border-green-400';
      case 'curse': return 'from-gray-600 to-gray-800 border-gray-400';
      case 'equipment': return 'from-blue-600 to-blue-800 border-blue-400';
      case 'treasure': return 'from-yellow-600 to-yellow-800 border-yellow-400';
      default: return 'from-gray-600 to-gray-800 border-gray-400';
    }
  };

  return (
    <div className="relative">
      <div 
        className={`
          w-24 h-32 rounded-lg border-2 cursor-pointer transition-all duration-200
          bg-gradient-to-br ${getCardColor()}
          ${isSelected ? 'ring-2 ring-white scale-105' : 'hover:scale-102'}
          flex flex-col p-2 text-white
        `}
        onClick={onSelect}
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between mb-1">
          {getCardIcon()}
          {card.bonus && (
            <Badge className="text-xs px-1 py-0 bg-white/20">
              +{card.bonus}
            </Badge>
          )}
        </div>

        {/* Card Name */}
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs font-bold text-center leading-tight">
            {card.name.length > 12 ? `${card.name.substring(0, 12)}...` : card.name}
          </p>
        </div>

        {/* Card Type */}
        <div className="text-center">
          <Badge className="text-xs px-1 py-0 bg-black/30">
            {card.type}
          </Badge>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full" />
          </div>
        )}
      </div>

      {/* Card Details Tooltip */}
      {showDetails && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-black/90 backdrop-blur-sm rounded-lg border border-white/20 p-3 text-white text-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold">{card.name}</h4>
            {card.bonus && (
              <Badge className="bg-yellow-600">+{card.bonus}</Badge>
            )}
          </div>
          
          <p className="text-gray-300 mb-2">{card.description}</p>
          
          {card.effects.length > 0 && (
            <div className="space-y-1">
              <p className="font-semibold text-xs text-gray-400">EFEITOS:</p>
              {card.effects.map((effect, index) => (
                <p key={index} className="text-xs text-gray-300">
                  • {effect.description}
                </p>
              ))}
            </div>
          )}
          
          {card.requirements && (
            <div className="mt-2 pt-2 border-t border-white/20">
              <p className="font-semibold text-xs text-gray-400">REQUISITOS:</p>
              {card.requirements.level && (
                <p className="text-xs text-gray-300">Nível: {card.requirements.level}</p>
              )}
              {card.requirements.class && (
                <p className="text-xs text-gray-300">Classe: {card.requirements.class}</p>
              )}
              {card.requirements.race && (
                <p className="text-xs text-gray-300">Raça: {card.requirements.race}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 mt-3">
            {onPlay && (
              <Button size="sm" className="flex-1 text-xs" onClick={onPlay}>
                <Play className="w-3 h-3 mr-1" />
                Jogar
              </Button>
            )}
            {onEquip && card.subtype === 'equipment' && (
              <Button size="sm" className="flex-1 text-xs" onClick={onEquip}>
                <Shield className="w-3 h-3 mr-1" />
                Equipar
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const MunchkinHand: React.FC<MunchkinHandProps> = ({
  player,
  selectedCards,
  onCardSelect,
  onAction
}) => {
  const [activeTab, setActiveTab] = useState('door');

  const handlePlayCard = (cardId: string) => {
    onAction('play_card', { cardId });
  };

  const handleEquipItem = (cardId: string) => {
    onAction('equip_item', { itemId: cardId });
  };

  if (!player?.hand) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Carregando mão do jogador...</p>
      </div>
    );
  }

  const doorCards = player.hand.door;
  const treasureCards = player.hand.treasure;
  const totalCards = doorCards.length + treasureCards.length;

  return (
    <div className="h-full flex flex-col">
      {/* Hand Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center">
          <Package className="w-5 h-5 mr-2" />
          Sua Mão ({totalCards} cartas)
        </h3>
        
        {selectedCards.length > 0 && (
          <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-2">
            <p className="text-sm text-blue-300">
              {selectedCards.length} carta(s) selecionada(s)
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-1 text-xs"
              onClick={() => selectedCards.forEach(id => onCardSelect(id))}
            >
              Limpar Seleção
            </Button>
          </div>
        )}
      </div>

      {/* Card Tabs */}
      <Tabs index={activeTab === 'door' ? 0 : 1} onChange={(index) => setActiveTab(index === 0 ? 'door' : 'treasure')} className="flex-1 flex flex-col">
        <TabList className="grid w-full grid-cols-2 bg-black/20">
          <Tab className="flex items-center space-x-2">
            <Skull className="w-4 h-4" />
            <span>Porta ({doorCards.length})</span>
          </Tab>
          <Tab className="flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span>Tesouro ({treasureCards.length})</span>
          </Tab>
        </TabList>

        <TabPanels className="flex-1">
          {/* Door Cards */}
          <TabPanel className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-3 gap-2 p-2">
              {doorCards.map(card => (
                <CardDisplay
                  key={card.id}
                  card={card}
                  isSelected={selectedCards.includes(card.id)}
                  onSelect={() => onCardSelect(card.id)}
                  onPlay={() => handlePlayCard(card.id)}
                />
              ))}
              
              {doorCards.length === 0 && (
                <div className="col-span-3 text-center py-8">
                  <Skull className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                  <p className="text-gray-400">Nenhuma carta de Porta</p>
                </div>
              )}
            </div>
          </TabPanel>

          {/* Treasure Cards */}
          <TabPanel className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-3 gap-2 p-2">
              {treasureCards.map(card => (
                <CardDisplay
                  key={card.id}
                  card={card}
                  isSelected={selectedCards.includes(card.id)}
                  onSelect={() => onCardSelect(card.id)}
                  onPlay={() => handlePlayCard(card.id)}
                  onEquip={card.subtype === 'equipment' ? () => handleEquipItem(card.id) : undefined}
                />
              ))}
              
              {treasureCards.length === 0 && (
                <div className="col-span-3 text-center py-8">
                  <Star className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                  <p className="text-gray-400">Nenhuma carta de Tesouro</p>
                </div>
              )}
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Quick Actions */}
      {selectedCards.length > 0 && (
        <div className="mt-4 p-3 bg-black/20 rounded-lg border border-white/10">
          <h4 className="text-sm font-semibold text-white mb-2">Ações Rápidas</h4>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              className="flex-1 text-xs"
              onClick={() => selectedCards.forEach(id => handlePlayCard(id))}
            >
              <Play className="w-3 h-3 mr-1" />
              Jogar
            </Button>
            
            {selectedCards.some(id => {
              const card = [...doorCards, ...treasureCards].find(c => c.id === id);
              return card?.subtype === 'equipment';
            }) && (
              <Button 
                size="sm" 
                className="flex-1 text-xs"
                onClick={() => {
                  selectedCards.forEach(id => {
                    const card = [...doorCards, ...treasureCards].find(c => c.id === id);
                    if (card?.subtype === 'equipment') {
                      handleEquipItem(id);
                    }
                  });
                }}
              >
                <Shield className="w-3 h-3 mr-1" />
                Equipar
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};