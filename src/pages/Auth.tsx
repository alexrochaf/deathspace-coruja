import { useState } from 'react';
import { auth } from '../config/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/game');
    } catch (error) {
      console.error(error);
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
            DEATH SPACE - CORUJA GAME
          </Heading>
          <Text color="gray.300" mb={8}>
            Prepare-se para uma aventura épica nas estrelas!
          </Text>
          <Stack spacing={4} direction="column" align="center" w="full">
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
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};