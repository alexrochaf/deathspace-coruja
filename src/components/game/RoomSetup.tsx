import { Container, VStack, Heading, FormControl, FormLabel, Input, Button, Text, useToast, HStack, Box, List, ListItem } from "@chakra-ui/react";
import type { GameRoom } from "../../types/game";

type RoomSetupProps = {
  roomName: string;
  setRoomName: (name: string) => void;
  roomIdToJoin: string;
  setRoomIdToJoin: (id: string) => void;
  handleCreateRoom: () => void;
  handleJoinRoom: () => void;
  playerRooms: GameRoom[];
  setCurrentRoom: (room: GameRoom) => void;
};

export const RoomSetup = ({ 
    roomName, 
    setRoomName, 
    roomIdToJoin, 
    setRoomIdToJoin, 
    handleCreateRoom, 
    handleJoinRoom, 
    playerRooms,
    setCurrentRoom
}: RoomSetupProps) => {
  return (
    <Container maxW="md">
      <VStack spacing={8} py={12}>
        <Heading>Bem-vindo</Heading>
        {playerRooms.length > 0 && (
          <>
            <Box w="100%" p={6} borderWidth={1} borderRadius="lg">
              <VStack spacing={4} align="stretch" w="100%">
                <Heading size="md">Participando</Heading>
                <List spacing={3} w="100%">
                  {playerRooms.map((room) => (
                    <ListItem
                      key={room.id}
                      p={2}
                      borderWidth="1px"
                      borderRadius="md"
                      _hover={{ bg: "gray.100" }}
                    >
                      <HStack justify="space-between">
                        <Box>
                          <Text fontWeight="bold">{room.name}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {room.players?.length || 0} jogadores
                          </Text>
                        </Box>
                        <Button size="sm" onClick={() => setCurrentRoom(room)}>
                          Entrar
                        </Button>
                      </HStack>
                    </ListItem>
                  ))}
                </List>
              </VStack>
            </Box>
          </>
        )}

        <VStack
          as="form"
          spacing={4}
          w="100%"
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateRoom();
          }}
        >
          <Heading size="lg">Começar uma nova sala</Heading>
          <FormControl isRequired>
            <FormLabel>Nome da Sala</FormLabel>
            <Input
              placeholder="Digite o nome da sala"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </FormControl>
          <Button type="submit" colorScheme="blue" w="100%">
            Começar Batalha
          </Button>
        </VStack>

        <Text>ou</Text>

        <VStack
          as="form"
          spacing={4}
          w="100%"
          onSubmit={(e) => {
            e.preventDefault();
            handleJoinRoom();
          }}
        >
          <Heading size="lg">Entrar em uma Sala</Heading>
          <FormControl isRequired>
            <FormLabel>ID da Sala</FormLabel>
            <Input
              placeholder="Digite o ID da sala"
              value={roomIdToJoin}
              onChange={(e) => setRoomIdToJoin(e.target.value)}
            />
          </FormControl>
          <Button type="submit" colorScheme="teal" w="100%">
            Entrar na Sala
          </Button>
        </VStack>
      </VStack>
    </Container>
  );
};