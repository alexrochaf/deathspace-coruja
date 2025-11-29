import React from 'react';
import type { MunchkinPlayer } from '../../types/munchkin';
import { Box, HStack, VStack, Text, Badge, Avatar } from '@chakra-ui/react';
import { 
  Crown, 
  Sword, 
  Shield,
  Target,
  Star,
  Package
} from 'lucide-react';

interface MunchkinPlayerPlaqueProps {
  player: MunchkinPlayer;
  isCurrentPlayer: boolean;
  isActivePlayer: boolean;
  isCurrentUserTurn: boolean;
}

export const MunchkinPlayerPlaque: React.FC<MunchkinPlayerPlaqueProps> = ({
  player,
  isCurrentPlayer,
  isActivePlayer,
  // isCurrentUserTurn
}) => {
  const calculatePlayerPower = (player: MunchkinPlayer) => {
    let power = player.level || 0;
    
    // Adicionar bônus de classe e raça
    if (player.class) power += player.class.bonus || 0;
    if (player.race) power += player.race.bonus || 0;
    
    // Adicionar bônus de equipamentos
    if (player.equipment) {
      const equipment = [
        player.equipment.armor,
        player.equipment.helmet,
        player.equipment.footgear,
        ...(player.equipment.hands || []),
        ...(player.equipment.big || [])
      ].filter(Boolean);
      
      equipment.forEach(item => {
        if (item?.bonus) power += item.bonus;
      });
    }
    
    return power;
  };
  
  const getEquipmentCount = (player: MunchkinPlayer) => {
    if (!player?.equipment) return 0;
    
    return [
      player.equipment.armor,
      player.equipment.helmet,
      player.equipment.footgear,
      ...(player.equipment.hands || []),
      ...(player.equipment.big || [])
    ].filter(Boolean).length;
  };
  
  const playerPower = calculatePlayerPower(player);
  const equipmentCount = getEquipmentCount(player);
  const totalCards = (player.hand?.door?.length || 0) + (player.hand?.treasure?.length || 0);
  
  return (
    <Box
      position="relative"
      w="200px"
      h="120px"
      bgImage="url('https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=medieval%20wooden%20plaque%20nameplate%20fantasy%20game%20ornate%20border&image_size=portrait_4_3')"
      bgSize="cover"
      bgPosition="center"
      borderRadius="lg"
      border="3px solid"
      borderColor={
        isActivePlayer ? "yellow.400" : 
        isCurrentPlayer ? "blue.400" : 
        "gray.600"
      }
      boxShadow={
        isActivePlayer ? "0 0 20px rgba(255, 215, 0, 0.6)" :
        isCurrentPlayer ? "0 0 15px rgba(59, 130, 246, 0.5)" :
        "0 4px 6px rgba(0, 0, 0, 0.3)"
      }
      transform={isActivePlayer ? "scale(1.05)" : "scale(1)"}
      transition="all 0.3s ease"
      _hover={{ transform: "scale(1.02)" }}
      className={isActivePlayer ? 'active-player-plaque' : ''}
    >
      {/* Overlay para melhor legibilidade */}
      <Box 
        position="absolute" 
        top={0} 
        left={0} 
        right={0} 
        bottom={0} 
        bg="blackAlpha.700"
        borderRadius="lg"
      />
      
      {/* Indicador de turno ativo */}
      {isActivePlayer && (
        <Box
          position="absolute"
          top="-10px"
          left="50%"
          transform="translateX(-50%)"
          bg="yellow.400"
          color="black"
          px={3}
          py={1}
          borderRadius="full"
          fontSize="xs"
          fontWeight="bold"
          display="flex"
          alignItems="center"
          gap={1}
          animation="pulse 2s infinite"
        >
          <Crown size={12} />
          SEU TURNO
        </Box>
      )}
      
      {/* Conteúdo da placa */}
      <Box position="relative" zIndex={1} p={3} h="100%">
        <VStack spacing={1} h="100%" justify="space-between">
          {/* Header com avatar e nome */}
          <HStack spacing={2} w="100%">
            <Avatar 
              name={player.name}
              size="sm"
              bg={isCurrentPlayer ? "blue.600" : "gray.600"}
              color="white"
            />
            <VStack spacing={0} align="start" flex={1}>
              <Text 
                color="white" 
                fontWeight="bold" 
                fontSize="sm"
                noOfLines={1}
              >
                {player.name}
                {isCurrentPlayer && (
                  <Text as="span" color="blue.300" fontSize="xs" ml={1}>
                    (Você)
                  </Text>
                )}
              </Text>
              
              {/* Nível e força */}
              <HStack spacing={3}>
                <HStack spacing={1}>
                  <Target size={12} color="white" />
                  <Text color="yellow.300" fontSize="xs" fontWeight="bold">
                    Nv.{player.level}
                  </Text>
                </HStack>
                
                <HStack spacing={1}>
                  <Sword size={12} color="white" />
                  <Text color="red.300" fontSize="xs" fontWeight="bold">
                    {playerPower}
                  </Text>
                </HStack>
              </HStack>
            </VStack>
          </HStack>
          
          {/* Stats inferiores */}
          <HStack spacing={4} w="100%" justify="space-between">
            {/* Classe e Raça */}
            <VStack spacing={0} align="start">
              <Text color="gray.300" fontSize="xs">
                {player.class?.name || 'Sem Classe'}
              </Text>
              <Text color="gray.300" fontSize="xs">
                {player.race?.name || 'Humano'}
              </Text>
            </VStack>
            
            {/* Equipamentos e cartas */}
            <VStack spacing={0} align="end">
              <HStack spacing={1}>
                <Shield size={10} color="gray.400" />
                <Text color="gray.300" fontSize="xs">
                  {equipmentCount}
                </Text>
              </HStack>
              
              <HStack spacing={1}>
                <Package size={10} color="gray.400" />
                <Text color="gray.300" fontSize="xs">
                  {totalCards}
                </Text>
              </HStack>
            </VStack>
          </HStack>
          
          {/* Indicador de vitória */}
          {player.level >= 10 && (
            <Badge 
              colorScheme="yellow" 
              size="sm"
              position="absolute"
              top="2px"
              right="2px"
              fontSize="xs"
            >
              <Star size={8} className="mr-1" />
              PODE VENCER!
            </Badge>
          )}
        </VStack>
      </Box>
    </Box>
  );
};