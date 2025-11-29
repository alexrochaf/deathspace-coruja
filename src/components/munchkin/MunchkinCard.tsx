import React, { useState } from 'react';
import type { Card as MunchkinCard } from '../../types/munchkin';
import { Box, Badge, Button, Text, VStack, HStack, Tooltip } from '@chakra-ui/react';
import { 
  Shield, 
  Crown, 
  Zap, 
  Skull,
  Star,
  Package,
  Play,
  Sword,
  Target
} from 'lucide-react';

interface MunchkinCardProps {
  card: MunchkinCard;
  isSelected: boolean;
  onSelect: () => void;
  onAction: (action: string, data?: Record<string, unknown>) => void;
  size?: 'small' | 'medium' | 'large';
  showActions?: boolean;
}

export const MunchkinCard: React.FC<MunchkinCardProps> = ({ 
  card, 
  isSelected, 
  onSelect, 
  onAction,
  size = 'medium',
  showActions = true
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getCardIcon = () => {
    switch (card.type) {
      case 'monster': return <Skull className="w-4 h-4" />;
      case 'class': return <Crown className="w-4 h-4" />;
      case 'race': return <Star className="w-4 h-4" />;
      case 'curse': return <Zap className="w-4 h-4" />;
      case 'equipment': return <Shield className="w-4 h-4" />;
      case 'treasure': return <Package className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  const getCardTheme = () => {
    switch (card.type) {
      case 'monster': 
        return {
          bg: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)',
          border: '#dc2626',
          accent: '#fca5a5',
          shadow: '0 8px 25px rgba(220, 38, 38, 0.4)'
        };
      case 'class': 
        return {
          bg: 'linear-gradient(135deg, #581c87 0%, #7c3aed 50%, #581c87 100%)',
          border: '#8b5cf6',
          accent: '#c4b5fd',
          shadow: '0 8px 25px rgba(139, 92, 246, 0.4)'
        };
      case 'race': 
        return {
          bg: 'linear-gradient(135deg, #14532d 0%, #16a34a 50%, #14532d 100%)',
          border: '#22c55e',
          accent: '#86efac',
          shadow: '0 8px 25px rgba(34, 197, 94, 0.4)'
        };
      case 'curse': 
        return {
          bg: 'linear-gradient(135deg, #374151 0%, #6b7280 50%, #374151 100%)',
          border: '#9ca3af',
          accent: '#d1d5db',
          shadow: '0 8px 25px rgba(156, 163, 175, 0.4)'
        };
      case 'equipment': 
        return {
          bg: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e3a8a 100%)',
          border: '#60a5fa',
          accent: '#bfdbfe',
          shadow: '0 8px 25px rgba(96, 165, 250, 0.4)'
        };
      case 'treasure': 
        return {
          bg: 'linear-gradient(135deg, #92400e 0%, #f59e0b 50%, #92400e 100%)',
          border: '#fbbf24',
          accent: '#fde68a',
          shadow: '0 8px 25px rgba(251, 191, 36, 0.4)'
        };
      default: 
        return {
          bg: 'linear-gradient(135deg, #374151 0%, #6b7280 50%, #374151 100%)',
          border: '#9ca3af',
          accent: '#d1d5db',
          shadow: '0 8px 25px rgba(156, 163, 175, 0.4)'
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { width: '80px', height: '120px', fontSize: 'xs' };
      case 'large':
        return { width: '140px', height: '200px', fontSize: 'sm' };
      default:
        return { width: '100px', height: '150px', fontSize: 'xs' };
    }
  };

  const theme = getCardTheme();
  const sizeConfig = getSizeConfig();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAction('play_card', { cardId: card.id });
  };

  const handleEquip = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAction('equip_item', { itemId: card.id });
  };

  return (
    <Tooltip 
      label={
        <Box p={2} maxW="250px">
          <Text fontWeight="bold" mb={1} color="white">{card.name}</Text>
          <Text fontSize="sm" color="gray.200" mb={2}>{card.description}</Text>
          
          {card.effects.length > 0 && (
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" fontWeight="bold" color="yellow.300">EFEITOS:</Text>
              {card.effects.map((effect, index) => (
                <Text key={index} fontSize="xs" color="gray.200">
                  • {effect.description}
                </Text>
              ))}
            </VStack>
          )}
          
          {card.requirements && (
            <Box mt={2} pt={2} borderTop="1px solid" borderColor="gray.600">
              <Text fontSize="xs" fontWeight="bold" color="orange.300">REQUISITOS:</Text>
              {card.requirements.level && (
                <Text fontSize="xs" color="gray.200">Nível: {card.requirements.level}</Text>
              )}
              {card.requirements.class && (
                <Text fontSize="xs" color="gray.200">Classe: {card.requirements.class}</Text>
              )}
              {card.requirements.race && (
                <Text fontSize="xs" color="gray.200">Raça: {card.requirements.race}</Text>
              )}
            </Box>
          )}
        </Box>
      }
      placement="top"
      hasArrow
      bg="gray.800"
      color="white"
      borderRadius="lg"
      isDisabled={!isHovered}
    >
      <Box
        position="relative"
        w={sizeConfig.width}
        h={sizeConfig.height}
        cursor="pointer"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        transform={
          isHovered 
            ? 'scale(1.1) translateY(-8px) rotateY(5deg)' 
            : isSelected 
            ? 'scale(1.02) translateY(-2px)'
            : 'scale(1)'
        }
        onClick={onSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`card-hover ${card.type === 'treasure' ? 'treasure-card' : ''} ${card.type === 'door' ? 'door-card' : ''}`}
        _hover={{ zIndex: 10 }}
        style={{
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden'
        }}
      >
        {/* Carta principal */}
        <Box
          w="100%"
          h="100%"
          background={theme.bg}
          borderRadius="15px"
          border="3px solid"
          borderColor={isSelected ? '#FFD700' : theme.border}
          boxShadow={
            isHovered
              ? `0 15px 35px rgba(0, 0, 0, 0.4), 0 0 25px ${theme.accent}, inset 0 2px 0 rgba(255, 255, 255, 0.3)`
              : isSelected
              ? `0 8px 20px rgba(255, 215, 0, 0.3), 0 0 15px rgba(255, 215, 0, 0.2)`
              : `0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)`
          }
          position="relative"
          overflow="hidden"
        >
          {/* Cartoon-style decorative border */}
          <Box
            position="absolute"
            top="3px"
            left="3px"
            right="3px"
            bottom="3px"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.4)"
            borderRadius="12px"
            pointerEvents="none"
          />
          
          {/* Padrão de fundo decorativo - mais cartunesco */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            opacity="0.15"
            backgroundImage={`
              radial-gradient(circle at 25% 25%, ${theme.accent} 3px, transparent 3px),
              radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 2px, transparent 2px)
            `}
            backgroundSize="25px 25px, 15px 15px"
            pointerEvents="none"
          />
          
          {/* Card type indicator corner */}
          <Box
            position="absolute"
            top="0"
            left="0"
            w="0"
            h="0"
            borderStyle="solid"
            borderWidth="20px 20px 0 0"
            borderColor={`${theme.accent} transparent transparent transparent`}
          />
          
          {/* Header da carta */}
          <Box p={2} position="relative" zIndex={2}>
            <HStack justify="space-between" align="start">
              <Box 
                p={1}
                borderRadius="full"
                bg="rgba(255, 255, 255, 0.2)"
                backdropFilter="blur(5px)"
                color={theme.accent}
              >
                {getCardIcon()}
              </Box>
              
              {card.bonus && (
                <Badge 
                  bg="linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" 
                  color="#8B4513"
                  fontSize="xs"
                  fontWeight="bold"
                  border="2px solid"
                  borderColor="rgba(255, 255, 255, 0.8)"
                  boxShadow="0 2px 4px rgba(0, 0, 0, 0.3)"
                >
                  +{card.bonus}
                </Badge>
              )}
            </HStack>
          </Box>
          
          {/* Nome da carta */}
          <Box px={2} flex={1} display="flex" alignItems="center" justifyContent="center">
            <Text 
              color="white" 
              fontWeight="bold" 
              fontSize={sizeConfig.fontSize}
              textAlign="center"
              lineHeight="1.1"
              textShadow="2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.5)"
              position="relative"
              zIndex={2}
            >
              {card.name.length > 15 ? `${card.name.substring(0, 15)}...` : card.name}
            </Text>
          </Box>
          
          {/* Footer da carta */}
          <Box p={2} position="relative" zIndex={2}>
            <HStack justify="space-between" align="end">
              <Badge 
                bg="blackAlpha.700" 
                color={theme.accent}
                fontSize="xs"
              >
                {card.type}
              </Badge>
              
              {/* Indicadores especiais */}
              {card.type === 'monster' && card.level && (
                <HStack spacing={1}>
                  <Target size={10} color={theme.accent} />
                  <Text color={theme.accent} fontSize="xs" fontWeight="bold">
                    {card.level}
                  </Text>
                </HStack>
              )}
              
              {card.type === 'equipment' && card.bonus && (
                <HStack spacing={1}>
                  <Sword size={10} color={theme.accent} />
                  <Text color={theme.accent} fontSize="xs" fontWeight="bold">
                    +{card.bonus}
                  </Text>
                </HStack>
              )}
            </HStack>
          </Box>
          
          {/* Indicador de seleção - mais proeminente */}
          {isSelected && (
            <>
              <Box
                position="absolute"
                top="-2px"
                left="-2px"
                right="-2px"
                bottom="-2px"
                border="4px solid"
                borderColor="#FFD700"
                borderRadius="18px"
                pointerEvents="none"
                boxShadow="
                  0 0 20px rgba(255, 215, 0, 0.6),
                  inset 0 0 20px rgba(255, 215, 0, 0.2)
                "
              />
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                fontSize="2xl"
                pointerEvents="none"
                zIndex={3}
              >
                ✨
              </Box>
            </>
          )}
          
          {/* Hover glow effect */}
          {isHovered && (
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              borderRadius="15px"
              pointerEvents="none"
              bg={`radial-gradient(circle, ${theme.accent}20 0%, transparent 70%)`}
            />
          )}
        </Box>
        
        {/* Ações rápidas (aparecem no hover) */}
        {showActions && isHovered && size !== 'small' && (
          <Box
            position="absolute"
            bottom="-40px"
            left="50%"
            transform="translateX(-50%)"
            bg="blackAlpha.900"
            borderRadius="md"
            p={2}
            boxShadow="lg"
            zIndex={20}
          >
            <HStack spacing={1}>
              <Button 
                size="xs" 
                colorScheme="blue"
                leftIcon={<Play size={10} />}
                onClick={handlePlay}
              >
                Jogar
              </Button>
              
              {card.type === 'equipment' && (
                <Button 
                  size="xs" 
                  colorScheme="green"
                  leftIcon={<Shield size={10} />}
                  onClick={handleEquip}
                >
                  Equipar
                </Button>
              )}
            </HStack>
          </Box>
        )}
      </Box>
    </Tooltip>
  );
};