// Dados das cartas do Munchkin - Baralho Básico

import type { Card, CardTemplate } from '../types/munchkin';

// Monstros do Baralho de Porta
export const DOOR_MONSTERS: CardTemplate[] = [
  {
    name: "Lesma Gigante",
    type: "door",
    subtype: "monster",
    level: 1,
    description: "Uma lesma... mas gigante!",
    flavorText: "Deixa um rastro pegajoso por onde passa.",
    effects: [
      {
        type: "combat_bonus",
        description: "Nível 1",
        target: "self"
      }
    ],
    quantity: 2
  },
  {
    name: "Goblin Fedorento",
    type: "door",
    subtype: "monster",
    level: 1,
    description: "Um goblin que precisa de um banho.",
    flavorText: "O cheiro é pior que a mordida.",
    effects: [
      {
        type: "combat_bonus",
        description: "Nível 1",
        target: "self"
      }
    ],
    quantity: 2
  },
  {
    name: "Orc Guerreiro",
    type: "door",
    subtype: "monster",
    level: 2,
    description: "Um orc com uma grande clava.",
    flavorText: "Ele não é muito inteligente, mas é forte.",
    effects: [
      {
        type: "combat_bonus",
        description: "Nível 2",
        target: "self"
      }
    ],
    quantity: 2
  },
  {
    name: "Esqueleto",
    type: "door",
    subtype: "monster",
    level: 2,
    description: "Ossos que andam sozinhos.",
    flavorText: "Pelo menos não tem mau hálito.",
    effects: [
      {
        type: "combat_bonus",
        description: "Nível 2",
        target: "self"
      }
    ],
    quantity: 2
  },
  {
    name: "Troll das Pontes",
    type: "door",
    subtype: "monster",
    level: 8,
    description: "Um troll que cobra pedágio.",
    flavorText: "Você não vai passar!",
    effects: [
      {
        type: "combat_bonus",
        description: "Nível 8",
        target: "self"
      }
    ],
    quantity: 1
  },
  {
    name: "Dragão Antigo",
    type: "door",
    subtype: "monster",
    level: 16,
    description: "Um dragão muito, muito velho.",
    flavorText: "Ele já viu de tudo nesta vida.",
    effects: [
      {
        type: "combat_bonus",
        description: "Nível 16",
        target: "self"
      }
    ],
    quantity: 1
  }
];

// Classes do Baralho de Porta
export const DOOR_CLASSES: CardTemplate[] = [
  {
    name: "Guerreiro",
    type: "door",
    subtype: "class",
    bonus: 3,
    description: "Especialista em combate corpo a corpo.",
    flavorText: "Músculos resolvem a maioria dos problemas.",
    effects: [
      {
        type: "combat_bonus",
        value: 3,
        description: "+3 em combate",
        target: "self"
      },
      {
        type: "special_ability",
        description: "Pode usar armas grandes",
        target: "self"
      }
    ],
    quantity: 3
  },
  {
    name: "Mago",
    type: "door",
    subtype: "class",
    description: "Mestre das artes arcanas.",
    flavorText: "Conhecimento é poder, literalmente.",
    effects: [
      {
        type: "special_ability",
        description: "Pode descartar cartas para bônus",
        target: "self"
      }
    ],
    quantity: 3
  },
  {
    name: "Ladino",
    type: "door",
    subtype: "class",
    description: "Especialista em furtividade e trapaça.",
    flavorText: "Se não conseguir na força, use a astúcia.",
    effects: [
      {
        type: "special_ability",
        description: "Pode fugir automaticamente",
        target: "self"
      },
      {
        type: "special_ability",
        description: "Backstab: +2 se outro jogador estiver no combate",
        target: "self"
      }
    ],
    quantity: 3
  },
  {
    name: "Clérigo",
    type: "door",
    subtype: "class",
    description: "Servo dos deuses.",
    flavorText: "A fé move montanhas... e mata mortos-vivos.",
    effects: [
      {
        type: "combat_bonus",
        value: 3,
        condition: "vs mortos-vivos",
        description: "+3 contra mortos-vivos",
        target: "self"
      },
      {
        type: "special_ability",
        description: "Pode ressuscitar jogadores",
        target: "other_players"
      }
    ],
    quantity: 3
  }
];

