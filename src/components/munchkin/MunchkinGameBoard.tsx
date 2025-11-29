import React, { useState } from 'react';
import type { MunchkinGameState, MunchkinPlayer } from '../../types/munchkin';
import { getTurnPhaseName } from '../../utils/munchkinPhases';
import { Box, VStack, HStack, Grid, GridItem, Badge, Button, Text, Heading, Flex } from '@chakra-ui/react';
import '../../styles/munchkin-animations.css';
import { 
  Crown, 
  Skull,
  Star,
  Package,
  Target,
  Flame
} from 'lucide-react';
import { MunchkinCard } from './MunchkinCard';
import { MunchkinPlayerPlaque } from './MunchkinPlayerPlaque';
import { MunchkinFloatingChat } from './MunchkinFloatingChat';
import { MunchkinActions } from './MunchkinActions';

interface MunchkinGameBoardProps {
  gameState: MunchkinGameState;
  currentPlayer: MunchkinPlayer;
  onAction: (action: string, data?: Record<string, unknown>) => void;
  logs?: string[];
  chatMessages?: Array<{ id: string; user: string; message: string; timestamp: Date }>;
  onSendMessage?: (message: string) => void;
}

export const MunchkinGameBoard: React.FC<MunchkinGameBoardProps> = ({
  gameState,
  currentPlayer,
  onAction,
  logs = [],
  chatMessages = [],
  onSendMessage = () => {}
}) => {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  
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
  
  const handleCardSelect = (cardId: string) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };
  
  const handleKickDoor = () => {
    onAction('kick_door');
  };
  
  const handleLookForTrouble = () => {
    if (!currentPlayer?.hand?.door) return;
    
    const monsters = currentPlayer.hand.door.filter(card => card.type === 'monster');
    if (monsters.length === 0) {
      alert('Você não tem monstros na mão para Procurar Encrenca!');
      return;
    }
    
    onAction('look_for_trouble', { monsterId: monsters[0].id });
  };
  
  const handleEndTurn = () => {
    onAction('end_turn');
  };
  
  return (
    <Box
      minHeight="100vh"
      bg="linear-gradient(45deg, #FFE4B5 0%, #DEB887 25%, #F4A460 50%, #CD853F 75%, #D2691E 100%)"
      position="relative"
      overflow="hidden"
      className="munchkin-cartoon-theme"
    >
      {/* Cartoon Background Pattern */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.15}
        backgroundImage="
          radial-gradient(circle at 20% 20%, #FF6B6B 2px, transparent 2px),
          radial-gradient(circle at 80% 80%, #4ECDC4 2px, transparent 2px),
          radial-gradient(circle at 40% 60%, #45B7D1 2px, transparent 2px),
          radial-gradient(circle at 70% 30%, #96CEB4 2px, transparent 2px)
        "
        backgroundSize="100px 100px, 120px 120px, 80px 80px, 90px 90px"
        animation="cartoonFloat 20s ease-in-out infinite"
      />
      
      <Grid
        templateColumns="1fr"
        templateRows="auto 1fr auto"
        height="100vh"
        gap={4}
        p={4}
        position="relative"
        zIndex={1}
      >
        {/* Players Row - Cartoon Style */}
        <GridItem>
          <Flex
            justify="center"
            wrap="wrap"
            gap={4}
            bg="linear-gradient(135deg, #FF9A9E 0%, #FECFEF 50%, #FECFEF 100%)"
            p={4}
            borderRadius="20px"
            border="4px solid"
            borderColor="#FF6B6B"
            boxShadow="
              0 8px 32px rgba(255, 107, 107, 0.3),
              inset 0 2px 0 rgba(255, 255, 255, 0.3),
              inset 0 -2px 0 rgba(0, 0, 0, 0.1)
            "
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              right: '-2px',
              bottom: '-2px',
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4)',
              borderRadius: '22px',
              zIndex: -1
            }}
          >
            {gameState.players?.map((player) => (
              <MunchkinPlayerPlaque
                 key={player.id}
                 player={player}
                 isCurrentPlayer={player.id === currentPlayer.id}
                 isActivePlayer={player.id === gameState.activePlayerId}
                 isCurrentUserTurn={isCurrentPlayerTurn}
               />
            ))}
          </Flex>
        </GridItem>
        {/* Main Game Area - Cartoon Layout */}
        <GridItem>
          <Grid
            templateColumns="300px 1fr 300px"
            templateRows="1fr"
            height="100%"
            gap={6}
          >
            {/* Left Panel - Dungeon/Combat Area - Cartoon Style */}
            <GridItem>
              <VStack
                spacing={4}
                height="100%"
                bg="linear-gradient(135deg, #8B4513 0%, #CD853F 50%, #DEB887 100%)"
                p={4}
                borderRadius="20px"
                border="4px solid"
                borderColor="#654321"
                boxShadow="
                  0 8px 32px rgba(139, 69, 19, 0.4),
                  inset 0 4px 0 rgba(255, 255, 255, 0.2),
                  inset 0 -4px 0 rgba(0, 0, 0, 0.2)
                "
                position="relative"
                overflow="hidden"
              >
                {/* Cartoon Door Icon */}
                <Box
                  position="absolute"
                  top="10px"
                  right="10px"
                  fontSize="2xl"
                  opacity={0.3}
                >
                  🚪
                </Box>
                
                <HStack spacing={2} color="white">
                  <Skull size={20} />
                  <Text fontWeight="bold" fontSize="lg" textShadow="2px 2px 4px rgba(0,0,0,0.5)">
                    DUNGEON
                  </Text>
                </HStack>
                
                {/* Dungeon Cards Area */}
                <Box
                  flex={1}
                  w="100%"
                  bg="rgba(0, 0, 0, 0.2)"
                  borderRadius="15px"
                  p={3}
                  border="2px dashed"
                  borderColor="rgba(255, 255, 255, 0.3)"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  minH="200px"
                >
                  <Text color="white" fontSize="sm" textAlign="center" opacity={0.7}>
                    Área de Monstros
                    <br />e Combate
                  </Text>
                </Box>
              </VStack>
            </GridItem>

            {/* Center Panel - Main Action Area - Cartoon Style */}
            <GridItem>
              <VStack
                spacing={6}
                height="100%"
                bg="linear-gradient(135deg, #FFE4E1 0%, #FFF8DC 50%, #F0E68C 100%)"
                p={6}
                borderRadius="25px"
                border="5px solid"
                borderColor="#FF6347"
                position="relative"
                boxShadow="
                  0 12px 48px rgba(255, 99, 71, 0.3),
                  inset 0 4px 0 rgba(255, 255, 255, 0.4),
                  inset 0 -4px 0 rgba(0, 0, 0, 0.1)
                "
                overflow="hidden"
              >
                {/* Cartoon Background Elements */}
                <Box
                  position="absolute"
                  top="20px"
                  left="20px"
                  fontSize="3xl"
                  opacity={0.1}
                  transform="rotate(-15deg)"
                >
                  ⚔️
                </Box>
                <Box
                  position="absolute"
                  bottom="20px"
                  right="20px"
                  fontSize="2xl"
                  opacity={0.1}
                  transform="rotate(15deg)"
                >
                  🏆
                </Box>
                {/* Status do jogo */}
                <Box mb={4} textAlign="center">
                  <Heading size="lg" color="white" mb={2}>
                    {currentCombat ? (
                      <HStack justify="center" spacing={2}>
                        <Flame color="red" />
                        <Text>Combate em Andamento!</Text>
                        <Flame color="red" />
                      </HStack>
                    ) : (
                      <HStack justify="center" spacing={2}>
                        <Crown color="gold" />
                        <Text>Turno {gameState.currentPlayer}</Text>
                      </HStack>
                    )}
                  </Heading>
                  
                  <Text color="gray.300" fontSize="lg">
                    Fase: <Badge colorScheme="purple" ml={2}>{getTurnPhaseName(gameState.turnPhase)}</Badge>
                  </Text>
                  
                  <Text color="gray.400" fontSize="sm" mt={2}>
                    {getTurnPhaseName(gameState.turnPhase) === 'door' && '🚪 Chutar a Porta ou Procurar Encrenca'}
                    {getTurnPhaseName(gameState.turnPhase) === 'treasure' && '💰 Saquear o Quarto'}
                    {getTurnPhaseName(gameState.turnPhase) === 'charity' && '🤝 Caridade (descartar cartas extras)'}
                    {getTurnPhaseName(gameState.turnPhase) === 'trouble' && '🔍 Procurar Encrenca'}
                  </Text>
                </Box>
                
                {/* Área de combate ou mesa central */}
                {currentCombat ? (
                  <Box textAlign="center" py={8}>
                    <VStack spacing={4}>
                      <Box 
                   bg="red.900"
                   borderRadius="lg"
                   p={4}
                   border="2px solid red.400"
                   className="combat-area"
                 >
                        <Skull size={48} color="white" />
                        <Text color="white" fontWeight="bold" mt={2}>
                          {currentCombat.monster.name}
                        </Text>
                        <Text color="red.300">
                          Nível: {currentCombat.monster.level}
                        </Text>
                      </Box>
                      
                      <Text color="white" fontSize="lg">
                        VS
                      </Text>
                      
                      <Box 
                        bg="blue.900"
                        borderRadius="lg"
                        p={4}
                        border="2px solid blue.400"
                      >
                        <Target size={48} color="white" />
                        <Text color="white" fontWeight="bold" mt={2}>
                          {currentCombat.player.name}
                        </Text>
                        <Text color="blue.300">
                          Força: {currentCombat.playerPower}
                        </Text>
                      </Box>
                    </VStack>
                  </Box>
                ) : (
                  <Box textAlign="center" py={8}>
                    <VStack spacing={6}>
                      <Text color="gray.400" fontSize="lg">
                        Mesa de Jogo
                      </Text>
                      
                      {/* Ações principais */}
                      {isCurrentPlayerTurn && getTurnPhaseName(gameState.turnPhase) === 'door' && (
                        <HStack spacing={4}>
                          <Button 
                            size="lg"
                            colorScheme="purple"
                            leftIcon={<Package />}
                            onClick={handleKickDoor}
                          >
                            Chutar a Porta
                          </Button>
                          
                          <Button 
                            size="lg"
                            colorScheme="red"
                            leftIcon={<Skull />}
                            onClick={handleLookForTrouble}
                          >
                            Procurar Encrenca
                          </Button>
                        </HStack>
                      )}
                      
                      {isCurrentPlayerTurn && getTurnPhaseName(gameState.turnPhase) === 'treasure' && (
                        <Button 
                          size="lg"
                          colorScheme="yellow"
                          leftIcon={<Star />}
                          onClick={() => onAction('loot_room')}
                        >
                          Saquear o Quarto
                        </Button>
                      )}
                      
                      {isCurrentPlayerTurn && (
                        <Button 
                          size="sm"
                          colorScheme="gray"
                          onClick={handleEndTurn}
                        >
                          Finalizar Turno
                        </Button>
                      )}
                    </VStack>
                  </Box>
                )}
              </VStack>
            </GridItem>

            {/* Right Panel - Treasure/Equipment - Cartoon Style */}
            <GridItem>
              <VStack
                spacing={4}
                height="100%"
                bg="linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)"
                p={4}
                borderRadius="20px"
                border="4px solid"
                borderColor="#DAA520"
                boxShadow="
                  0 8px 32px rgba(255, 215, 0, 0.4),
                  inset 0 4px 0 rgba(255, 255, 255, 0.3),
                  inset 0 -4px 0 rgba(0, 0, 0, 0.2)
                "
                position="relative"
                overflow="hidden"
              >
                {/* Cartoon Treasure Icon */}
                <Box
                  position="absolute"
                  top="10px"
                  right="10px"
                  fontSize="2xl"
                  opacity={0.3}
                >
                  💰
                </Box>
                
                <HStack spacing={2} color="#8B4513">
                  <Package size={20} />
                  <Text fontWeight="bold" fontSize="lg" textShadow="1px 1px 2px rgba(255,255,255,0.5)">
                    TREASURE
                  </Text>
                </HStack>
                
                {/* Treasure Cards Area */}
                <Box
                  flex={1}
                  w="100%"
                  bg="rgba(139, 69, 19, 0.2)"
                  borderRadius="15px"
                  p={3}
                  border="2px dashed"
                  borderColor="rgba(139, 69, 19, 0.4)"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  minH="200px"
                >
                  <Text color="#8B4513" fontSize="sm" textAlign="center" opacity={0.8}>
                    Área de Tesouros
                    <br />e Equipamentos
                  </Text>
                </Box>
              </VStack>
            </GridItem>
          </Grid>
        </GridItem>
        {/* Player Hand - Cartoon Style with Better Card Layout */}
        <GridItem>
          <Box
            bg="linear-gradient(135deg, #E6E6FA 0%, #DDA0DD 50%, #DA70D6 100%)"
            p={4}
            borderRadius="20px"
            border="4px solid"
            borderColor="#9370DB"
            boxShadow="
              0 8px 32px rgba(147, 112, 219, 0.3),
              inset 0 4px 0 rgba(255, 255, 255, 0.3),
              inset 0 -4px 0 rgba(0, 0, 0, 0.1)
            "
            position="relative"
            overflow="hidden"
          >
            {/* Cartoon Hand Icon */}
            <Box
              position="absolute"
              top="10px"
              right="15px"
              fontSize="2xl"
              opacity={0.2}
            >
              🃏
            </Box>
            
            <HStack spacing={3} mb={4} justify="center">
              <Package size={20} color="#4B0082" />
              <Text color="#4B0082" fontWeight="bold" fontSize="lg" textShadow="1px 1px 2px rgba(255,255,255,0.5)">
                SUA MÃO ({(currentPlayer.hand?.door?.length || 0) + (currentPlayer.hand?.treasure?.length || 0)} cartas)
              </Text>
            </HStack>
            
            {/* Cards Container with Better Spacing */}
            <Box
              bg="rgba(75, 0, 130, 0.1)"
              borderRadius="15px"
              p={4}
              border="2px dashed"
              borderColor="rgba(75, 0, 130, 0.3)"
              minH="140px"
            >
              <Flex
                wrap="wrap"
                gap={3}
                justify="center"
                align="start"
                maxH="120px"
                overflowY="auto"
                css={{
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(147, 112, 219, 0.5)',
                    borderRadius: '4px',
                  },
                }}
              >
                {/* Door Cards Section */}
                {currentPlayer.hand?.door?.map((card, index) => (
                  <Box
                    key={card.id}
                    transform={`translateY(${index * -2}px)`}
                    zIndex={currentPlayer.hand.door.length - index}
                    transition="all 0.3s ease"
                    _hover={{
                      transform: `translateY(${index * -2 - 10}px) scale(1.05)`,
                      zIndex: 999
                    }}
                  >
                    <MunchkinCard
                      card={card}
                      isSelected={selectedCards.includes(card.id)}
                      onSelect={() => handleCardSelect(card.id)}
                      onAction={onAction}
                      size="small"
                    />
                  </Box>
                ))}
                
                {/* Separator */}
                {(currentPlayer.hand?.door?.length || 0) > 0 && (currentPlayer.hand?.treasure?.length || 0) > 0 && (
                  <Box
                    w="2px"
                    h="80px"
                    bg="rgba(75, 0, 130, 0.3)"
                    borderRadius="1px"
                    mx={2}
                  />
                )}
                
                {/* Treasure Cards Section */}
                {currentPlayer.hand?.treasure?.map((card, index) => (
                  <Box
                    key={card.id}
                    transform={`translateY(${index * -2}px)`}
                    zIndex={currentPlayer.hand.treasure.length - index}
                    transition="all 0.3s ease"
                    _hover={{
                      transform: `translateY(${index * -2 - 10}px) scale(1.05)`,
                      zIndex: 999
                    }}
                  >
                    <MunchkinCard
                      card={card}
                      isSelected={selectedCards.includes(card.id)}
                      onSelect={() => handleCardSelect(card.id)}
                      onAction={onAction}
                      size="small"
                    />
                  </Box>
                ))}
              </Flex>
              
              {/* Empty Hand Message */}
              {(currentPlayer.hand?.door?.length || 0) === 0 && (currentPlayer.hand?.treasure?.length || 0) === 0 && (
                <Box textAlign="center" py={8}>
                  <Text color="#4B0082" fontSize="sm" opacity={0.6}>
                    Sua mão está vazia
                  </Text>
                  <Text fontSize="2xl" opacity={0.3} mt={2}>
                    🤷‍♂️
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
        </GridItem>
      </Grid>
      
      {/* Floating Chat */}
      <MunchkinFloatingChat
        messages={chatMessages}
        logs={logs}
        onSendMessage={onSendMessage}
      />
      
      {/* Actions Panel - Fixed Position */}
      <Box
        position="fixed"
        bottom="20px"
        right="20px"
        width="320px"
        maxHeight="60vh"
        overflowY="auto"
        zIndex={1000}
        css={{
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(147, 112, 219, 0.5)',
            borderRadius: '4px',
          },
        }}
      >
        <MunchkinActions
          gameState={gameState}
          currentPlayer={currentPlayer}
          selectedCards={selectedCards}
          isCurrentPlayerTurn={isCurrentPlayerTurn}
          onAction={onAction}
        />
      </Box>
    </Box>
  );
};