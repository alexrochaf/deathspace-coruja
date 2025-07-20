import { VStack, Box, Heading } from "@chakra-ui/react";
import { Chat } from "../Chat";
import { GameLogList } from "../GameLog";
import * as GameTypes from "../../types/game";

type SidebarProps = {
  councilChat: GameTypes.ChatMessage[];
  roomChat: GameTypes.ChatMessage[];
  sendCouncilMessage: (message: string) => void;
  sendRoomMessage: (message: string) => void;
  isCouncilMember: boolean;
};

export const Sidebar = ({
  councilChat,
  roomChat,
  sendCouncilMessage,
  sendRoomMessage,
  isCouncilMember,
}: SidebarProps) => {
  return (
    <VStack spacing={4} h="100%" align="stretch">
      <Box
        flex="1"
        overflowY="auto"
        bg="gray.900"
        borderRadius="md"
        p={4}
        color="white"
      >
        <Heading size="md" mb={4}>
          Histórico de Ações
        </Heading>
        <GameLogList />
      </Box>

      <Box flex="1" overflowY="hidden">
        <Chat
          title="Chat da Sala"
          messages={roomChat}
          onSendMessage={sendRoomMessage}
          isMemberOfTargetChat={true}
        />
      </Box>

      {isCouncilMember && (
        <Box flex="1" overflowY="hidden">
          <Chat
            title="Chat do Conselho"
            messages={councilChat}
            onSendMessage={sendCouncilMessage}
            isMemberOfTargetChat={true}
          />
        </Box>
      )}
    </VStack>
  );
};