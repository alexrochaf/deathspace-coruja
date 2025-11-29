import React, { useState } from 'react';
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
  Input,
  FormControl,
  FormLabel,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Icon,
  Flex,
  Avatar,
  useColorModeValue
} from '@chakra-ui/react';
import { Users, Crown, Clock, Plus, LogIn, ArrowLeft } from 'lucide-react';
import { useMunchkin } from '../../contexts/MunchkinContext';
import { useNavigate } from 'react-router-dom';

interface MunchkinRoomSelectorProps {
  onRoomJoined?: () => void;
}

export const MunchkinRoomSelector: React.FC<MunchkinRoomSelectorProps> = ({ onRoomJoined }) => {
  const navigate = useNavigate();
  const { availableRooms, createRoom, joinRoom, loading, currentPlayer } = useMunchkin();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('6');
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      return;
    }
    
    await createRoom(roomName.trim(), parseInt(maxPlayers));
    setRoomName('');
    setMaxPlayers('6');
    onClose();
    onRoomJoined?.();
  };

  const handleJoinRoom = async (roomId: string) => {
    await joinRoom(roomId);
    onRoomJoined?.();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'blue';
      case 'playing': return 'green';
      case 'finished': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return 'Aguardando';
      case 'playing': return 'Em Jogo';
      case 'finished': return 'Finalizada';
      default: return status;
    }
  };

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="lg" mb={2}>
              Salas de Munchkin
            </Heading>
            <Text color="gray.600">
              Escolha uma sala para jogar ou crie a sua própria
            </Text>
          </Box>
          <HStack spacing={4}>
            <Button
              leftIcon={<Icon as={ArrowLeft} />}
              variant="ghost"
              onClick={() => navigate('/platform')}
            >
              Voltar
            </Button>
            <Button
              leftIcon={<Icon as={Plus} />}
              colorScheme="purple"
              onClick={onOpen}
              isLoading={loading}
            >
              Criar Sala
            </Button>
          </HStack>
        </Flex>

        {/* Player Info */}
        <Card bg={cardBg}>
          <CardBody>
            <HStack spacing={4}>
              <Avatar
                size="md"
                name={currentPlayer?.user_metadata?.name || currentPlayer?.email}
                src={currentPlayer?.user_metadata?.avatar_url}
              />
              <VStack align="start" spacing={1}>
                <Text fontWeight="medium">
                  {currentPlayer?.user_metadata?.name || currentPlayer?.email}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Pronto para a aventura!
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Available Rooms */}
        <Box>
          <Heading size="md" mb={4}>
            Salas Disponíveis ({availableRooms.length})
          </Heading>
          
          {availableRooms.length === 0 ? (
            <Card bg={cardBg}>
              <CardBody textAlign="center" py={12}>
                <Text color="gray.500" mb={4}>
                  Nenhuma sala disponível no momento
                </Text>
                <Button
                  leftIcon={<Icon as={Plus} />}
                  colorScheme="purple"
                  onClick={onOpen}
                >
                  Criar a Primeira Sala
                </Button>
              </CardBody>
            </Card>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {availableRooms.map((room) => (
                <Card
                  key={room.id}
                  bg={cardBg}
                  borderColor={borderColor}
                  borderWidth={1}
                  _hover={{
                    transform: 'translateY(-2px)',
                    shadow: 'lg',
                    borderColor: 'purple.300'
                  }}
                  transition="all 0.2s"
                >
                  <CardHeader pb={2}>
                    <VStack align="stretch" spacing={2}>
                      <HStack justify="space-between">
                        <Heading size="sm" noOfLines={1}>
                          {room.name}
                        </Heading>
                        <Badge colorScheme={getStatusColor(room.status)}>
                          {getStatusText(room.status)}
                        </Badge>
                      </HStack>
                      
                      <HStack spacing={2} fontSize="sm" color="gray.600">
                        <Icon as={Crown} boxSize={3} />
                        <Text>Host: {room.players.find(p => p.id === room.hostId)?.name || 'Desconhecido'}</Text>
                      </HStack>
                    </VStack>
                  </CardHeader>

                  <CardBody pt={0}>
                    <VStack spacing={4} align="stretch">
                      {/* Room Stats */}
                      <VStack spacing={2}>
                        <HStack justify="space-between" w="full">
                          <HStack spacing={1}>
                            <Icon as={Users} boxSize={4} color="gray.500" />
                            <Text fontSize="sm" color="gray.600">
                              {room.players.length}/{room.maxPlayers} jogadores
                            </Text>
                          </HStack>
                          <HStack spacing={1}>
                            <Icon as={Clock} boxSize={4} color="gray.500" />
                            <Text fontSize="sm" color="gray.600">
                              {new Date(room.createdAt).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Text>
                          </HStack>
                        </HStack>
                        
                        {/* Players List */}
                        {room.players.length > 0 && (
                          <Box w="full">
                            <Text fontSize="xs" color="gray.500" mb={1}>
                              Jogadores:
                            </Text>
                            <HStack spacing={1} flexWrap="wrap">
                              {room.players.slice(0, 3).map((player) => (
                                <Badge key={player.id} size="sm" variant="outline">
                                  {player.name}
                                </Badge>
                              ))}
                              {room.players.length > 3 && (
                                <Badge size="sm" variant="outline">
                                  +{room.players.length - 3}
                                </Badge>
                              )}
                            </HStack>
                          </Box>
                        )}
                      </VStack>

                      {/* Join Button */}
                      <Button
                        leftIcon={<Icon as={LogIn} />}
                        colorScheme="purple"
                        size="sm"
                        isDisabled={
                          room.players.length >= room.maxPlayers ||
                          room.status === 'finished' ||
                          loading
                        }
                        isLoading={loading}
                        onClick={() => handleJoinRoom(room.id)}
                      >
                        {room.players.some(p => p.id === currentPlayer?.id)
                          ? 'Reconectar'
                          : room.players.length >= room.maxPlayers
                          ? 'Sala Cheia'
                          : room.status === 'finished'
                          ? 'Finalizada'
                          : 'Entrar'
                        }
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </VStack>

      {/* Create Room Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Criar Nova Sala</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nome da Sala</FormLabel>
                <Input
                  placeholder="Digite o nome da sala..."
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  maxLength={50}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Máximo de Jogadores</FormLabel>
                <Select value={maxPlayers} onChange={(e) => setMaxPlayers(e.target.value)}>
                  <option value="3">3 jogadores</option>
                  <option value="4">4 jogadores</option>
                  <option value="5">5 jogadores</option>
                  <option value="6">6 jogadores</option>
                </Select>
              </FormControl>
              
              <Box p={4} bg="purple.50" borderRadius="md" w="full">
                <Text fontSize="sm" color="purple.700">
                  💡 <strong>Dica:</strong> O Munchkin é mais divertido com 4-6 jogadores!
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleCreateRoom}
              isDisabled={!roomName.trim()}
              isLoading={loading}
            >
              Criar Sala
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default MunchkinRoomSelector;