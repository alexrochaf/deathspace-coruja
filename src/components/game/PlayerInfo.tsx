import { Box, VStack, Heading, Text, Divider, Button } from "@chakra-ui/react";
import * as GameTypes from "../../types/game";

// Use GameTypes.Player and GameTypes.Room instead of Player and Room

type PlayerInfoProps = {
  currentPlayer?: GameTypes.Player | null;
  currentRoom: GameTypes.Room;
  onLeaveRoom: () => void;
};

export const PlayerInfo = ({ currentPlayer, currentRoom, onLeaveRoom }: PlayerInfoProps) => {
  return (
    <Box bg="gray.800" p={4} borderRadius="md" color="white">
      <VStack spacing={4} align="stretch">
        <Heading size="md">Jogador</Heading>
        <Text>Nome: {currentPlayer?.name}</Text>
        <Text>Sala: {currentRoom.name}</Text>
        <Text>ID da Sala: {currentRoom.id}</Text>
        <Divider />
        <Button colorScheme="red" size="sm" onClick={onLeaveRoom}>
          Sair da Sala
        </Button>
      </VStack>
    </Box>
  );
};