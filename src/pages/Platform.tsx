import React from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Badge,
  HStack,
  Icon,
  Button,
  Avatar,
  Flex
} from '@chakra-ui/react';
import { GameSelector } from '../components/GameSelector';
import { useNavigate } from 'react-router-dom';
import { Users, Trophy, Clock, Star, LogOut } from 'lucide-react';
import { signOut } from '../config/supabase';
import { useEffect, useState } from 'react';
import { onAuthStateChange } from '../config/supabase';
import type { User } from '../config/supabase';
import type { GameType } from '../types/platform';

export const Platform: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50)',
    'linear(to-br, gray.900, gray.800)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGameSelect = (gameType: GameType) => {
    navigate(`/game/${gameType}`);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <Box
      minH="100vh"
      bgGradient={bgGradient}
      py={8}
    >
      <Container maxW="6xl">
        <VStack spacing={8} align="stretch">
          {/* Header com perfil do usuário */}
          <Flex justify="space-between" align="center" py={4}>
            <Box>
              <Heading
                size="xl"
                bgGradient="linear(to-r, blue.400, purple.500)"
                bgClip="text"
              >
                Plataforma Coruja Games
              </Heading>
            </Box>
            <HStack spacing={4}>
              <Avatar
                size="sm"
                name={user?.user_metadata?.name || user?.email}
                src={user?.user_metadata?.avatar_url}
              />
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="medium">
                  {user?.user_metadata?.name || user?.email}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Jogador
                </Text>
              </VStack>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<Icon as={LogOut} />}
                onClick={handleLogout}
              >
                Sair
              </Button>
            </HStack>
          </Flex>

          {/* Boas-vindas */}
          <Box textAlign="center" py={6}>
            <Heading size="lg" mb={4}>
              Bem-vindo de volta, {user?.user_metadata?.name?.split(' ')[0] || 'Jogador'}!
            </Heading>
            <Text
              fontSize="lg"
              color="gray.600"
              maxW="2xl"
              mx="auto"
            >
              Escolha um jogo e divirta-se com seus amigos online.
            </Text>
          </Box>

          {/* Estatísticas da plataforma */}
          <Card bg={cardBg}>
            <CardBody>
              <VStack spacing={4}>
                <Heading size="md" textAlign="center">
                  Estatísticas da Plataforma
                </Heading>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} w="full">
                  <Stat textAlign="center">
                    <StatLabel>
                      <HStack justify="center" spacing={1}>
                        <Icon as={Users} boxSize={4} />
                        <Text>Jogadores Online</Text>
                      </HStack>
                    </StatLabel>
                    <StatNumber color="green.500">127</StatNumber>
                    <StatHelpText>+12% hoje</StatHelpText>
                  </Stat>
                  <Stat textAlign="center">
                    <StatLabel>
                      <HStack justify="center" spacing={1}>
                        <Icon as={Trophy} boxSize={4} />
                        <Text>Partidas Hoje</Text>
                      </HStack>
                    </StatLabel>
                    <StatNumber color="blue.500">89</StatNumber>
                    <StatHelpText>+5% ontem</StatHelpText>
                  </Stat>
                  <Stat textAlign="center">
                    <StatLabel>
                      <HStack justify="center" spacing={1}>
                        <Icon as={Clock} boxSize={4} />
                        <Text>Tempo Médio</Text>
                      </HStack>
                    </StatLabel>
                    <StatNumber color="purple.500">45min</StatNumber>
                    <StatHelpText>por partida</StatHelpText>
                  </Stat>
                  <Stat textAlign="center">
                    <StatLabel>
                      <HStack justify="center" spacing={1}>
                        <Icon as={Star} boxSize={4} />
                        <Text>Avaliação</Text>
                      </HStack>
                    </StatLabel>
                    <StatNumber color="yellow.500">4.8</StatNumber>
                    <StatHelpText>de 5 estrelas</StatHelpText>
                  </Stat>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* Novidades */}
          <Card bg={cardBg}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md" textAlign="center">
                  🎉 Novidades da Plataforma
                </Heading>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between" p={3} bg="purple.50" borderRadius="md">
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <Badge colorScheme="purple">NOVO</Badge>
                        <Text fontWeight="medium">Munchkin Beta Disponível!</Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        O clássico jogo de cartas agora está disponível em versão beta.
                      </Text>
                    </VStack>
                    <Button size="sm" colorScheme="purple" onClick={() => handleGameSelect('munchkin')}>
                      Jogar
                    </Button>
                  </HStack>
                  <HStack justify="space-between" p={3} bg="blue.50" borderRadius="md">
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <Badge colorScheme="blue">ATUALIZAÇÃO</Badge>
                        <Text fontWeight="medium">Death Space Melhorado</Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        Nova interface e correções de bugs para uma experiência ainda melhor.
                      </Text>
                    </VStack>
                    <Button size="sm" colorScheme="blue" onClick={() => handleGameSelect('death_space')}>
                      Jogar
                    </Button>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Game Selector */}
          <GameSelector onGameSelect={handleGameSelect} />
        </VStack>
      </Container>
    </Box>
  );
};

export default Platform;