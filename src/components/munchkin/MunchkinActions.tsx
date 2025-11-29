import React, { useState } from 'react';
import type { MunchkinGameState, MunchkinPlayer } from '../../types/munchkin';
import { getTurnPhaseName } from '../../utils/munchkinPhases';
import { 
  Badge, 
  Button, 
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { 
  Shield, 
  Crown, 
  Package,
  Target,
  ArrowRight,
  DollarSign,
  Play,
  Skull,
  Star,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface MunchkinActionsProps {
  gameState: MunchkinGameState;
  currentPlayer: MunchkinPlayer;
  selectedCards: string[];
  isCurrentPlayerTurn: boolean;
  onAction: (action: string, data?: Record<string, unknown>) => void;
}

export const MunchkinActions: React.FC<MunchkinActionsProps> = ({
  gameState,
  currentPlayer,
  selectedCards,
  isCurrentPlayerTurn,
  onAction
}) => {
  const { isOpen: showSellDialog, onOpen: openSellDialog, onClose: closeSellDialog } = useDisclosure();
  const [itemsToSell, setItemsToSell] = useState<string[]>([]);
  
  if (!currentPlayer?.hand) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Carregando ações do jogador...</p>
      </div>
    );
  }
  
  const isInCombat = !!gameState.currentCombat;
  const isPlayerInCombat = gameState.currentCombat?.player.id === currentPlayer.id;
  const totalCards = currentPlayer.hand.door.length + currentPlayer.hand.treasure.length;
  const maxHandSize = 5; // MUNCHKIN_CONSTANTS.MAX_HAND_SIZE
  const needsToDiscard = totalCards > maxHandSize;

  // Calcular valor total dos itens selecionados para venda
  const calculateSellValue = (itemIds: string[]) => {
    return itemIds.reduce((total, itemId) => {
      const item = currentPlayer.hand.treasure.find(c => c.id === itemId);
      return total + (item?.goldValue || 0);
    }, 0);
  };

  const sellableItems = currentPlayer.hand.treasure.filter(card => 
    card.subtype === 'equipment' && card.goldValue && card.goldValue > 0
  );

  const handleSellItems = () => {
    if (itemsToSell.length === 0) return;
    
    onAction('sell_items', { itemIds: itemsToSell });
    setItemsToSell([]);
    closeSellDialog();
  };

  const handleDiscardCards = () => {
    if (selectedCards.length === 0) return;
    
    onAction('discard_cards', { cardIds: selectedCards });
  };

  const canLevelUpBySelling = () => {
    const sellValue = calculateSellValue(itemsToSell);
    return sellValue >= 1000; // 1000 gold = 1 level
  };

  const getLevelsFromSelling = () => {
    const sellValue = calculateSellValue(itemsToSell);
    return Math.floor(sellValue / 1000);
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* Turn Status */}
      <Box
        p={4}
        bg={isCurrentPlayerTurn ? "rgba(34, 197, 94, 0.2)" : "rgba(107, 114, 128, 0.2)"}
        border="2px solid"
        borderColor={isCurrentPlayerTurn ? "green.400" : "gray.500"}
        borderRadius="15px"
        backdropFilter="blur(10px)"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
      >
        <HStack justify="space-between" align="center">
          <HStack spacing={2}>
            <Crown 
              size={16} 
              color={isCurrentPlayerTurn ? "#4ade80" : "#9ca3af"} 
            />
            <Text 
              fontWeight="bold" 
              color={isCurrentPlayerTurn ? "green.300" : "gray.400"}
              fontSize="sm"
            >
              {isCurrentPlayerTurn ? 'SEU TURNO' : 'AGUARDANDO'}
            </Text>
          </HStack>
          
          {isCurrentPlayerTurn && (
            <Badge 
              bg="green.500" 
              color="white"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="bold"
              animation="pulse 2s infinite"
            >
              FASE: {getTurnPhaseName(gameState.turnPhase)?.toUpperCase() || 'AGUARDANDO'}
            </Badge>
          )}
        </HStack>
        
        {needsToDiscard && (
          <Box 
            mt={3} 
            p={3} 
            bg="rgba(239, 68, 68, 0.2)" 
            border="2px solid" 
            borderColor="red.400"
            borderRadius="10px"
          >
            <HStack spacing={2}>
              <AlertTriangle size={16} color="#f87171" />
              <Text color="red.300" fontSize="sm" fontWeight="bold">
                Você tem muitas cartas! Descarte {totalCards - maxHandSize} carta(s).
              </Text>
            </HStack>
          </Box>
        )}
      </Box>

      {/* Main Actions */}
      {isCurrentPlayerTurn && (
        <Box
          p={4}
          bg="rgba(59, 130, 246, 0.2)"
          border="2px solid"
          borderColor="blue.400"
          borderRadius="15px"
          backdropFilter="blur(10px)"
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
        >
          <VStack spacing={3}>
            <Heading size="sm" color="blue.300" textAlign="center">
              AÇÕES DISPONÍVEIS
            </Heading>
            
            {/* Door Phase Actions */}
            {getTurnPhaseName(gameState.turnPhase) === 'door' && !isInCombat && (
              <>
                <Button 
                  onClick={() => onAction('kick_door')}
                  w="full"
                  bg="linear-gradient(135deg, #dc2626, #b91c1c)"
                  color="white"
                  fontWeight="bold"
                  py={3}
                  borderRadius="12px"
                  border="2px solid"
                  borderColor="red.400"
                  boxShadow="0 4px 15px rgba(220, 38, 38, 0.4)"
                  _hover={{
                    bg: "linear-gradient(135deg, #b91c1c, #991b1b)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(220, 38, 38, 0.6)"
                  }}
                  leftIcon={<Skull size={16} />}
                >
                  CHUTAR A PORTA
                </Button>
                
                <Button 
                  onClick={() => onAction('look_for_trouble')}
                  disabled={currentPlayer.hand.door.filter(c => c.type === 'monster').length === 0}
                  w="full"
                  bg="linear-gradient(135deg, #ea580c, #c2410c)"
                  color="white"
                  fontWeight="bold"
                  py={3}
                  borderRadius="12px"
                  border="2px solid"
                  borderColor="orange.400"
                  boxShadow="0 4px 15px rgba(234, 88, 12, 0.4)"
                  _hover={{
                    bg: "linear-gradient(135deg, #c2410c, #9a3412)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(234, 88, 12, 0.6)"
                  }}
                  leftIcon={<Target size={16} />}
                >
                  PROCURAR ENCRENCA
                </Button>
              </>
            )}
            
            {/* Combat Actions */}
            {isInCombat && isPlayerInCombat && (
              <>
                <Button 
                  onClick={() => onAction('run_away')}
                  w="full"
                  bg="linear-gradient(135deg, #ca8a04, #a16207)"
                  color="white"
                  fontWeight="bold"
                  py={3}
                  borderRadius="12px"
                  border="2px solid"
                  borderColor="yellow.400"
                  boxShadow="0 4px 15px rgba(202, 138, 4, 0.4)"
                  _hover={{
                    bg: "linear-gradient(135deg, #a16207, #854d0e)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(202, 138, 4, 0.6)"
                  }}
                  leftIcon={<ArrowRight size={16} />}
                >
                  FUGIR DO COMBATE
                </Button>
                
                <Button 
                  onClick={() => onAction('ask_for_help')}
                  w="full"
                  bg="linear-gradient(135deg, #9333ea, #7c3aed)"
                  color="white"
                  fontWeight="bold"
                  py={3}
                  borderRadius="12px"
                  border="2px solid"
                  borderColor="purple.400"
                  boxShadow="0 4px 15px rgba(147, 51, 234, 0.4)"
                  _hover={{
                    bg: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(147, 51, 234, 0.6)"
                  }}
                  leftIcon={<Shield size={16} />}
                >
                  PEDIR AJUDA
                </Button>
              </>
            )}
            
            {/* End Turn */}
            {(getTurnPhaseName(gameState.turnPhase) === 'treasure' || getTurnPhaseName(gameState.turnPhase) === 'charity') && (
              <Button 
                onClick={() => onAction('end_turn')}
                disabled={needsToDiscard}
                w="full"
                bg="linear-gradient(135deg, #16a34a, #15803d)"
                color="white"
                fontWeight="bold"
                py={3}
                borderRadius="12px"
                border="2px solid"
                borderColor="green.400"
                boxShadow="0 4px 15px rgba(22, 163, 74, 0.4)"
                _hover={{
                  bg: "linear-gradient(135deg, #15803d, #166534)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(22, 163, 74, 0.6)"
                }}
                leftIcon={<Crown size={16} />}
              >
                TERMINAR TURNO
              </Button>
            )}
          </VStack>
        </Box>
      )}

      {/* Card Actions */}
      {selectedCards.length > 0 && (
        <Box
          p={4}
          bg="rgba(147, 51, 234, 0.2)"
          border="2px solid"
          borderColor="purple.400"
          borderRadius="15px"
          backdropFilter="blur(10px)"
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
        >
          <VStack spacing={3}>
            <HStack spacing={2}>
              <Play size={20} color="#c084fc" />
              <Heading size="sm" color="purple.300">
                AÇÕES COM CARTAS ({selectedCards.length})
              </Heading>
            </HStack>
            
            <Button 
              onClick={() => {
                selectedCards.forEach(cardId => {
                  onAction('play_card', { cardId });
                });
              }}
              disabled={!isCurrentPlayerTurn}
              w="full"
              bg="linear-gradient(135deg, #2563eb, #1d4ed8)"
              color="white"
              fontWeight="bold"
              py={3}
              borderRadius="12px"
              border="2px solid"
              borderColor="blue.400"
              boxShadow="0 4px 15px rgba(37, 99, 235, 0.4)"
              _hover={{
                bg: "linear-gradient(135deg, #1d4ed8, #1e40af)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(37, 99, 235, 0.6)"
              }}
              leftIcon={<Play size={16} />}
            >
              JOGAR CARTA(S)
            </Button>
            
            {/* Equip selected equipment */}
            {selectedCards.some(cardId => {
              const card = [...currentPlayer.hand.door, ...currentPlayer.hand.treasure]
                .find(c => c.id === cardId);
              return card?.subtype === 'equipment';
            }) && (
              <Button 
                onClick={() => {
                  selectedCards.forEach(cardId => {
                    const card = [...currentPlayer.hand.door, ...currentPlayer.hand.treasure]
                      .find(c => c.id === cardId);
                    if (card?.subtype === 'equipment') {
                      onAction('equip_item', { itemId: cardId });
                    }
                  });
                }}
                disabled={!isCurrentPlayerTurn}
                w="full"
                bg="linear-gradient(135deg, #9333ea, #7c3aed)"
                color="white"
                fontWeight="bold"
                py={3}
                borderRadius="12px"
                border="2px solid"
                borderColor="purple.400"
                boxShadow="0 4px 15px rgba(147, 51, 234, 0.4)"
                _hover={{
                  bg: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(147, 51, 234, 0.6)"
                }}
                leftIcon={<Shield size={16} />}
              >
                EQUIPAR ITEM(S)
              </Button>
            )}
            
            {/* Discard cards (for charity phase) */}
            {needsToDiscard && (
              <Button 
                onClick={handleDiscardCards}
                w="full"
                bg="linear-gradient(135deg, #6b7280, #4b5563)"
                color="white"
                fontWeight="bold"
                py={3}
                borderRadius="12px"
                border="2px solid"
                borderColor="gray.400"
                boxShadow="0 4px 15px rgba(107, 114, 128, 0.4)"
                _hover={{
                  bg: "linear-gradient(135deg, #4b5563, #374151)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(107, 114, 128, 0.6)"
                }}
                leftIcon={<Package size={16} />}
              >
                DESCARTAR CARTA(S)
              </Button>
            )}
          </VStack>
        </Box>
      )}

      {/* Sell Items */}
      {sellableItems.length > 0 && (
        <Box
          p={4}
          bg="rgba(245, 158, 11, 0.2)"
          border="2px solid"
          borderColor="amber.400"
          borderRadius="15px"
          backdropFilter="blur(10px)"
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
        >
          <VStack spacing={3}>
            <HStack spacing={2}>
              <DollarSign size={20} color="#fbbf24" />
              <Heading size="sm" color="amber.300">
                VENDER ITENS
              </Heading>
            </HStack>
            
            <Button 
               onClick={openSellDialog}
               w="full"
               bg="linear-gradient(135deg, #f59e0b, #d97706)"
               color="white"
               fontWeight="bold"
               py={3}
               borderRadius="12px"
               border="2px solid"
               borderColor="amber.400"
               boxShadow="0 4px 15px rgba(245, 158, 11, 0.4)"
               _hover={{
                 bg: "linear-gradient(135deg, #d97706, #b45309)",
                 transform: "translateY(-2px)",
                 boxShadow: "0 6px 20px rgba(245, 158, 11, 0.6)"
               }}
               leftIcon={<DollarSign size={16} />}
             >
               ABRIR LOJA ({sellableItems.length} itens)
             </Button>
           </VStack>
           
           <Modal isOpen={showSellDialog} onClose={closeSellDialog}>
            <ModalOverlay />
            <ModalContent className="max-w-md">
              <ModalHeader className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Vender Itens
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Selecione os itens que deseja vender. Você precisa de 1000 moedas de ouro para subir 1 nível.
                </p>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {sellableItems.map(item => (
                    <div 
                      key={item.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        itemsToSell.includes(item.id) 
                          ? 'bg-yellow-100 border-yellow-500' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setItemsToSell(prev => 
                          prev.includes(item.id)
                            ? prev.filter(id => id !== item.id)
                            : [...prev, item.id]
                        );
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        
                        <div className="text-right">
                          <Badge className="bg-yellow-600">
                            {item.goldValue} ouro
                          </Badge>
                          {itemsToSell.includes(item.id) && (
                            <CheckCircle className="w-4 h-4 text-green-600 mt-1 ml-auto" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {itemsToSell.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-yellow-600">
                        {calculateSellValue(itemsToSell)} ouro
                      </span>
                    </div>
                    
                    {canLevelUpBySelling() && (
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-semibold text-yellow-600">
                          Você subirá {getLevelsFromSelling()} nível(s)!
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setItemsToSell([]);
                      closeSellDialog();
                    }}
                  >
                    Cancelar
                  </Button>
                  
                  <Button 
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                    onClick={handleSellItems}
                    disabled={itemsToSell.length === 0 || !isCurrentPlayerTurn}
                  >
                    Vender
                  </Button>
                </div>
              </div>
              </ModalBody>
            </ModalContent>
             </Modal>
           </Box>
         )}

      {/* Player Status Summary */}
      <Box
        p={4}
        bg="rgba(99, 102, 241, 0.2)"
        border="2px solid"
        borderColor="indigo.400"
        borderRadius="15px"
        backdropFilter="blur(10px)"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
      >
        <VStack spacing={3}>
          <HStack spacing={2}>
            <Target size={20} color="#818cf8" />
            <Heading size="sm" color="indigo.300">
              STATUS RÁPIDO
            </Heading>
          </HStack>
          
          <Box w="full">
            <HStack justify="space-between" mb={2}>
              <VStack spacing={1} align="start">
                <HStack justify="space-between" w="full">
                  <Text color="gray.400" fontSize="sm">Nível:</Text>
                  <Text color="white" fontWeight="bold" fontSize="sm">{currentPlayer.level}/10</Text>
                </HStack>
                
                <HStack justify="space-between" w="full">
                  <Text color="gray.400" fontSize="sm">Cartas:</Text>
                  <Text 
                    color={needsToDiscard ? "red.400" : "white"} 
                    fontWeight="bold" 
                    fontSize="sm"
                  >
                    {totalCards}/{maxHandSize}
                  </Text>
                </HStack>
              </VStack>
              
              <VStack spacing={1} align="start">
                <HStack justify="space-between" w="full">
                  <Text color="gray.400" fontSize="sm">Classe:</Text>
                  <Text color="white" fontWeight="bold" fontSize="sm">
                    {currentPlayer.class?.name || 'Nenhuma'}
                  </Text>
                </HStack>
                
                <HStack justify="space-between" w="full">
                  <Text color="gray.400" fontSize="sm">Raça:</Text>
                  <Text color="white" fontWeight="bold" fontSize="sm">
                    {currentPlayer.race?.name || 'Humano'}
                  </Text>
                </HStack>
              </VStack>
            </HStack>
          </Box>
        </VStack>
      </Box>
    </VStack>
  );
};