// Raças do Baralho de Porta
export const DOOR_RACES: CardTemplate[] = [
  {
    name: "Humano",
    type: "door",
    subtype: "race",
    description: "A raça mais comum e versátil.",
    flavorText: "Não tem habilidades especiais, mas pode ter uma classe extra.",
    effects: [
      {
        type: "special_ability",
        description: "Pode ter uma classe extra",
        target: "self"
      }
    ],
    quantity: 3
  },
  {
    name: "Elfo",
    type: "door",
    subtype: "race",
    description: "Seres mágicos e ágeis.",
    flavorText: "Bonitos, inteligentes e irritantemente superiores.",
    effects: [
      {
        type: "level_bonus",
        value: 1,
        description: "+1 nível contra monstros",
        target: "self"
      },
      {
        type: "special_ability",
        description: "Foge automaticamente em caso de empate",
        target: "self"
      }
    ],
    quantity: 3
  },
  {
    name: "Anão",
    type: "door",
    subtype: "race",
    description: "Pequenos mas resistentes.",
    flavorText: "Compensam a altura com atitude.",
    effects: [
      {
        type: "combat_bonus",
        value: 2,
        description: "+2 em combate",
        target: "self"
      },
      {
        type: "special_ability",
        description: "Pode carregar itens extras",
        target: "self"
      }
    ],
    quantity: 3
  },
  {
    name: "Halfling",
    type: "door",
    subtype: "race",
    description: "Pequenos e sortudos.",
    flavorText: "A sorte dos pequenos é real.",
    effects: [
      {
        type: "special_ability",
        description: "Pode vender itens por mais ouro",
        target: "self"
      },
      {
        type: "special_ability",
        description: "Sorte extra em dados",
        target: "self"
      }
    ],
    quantity: 3
  }
];

// Maldições do Baralho de Porta
export const DOOR_CURSES: CardTemplate[] = [
  {
    name: "Perder Armadura",
    type: "door",
    subtype: "curse",
    description: "Sua armadura se desfaz.",
    flavorText: "Isso é o que acontece quando você compra no camelô.",
    effects: [
      {
        type: "curse",
        description: "Perde a armadura equipada",
        target: "self"
      }
    ],
    quantity: 2
  },
  {
    name: "Perder Nível",
    type: "door",
    subtype: "curse",
    description: "Você esquece algumas coisas.",
    flavorText: "Amnésia seletiva é terrível.",
    effects: [
      {
        type: "curse",
        description: "Perde 1 nível",
        target: "self"
      }
    ],
    quantity: 2
  }
];

// Equipamentos do Baralho de Tesouro
export const TREASURE_EQUIPMENT: CardTemplate[] = [
  {
    name: "Espada Curta",
    type: "treasure",
    subtype: "equipment",
    bonus: 1,
    goldValue: 200,
    description: "Uma espada básica mas confiável.",
    flavorText: "Pequena, mas afiada.",
    effects: [
      {
        type: "combat_bonus",
        value: 1,
        description: "+1 em combate",
        target: "self"
      }
    ],
    requirements: [
      {
        type: "class",
        value: "Guerreiro",
        operator: "equals"
      }
    ],
    quantity: 3
  },
  {
    name: "Armadura de Couro",
    type: "treasure",
    subtype: "equipment",
    bonus: 1,
    goldValue: 200,
    description: "Proteção básica contra ataques.",
    flavorText: "Melhor que nada.",
    effects: [
      {
        type: "combat_bonus",
        value: 1,
        description: "+1 em combate",
        target: "self"
      }
    ],
    quantity: 3
  },
  {
    name: "Botas de Corrida",
    type: "treasure",
    subtype: "equipment",
    goldValue: 400,
    description: "Para quando você precisa sair correndo.",
    flavorText: "A covardia às vezes é a melhor estratégia.",
    effects: [
      {
        type: "special_ability",
        value: 2,
        description: "+2 para fugir",
        target: "self"
      }
    ],
    quantity: 2
  },
  {
    name: "Escudo Pequeno",
    type: "treasure",
    subtype: "equipment",
    bonus: 1,
    goldValue: 200,
    description: "Proteção adicional para uma mão.",
    flavorText: "Pequeno mas útil.",
    effects: [
      {
        type: "combat_bonus",
        value: 1,
        description: "+1 em combate",
        target: "self"
      }
    ],
    quantity: 2
  }
];

