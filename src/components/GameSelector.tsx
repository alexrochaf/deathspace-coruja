import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  keyframes
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Sword, Users, Clock, Sparkles } from 'lucide-react';
import type { GameType } from '../types/platform';

// Animações personalizadas
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

interface GameInfo {
  type: GameType;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  estimatedTime: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  status: 'Disponível' | 'Em Breve' | 'Beta';
  icon: React.ComponentType;
  color: string;
}

const GAMES: GameInfo[] = [
  {
    type: 'death_space',
    name: 'Death Space',
    description: 'Um jogo de estratégia espacial onde você comanda uma nave em um universo hostil. Colete recursos, evite perigos e seja o último sobrevivente.',
    minPlayers: 2,
    maxPlayers: 6,
    estimatedTime: '30-45 min',
    difficulty: 'Médio',
    status: 'Disponível',
    icon: Rocket,
    color: 'blue'
  },
  {
    type: 'munchkin',
    name: 'Munchkin',
    description: 'Um jogo de cartas divertido onde você explora masmorras, luta contra monstros e trai seus amigos para alcançar o nível 10 primeiro.',
    minPlayers: 3,
    maxPlayers: 6,
    estimatedTime: '60-90 min',
    difficulty: 'Fácil',
    status: 'Beta',
    icon: Sword,
    color: 'purple'
  }
];

interface GameSelectorProps {
  onGameSelect?: (gameType: GameType) => void;
}

export const GameSelector: React.FC<GameSelectorProps> = ({ onGameSelect }) => {
  const navigate = useNavigate();
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(26, 32, 44, 0.95)');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleGameSelect = (gameType: GameType) => {
    if (onGameSelect) {
      onGameSelect(gameType);
    } else {
      navigate(`/game/${gameType}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponível': return 'green';
      case 'Beta': return 'orange';
      case 'Em Breve': return 'gray';
      default: return 'gray';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'green';
      case 'Médio': return 'yellow';
      case 'Difícil': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box p={6} className="animate-fade-in">
      <VStack spacing={6} align="stretch">
        <Box textAlign="center" className="animate-scale-in">
          <Heading 
            size="lg" 
            mb={2}
            bgGradient="linear(to-r, purple.400, blue.400, teal.400)"
            bgClip="text"
            animation={`${shimmer} 3s ease-in-out infinite`}
            backgroundSize="200% auto"
          >
            <Icon as={Sparkles} mr={2} color="purple.400" />
            Escolha seu Jogo
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Selecione um dos jogos disponíveis para começar a jogar
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {GAMES.map((game, index) => (
            <Card
              key={game.type}
              bg={cardBg}
              borderColor={hoveredGame === game.type ? `${game.color}.400` : borderColor}
              borderWidth={2}
              backdropFilter="blur(10px)"
              boxShadow={hoveredGame === game.type ? `0 20px 40px rgba(0,0,0,0.3)` : '0 4px 12px rgba(0,0,0,0.1)'}
              _hover={{
                transform: 'translateY(-8px) scale(1.02)',
                shadow: `0 25px 50px rgba(0,0,0,0.4)`,
                borderColor: `${game.color}.400`,
                bg: hoveredGame === game.type ? `${game.color}.50` : cardBg
              }}
              transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
              cursor={game.status === 'Disponível' ? 'pointer' : 'not-allowed'}
              opacity={game.status === 'Em Breve' ? 0.7 : 1}
              onMouseEnter={() => setHoveredGame(game.type)}
              onMouseLeave={() => setHoveredGame(null)}
              className={`animate-slide-in-${index % 2 === 0 ? 'left' : 'right'}`}
              style={{ animationDelay: `${index * 0.2}s` }}
              position="relative"
              overflow="hidden"
            >
              {/* Efeito de brilho no hover */}
              {hoveredGame === game.type && (
                <Box
                  position="absolute"
                  top="0"
                  left="-100%"
                  width="100%"
                  height="100%"
                  background={`linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`}
                  animation={`${shimmer} 1.5s ease-in-out`}
                  zIndex={1}
                />
              )}
              
              <CardHeader pb={2} position="relative" zIndex={2}>
                <HStack justify="space-between" align="start">
                  <HStack spacing={3}>
                    <Box
                      p={3}
                      borderRadius="lg"
                      bg={`${game.color}.100`}
                      color={`${game.color}.600`}
                      animation={hoveredGame === game.type ? `${float} 2s ease-in-out infinite` : undefined}
                      transition="all 0.3s ease"
                      transform={hoveredGame === game.type ? 'scale(1.1)' : 'scale(1)'}
                    >
                      <Icon as={game.icon} boxSize={6} />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Heading 
                        size="md"
                        color={hoveredGame === game.type ? `${game.color}.600` : undefined}
                        transition="color 0.3s ease"
                      >
                        {game.name}
                      </Heading>
                      <HStack spacing={2}>
                        <Badge 
                          colorScheme={getStatusColor(game.status)}
                          variant={hoveredGame === game.type ? 'solid' : 'subtle'}
                          animation={hoveredGame === game.type ? `${pulse} 2s ease-in-out infinite` : undefined}
                          transition="all 0.3s ease"
                        >
                          {game.status}
                        </Badge>
                        <Badge 
                          colorScheme={getDifficultyColor(game.difficulty)}
                          variant={hoveredGame === game.type ? 'solid' : 'subtle'}
                          animation={hoveredGame === game.type ? `${pulse} 2s ease-in-out infinite` : undefined}
                          transition="all 0.3s ease"
                        >
                          {game.difficulty}
                        </Badge>
                      </HStack>
                    </VStack>
                  </HStack>
                </HStack>
              </CardHeader>

              <CardBody pt={0}>
                <VStack align="stretch" spacing={4}>
                  <Text fontSize="sm" color="gray.600">
                    {game.description}
                  </Text>

                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <HStack spacing={1}>
                        <Icon as={Users} boxSize={4} color="gray.500" />
                        <Text fontSize="sm" color="gray.600">
                          {game.minPlayers}-{game.maxPlayers} jogadores
                        </Text>
                      </HStack>
                      <HStack spacing={1}>
                        <Icon as={Clock} boxSize={4} color="gray.500" />
                        <Text fontSize="sm" color="gray.600">
                          {game.estimatedTime}
                        </Text>
                      </HStack>
                    </HStack>
                  </VStack>

                  <Button
                    colorScheme={game.color}
                    size="lg"
                    isDisabled={game.status === 'Em Breve'}
                    onClick={() => handleGameSelect(game.type)}
                    mt={2}
                    bgGradient={`linear(to-r, ${game.color}.400, ${game.color}.600)`}
                    _hover={{
                      bgGradient: `linear(to-r, ${game.color}.500, ${game.color}.700)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px rgba(0,0,0,0.3)`,
                      _before: {
                        left: '100%'
                      }
                    }}
                    _active={{
                      transform: 'translateY(0px)',
                      boxShadow: `0 4px 15px rgba(0,0,0,0.2)`
                    }}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    position="relative"
                    overflow="hidden"
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      transition: 'left 0.5s ease'
                    }}
                  >
                    {game.status === 'Disponível' ? '🎮 Jogar Agora' : 
                     game.status === 'Beta' ? '🧪 Jogar Beta' : '⏳ Em Breve'}
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        <Box textAlign="center" pt={4}>
          <Text fontSize="sm" color="gray.500">
            Mais jogos serão adicionados em breve!
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default GameSelector;