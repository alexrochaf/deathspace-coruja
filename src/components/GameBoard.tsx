import { Box, Grid, GridItem, Tooltip } from "@chakra-ui/react";
import { useGame } from "../contexts/GameContext";
import type { Position, Ship, Debris, ShipType } from "../types/game";
import { useEffect, useState } from "react";

// Importe os SVGs dos detritos e naves
import asteroidSvg from "../assets/debris/asteroid.svg";
import satelliteSvg from "../assets/debris/satellite.svg";
import fighterSvg from "../assets/spaceships/fighter.svg";
import cruiserSvg from "../assets/spaceships/cruiser.svg";
import destroyerSvg from "../assets/spaceships/destroyer.svg";
import scoutSvg from "../assets/spaceships/scout.svg";
import destroyedSvg from "../assets/spaceships/destroyed.svg";

interface GameBoardProps {
  onCellClick: (position: Position) => void;
  onShipSelect?: (ship: Ship) => void;
  selectedAction?: string | null;
  getShipInfo: (ship: Ship) => string;
}

export const GameBoard = ({
  onCellClick,
  onShipSelect,
  selectedAction,
  getShipInfo,
}: GameBoardProps) => {
  const { currentRoom, currentPlayer } = useGame();
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);

  useEffect(() => {
    if (selectedShip) {
      const updatedShip = currentRoom?.ships?.find(
        (s) => s.id === selectedShip.id
      );
      if (updatedShip) {
        setSelectedShip(updatedShip);
        onShipSelect?.(updatedShip);
      }
    }
  }, [currentRoom?.ships, selectedShip, onShipSelect]);

  if (!currentRoom || !currentRoom.ships || !currentRoom.debris) return null;

  const { gridSize, ships, debris } = currentRoom;

  const getShipAtPosition = (pos: Position): Ship | undefined => {
    return ships?.find(
      (ship) => ship.position.x === pos.x && ship.position.y === pos.y
    );
  };

  const getShipImage = (type: ShipType) => {
    switch (type) {
      case "fighter":
        return fighterSvg;
      case "cruiser":
        return cruiserSvg;
      case "destroyer":
        return destroyerSvg;
      case "scout":
        return scoutSvg;
      default:
        return fighterSvg;
    }
  };

  const getDebrisAtPosition = (pos: Position): Debris | undefined => {
    return debris?.find(
      (d) => d.position.x === pos.x && d.position.y === pos.y
    );
  };

  const handleCellClick = (position: Position) => {
    const shipAtPosition = getShipAtPosition(position);

    if (selectedAction) {
      onCellClick(position);
      return;
    }

    if (shipAtPosition && shipAtPosition.health > 0) {
      setSelectedShip(shipAtPosition);
      onShipSelect?.(shipAtPosition);
      return;
    }

    onCellClick(position);
  };

  return (
    <Box
      w="100%"
      maxW={["100%", "100%", "600px"]}
      aspectRatio="1"
      border="2px"
      borderColor="gray.200"
      p={[1, 2]}
    >
      <Grid
        templateColumns={`repeat(${gridSize.width}, 1fr)`}
        templateRows={`repeat(${gridSize.height}, 1fr)`}
        gap={[0.5, 1]}
        h="100%"
      >
        {Array.from({ length: gridSize.height }).map((_, y) =>
          Array.from({ length: gridSize.width }).map((_, x) => {
            const position = { x, y };
            const ship = getShipAtPosition(position);
            const debris = getDebrisAtPosition(position);
            const isSelected = selectedShip?.id === ship?.id;

            return (
              <GridItem
                key={`${x}-${y}`}
                bg={isSelected ? "blue.200" : "gray.100"}
                border="1px"
                borderColor={
                  selectedShip &&
                  Math.max(
                    Math.abs(x - selectedShip.position.x),
                    Math.abs(y - selectedShip.position.y)
                  ) <= selectedShip.reach
                    ? selectedShip.playerId === currentPlayer?.id
                      ? "green.500"
                      : "red.500"
                    : "gray.300"
                }
                borderWidth={
                  selectedShip &&
                  Math.max(
                    Math.abs(x - selectedShip.position.x),
                    Math.abs(y - selectedShip.position.y)
                  ) <= selectedShip.reach
                    ? "2px"
                    : "1px"
                }
                cursor="pointer"
                display="flex"
                alignItems="center"
                justifyContent="center"
                onClick={() => handleCellClick(position)}
                position="relative"
                _hover={{ bg: "gray.200" }}
              >
                {ship && (
                  <Tooltip
                    label={
                      ship.health <= 0
                        ? "Nave Destruída"
                        : getShipInfo(ship) ?? "Nave"
                    }
                    hasArrow
                    placement="top"
                    bg="gray.700"
                    color="white"
                    p={2}
                    borderRadius="md"
                  >
                    <Box
                      as="img"
                      src={
                        ship.health <= 0
                          ? destroyedSvg
                          : getShipImage(ship.type)
                      }
                      alt={ship.health <= 0 ? "destroyed" : ship.type}
                      w="90%"
                      h="90%"
                      opacity={
                        ship.health <= 0 ? 0.7 : ship.actionPoints > 0 ? 1 : 0.5
                      }
                      transform={ship.health <= 0 ? "rotate(15deg)" : undefined}
                    />
                  </Tooltip>
                )}
                {debris && (
                  <Box
                    as="img"
                    src={
                      debris.type === "asteroid" ? asteroidSvg : satelliteSvg
                    }
                    alt={debris.type}
                    w="90%"
                    h="90%"
                    opacity={0.8}
                  />
                )}
              </GridItem>
            );
          })
        )}
      </Grid>
    </Box>
  );
};