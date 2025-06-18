import {
  Box,
  Button,
  Container,
  Grid,
  Heading,
  Input,
  Text,
  useToast,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Image,
  SimpleGrid,
  Divider
} from '@chakra-ui/react';
import { useState } from 'react';
import { GameBoard } from '../components/GameBoard';
import { useGame } from '../contexts/GameContext';
import type { GameAction, Position, ShipType, Ship } from '../types/game';

// Ship assets
import fighterSvg from '../assets/spaceships/fighter.svg';
import cruiserSvg from '../assets/spaceships/cruiser.svg';

export const Game: React.FC = () => {
  const { currentRoom, currentPlayer, playerRooms, createRoom, joinRoom, performAction, loading } = useGame();
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [selectedAction, setSelectedAction] = useState<'MOVE' | 'ATTACK' | 'DONATE' | null>(null);
  const [isShipSelectOpen, setIsShipSelectOpen] = useState(false);
  const [selectedShip, setSelectedShip] = useState<ShipType>('fighter');
  const [selectedShipInfo, setSelectedShipInfo] = useState<Ship | null>(null);
  const toast = useToast();

  const handleCreateRoom = async () => {
    if (!roomName) {
      toast({
        title: 'Nome da sala é obrigatório',
        status: 'error',
        duration: 2000,
      });
      return;
    }
    setIsShipSelectOpen(true);
  };

  const handleShipSelect = async (event: React.MouseEvent<HTMLButtonElement>) => {
    // Remover o evento do parâmetro e usar o selectedShip do estado
    if (!currentPlayer) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para criar uma sala",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await createRoom(roomName, selectedShip); // Usar selectedShip do estado
      setIsShipSelectOpen(false); // Fechar o modal após criar a sala
    } catch (error) {
      toast({
        title: "Erro ao criar sala",
        description: "Tente novamente mais tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const onShipSelect = (shipType: ShipType) => {
    setSelectedShip(shipType);
  };

  // No modal de seleção de nave, atualize os botões para usar onShipSelect:
  const handleJoinRoom = async () => {
    if (!roomId) {
      toast({
        title: "ID da sala é obrigatório",
        status: "error",
        duration: 2000,
      });
      return;
    }
    setIsShipSelectOpen(true);
  };

  const handleShipSelectForJoin = async () => {
    if (!currentPlayer) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para entrar na sala",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await joinRoom(roomId, selectedShip);
      setIsShipSelectOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao entrar na sala",
        description: "Tente novamente mais tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCellClick = async (position: Position) => {
    if (!currentPlayer || !selectedAction || !selectedShipInfo) {
      toast({
        title: "Erro",
        description: "Selecione uma nave e uma ação primeiro",
        status: "error",
        duration: 2000,
      });
      return;
    }

    try {
      const action: GameAction = {
        type: selectedAction,
        shipId: selectedShipInfo.id,
        playerId: currentPlayer.id,
        target: position,
      };

      await performAction(action);
    } catch (error) {
      toast({
        title: "Erro ao executar ação",
        description: error instanceof Error ? error.message : "Tente novamente",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleShipClick = (ship: Ship) => {
    if (ship.playerId !== currentPlayer?.id) {
      toast({
        title: "Erro",
        description: "Você só pode selecionar suas próprias naves",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    setSelectedShipInfo(ship);
  };

  const handleLeaveRoom = async () => {
    try {
      // Add your leave room logic here
      setCurrentRoom(null);
      toast({
        title: "Sala abandonada",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Erro ao sair da sala",
        status: "error",
        duration: 2000,
      });
    }
  };

  const handleLogout = async () => {
    try {
      // Add your logout logic here
      // Example: await auth.signOut();
      toast({
        title: "Logout realizado",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        status: "error",
        duration: 2000,
      });
    }
  };

  if (!currentRoom) {
    return (
      <Container maxW="container.md" py={10}>
        <VStack spacing={8}>
          <Heading>Death Space</Heading>

          {playerRooms.length > 0 && (
            <Box w="100%" p={6} borderWidth={1} borderRadius="lg">
              <VStack spacing={4} align="stretch">
                <Heading size="md">Suas Salas</Heading>
                {playerRooms.map((room) => (
                  <Flex
                    key={room.id}
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    justify="space-between"
                    align="center"
                  >
                    <Box>
                      <Text fontWeight="bold">{room.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {room.players?.length || 0} jogadores
                      </Text>
                    </Box>
                    <Button
                      colorScheme="blue"
                      size="sm"
                      onClick={() => room.id && joinRoom(room.id)}
                      isLoading={loading}
                    >
                      Entrar
                    </Button>
                  </Flex>
                ))}
              </VStack>
            </Box>
          )}

          <Box w="100%" p={6} borderWidth={1} borderRadius="lg">
            <VStack spacing={4}>
              <Heading size="md">Criar Sala</Heading>
              <Input
                placeholder="Nome da sala"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
              <Button
                colorScheme="blue"
                onClick={handleCreateRoom}
                isLoading={loading}
                w="100%"
              >
                Criar Sala
              </Button>
            </VStack>
          </Box>

          <Box w="100%" p={6} borderWidth={1} borderRadius="lg">
            <VStack spacing={4}>
              <Heading size="md">Join Room</Heading>
              <Input
                placeholder="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
              <Button
                colorScheme="green"
                onClick={handleJoinRoom}
                isLoading={loading}
                w="100%"
              >
                Join Room
              </Button>
            </VStack>
          </Box>

          <Modal isOpen={isShipSelectOpen} onClose={() => setIsShipSelectOpen(false)}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Escolha sua Nave</ModalHeader>
              <ModalBody>
                <SimpleGrid columns={2} spacing={4}>
                  <Box
                    p={4}
                    borderWidth={2}
                    borderRadius="lg"
                    borderColor={selectedShip === 'fighter' ? 'blue.500' : 'gray.200'}
                    cursor="pointer"
                    onClick={() => setSelectedShip('fighter')}
                  >
                    <VStack>
                      <Image src={fighterSvg} alt="Fighter" boxSize="100px" />
                      <Text fontWeight="bold">Fighter</Text>
                      <Text fontSize="sm">Rápido e Ágil</Text>
                    </VStack>
                  </Box>
                  <Box
                    p={4}
                    borderWidth={2}
                    borderRadius="lg"
                    borderColor={selectedShip === 'cruiser' ? 'blue.500' : 'gray.200'}
                    cursor="pointer"
                    onClick={() => setSelectedShip('cruiser')}
                  >
                    <VStack>
                      <Image src={cruiserSvg} alt="Cruiser" boxSize="100px" />
                      <Text fontWeight="bold">Cruiser</Text>
                      <Text fontSize="sm">Resistente e Poderoso</Text>
                    </VStack>
                  </Box>
                </SimpleGrid>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" onClick={roomId ? handleShipSelectForJoin : handleShipSelect}>
                  Confirmar Seleção
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </VStack>
      </Container>
    );
  }

  const renderHUD = () => {
    if (!selectedShipInfo) return null;

    return (
      <Box
        position="fixed"
        bottom="20px"
        right="20px"
        bg="gray.800"
        color="white"
        p={4}
        borderRadius="md"
        boxShadow="lg"
      >
        <VStack spacing={3} align="stretch">
          <Heading size="md">Informações da Nave</Heading>
          <Text>Tipo: {selectedShipInfo.type}</Text>
          <Text>Pontos de Ação: {selectedShipInfo.actionPoints}</Text>
          <Text>Vida: {selectedShipInfo.health}</Text>
          
          <Heading size="sm" mt={2}>Ações</Heading>
          <SimpleGrid columns={2} spacing={2}>
            <Button
              colorScheme={selectedAction === 'MOVE' ? 'blue' : 'gray'}
              onClick={() => setSelectedAction('MOVE')}
              isDisabled={selectedShipInfo.actionPoints <= 0}
            >
              Mover
            </Button>
            <Button
              colorScheme={selectedAction === 'ATTACK' ? 'red' : 'gray'}
              onClick={() => setSelectedAction('ATTACK')}
              isDisabled={selectedShipInfo.actionPoints <= 0}
            >
              Atacar
            </Button>
            <Button
              colorScheme={selectedAction === 'DONATE' ? 'green' : 'gray'}
              onClick={() => setSelectedAction('DONATE')}
              isDisabled={selectedShipInfo.actionPoints <= 0}
            >
              Doar AP
            </Button>
            <Button
              colorScheme="gray"
              onClick={() => setSelectedAction(null)}
              isDisabled={!selectedAction}
            >
              Cancelar Ação
            </Button>
          </SimpleGrid>
        </VStack>
      </Box>
    );
  };

  // Adicione este return para quando houver uma sala atual
  return (
    <Container maxW="container.xl" py={8}>
      <Grid templateColumns="250px 1fr 250px" gap={4} w="100%">
        {/* Painel Esquerdo - Informações do Jogador */}
        <Box bg="gray.800" p={4} borderRadius="md" color="white">
          <VStack spacing={4} align="stretch">
            <Heading size="md">Jogador</Heading>
            <Text>Nome: {currentPlayer?.name}</Text>
            <Text>Sala: {currentRoom.name}</Text>
            <Text>ID da Sala: {currentRoom.id}</Text>
            <Divider />
            <Button colorScheme="red" size="sm" onClick={handleLeaveRoom}>
              Sair da Sala
            </Button>
            <Button colorScheme="gray" size="sm" onClick={handleLogout}>
              Deslogar
            </Button>
          </VStack>
        </Box>

        {/* Tabuleiro Central */}
        <VStack spacing={4}>
          <GameBoard
            onCellClick={handleCellClick}
            onShipSelect={handleShipClick}
            selectedAction={selectedAction}
          />
        </VStack>

        {/* Painel Direito - Informações da Nave e Ações */}
        <Box bg="gray.800" p={4} borderRadius="md" color="white">
          <VStack spacing={4} align="stretch">
            <Heading size="md">Controles</Heading>
            {selectedShipInfo ? (
              <>
                <Box>
                  <Heading size="sm">Nave Selecionada</Heading>
                  <Text>Tipo: {selectedShipInfo.type}</Text>
                  <Text>Pontos de Ação: {selectedShipInfo.actionPoints}</Text>
                  <Text>Vida: {selectedShipInfo.health}</Text>
                </Box>
                <Divider />
                <VStack spacing={2}>
                  <Heading size="sm">Ações</Heading>
                  <Button
                    w="100%"
                    colorScheme={selectedAction === 'MOVE' ? 'blue' : 'gray'}
                    onClick={() => setSelectedAction('MOVE')}
                    isDisabled={selectedShipInfo.actionPoints <= 0}
                    isLoading={loading}
                  >
                    Mover
                  </Button>
                  <Button
                    w="100%"
                    colorScheme={selectedAction === 'ATTACK' ? 'red' : 'gray'}
                    onClick={() => setSelectedAction('ATTACK')}
                    isDisabled={selectedShipInfo.actionPoints <= 0}
                  >
                    Atacar
                  </Button>
                  <Button
                    w="100%"
                    colorScheme={selectedAction === 'DONATE' ? 'green' : 'gray'}
                    onClick={() => setSelectedAction('DONATE')}
                    isDisabled={selectedShipInfo.actionPoints <= 0}
                  >
                    Doar AP
                  </Button>
                  <Button
                    colorScheme="gray"
                    onClick={() => setSelectedAction(null)}
                    isDisabled={!selectedAction}
                  >
                    Cancelar Ação
                  </Button>
                </VStack>
              </>
            ) : (
              <Text>Selecione uma nave para ver as ações disponíveis</Text>
            )}
          </VStack>
        </Box>
      </Grid>
    </Container>
  );
};