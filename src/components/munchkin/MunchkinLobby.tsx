import React from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Badge,
  Avatar,
  useColorModeValue,
  Flex,
  Icon,
  useToast
} from '@chakra-ui/react';
import { Users, Crown, Play, UserPlus, Clock, LogOut } from 'lucide-react';
import { useMunchkin } from '../../contexts/MunchkinContext';
import type { MunchkinRoom, MunchkinPlayer } from '../../types/munchkin';

interface MunchkinLobbyProps {
  room: MunchkinRoom;
  currentPlayer: MunchkinPlayer;
  onStartGame: () => void;
}

export const MunchkinLobby: React.FC<MunchkinLobbyProps> = ({
  room,
  currentPlayer,
  onStartGame
}) => {
  const toast = useToast();
  const { loading } = useMunchkin();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (!room || !currentPlayer) {
    return (
      <Container maxW="4xl" py={8}>
        <VStack spacing={4}>
          <Text>Carregando sala...</Text>
        </VStack>
      </Container>
    );
  }
  const isHost = room.hostId === currentPlayer.id;
  const canStartGame = room.players.length >= 2 && room.players.length <= room.maxPlayers;
  
  const handleStartGame = () => {
    if (!canStartGame) {
      toast({
        title: 'Não é possível iniciar',
        description: 'É necessário ter entre 2 e 6 jogadores para iniciar o jogo.',
        status: 'warning',
        duration: 3000
      });
      return;
    }
    onStartGame();
  };

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header da Sala */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <HStack spacing={2}>
                  <Icon as={Crown} color="gold" boxSize={6} />
                  <Heading size="lg">{room.name}</Heading>
                </HStack>
                <Text color="gray.600" fontSize="sm">
                  Sala de Munchkin • Aguardando jogadores
                </Text>
              </VStack>
              <VStack align="end" spacing={1}>
                <Badge colorScheme="blue" size="lg">
                  {room.players.length}/{room.maxPlayers} jogadores
                </Badge>
                <HStack spacing={1} fontSize="xs" color="gray.500">
                  <Icon as={Clock} boxSize={3} />
                  <Text>
                    Criada às {new Date(room.createdAt).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </HStack>
              </VStack>
            </Flex>
          </CardHeader>
        </Card>

        {/* Informações do Jogo */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="full" justify="center">
                <VStack spacing={1}>
                  <Icon as={Users} boxSize={8} color="purple.500" />
                  <Text fontSize="sm" fontWeight="medium">Mínimo</Text>
                  <Text fontSize="lg" fontWeight="bold">2 jogadores</Text>
                </VStack>
                <VStack spacing={1}>
                  <Icon as={Crown} boxSize={8} color="gold" />
                  <Text fontSize="sm" fontWeight="medium">Máximo</Text>
                  <Text fontSize="lg" fontWeight="bold">6 jogadores</Text>
                </VStack>
              </HStack>
              
              <Box p={4} bg="purple.50" borderRadius="md" w="full">
                <Text fontSize="sm" color="purple.700" textAlign="center">
                  💡 <strong>Dica:</strong> O Munchkin é mais divertido com 4-6 jogadores! 
                  Aguarde mais jogadores se juntarem ou comece com 2 para uma partida mais rápida.
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Lista de Jogadores */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Jogadores na Sala</Heading>
              <HStack spacing={2}>
                <Icon as={Users} boxSize={5} color="gray.500" />
                <Text color="gray.600">{room.players.length} de {room.maxPlayers}</Text>
              </HStack>
            </HStack>
          </CardHeader>
          <CardBody>
            {room.players.length === 0 ? (
              <VStack spacing={4} py={8}>
                <Icon as={UserPlus} boxSize={12} color="gray.400" />
                <Text color="gray.500" textAlign="center">
                  Nenhum jogador na sala ainda.
                </Text>
              </VStack>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {room.players.map((player) => {
                  const isCurrentPlayer = player.id === currentPlayer.id;
                  const isRoomHost = player.id === room.hostId;
                  
                  return (
                    <Card
                      key={player.id}
                      bg={isCurrentPlayer ? 'blue.50' : 'gray.50'}
                      borderColor={isCurrentPlayer ? 'blue.300' : 'gray.200'}
                      borderWidth={2}
                    >
                      <CardBody>
                        <HStack spacing={3}>
                          <Avatar
                            size="md"
                            name={player.name}
                            bg={isCurrentPlayer ? 'blue.500' : 'gray.500'}
                          />
                          <VStack align="start" spacing={1} flex={1}>
                            <HStack spacing={2}>
                              <Text fontWeight="bold" fontSize="sm">
                                {player.name}
                              </Text>
                              {isRoomHost && (
                                <Badge colorScheme="yellow" size="sm">
                                  <Icon as={Crown} boxSize={3} mr={1} />
                                  Host
                                </Badge>
                              )}
                              {isCurrentPlayer && (
                                <Badge colorScheme="blue" size="sm">
                                  Você
                                </Badge>
                              )}
                            </HStack>
                            <Text fontSize="xs" color="gray.600">
                              Pronto para jogar
                            </Text>
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  );
                })}
              </SimpleGrid>
            )}
          </CardBody>
        </Card>

        {/* Ações */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <VStack spacing={4}>
              {isHost ? (
                <VStack spacing={3} w="full">
                  <Button
                    leftIcon={<Icon as={Play} />}
                    colorScheme="green"
                    size="lg"
                    w="full"
                    isDisabled={!canStartGame || loading}
                    isLoading={loading}
                    onClick={handleStartGame}
                  >
                    {canStartGame 
                      ? 'Iniciar Jogo' 
                      : `Aguardando jogadores (${room.players.length}/${room.maxPlayers})`
                    }
                  </Button>
                  
                  {!canStartGame && (
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      {room.players.length < 2 
                        ? `Precisa de pelo menos ${2 - room.players.length} jogador(es) para iniciar`
                        : 'Sala cheia! Remova alguns jogadores para iniciar'
                      }
                    </Text>
                  )}
                </VStack>
              ) : (
                <VStack spacing={2} w="full">
                  <Text textAlign="center" color="gray.600">
                    Aguardando o host iniciar o jogo...
                  </Text>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Host: {room.players.find(p => p.id === room.hostId)?.name || 'Desconhecido'}
                  </Text>
                </VStack>
              )}
              
              {/* Botão para sair da sala (sem remover o usuário) */}
              <Button
                leftIcon={<Icon as={LogOut} />}
                variant="outline"
                colorScheme="red"
                size="sm"
                w="full"
                onClick={() => {
                   // Limpa apenas o estado local para voltar ao seletor de salas
                   // O usuário permanece na sala no banco de dados
                   window.history.pushState({}, '', '/platform/munchkin');
                   window.location.reload();
                 }}
              >
                Sair da Sala
              </Button>
              
              <Box w="full" pt={4} borderTop="1px" borderColor={borderColor}>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  Compartilhe o código da sala com seus amigos para que eles possam se juntar!
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default MunchkinLobby;