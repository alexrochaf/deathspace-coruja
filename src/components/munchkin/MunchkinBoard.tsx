import React, { useState, useEffect } from 'react';
import type { MunchkinGameState, MunchkinPlayer } from '../../types/munchkin';
import { getTurnPhaseName } from '../../utils/munchkinPhases';
import { Badge, Button, Box, VStack, Grid, GridItem, keyframes, useColorModeValue } from '@chakra-ui/react';
import { 
  Sword, 
  Shield, 
  Crown, 
  Zap, 
  Heart, 
  Star,
  Skull,
  Package,
  Users,
  Target,
  Sparkles,
  Flame
} from 'lucide-react';

// Animações personalizadas
const cardPulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const combatGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(255, 0, 0, 0.5); }
  50% { box-shadow: 0 0 30px rgba(255, 0, 0, 0.8); }
`;

const phaseTransition = keyframes`
  0% { opacity: 0; transform: translateY(-20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const levelUpGlow = keyframes`
  0%, 100% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.6); }
  50% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.9); }
`;

interface MunchkinBoardProps {
  gameState: MunchkinGameState;
  currentPlayer: MunchkinPlayer;
  onAction: (action: string, data?: Record<string, unknown>) => void;
}

export const MunchkinBoard: React.FC<MunchkinBoardProps> = ({
  gameState,
  currentPlayer,
  onAction
}) => {
  // Hooks devem estar no topo, antes de qualquer return condicional
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [phaseChanged, setPhaseChanged] = useState(false);
  const [lastPhase, setLastPhase] = useState(getTurnPhaseName(gameState.turnPhase));
  
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(0, 0, 0, 0.3)');
  
  // Detectar mudança de fase para animação
  useEffect(() => {
    const currentPhaseName = getTurnPhaseName(gameState.turnPhase);
    if (lastPhase !== currentPhaseName) {
      setPhaseChanged(true);
      setLastPhase(currentPhaseName);
      const timer = setTimeout(() => setPhaseChanged(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState.turnPhase, lastPhase]);

  // Validação para evitar erro quando currentPlayer é null
  if (!currentPlayer) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-400">
          <div className="text-lg font-semibold mb-2">Carregando jogador...</div>
          <div className="text-sm">Aguarde enquanto carregamos os dados do jogo.</div>
        </div>
      </div>
    );
  }
  
  const isCurrentPlayerTurn = gameState.currentPlayer === currentPlayer.id;
  const currentCombat = gameState.currentCombat;

  const handleKickDoor = () => {
    onAction('kick_door');
  };

  const handleLookForTrouble = () => {
    if (!currentPlayer?.hand?.door) return;
    
    // Mostrar modal para selecionar monstro da mão
    const monsters = currentPlayer.hand.door.filter(card => card.type === 'monster');
    if (monsters.length === 0) {
      alert('Você não tem monstros na mão para Procurar Encrenca!');
      return;
    }
    
    // Por simplicidade, usar o primeiro monstro
    onAction('look_for_trouble', { monsterId: monsters[0].id });
  };

  const handleEndTurn = () => {
    onAction('end_turn');
  };

  const calculatePlayerPower = (player: MunchkinPlayer) => {
    let power = player.level;
    
    // Adicionar bônus de classe e raça
    if (player.class) power += player.class.bonus || 0;
    if (player.race) power += player.race.bonus || 0;
    
    // Adicionar bônus de equipamentos
    const equipment = [
      player.equipment.armor,
      player.equipment.helmet,
      player.equipment.footgear,
      ...player.equipment.hands,
      ...player.equipment.big
    ].filter(Boolean);
    
    equipment.forEach(item => {
      if (item?.bonus) power += item.bonus;
    });
    
    return power;
  };

  return (
    <VStack spacing={6} h="full" align="stretch">
      {/* Game Status */}
      <Box 
        p={6} 
        bgGradient="linear(45deg, purple.600, blue.600, teal.500)" 
        borderRadius="xl" 
        border="2px" 
        borderColor={currentCombat ? "red.400" : "purple.400"}
        position="relative"
        overflow="hidden"
        animation={currentCombat ? `${combatGlow} 2s ease-in-out infinite` : undefined}
        className="game-status"
      >
        {/* Efeito de partículas de fundo */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity="0.1"
          backgroundImage="radial-gradient(circle, white 1px, transparent 1px)"
          backgroundSize="20px 20px"
          animation={`${cardPulse} 4s ease-in-out infinite`}
        />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-4">
            <Box
              p={3}
              borderRadius="full"
              bg={cardBg}
              backdropFilter="blur(10px)"
              animation={isCurrentPlayerTurn ? `${levelUpGlow} 2s ease-in-out infinite` : undefined}
            >
              <Crown className="w-8 h-8 text-yellow-400" />
            </Box>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Sparkles className="w-6 h-6 mr-2 text-yellow-400" />
                Turno {gameState.currentPlayer}
              </h2>
              <p className="text-gray-200 text-lg">
                Jogador atual: <span className="font-semibold text-yellow-300">
                  {gameState.players?.find(p => p.id === gameState.currentPlayer)?.name || 'Carregando...'}
                </span>
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <Box
              p={4}
              borderRadius="lg"
              bg={cardBg}
              backdropFilter="blur(10px)"
              animation={phaseChanged ? `${phaseTransition} 1s ease-out` : undefined}
            >
              <p className="text-xl font-bold text-white flex items-center justify-end">
                {currentCombat && <Flame className="w-5 h-5 mr-2 text-red-400" />}
                Fase: <span className="ml-2 text-yellow-300">{getTurnPhaseName(gameState.turnPhase)}</span>
              </p>
              <p className="text-sm text-gray-200 mt-1">
                {getTurnPhaseName(gameState.turnPhase) === 'door' && '🚪 Chutar a Porta ou Procurar Encrenca'}
                {getTurnPhaseName(gameState.turnPhase) === 'treasure' && '💰 Saquear o Quarto'}
                {getTurnPhaseName(gameState.turnPhase) === 'charity' && '🤝 Caridade (descartar cartas extras)'}
                {getTurnPhaseName(gameState.turnPhase) === 'trouble' && '🔍 Procurar Encrenca'}
              </p>
            </Box>
          </div>
        </div>
      </Box>

      {/* Main Game Area */}
      <Grid templateColumns="1fr 1fr" gap={6} flex={1}>
        {/* Left Side - Decks and Actions */}
        <GridItem>
          <VStack spacing={4} align="stretch">
            {/* Decks */}
            <Box 
              p={6} 
              bgGradient="linear(135deg, gray.800, gray.900)" 
              borderRadius="xl" 
              border="2px"
              borderColor="gray.600"
              backdropFilter="blur(10px)"
              position="relative"
              overflow="hidden"
            >
              {/* Efeito de brilho de fundo */}
              <Box
                position="absolute"
                top="-50%"
                left="-50%"
                width="200%"
                height="200%"
                background="radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)"
                animation={`${cardPulse} 6s ease-in-out infinite`}
              />
              
              <h3 className="text-xl font-bold text-white mb-6 flex items-center relative z-10">
                <Box
                  p={2}
                  borderRadius="lg"
                  bg="purple.600"
                  mr={3}
                  animation={`${cardPulse} 3s ease-in-out infinite`}
                >
                  <Package className="w-5 h-5" />
                </Box>
                Baralhos
              </h3>
              
              <div className="grid grid-cols-2 gap-6 relative z-10">
                {/* Door Deck */}
                <div className="text-center">
                  <Box
                    className="w-24 h-32 mx-auto mb-3 cursor-pointer"
                    bgGradient="linear(135deg, red.600, red.800, red.900)"
                    borderRadius="xl"
                    border="3px"
                    borderColor={hoveredCard === 'door' ? 'red.300' : 'red.500'}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                    overflow="hidden"
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={{
                      transform: 'translateY(-8px) scale(1.05)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                      borderColor: 'red.300'
                    }}
                    onClick={isCurrentPlayerTurn && getTurnPhaseName(gameState.turnPhase) === 'door' ? handleKickDoor : undefined}
                    onMouseEnter={() => setHoveredCard('door')}
                    onMouseLeave={() => setHoveredCard(null)}
                    animation={isCurrentPlayerTurn && getTurnPhaseName(gameState.turnPhase) === 'door' ? `${cardPulse} 2s ease-in-out infinite` : undefined}
                  >
                    {/* Efeito de brilho no hover */}
                    {hoveredCard === 'door' && (
                      <Box
                        position="absolute"
                        top="0"
                        left="-100%"
                        width="100%"
                        height="100%"
                        background="linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
                        animation={`shimmer 1.5s ease-in-out infinite`}
                      />
                    )}
                    <Skull className="w-10 h-10 text-white relative z-10" />
                  </Box>
                  <p className="text-lg text-white font-bold">Porta</p>
                  <Badge 
                    colorScheme="red" 
                    variant="solid"
                    fontSize="sm"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {gameState.doorDeck.length} cartas
                  </Badge>
                  {isCurrentPlayerTurn && getTurnPhaseName(gameState.turnPhase) === 'door' && (
                    <Button 
                      size="sm" 
                      colorScheme="red"
                      variant="solid"
                      mt={3}
                      bgGradient="linear(to-r, red.500, red.600)"
                      _hover={{
                        bgGradient: 'linear(to-r, red.600, red.700)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                      }}
                      transition="all 0.3s ease"
                      onClick={handleKickDoor}
                    >
                      🦶 Chutar!
                    </Button>
                  )}
                </div>

                {/* Treasure Deck */}
                <div className="text-center">
                  <Box
                    className="w-24 h-32 mx-auto mb-3"
                    bgGradient="linear(135deg, yellow.600, yellow.700, yellow.800)"
                    borderRadius="xl"
                    border="3px"
                    borderColor={hoveredCard === 'treasure' ? 'yellow.300' : 'yellow.500'}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                    overflow="hidden"
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={{
                      transform: 'translateY(-4px) scale(1.02)',
                      boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                      borderColor: 'yellow.300'
                    }}
                    onMouseEnter={() => setHoveredCard('treasure')}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Efeito de brilho no hover */}
                    {hoveredCard === 'treasure' && (
                      <Box
                        position="absolute"
                        top="0"
                        left="-100%"
                        width="100%"
                        height="100%"
                        background="linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
                        animation={`shimmer 1.5s ease-in-out infinite`}
                      />
                    )}
                    <Star className="w-10 h-10 text-white relative z-10" />
                  </Box>
                  <p className="text-lg text-white font-bold">Tesouro</p>
                  <Badge 
                    colorScheme="yellow" 
                    variant="solid"
                    fontSize="sm"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {gameState.treasureDeck.length} cartas
                  </Badge>
                </div>
              </div>
            </Box>

          {/* Turn Actions */}
          {isCurrentPlayerTurn && (
            <Box p={4} bg="gray.800" borderRadius="md">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Ações do Turno
              </h3>
              
              <div className="space-y-2">
                {getTurnPhaseName(gameState.turnPhase) === 'door' && (
                  <>
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700"
                      onClick={handleKickDoor}
                    >
                      <Skull className="w-4 h-4 mr-2" />
                      Chutar a Porta
                    </Button>
                    
                    <Button 
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      onClick={handleLookForTrouble}
                      disabled={currentPlayer.hand.door.filter(c => c.type === 'monster').length === 0}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Procurar Encrenca
                    </Button>
                  </>
                )}
                
                {(getTurnPhaseName(gameState.turnPhase) === 'treasure' || getTurnPhaseName(gameState.turnPhase) === 'charity') && (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleEndTurn}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Terminar Turno
                  </Button>
                )}
              </div>
            </Box>
          )}
          </VStack>
        </GridItem>

        {/* Right Side - Player Status */}
        <GridItem>
          <VStack spacing={4} align="stretch">
            {/* Current Player Stats */}
            <Box p={4} bg="gray.800" borderRadius="md">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Seu Status
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500 mb-1">
                  {currentPlayer.level}
                </div>
                <p className="text-sm text-gray-300">Nível</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 mb-1">
                  {calculatePlayerPower(currentPlayer)}
                </div>
                <p className="text-sm text-gray-300">Força Total</p>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Classe:</span>
                <Badge variant={currentPlayer.class ? 'default' : 'secondary'}>
                  {currentPlayer.class?.name || 'Nenhuma'}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">Raça:</span>
                <Badge variant={currentPlayer.race ? 'default' : 'secondary'}>
                  {currentPlayer.race?.name || 'Humano'}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">Cartas na Mão:</span>
                <span className="text-white font-semibold">
                  {currentPlayer.hand.door.length + currentPlayer.hand.treasure.length}
                </span>
              </div>
            </div>
          </Box>

          {/* Equipment Summary */}
          <Box p={4} bg="gray.800" borderRadius="md">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Equipamentos
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Armadura:</span>
                <span className="text-white">
                  {currentPlayer.equipment.armor?.name || 'Nenhuma'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">Capacete:</span>
                <span className="text-white">
                  {currentPlayer.equipment.helmet?.name || 'Nenhum'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">Calçado:</span>
                <span className="text-white">
                  {currentPlayer.equipment.footgear?.name || 'Nenhum'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">Mãos:</span>
                <span className="text-white">
                  {currentPlayer.equipment.hands.length > 0 
                    ? `${currentPlayer.equipment.hands.length} item(s)`
                    : 'Vazias'
                  }
                </span>
              </div>
              
              {currentPlayer.equipment.big.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Itens Big:</span>
                  <span className="text-white">
                    {currentPlayer.equipment.big.length} item(s)
                  </span>
                </div>
              )}
            </div>
          </Box>
          </VStack>
        </GridItem>
      </Grid>

      {/* Combat Status (if active) */}
      {currentCombat && (
        <Box p={4} bg="red.900" borderRadius="md" border="1px" borderColor="red.500">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center">
            <Sword className="w-5 h-5 mr-2" />
            Combate em Andamento!
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">
                <span className="font-semibold">{currentCombat.player.name}</span> vs{' '}
                <span className="font-semibold text-red-400">{currentCombat.monster.name}</span>
              </p>
              <p className="text-sm text-gray-300">
                Força do Jogador: {currentCombat.playerPower} | Força do Monstro: {currentCombat.monsterPower}
              </p>
            </div>
            
            <div className="text-right">
              {currentCombat.playerPower > currentCombat.monsterPower ? (
                <Badge className="bg-green-600">
                  <Heart className="w-4 h-4 mr-1" />
                  Vencendo
                </Badge>
              ) : (
                <Badge className="bg-red-600">
                  <Skull className="w-4 h-4 mr-1" />
                  Perdendo
                </Badge>
              )}
            </div>
          </div>
        </Box>
      )}
    </VStack>
  );
};