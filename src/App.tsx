import { ChakraProvider } from '@chakra-ui/react';
import { GameProvider } from './contexts/GameContext';
import { Game } from './pages/Game';
import { Auth } from './pages/Auth';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth, type User } from './config/firebase';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
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
            path="/game"
            element={
              <PrivateRoute>
                <GameProvider>
                  <Game />
                </GameProvider>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
