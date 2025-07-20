import { useState, useRef, useEffect } from 'react';
import { Box, Input, Button, VStack, Text, Heading, Flex } from '@chakra-ui/react';
import type { ChatMessage } from '../types/game';
import { useGame } from '../contexts/GameContext';

interface ChatProps {
  title: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isDisabled?: boolean;
  isMemberOfTargetChat: boolean;
}

export const Chat = ({ title, messages, onSendMessage, isDisabled, isMemberOfTargetChat }: ChatProps) => {
  const [newMessage, setNewMessage] = useState('');
  const { currentPlayer } = useGame();
  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.scrollTop = scrollableContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    await onSendMessage(newMessage);
    setNewMessage('');
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} h="100%" display="flex" flexDirection="column">
      <Heading size="md" mb={4}>{title}</Heading>
      <VStack
        ref={scrollableContainerRef}
        spacing={2}
        align="stretch"
        flex={1}
        overflowY="auto"
        pr={2}
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'gray.400',
            borderRadius: '24px',
          },
        }}
      >
        {messages.map((msg) => (
          <Box key={msg.id} w="100%">
            <Flex justify={msg.playerId === currentPlayer?.id ? 'flex-end' : 'flex-start'}>
              <Box
                bg={msg.playerId === currentPlayer?.id ? 'blue.500' : 'gray.200'}
                color={msg.playerId === currentPlayer?.id ? 'white' : 'black'}
                px={3}
                py={1}
                borderRadius="lg"
                maxWidth="80%"
              >
                <Text fontSize="xs" fontWeight="bold">{msg.playerName}</Text>
                <Text>{msg.message}</Text>
                <Text fontSize="2xs" textAlign="right">{formatTimestamp(msg.timestamp)}</Text>
              </Box>
            </Flex>
          </Box>
        ))}
      </VStack>
      <Flex mt={4}>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={!isMemberOfTargetChat ? 'Você não pode enviar mensagens aqui' : 'Digite sua mensagem...'}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          isDisabled={isDisabled || !isMemberOfTargetChat}
        />
        <Button onClick={handleSendMessage} ml={2} isDisabled={isDisabled || !newMessage.trim() || !isMemberOfTargetChat}>
          Enviar
        </Button>
      </Flex>
    </Box>
  );
};