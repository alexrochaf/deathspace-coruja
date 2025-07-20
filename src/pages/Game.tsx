import {
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  useToast,
  VStack,
  Flex,
  Avatar,
  HStack,
} from "@chakra-ui/react";
import { useState } from 'react';
import { GameBoard } from '../components/GameBoard';
import { useGame } from '../contexts/GameContext';
import type { GameAction, Position, ShipType, Ship } from '../types/game';
import { auth } from '../config/firebase';
import { PlayerInfo } from "../components/game/PlayerInfo";
import { GameControls } from "../components/game/GameControls";
import { Sidebar } from "../components/game/Sidebar";
import { RoomSetup } from "../components/game/RoomSetup";
import { ShipSelectionModal } from "../components/game/ShipSelectionModal";

export const Game: React.FC = () => {
  const {
    currentRoom,
    currentPlayer,
    playerRooms,
    createRoom,
    setCurrentRoom,
    joinRoom,
    performAction,
    voteInCouncil,
    sendRoomMessage,
    sendCouncilMessage,
  } = useGame();
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [selectedAction, setSelectedAction] = useState<'MOVE' | 'ATTACK' | 'DONATE' | 'RECOVER' | 'IMPROVE' | 'VOTE' | null>(null);
  const [isShipSelectOpen, setIsShipSelectOpen] = useState(false);
  const [selectedShip, setSelectedShip] = useState<ShipType>('fighter');
  const [selectedShipInfo, setSelectedShipInfo] = useState<Ship | null>(null);
  const toast = useToast();
  const isCouncilMember = currentRoom?.council?.memberIds.includes(currentPlayer?.id ?? '');


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

  const handleShipSelect = async () => {
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
      await createRoom(roomName, selectedShip, []); // Usar selectedShip do estado
      setIsShipSelectOpen(false); // Fechar o modal após criar a sala
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao criar sala",
        description: "Tente novamente mais tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
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

    // Verificar se o usuário está autenticado
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
      // Verificar se o usuário já está na sala
      const isInRoom = playerRooms.some(room => room.id === roomId);
      
      if (isInRoom) {
        const room = playerRooms.find(room => room.id === roomId);
        const ship = room?.ships.find(ship => ship.playerId === currentPlayer.id);

        if (ship) {
          // Se já está na sala e tem nave, apenas entra
          await joinRoom(roomId, ship.type);
          return;
        }
      }

      // Se não está na sala ou não tem nave, abre modal para selecionar nave
      setIsShipSelectOpen(true);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao verificar sala",
        description: "Tente novamente mais tarde",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
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
      console.error(error);
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
    if (!currentPlayer || !selectedAction) {
      toast({
        title: "Erro",
        description: "Selecione uma ação primeiro",
        status: "error",
        duration: 2000,
      });
      return;
    }

    if (selectedAction !== 'VOTE' && !selectedShipInfo) {
        toast({
            title: "Erro",
            description: "Selecione uma nave primeiro",
            status: "error",
            duration: 2000,
        });
        return;
    }

    if (selectedAction === 'VOTE') {
      const targetShip = currentRoom?.ships.find(s => s.position.x === position.x && s.position.y === position.y);
      if (targetShip && targetShip.health > 0) {
        await voteInCouncil(targetShip.playerId);
        setSelectedAction(null);
      } else {
        toast({
          title: "Voto inválido",
          description: "Você só pode votar em naves ativas.",
          status: "error",
          duration: 2000,
        });
      }
      return;
    }

    try {
      const action: GameAction = {
        type: selectedAction as 'MOVE' | 'ATTACK' | 'DONATE' | 'RECOVER' | 'IMPROVE',
        shipId: selectedShipInfo!.id,
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
    setSelectedShipInfo(ship);
  };

  const handleLeaveRoom = async () => {
    try {
      setCurrentRoom(null);
      setSelectedShipInfo(null);
      setSelectedAction(null);
      toast({
        title: "Você saiu da sala",
        status: "info",
        duration: 2000,
      });
    } catch (error) {
      console.error("Erro ao sair da sala:", error);
      toast({
        title: "Erro ao sair da sala",
        description: "Tente novamente.",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleLogout = async () => {
    try {
      // Clear current room and player data
      setCurrentRoom(null);
      setSelectedShipInfo(null);
      setSelectedAction(null);
      await auth.signOut();
      window.location.href = "/";
      toast({
        title: "Logout realizado",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao fazer logout",
        status: "error",
        duration: 2000,
      });
    }
  };



  return (
    <Box>
      {/* Barra de Menu */}
      <Box bg="gray.800" py={3} px={6} color="white" boxShadow="md">
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Heading size="md">Death Space</Heading>
            <HStack spacing={4}>
              <Avatar
                size="sm"
                name={currentPlayer?.name}
                src={currentPlayer?.photoURL || undefined}
              />
              <Text>{currentPlayer?.name}</Text>
              <Button size="sm" colorScheme="red" onClick={handleLogout}>
                Sair
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>
      {!currentRoom ? (
        <>
          <RoomSetup
            playerName={currentPlayer?.name || ''}
            setPlayerName={() => {}} // Handled by auth
            roomName={roomName}
            setRoomName={setRoomName}
            roomIdToJoin={roomId}
            setRoomIdToJoin={setRoomId}
            handleCreateRoom={handleCreateRoom}
            handleJoinRoom={handleJoinRoom}
            playerRooms={playerRooms}
            setCurrentRoom={setCurrentRoom}
          />
          <ShipSelectionModal
            isOpen={isShipSelectOpen}
            onClose={() => setIsShipSelectOpen(false)}
            selectedShip={selectedShip}
            setSelectedShip={setSelectedShip}
            onConfirm={roomId ? handleShipSelectForJoin : handleShipSelect}
          />
        </>
      ) : (
        <Container maxW="container.xl" py={5}>
          <Grid
            templateAreas={{
              base: `"main" "logs"`,
              md: `"main sidebar"`,
            }}
            templateColumns={{ base: "1fr", md: "2fr 1fr" }}
            gap={6}
            h={{ base: "auto", md: "calc(100vh - 100px)" }}
          >
            <GridItem area="main">
              <VStack spacing={4} align="stretch" h="100%">
                <PlayerInfo
                  currentPlayer={currentPlayer}
                  currentRoom={currentRoom}
                  onLeaveRoom={handleLeaveRoom}
                />
                <GameBoard
                  onCellClick={handleCellClick}
                  onShipSelect={handleShipClick}
                  selectedAction={selectedAction}
                  getShipInfo={(ship) =>
                    `Vida: ${ship.health} | PA: ${ship.actionPoints} | Dono: ${currentRoom?.players.find((p) => p.id === ship.playerId)?.name || '?'}`
                  }
                />
                <GameControls
                  isCouncilMember={isCouncilMember || false}
                  selectedAction={selectedAction}
                  setSelectedAction={setSelectedAction}
                  currentPlayer={currentPlayer}
                  selectedShipInfo={selectedShipInfo}
                />
              </VStack>
            </GridItem>

            <GridItem area={{ base: 'logs', md: 'sidebar' }} h={{ base: '100em', md: 'calc(100vh - 120px)' }} minH={{ base: 'auto', md: 'auto' }}>
              <Sidebar
                councilChat={currentRoom.councilChat || []}
                roomChat={currentRoom.roomChat || []}
                sendCouncilMessage={sendCouncilMessage}
                sendRoomMessage={sendRoomMessage}
                isCouncilMember={isCouncilMember || false}
              />
            </GridItem>
          </Grid>
        </Container>
      )}
    </Box>
  );
};