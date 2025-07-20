import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, SimpleGrid, Box, VStack, Image, Text, Button } from "@chakra-ui/react";
import * as GameTypes from "../../types/game";
import fighterSvg from "../../assets/spaceships/fighter.svg";
import cruiserSvg from "../../assets/spaceships/cruiser.svg";
import destroyerSvg from "../../assets/spaceships/destroyer.svg";
import scoutSvg from "../../assets/spaceships/scout.svg";

type ShipSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedShip: GameTypes.ShipType;
  setSelectedShip: (ship: GameTypes.ShipType) => void;
  onConfirm: () => void;
};

const shipData = [
  { type: "fighter" as ShipType, name: "Fighter", desc: "Rápido e Ágil", img: fighterSvg },
  { type: "cruiser" as ShipType, name: "Cruiser", desc: "Resistente e Poderoso", img: cruiserSvg },
  { type: "destroyer" as ShipType, name: "Destroyer", desc: "Alto Dano e Alcance", img: destroyerSvg },
  { type: "scout" as ShipType, name: "Scout", desc: "Alta Mobilidade e Visão", img: scoutSvg },
];

export const ShipSelectionModal = ({ 
    isOpen, 
    onClose, 
    selectedShip, 
    setSelectedShip, 
    onConfirm 
}: ShipSelectionModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader>Escolha sua Nave</ModalHeader>
        <ModalBody>
          <SimpleGrid columns={2} spacing={4}>
            {shipData.map((ship) => (
              <Box
                key={ship.type}
                p={4}
                borderWidth={2}
                borderRadius="lg"
                borderColor={selectedShip === ship.type ? "blue.500" : "gray.600"}
                cursor="pointer"
                onClick={() => setSelectedShip(ship.type)}
                bg={selectedShip === ship.type ? "gray.700" : "gray.800"}
              >
                <VStack>
                  <Image src={ship.img} alt={ship.name} boxSize="100px" />
                  <Text fontWeight="bold">{ship.name}</Text>
                  <Text fontSize="sm">{ship.desc}</Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={onConfirm} isDisabled={!selectedShip}>
            Confirmar Seleção
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};