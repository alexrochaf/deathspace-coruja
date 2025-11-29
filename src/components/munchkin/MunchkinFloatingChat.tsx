import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  IconButton,
  Collapse,
  Badge
} from '@chakra-ui/react';
import { MessageCircle, Send, Minimize2, Maximize2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
}

interface MunchkinFloatingChatProps {
  messages: ChatMessage[];
  logs: string[];
  onSendMessage: (message: string) => void;
}

export const MunchkinFloatingChat: React.FC<MunchkinFloatingChatProps> = ({
  messages,
  logs,
  onSendMessage
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'logs'>('chat');
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Box
      position="fixed"
      bottom="20px"
      right="20px"
      width={isExpanded ? "350px" : "60px"}
      height={isExpanded ? "400px" : "60px"}
      bg="rgba(0, 0, 0, 0.9)"
      borderRadius="lg"
      border="2px solid"
      borderColor="yellow.400"
      boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
      transition="all 0.3s ease"
      zIndex={1000}
      overflow="hidden"
    >
      {/* Header */}
      <HStack
        p={3}
        bg="yellow.400"
        color="black"
        justify="space-between"
        cursor="pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <HStack spacing={2}>
          <MessageCircle size={20} />
          {isExpanded && (
            <Text fontWeight="bold" fontSize="sm">
              Chat & Logs
            </Text>
          )}
        </HStack>
        
        {isExpanded && (
          <IconButton
            aria-label="Toggle chat"
            icon={isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            size="xs"
            variant="ghost"
            color="black"
            _hover={{ bg: "yellow.300" }}
          />
        )}
      </HStack>

      <Collapse in={isExpanded}>
        <VStack spacing={0} height="340px">
          {/* Tab Navigation */}
          <HStack
            width="100%"
            bg="gray.800"
            p={2}
            spacing={0}
          >
            <Button
              size="sm"
              variant={activeTab === 'chat' ? 'solid' : 'ghost'}
              colorScheme={activeTab === 'chat' ? 'yellow' : 'gray'}
              onClick={() => setActiveTab('chat')}
              flex={1}
              borderRadius="md"
              mr={1}
            >
              Chat
              {messages.length > 0 && (
                <Badge ml={2} colorScheme="red" size="sm">
                  {messages.length}
                </Badge>
              )}
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'logs' ? 'solid' : 'ghost'}
              colorScheme={activeTab === 'logs' ? 'yellow' : 'gray'}
              onClick={() => setActiveTab('logs')}
              flex={1}
              borderRadius="md"
            >
              Logs
              {logs.length > 0 && (
                <Badge ml={2} colorScheme="blue" size="sm">
                  {logs.length}
                </Badge>
              )}
            </Button>
          </HStack>

          {/* Content Area */}
          <Box
            flex={1}
            width="100%"
            bg="gray.900"
            overflowY="auto"
            p={3}
          >
            {activeTab === 'chat' ? (
              <VStack spacing={2} align="stretch">
                {messages.length === 0 ? (
                  <Text color="gray.400" fontSize="sm" textAlign="center">
                    Nenhuma mensagem ainda...
                  </Text>
                ) : (
                  messages.map((msg) => (
                    <Box
                      key={msg.id}
                      p={2}
                      bg="gray.800"
                      borderRadius="md"
                      borderLeft="3px solid"
                      borderLeftColor="yellow.400"
                    >
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="xs" fontWeight="bold" color="yellow.400">
                          {msg.user}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          {msg.timestamp.toLocaleTimeString()}
                        </Text>
                      </HStack>
                      <Text fontSize="sm" color="white">
                        {msg.message}
                      </Text>
                    </Box>
                  ))
                )}
              </VStack>
            ) : (
              <VStack spacing={1} align="stretch">
                {logs.length === 0 ? (
                  <Text color="gray.400" fontSize="sm" textAlign="center">
                    Nenhum log ainda...
                  </Text>
                ) : (
                  logs.map((log, index) => (
                    <Text
                      key={index}
                      fontSize="xs"
                      color="cyan.300"
                      fontFamily="mono"
                      p={1}
                      bg="gray.800"
                      borderRadius="sm"
                    >
                      {log}
                    </Text>
                  ))
                )}
              </VStack>
            )}
          </Box>

          {/* Input Area (only for chat) */}
          {activeTab === 'chat' && (
            <HStack
              p={3}
              bg="gray.800"
              borderTop="1px solid"
              borderTopColor="gray.700"
              width="100%"
            >
              <Input
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                size="sm"
                bg="gray.900"
                border="1px solid"
                borderColor="gray.600"
                color="white"
                _placeholder={{ color: 'gray.400' }}
                _focus={{
                  borderColor: 'yellow.400',
                  boxShadow: '0 0 0 1px var(--chakra-colors-yellow-400)'
                }}
              />
              <IconButton
                aria-label="Enviar mensagem"
                icon={<Send size={16} />}
                onClick={handleSendMessage}
                size="sm"
                colorScheme="yellow"
                isDisabled={!newMessage.trim()}
              />
            </HStack>
          )}
        </VStack>
      </Collapse>
    </Box>
  );
};