import { useState } from 'react';
import { auth } from '../config/firebase';
import { signInAnonymously, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  useToast
} from '@chakra-ui/react';
import { FaGoogle } from 'react-icons/fa';

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      navigate('/game');
    } catch (error) {
      toast({
        title: 'Erro ao fazer login',
        description: 'Tente novamente mais tarde',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/game');
    } catch (error) {
      toast({
        title: 'Erro ao fazer login com Google',
        description: 'Tente novamente mais tarde',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" centerContent>
      <Box textAlign="center" py={10}>
        <Heading mb={6}>Bem-vindo ao Jogo</Heading>
        <Text mb={8}>Escolha como você quer entrar:</Text>
        <Stack spacing={4} direction="column" align="center">
          <Button
            w="full"
            colorScheme="blue"
            onClick={handleAnonymousLogin}
            isLoading={loading}
          >
            Entrar Anonimamente
          </Button>
          <Button
            w="full"
            colorScheme="red"
            leftIcon={<FaGoogle />}
            onClick={handleGoogleLogin}
            isLoading={loading}
          >
            Entrar com Google
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};