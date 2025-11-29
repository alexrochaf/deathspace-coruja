import React, { useState, useEffect } from 'react';
import { Box, Container, VStack, Heading, HStack, Button, Avatar, Text, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { MunchkinProvider, useMunchkin } from '../../contexts/MunchkinContext';
import { MunchkinGameBoard } from './MunchkinGameBoard';
import { MunchkinRoomSelector } from './MunchkinRoomSelector';
import { MunchkinLobby } from './MunchkinLobby';
import { signOut } from '../../config/supabase';
import { Crown } from 'lucide-react';

const MunchkinGameContent: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentRoom, currentPlayer, gameEngine, performGameAction, leaveRoom, sendMessage } = useMunchkin();
  // const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; user: string; message: string; timestamp: Date }>>([]);

  const gameState = currentRoom?.gameState || null;
  const currentMunchkinPlayer = gameState?.players?.find(p => p.id === currentPlayer?.id) || null;

  useEffect(() => {
    if (gameEngine) {
      // Setup event listeners
      gameEngine.addEventListener('gameStateChanged', () => {
        // State is managed by context
      });
      
      gameEngine.addEventListener('logMessage', (message: string) => {
        setLogs(prev => [...prev, message]);
      });
    }
  }, [gameEngine]);

  const handlePlayerAction = async (action: string, data?: Record<string, unknown>) => {
    if (!gameState || !currentPlayer) return;
    
    try {
      await performGameAction(action, data);
    } catch (error) {
      console.error('Error performing action:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao executar ação',
        status: 'error',
        duration: 3000
      });
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!currentPlayer) return;
    
    const newMessage = {
      id: crypto.randomUUID(),
      user: currentPlayer.user_metadata?.name || currentPlayer.email || 'Jogador',
      message,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    await sendMessage(message);
  };

  const handleLogout = async () => {
    try {
      leaveRoom();
      await signOut();
      navigate('/');
      toast({
        title: 'Logout realizado',
        status: 'success',
        duration: 2000
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro ao fazer logout',
        status: 'error',
        duration: 2000
      });
    }
  };

  const handleBackToPlatform = () => {
    leaveRoom();
    navigate('/platform');
  };

  const handleStartGame = async () => {
    if (!currentRoom || !currentPlayer) return;
    
    try {
      // Start the game using the START_GAME action
      await performGameAction('START_GAME', {
        roomId: currentRoom.id,
        players: currentRoom.players
      });
      
      toast({
        title: 'Jogo Iniciado!',
        description: 'O jogo Munchkin começou. Boa sorte!',
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      console.error('Error starting game:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao iniciar o jogo',
        status: 'error',
        duration: 3000
      });
    }
  };

  // Show room selector if not in a room
  if (!currentRoom) {
    return <MunchkinRoomSelector onRoomJoined={() => {}} />;
  }

  // Show lobby if room is in waiting status
  if (currentRoom.status === 'waiting' && currentPlayer) {
    return (
      <MunchkinLobby
        room={currentRoom}
        currentPlayer={currentPlayer}
        onStartGame={handleStartGame}
      />
    );
  }

  if (!gameState || !currentPlayer) {
    return (
      <Container maxW="container.md" py={10}>
        <VStack spacing={4}>
          <Crown size={64} color="gold" />
          <Heading>Carregando Munchkin...</Heading>
          <Text>Inicializando o jogo...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Box>
      {/* Barra de Menu */}
      <Box bg="gray.800" py={3} px={6} color="white" boxShadow="md">
        <Container maxW="container.xl">
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Crown size={32} color="gold" />
              <VStack align="start" spacing={0}>
                <Heading size="md">Munchkin - {currentRoom.name}</Heading>
                <Text fontSize="sm" color="gray.300">
                  Turno: {gameState.currentPlayer}
                </Text>
              </VStack>
            </HStack>
            <HStack spacing={4}>
              <Button size="sm" variant="ghost" onClick={handleBackToPlatform}>
                ← Plataforma
              </Button>
              <Avatar
                size="sm"
                name={currentPlayer.user_metadata?.name || currentPlayer.email}
                src={currentPlayer.user_metadata?.avatar_url}
              />
              <Text>{currentPlayer.user_metadata?.name || currentPlayer.email}</Text>
              <Button size="sm" colorScheme="red" onClick={handleLogout}>
                Sair
              </Button>
            </HStack>
          </HStack>
        </Container>
      </Box>

      {/* Novo layout consolidado */}
      <MunchkinGameBoard
        gameState={gameState}
        currentPlayer={currentMunchkinPlayer}
        onAction={handlePlayerAction}
        logs={logs}
        chatMessages={chatMessages}
        onSendMessage={handleSendMessage}
      />
      

    </Box>
  );
};

export const MunchkinGame: React.FC = () => {
  return (
    <MunchkinProvider>
      <MunchkinGameContent />
    </MunchkinProvider>
  );
};