import React from 'react';
import type { MunchkinPlayer } from '../../types/munchkin';
import { Badge, Avatar, Card } from '@chakra-ui/react';
import { 
  Crown, 
  Sword, 
  Shield,
  Users,
  Package,
  Target
} from 'lucide-react';

interface MunchkinPlayerListProps {
  players: MunchkinPlayer[];
  currentPlayerId: string;
  currentUserId: string;
}

export const MunchkinPlayerList: React.FC<MunchkinPlayerListProps> = ({
  players,
  currentPlayerId,
  currentUserId
}) => {
  // Validação para evitar erro quando players é undefined
  if (!players || !Array.isArray(players)) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Jogadores
          </h2>
          <Badge className="bg-blue-600">
            0 jogadores
          </Badge>
        </div>
        <div className="text-center text-gray-400 py-8">
          Carregando jogadores...
        </div>
      </div>
    );
  }
  const calculatePlayerPower = (player: MunchkinPlayer) => {
    if (!player) return 0;
    
    let power = player.level || 0;
    
    // Adicionar bônus de classe e raça
    if (player.class) power += player.class.bonus || 0;
    if (player.race) power += player.race.bonus || 0;
    
    // Adicionar bônus de equipamentos
    if (player.equipment) {
      const equipment = [
        player.equipment.armor,
        player.equipment.helmet,
        player.equipment.footgear,
        ...(player.equipment.hands || []),
        ...(player.equipment.big || [])
      ].filter(Boolean);
      
      equipment.forEach(item => {
        if (item?.bonus) power += item.bonus;
      });
    }
    
    return power;
  };



  const getEquipmentCount = (player: MunchkinPlayer) => {
    if (!player?.equipment) return 0;
    
    return [
      player.equipment.armor,
      player.equipment.helmet,
      player.equipment.footgear,
      ...(player.equipment.hands || []),
      ...(player.equipment.big || [])
    ].filter(Boolean).length;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Jogadores
        </h2>
        <Badge className="bg-blue-600">
          {players?.length || 0} jogadores
        </Badge>
      </div>

      <div className="space-y-3">
        {players?.map((player) => {
          const isCurrentPlayer = player.id === currentUserId;
          const isActivePlayer = player.id === currentPlayerId;
          const playerPower = calculatePlayerPower(player);
          const equipmentCount = getEquipmentCount(player);
          const totalCards = (player.hand?.door?.length || 0) + (player.hand?.treasure?.length || 0);

          return (
            <Card 
              key={player.id} 
              className={`
                p-4 transition-all duration-200
                ${isCurrentPlayer ? 'bg-blue-900/30 border-blue-500' : 'bg-black/20 border-white/10'}
                ${isActivePlayer ? 'ring-2 ring-yellow-500 shadow-lg' : ''}
                hover:bg-white/5
              `}
            >
              {/* Player Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Avatar 
                    name={player.name}
                    className={`w-10 h-10 ${isActivePlayer ? 'ring-2 ring-yellow-500' : ''}`}
                    bg={isCurrentPlayer ? 'blue.600' : 'gray.600'}
                    color="white"
                  />
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-white">
                        {player.name}
                        {isCurrentPlayer && <span className="text-blue-400"> (Você)</span>}
                      </h3>
                      {isActivePlayer && (
                        <Badge className="bg-yellow-600 text-black animate-pulse">
                          <Crown className="w-3 h-3 mr-1" />
                          Turno
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <span className="flex items-center">
                        <Target className="w-3 h-3 mr-1" />
                        Nível {player.level}
                      </span>
                      <span className="flex items-center">
                        <Sword className="w-3 h-3 mr-1" />
                        Força {playerPower}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Win Condition Indicator */}
                {player.level >= 10 && (
                  <Badge className="bg-yellow-600 text-black">
                    <Crown className="w-3 h-3 mr-1" />
                    Pode Vencer!
                  </Badge>
                )}
              </div>

              {/* Player Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Class and Race */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Classe:</span>
                    <Badge variant={player.class ? 'default' : 'secondary'} className="text-xs">
                      {player.class?.name || 'Nenhuma'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Raça:</span>
                    <Badge variant={player.race ? 'default' : 'secondary'} className="text-xs">
                      {player.race?.name || 'Humano'}
                    </Badge>
                  </div>
                </div>

                {/* Equipment and Cards */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center">
                      <Shield className="w-3 h-3 mr-1" />
                      Equipamentos:
                    </span>
                    <span className="text-xs text-white font-semibold">
                      {equipmentCount}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center">
                      <Package className="w-3 h-3 mr-1" />
                      Cartas:
                    </span>
                    <span className="text-xs text-white font-semibold">
                      {totalCards}
                    </span>
                  </div>
                </div>
              </div>

              {/* Equipment Summary */}
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-gray-400 mb-1">Equipamentos:</h4>
                
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Armadura:</span>
                    <span className="text-white truncate ml-1">
                      {player.equipment?.armor?.name || '-'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Capacete:</span>
                    <span className="text-white truncate ml-1">
                      {player.equipment?.helmet?.name || '-'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Calçado:</span>
                    <span className="text-white truncate ml-1">
                      {player.equipment?.footgear?.name || '-'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mãos:</span>
                    <span className="text-white">
                      {(player.equipment?.hands?.length || 0) > 0 
                        ? `${player.equipment.hands.length} item(s)`
                        : '-'
                      }
                    </span>
                  </div>
                </div>
                
                {(player.equipment?.big?.length || 0) > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Itens Big:</span>
                    <span className="text-white">
                      {player.equipment.big.length} item(s)
                    </span>
                  </div>
                )}
              </div>

              {/* Special Status */}
              {player.temporaryBonuses && Array.isArray(player.temporaryBonuses) && player.temporaryBonuses.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <h4 className="text-xs font-semibold text-gray-400 mb-1">Bônus Temporários:</h4>
                  <div className="flex flex-wrap gap-1">
                    {player.temporaryBonuses.map((bonus, index) => (
                      <Badge key={index} className="text-xs bg-green-600">
                        <Zap className="w-2 h-2 mr-1" />
                        +{bonus.value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress to Victory */}
              <div className="mt-3 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Progresso para Vitória:</span>
                  <span className="text-xs text-white font-semibold">
                    {player.level}/10
                  </span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`
                      h-2 rounded-full transition-all duration-300
                      ${player.level >= 10 
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
                        : 'bg-gradient-to-r from-blue-400 to-blue-600'
                      }
                    `}
                    style={{ width: `${Math.min((player.level / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};