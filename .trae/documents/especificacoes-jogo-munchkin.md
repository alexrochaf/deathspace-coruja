# Especificações do Jogo Munchkin - Plataforma Coruja Games

## 1. Visão Geral do Jogo

O Munchkin é um jogo de cartas competitivo onde jogadores assumem o papel de aventureiros em uma paródia de RPGs clássicos. O objetivo é ser o primeiro a alcançar o nível 10, derrotando monstros, coletando tesouros e sabotando outros jogadores.

O jogo combina estratégia, sorte e muita trapaça amigável, onde a cooperação temporária e a traição são elementos fundamentais da experiência.

## 2. Mecânicas Principais

### 2.1 Objetivo do Jogo

* Ser o primeiro jogador a alcançar o **Nível 10**

* Ganhar níveis derrotando monstros ou através de cartas especiais

* Impedir que outros jogadores vençam através de interferência

### 2.2 Componentes do Jogo

* **Baralho de Porta**: 168 cartas (monstros, classes, raças, maldições, eventos)

* **Baralho de Tesouro**: 168 cartas (equipamentos, itens, bônus, poções)

* **Marcadores de Nível**: Cada jogador começa no nível 1

* **Dados**: Para resolver empates e algumas cartas especiais

### 2.3 Configuração Inicial

* Cada jogador começa no **Nível 1**

* Cada jogador recebe **4 cartas de Porta** e **4 cartas de Tesouro**

* Embaralhar ambos os baralhos separadamente

* Determinar ordem de jogo aleatoriamente

## 3. Estrutura do Turno

### 3.1 Fase 1: Chutar a Porta

* Jogador vira a carta do topo do baralho de Porta

* **Se for Monstro**: Combate obrigatório

* **Se for Maldição**: Aplica efeito imediatamente

* **Se for outro tipo**: Adiciona à mão

### 3.2 Fase 2: Procurar Encrenca (Opcional)

* Se não enfrentou monstro na Fase 1

* Pode jogar monstro da mão para combate

* Ou pegar carta de Porta do baralho

### 3.3 Fase 3: Saquear o Quarto

* Pega cartas de Tesouro conforme recompensa

* Pode jogar cartas de Tesouro

* Pode equipar itens

### 3.4 Fase 4: Caridade

* Máximo de 5 cartas na mão

* Dar cartas excedentes para jogador de menor nível

* Se empate, escolher quem recebe

## 4. Sistema de Combate

### 4.1 Cálculo de Força

**Força do Jogador** = Nível + Bônus de Equipamentos + Bônus de Classe/Raça + Cartas Temporárias

**Força do Monstro** = Nível Base + Modificadores de Cartas

### 4.2 Resolução do Combate

* **Vitória**: Força do Jogador > Força do Monstro

  * Ganha níveis conforme carta do monstro

  * Pega tesouros conforme especificado

* **Derrota**: Força do Jogador ≤ Força do Monstro

  * Sofre "Coisa Ruim" do monstro

  * Pode tentar fugir

### 4.3 Fuga

* Rolar dado: 5 ou 6 = fuga bem-sucedida

* Modificadores de fuga (botas, cartas especiais)

* Se falhar, sofre "Coisa Ruim"

### 4.4 Ajuda e Interferência

* **Ajuda**: Outros jogadores podem ajudar no combate

  * Dividir tesouros (negociação livre)

  * Somar forças contra o monstro

* **Interferência**: Jogar cartas para fortalecer o monstro

  * Apenas contra outros jogadores

  * Não pode interferir em próprio combate

## 5. Tipos de Cartas

### 5.1 Cartas de Porta

#### Monstros

* **Nível**: 1-20

* **Recompensa**: Níveis ganhos (1-2) + Tesouros (1-4)

* **Coisa Ruim**: Penalidade por derrota

* **Especiais**: Alguns têm habilidades únicas

**Exemplos de Monstros**:

* Lesma Gigante (Nível 1) - 1 nível, 1 tesouro

* Orc Fedorento (Nível 2) - 1 nível, 2 tesouros

* Dragão Antigo (Nível 18) - 2 níveis, 4 tesouros

#### Classes

* **Guerreiro**: +3 em combate, pode usar armas grandes

* **Mago**: Pode descartar cartas para bônus, feitiços especiais

