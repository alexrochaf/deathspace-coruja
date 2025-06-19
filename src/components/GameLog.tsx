import { Box, VStack, Text } from "@chakra-ui/react";
import type { GameLog } from "../types/game";
import { useGame } from "../contexts/GameContext";
import { Timestamp } from "firebase/firestore";

export const GameLogList: React.FC = () => {
  const { currentRoom } = useGame();

  const formatLogMessage = (log: GameLog): string => {
    const date = log.timestamp instanceof Timestamp ? log.timestamp.toDate() : new Date(log.timestamp);
    const timestamp = date.toLocaleTimeString();
    
    // Encontrar o nome do jogador no currentRoom
    const getPlayerName = (playerId: string) => {
      const player = currentRoom?.players.find(p => p.id === playerId);
      if (!player) {
        const ship = currentRoom?.ships.find((s) => s.id === playerId);
        const ownerShip = currentRoom?.players.find(p => p.id === ship?.playerId);
        return ownerShip?.name || `Jogador ${playerId.slice(0, 4)}`;
      }
      return player?.name || `Jogador ${playerId.slice(0, 4)}`;
    };
    
    switch (log.action) {
      case "MOVE":
        return `${timestamp} - Nave de ${getPlayerName(log.playerId)} se moveu para posição (${log.details?.position?.x}, ${log.details?.position?.y})`;
      
      case "ATTACK":
        return `${timestamp} - Nave de ${getPlayerName(log.playerId)} atacou a nave de ${getPlayerName(log.targetId!)}`;
      
      case "POINT_DISTRIBUTION":
        return `${timestamp} - Sistema distribuiu pontos: ${getPlayerName(log.playerId)} recebeu ${log.details?.points} PA`;
      
      case "DONATE":
        return `${timestamp} - ${getPlayerName(log.playerId)} doou ${log.details?.points} PA para ${getPlayerName(log.targetId!)}`;
      
      default:
        return `${timestamp} - Ação desconhecida`;
    }
  };

  if (!currentRoom?.logs || currentRoom.logs.length === 0) {
    return (
      <Box
        p={4}
        bg="gray.800"
        borderRadius="lg"
        color="gray.300"
        height="100%"
        border="1px solid"
        borderColor="gray.700"
      >
        <Text>Nenhuma ação registrada ainda.</Text>
      </Box>
    );
  }

  return (
    <Box
      bg="gray.800"
      borderRadius="lg"
      maxH="calc(100% - 80px)"  // Ajustado para considerar o título e padding
      color="gray.100"
      p={3}
      overflowY="auto"
      css={{
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: 'rgba(255, 255, 255, 0.3)',
        },
      }}
    >
      <VStack spacing={2} align="stretch">
        {[...currentRoom.logs]
          .sort((a, b) => {
            const timeA = a.timestamp instanceof Timestamp ? a.timestamp.toDate().getTime() : new Date(a.timestamp).getTime();
            const timeB = b.timestamp instanceof Timestamp ? b.timestamp.toDate().getTime() : new Date(b.timestamp).getTime();
            return timeB - timeA;
          })
          .map((log, index) => (
            <Box 
              key={index} 
              p={3} 
              bg="gray.900" 
              borderRadius="md"
              _hover={{ bg: "gray.850" }}
              transition="background-color 0.2s"
              border="1px solid"
              borderColor="gray.700"
            >
              <Text 
                fontSize="sm" 
                fontFamily="mono"
                color="gray.100"
              >
                {formatLogMessage(log)}
              </Text>
            </Box>
          ))}
      </VStack>
    </Box>
  );
};