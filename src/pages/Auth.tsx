import { useState, useEffect } from 'react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, getCurrentUser } from '../config/supabase';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  useToast,
  Input,
  FormControl,
  FormLabel,
  VStack,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormErrorMessage
} from '@chakra-ui/react';
import { FaGoogle, FaEnvelope, FaLock } from 'react-icons/fa';

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  // Verificar se o usuário já está logado (importante para callback do OAuth)
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          navigate('/platform');
        }
      } catch (error) {
        console.error('Erro ao verificar status de autenticação:', error);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Email é obrigatório');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email inválido');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Senha é obrigatória');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Senha deve ter pelo menos 6 caracteres');
      isValid = false;
    }

    return isValid;
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        throw error;
      }
      // O OAuth redireciona automaticamente, não precisamos navegar manualmente
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro ao fazer login com Google',
        description: 'Verifique se o Google OAuth está configurado no Supabase',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!validateForm()) return;
    
    setEmailLoading(true);
    try {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        throw error;
      }
      navigate('/platform');
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Verifique suas credenciais';
      toast({
        title: 'Erro ao fazer login',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!validateForm()) return;
    
    setEmailLoading(true);
    try {
      const { error } = await signUpWithEmail(email, password, name || undefined);
      if (error) {
        throw error;
      }
      toast({
        title: 'Conta criada com sucesso!',
        description: 'Verifique seu email para confirmar a conta',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Tente novamente mais tarde';
      toast({
        title: 'Erro ao criar conta',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      w="100%"
      bgImage="url('https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?ixlib=rb-4.0.3')"
      bgPosition="center"
      bgRepeat="no-repeat"
      bgSize="cover"
    >
      <Container maxW="container.sm" centerContent>
        <Box 
          textAlign="center" 
          py={10} 
          bg="rgba(0, 0, 0, 0.7)" 
          borderRadius="xl"
          p={8}
          mt={20}
          backdropFilter="blur(10px)"
          boxShadow="xl"
        >
          <Heading mb={6} color="white" fontSize="4xl">
            PLATAFORMA CORUJA GAMES
          </Heading>
          <Text color="gray.300" mb={8}>
            Acesse nossa plataforma de jogos online e divirta-se!
          </Text>
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab color="white" _selected={{ color: 'blue.500', bg: 'white' }}>Login</Tab>
              <Tab color="white" _selected={{ color: 'blue.500', bg: 'white' }}>Criar Conta</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <VStack spacing={4}>
                  <FormControl isInvalid={!!emailError}>
                    <FormLabel color="white">Email</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      bg="white"
                      color="black"
                    />
                    <FormErrorMessage>{emailError}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!passwordError}>
                    <FormLabel color="white">Senha</FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha"
                      bg="white"
                      color="black"
                    />
                    <FormErrorMessage>{passwordError}</FormErrorMessage>
                  </FormControl>
                  <Button
                    w="full"
                    colorScheme="blue"
                    leftIcon={<FaEnvelope />}
                    onClick={handleEmailLogin}
                    isLoading={emailLoading}
                    size="lg"
                  >
                    Entrar
                  </Button>
                </VStack>
              </TabPanel>
              <TabPanel>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel color="white">Nome (opcional)</FormLabel>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                      bg="white"
                      color="black"
                    />
                  </FormControl>
                  <FormControl isInvalid={!!emailError}>
                    <FormLabel color="white">Email</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      bg="white"
                      color="black"
                    />
                    <FormErrorMessage>{emailError}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!passwordError}>
                    <FormLabel color="white">Senha</FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      bg="white"
                      color="black"
                    />
                    <FormErrorMessage>{passwordError}</FormErrorMessage>
                  </FormControl>
                  <Button
                    w="full"
                    colorScheme="green"
                    leftIcon={<FaLock />}
                    onClick={handleEmailSignUp}
                    isLoading={emailLoading}
                    size="lg"
                  >
                    Criar Conta
                  </Button>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
          
          <Divider my={6} borderColor="gray.400" />
          
          <Button
            w="full"
            colorScheme="red"
            leftIcon={<FaGoogle />}
            onClick={handleGoogleLogin}
            isLoading={loading}
            size="lg"
            _hover={{ transform: 'scale(1.05)' }}
            transition="all 0.2s"
          >
            Entrar com Google
          </Button>
        </Box>
      </Container>
    </Box>
  );
};