* **Ladino**: Pode fugir automaticamente, backstab

* **Clérigo**: Pode ressuscitar, bônus contra mortos-vivos

#### Raças

* **Humano**: Sem habilidade especial, pode ter classe extra

* **Elfo**: +1 nível contra monstros, foge automaticamente

* **Anão**: +2 em combate, pode carregar itens extras

* **Halfling**: Pode vender itens por mais, sorte extra

#### Maldições

* Efeitos negativos imediatos

* Perder níveis, equipamentos, cartas

* Algumas podem ser evitadas com cartas específicas

### 5.2 Cartas de Tesouro

#### Equipamentos

* **Armas**: Bônus de combate, algumas com requisitos

* **Armaduras**: Proteção, bônus defensivos

* **Calçados**: Bônus de fuga, movimento

* **Capacetes**: Proteção da cabeça, bônus especiais

* **Itens de Mão**: Escudos, itens mágicos

#### Itens Únicos

* **Poções**: Efeitos temporários

* **Pergaminhos**: Feitiços de uso único

* **Itens Especiais**: Efeitos únicos e poderosos

#### Cartas de Bônus

* **Vai Embora**: Remove monstro sem combate

* **Poção de Força**: +3 temporário em combate

* **Ressurreição**: Volta à vida após morte

## 6. Regras Especiais

### 6.1 Morte

* Jogador morre se chegar ao Nível 0 ou menos

* Perde todos equipamentos e cartas da mão

* Volta ao Nível 1 no próximo turno

* Pega nova mão inicial

### 6.2 Vitória

* Deve alcançar Nível 10 matando monstro

* Não pode vencer apenas com cartas de bônus

* Outros jogadores podem interferir no combate final

### 6.3 Limites de Equipamentos

* 1 Capacete

* 1 Armadura

* 1 Calçado

* 2 Itens de Mão (ou 1 item de duas mãos)

* Sem limite para itens "Big"

### 6.4 Vendas

* Pode vender itens por 1000 moedas de ouro = 1 nível

* Apenas durante próprio turno

* Não pode vender para alcançar nível 10

## 7. Implementação Digital

### 7.1 Interface do Jogador

#### Área da Mão

* Cartas organizadas por tipo (Porta/Tesouro)

* Filtros por categoria

* Drag & drop para jogar cartas

* Contador de cartas na mão

#### Status do Jogador

* Nível atual (grande e destacado)

* Força total em combate

* Classe e raça ativas

* Equipamentos vestidos

* Modificadores temporários

#### Área de Combate

* Monstro atual (se houver)

* Força do monstro vs força do jogador

* Botões de ação (Ajudar, Interferir, Fugir)

* Cartas jogadas no combate

### 7.2 Mecânicas de Interação

#### Sistema de Turnos

* Indicador visual do jogador ativo

* Timer opcional para turnos

* Botão "Passar Turno"

* Log de ações do turno

#### Negociação

* Sistema de chat para negociar ajuda

* Propostas formais de divisão de tesouro

* Votação para aceitar/rejeitar acordos

#### Interferência

* Janela popup para jogar cartas de interferência

* Timer para decisões rápidas

* Visualização de cartas jogadas por outros

### 7.3 Estados do Jogo

```typescript
interface MunchkinGameState {
  players: MunchkinPlayer[];
  currentPlayer: string;
  turnPhase: 1 | 2 | 3 | 4;
  doorDeck: Card[];
  treasureDeck: Card[];
  doorDiscard: Card[];
  treasureDiscard: Card[];
  currentCombat?: Combat;
  gameStatus: 'waiting' | 'playing' | 'finished';
  winner?: string;
  turnTimer?: number;
}

interface MunchkinPlayer {
  id: string;
  name: string;
  level: number;
  hand: {
    door: Card[];
    treasure: Card[];
  };
  equipment: {
    helmet?: Card;
    armor?: Card;
    footgear?: Card;
    hands: Card[]; // máximo 2 ou 1 de duas mãos
    big: Card[];
  };
  class?: Card;
  race?: Card;
  temporaryBonuses: Bonus[];
  isDead: boolean;
}
```

### 7.4 Validações de Regras

#### Validações de Turno

* Verificar se é o turno do jogador

* Validar fase atual do turno

* Verificar se ação é permitida na fase

#### Validações de Combate

