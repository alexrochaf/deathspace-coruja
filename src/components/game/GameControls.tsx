import { Box, VStack, Heading, Text, Divider, Button, SimpleGrid } from "@chakra-ui/react";
import * as GameTypes from "../../types/game";

type GameControlsProps = {
  isCouncilMember: boolean;
  selectedAction: GameTypes.PlayerActionType | null;
  setSelectedAction: (action: GameTypes.PlayerActionType | null) => void;
  currentPlayer?: GameTypes.Player | null;
  selectedShipInfo: GameTypes.Ship | null;
};

export const GameControls = ({ 
    isCouncilMember, 
    selectedAction, 
    setSelectedAction, 
    currentPlayer, 
    selectedShipInfo 
}: GameControlsProps) => {
  return (
    <Box bg="gray.800" p={4} borderRadius="md" color="white">
      <VStack spacing={4} align="stretch">
        <Heading size="md">Controles</Heading>
        {isCouncilMember && (
          <Button
            colorScheme={selectedAction === 'VOTE' ? 'cyan' : 'gray'}
            onClick={() => setSelectedAction('VOTE')}
            isDisabled={!!currentPlayer!.votedFor}
            size="sm"
          >
            🗳️ Votar
          </Button>
        )}
        {selectedShipInfo ? (
          <>
            <Box>
              <Heading size="sm">Nave Selecionada</Heading>
              <Text>Tipo: {selectedShipInfo.type}</Text>
              <Text>PA: {selectedShipInfo.actionPoints}</Text>
              <Text>Vida: {selectedShipInfo.health}</Text>
            </Box>
            <Divider />
            <VStack spacing={2}>
              <Heading size="sm">Ações</Heading>
              <SimpleGrid columns={2} spacing={2} w="100%">
                <Button
                  colorScheme={selectedAction === 'MOVE' ? 'blue' : 'gray'}
                  onClick={() => setSelectedAction('MOVE')}
                  isDisabled={selectedShipInfo.actionPoints <= 0}
                  size="sm"
                >
                  🚀 Propulsão
                </Button>
                <Button
                  colorScheme={selectedAction === 'ATTACK' ? 'red' : 'gray'}
                  onClick={() => setSelectedAction('ATTACK')}
                  isDisabled={selectedShipInfo.actionPoints <= 0}
                  size="sm"
                >
                  💥 Laser
                </Button>
                <Button
                  colorScheme={selectedAction === 'DONATE' ? 'green' : 'gray'}
                  onClick={() => setSelectedAction('DONATE')}
                  isDisabled={selectedShipInfo.actionPoints <= 0}
                  size="sm"
                >
                  🎁 Transferir
                </Button>
                <Button
                  colorScheme={selectedAction === 'RECOVER' ? 'purple' : 'gray'}
                  onClick={() => setSelectedAction('RECOVER')}
                  isDisabled={selectedShipInfo.actionPoints < 3 || selectedShipInfo.health >= 3}
                  size="sm"
                >
                  ❤️ Recuperar
                </Button>
                <Button
                  colorScheme={selectedAction === 'IMPROVE' ? 'yellow' : 'gray'}
                  onClick={() => setSelectedAction('IMPROVE')}
                  isDisabled={selectedShipInfo.actionPoints < 3}
                  size="sm"
                >
                  🎯 Aprimorar
                </Button>
                <Button
                  colorScheme="gray"
                  onClick={() => setSelectedAction(null)}
                  isDisabled={!selectedAction}
                  size="sm"
                >
                  ❌ Abortar
                </Button>
              </SimpleGrid>
            </VStack>
          </>
        ) : (
          <Text>Selecione uma nave para ver as ações.</Text>
        )}
      </VStack>
    </Box>
  );
};