// Itens especiais do Baralho de Tesouro
export const TREASURE_ITEMS: CardTemplate[] = [
  {
    name: "Poção de Cura",
    type: "treasure",
    subtype: "item",
    goldValue: 100,
    description: "Restaura sua saúde.",
    flavorText: "Gosto de xarope, mas funciona.",
    effects: [
      {
        type: "special_ability",
        description: "Remove efeitos de maldição",
        target: "self"
      }
    ],
    quantity: 3
  },
  {
    name: "Vai Embora",
    type: "treasure",
    subtype: "bonus",
    goldValue: 300,
    description: "Faz um monstro ir embora sem combate.",
    flavorText: "Às vezes a diplomacia funciona.",
    effects: [
      {
        type: "one_shot",
        description: "Remove monstro do combate",
        target: "monster"
      }
    ],
    quantity: 2
  },
  {
    name: "Poção de Força",
    type: "treasure",
    subtype: "bonus",
    goldValue: 400,
    description: "Aumenta temporariamente sua força.",
    flavorText: "Efeitos colaterais incluem músculos exagerados.",
    effects: [
      {
        type: "combat_bonus",
        value: 3,
        description: "+3 em combate (temporário)",
        target: "self"
      }
    ],
    quantity: 2
  }
];

// Função para gerar o baralho completo
export function generateDeck(): { doorCards: Card[], treasureCards: Card[] } {
  const doorCards: Card[] = [];
  const treasureCards: Card[] = [];

  // Gerar cartas de Porta
  const allDoorTemplates = [
    ...DOOR_MONSTERS,
    ...DOOR_CLASSES,
    ...DOOR_RACES,
    ...DOOR_CURSES
  ];

  allDoorTemplates.forEach((template, templateIndex) => {
    for (let i = 0; i < template.quantity; i++) {
      const card: Card = {
        id: `door_${templateIndex}_${i}`,
        name: template.name,
        type: template.type,
        subtype: template.subtype,
        level: template.level,
        bonus: template.bonus,
        goldValue: template.goldValue,
        description: template.description,
        flavorText: template.flavorText,
        imageUrl: `/images/cards/${template.name.toLowerCase().replace(/\s+/g, '_')}.jpg`,
        effects: template.effects,
        requirements: template.requirements
      };
      doorCards.push(card);
    }
  });

  // Gerar cartas de Tesouro
  const allTreasureTemplates = [
    ...TREASURE_EQUIPMENT,
    ...TREASURE_ITEMS
  ];

  allTreasureTemplates.forEach((template, templateIndex) => {
    for (let i = 0; i < template.quantity; i++) {
      const card: Card = {
        id: `treasure_${templateIndex}_${i}`,
        name: template.name,
        type: template.type,
        subtype: template.subtype,
        level: template.level,
        bonus: template.bonus,
        goldValue: template.goldValue,
        description: template.description,
        flavorText: template.flavorText,
        imageUrl: `/images/cards/${template.name.toLowerCase().replace(/\s+/g, '_')}.jpg`,
        effects: template.effects,
        requirements: template.requirements
      };
      treasureCards.push(card);
    }
  });

  return { doorCards, treasureCards };
}

// Função para embaralhar cartas
export function shuffleDeck(cards: Card[]): Card[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Função para distribuir mão inicial
export function dealInitialHand(): { doorHand: Card[], treasureHand: Card[] } {
  const { doorCards, treasureCards } = generateDeck();
  const shuffledDoor = shuffleDeck(doorCards);
  const shuffledTreasure = shuffleDeck(treasureCards);

  return {
    doorHand: shuffledDoor.slice(0, 4),
    treasureHand: shuffledTreasure.slice(0, 4)
  };
}