* Calcular forças corretamente

* Verificar se pode ajudar/interferir

* Validar cartas jogadas no combate

#### Validações de Equipamentos

* Verificar limites de equipamentos

* Validar requisitos de classe/raça

* Verificar conflitos entre itens

### 7.5 Sistema de Cartas

#### Estrutura de Dados

```typescript
interface Card {
  id: string;
  name: string;
  type: 'door' | 'treasure';
  subtype: string;
  level?: number;
  bonus?: number;
  goldValue?: number;
  description: string;
  flavorText?: string;
  imageUrl: string;
  effects: CardEffect[];
  requirements?: Requirement[];
}

interface CardEffect {
  type: 'combat_bonus' | 'level_bonus' | 'special_ability';
  value?: number;
  condition?: string;
  description: string;
}
```

#### Baralho Inicial (Exemplos)

**Monstros Básicos**:

* Lesma Gigante (Nível 1)

* Goblin Fedorento (Nível 1)

* Orc Guerreiro (Nível 2)

* Esqueleto (Nível 2)

* Troll (Nível 8)

* Dragão (Nível 16)

**Equipamentos Básicos**:

* Espada Curta (+1)

* Armadura de Couro (+1)

* Botas de Corrida (+2 fuga)

* Escudo Pequeno (+1)

* Poção de Cura

**Classes e Raças**:

* Todas as 4 classes básicas

* Todas as 4 raças básicas

* Cartas "Super Munchkin" e "Meio-sangue"

## 8. Balanceamento e Progressão

### 8.1 Curva de Dificuldade

* Monstros de nível baixo (1-3): 60% do baralho

* Monstros de nível médio (4-8): 30% do baralho

* Monstros de nível alto (9+): 10% do baralho

### 8.2 Economia de Cartas

* Proporção 2:1 entre cartas comuns e raras

* Equipamentos básicos mais frequentes

* Cartas poderosas mais raras

### 8.3 Duração da Partida

* Tempo estimado: 45-90 minutos

* Mecanismos para acelerar final de jogo

* Opção de limite de turnos

## 9. Otimizações para Versão Beta

### 9.1 Gestão de Assets

**Imagens de Cartas:**
* Formato WebP para reduzir tamanho
* Resolução otimizada (máximo 300x400px)
* Lazy loading de cartas não visíveis
* Sprite sheets para cartas similares

**Dados do Jogo:**
* Compressão JSON para estado do jogo
* Cache local de cartas estáticas
* Sincronização incremental de mudanças
* Limpeza automática de partidas antigas (>30 dias)

### 9.2 Performance de Rede

**Otimizações de Bandwidth:**
* Debounce em ações rápidas
* Batch de múltiplas ações
* Compressão de mensagens de chat
* Heartbeat otimizado (30s vs 10s)

**Estratégias de Cache:**
* Cache de regras de cartas no localStorage
* Cache de imagens no browser
* Prefetch de cartas comuns
* Invalidação inteligente de cache

### 9.3 Limitações da Versão Beta

**Funcionalidades Reduzidas:**
* Máximo 6 jogadores por partida (vs 8 ideal)
* Baralho básico (168 cartas vs 336 completo)
* Sem animações complexas
* Chat básico (sem emojis/GIFs)

**Monitoramento de Recursos:**
* Alerta quando storage > 80%
* Limite de 5 partidas simultâneas
* Auto-pause de partidas inativas (>2h)
* Limpeza de logs antigos

## 10. Expansões Futuras

### 10.1 Novos Conteúdos

* Novas classes e raças
* Monstros temáticos
* Equipamentos únicos
* Mecânicas especiais

### 10.2 Modos de Jogo

* Modo Épico (nível 20)
* Modo Rápido (nível 5)
* Modo Cooperativo
* Torneios e rankings

### 10.3 Personalização

* Avatares personalizados
* Backs de cartas especiais
* Efeitos visuais únicos
* Conquistas e títulos

### 10.4 Upgrade para Versão Completa

**Quando migrar para versões pagas:**
* Usuários simultâneos > 20 consistentemente
* Storage > 400MB usado
* Feedback positivo da comunidade
* Necessidade de features avançadas

**Benefícios do upgrade:**
* Domínio personalizado
* Analytics avançados
* Backup automático
* Suporte prioritário
* Funcionalidades premium

