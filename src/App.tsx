import { ChakraProvider } from '@chakra-ui/react';
import { GameProvider } from './contexts/GameContext';
import { Game } from './pages/Game';
import { Auth } from './pages/Auth';
import { Platform } from './pages/Platform';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChange, getCurrentUser } from './config/supabase';
import type { User } from './config/supabase';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão inicial
    const checkInitialSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Erro ao verificar sessão inicial:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkInitialSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return user ? <>{children}</> : <Navigate to="/" />;
}

function App() {
  return (
    <ChakraProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route
            path="/platform"
            element={
              <PrivateRoute>
                <Platform />
              </PrivateRoute>
            }
          />
          <Route
            path="/game/:gameType"
            element={
              <PrivateRoute>
                <GameProvider>
                  <Game />
                </GameProvider>
              </PrivateRoute>
            }
          />
          {/* Redirect legacy /game route to platform */}
          <Route
            path="/game"
            element={
              <PrivateRoute>
                <Navigate to="/platform" replace />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
