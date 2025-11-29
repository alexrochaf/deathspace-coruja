# Plano de Revisão e Correção do Jogo Munchkin

## 1. Diagnóstico do Problema Atual

### 1.1 Problema Identificado
- **Erro**: "Jogador não encontrado" ao tentar iniciar partida
- **Impacto**: Impossibilita o início do jogo
- **Prioridade**: CRÍTICA

### 1.2 Áreas de Investigação
1. **GameManager.ts** - Verificar inicialização dos engines
2. **MunchkinEngine.ts** - Validar método `startGame` e `getPlayerState`
3. **Room.tsx** - Verificar fluxo do botão "Iniciar Partida"
4. **Supabase** - Validar estrutura de dados de jogadores

## 2. Checklist de Verificação das Regras do Jogo

### 2.1 Mecânicas Básicas
- [ ] Sistema de níveis (1-10)
- [ ] Sistema de força de combate
- [ ] Condição de vitória (nível 10)
- [ ] Turnos sequenciais entre jogadores

### 2.2 Sistema de Cartas
- [ ] Baralho de Porta (Door deck)
- [ ] Baralho de Tesouro (Treasure deck)
- [ ] Distribuição inicial de cartas
- [ ] Limite de cartas na mão
- [ ] Descarte obrigatório no final do turno

### 2.3 Fases do Turno
- [ ] **Fase 1**: Chutar a Porta (Kick Door)
- [ ] **Fase 2**: Procurar Encrenca (Look for Trouble) - opcional
- [ ] **Fase 3**: Saquear a Sala (Loot the Room) - se não houve combate
- [ ] **Fase 4**: Caridade (Charity) - descartar cartas extras

### 2.4 Sistema de Combate
- [ ] Cálculo de força do jogador (nível + bônus de equipamentos)
- [ ] Cálculo de força do monstro
- [ ] Sistema de ajuda entre jogadores
- [ ] Sistema de interferência (prejudicar outros jogadores)
- [ ] Fuga de combate
- [ ] Recompensas por vitória (níveis e tesouros)
- [ ] Penalidades por derrota (Bad Stuff)

### 2.5 Sistema de Equipamentos
- [ ] Equipar/desequipar itens
- [ ] Limitações de equipamentos (1 armadura, 1 capacete, etc.)
- [ ] Bônus de combate dos equipamentos
- [ ] Restrições de classe/raça

### 2.6 Classes e Raças
- [ ] Sistema de classes (Guerreiro, Mago, Clérigo, Ladrão)
- [ ] Sistema de raças (Humano, Elfo, Anão, Halfling)
- [ ] Habilidades especiais de cada classe/raça
- [ ] Cartas específicas para classes/raças

## 3. Validação de Funções e Ações

### 3.1 Ações Principais
- [ ] `KICK_DOOR` - Chutar a porta
- [ ] `START_GAME` - Iniciar jogo
- [ ] `END_TURN` - Finalizar turno
- [ ] `PLAY_CARD` - Jogar carta
- [ ] `HELP_COMBAT` - Ajudar em combate
- [ ] `ESCAPE_COMBAT` - Fugir do combate
- [ ] `EQUIP_ITEM` - Equipar item
- [ ] `UNEQUIP_ITEM` - Desequipar item

### 3.2 Validações de Ações
- [ ] Verificar se é o turno do jogador
- [ ] Validar estado do jogo para cada ação
- [ ] Verificar pré-requisitos específicos
- [ ] Validar dados da ação

### 3.3 Execução de Ações
- [ ] Atualização correta do estado do jogo
- [ ] Notificação de outros jogadores
- [ ] Logs de ações para auditoria
- [ ] Tratamento de erros

## 4. Roteiro de Testes

### 4.1 Testes de Inicialização
1. **Criar Sala**
   - [ ] Verificar criação da sala no Supabase
   - [ ] Validar inicialização do MunchkinEngine
   - [ ] Confirmar estado inicial do jogo

2. **Entrar na Sala**
   - [ ] Adicionar jogadores à sala
   - [ ] Verificar sincronização em tempo real
   - [ ] Validar limite de jogadores (2-6)

3. **Iniciar Partida**
   - [ ] Testar botão "Iniciar Partida"
   - [ ] Verificar distribuição inicial de cartas
   - [ ] Confirmar definição do primeiro jogador

### 4.2 Testes de Gameplay
1. **Turno Básico**
   - [ ] Chutar a porta
   - [ ] Enfrentar monstro ou pegar tesouro
   - [ ] Finalizar turno

2. **Combate**
   - [ ] Combate solo (vitória/derrota)
   - [ ] Combate com ajuda
   - [ ] Combate com interferência
   - [ ] Fuga de combate

3. **Equipamentos**
   - [ ] Equipar/desequipar itens
   - [ ] Verificar bônus de combate
   - [ ] Testar limitações de equipamento

4. **Condição de Vitória**
   - [ ] Alcançar nível 10
   - [ ] Verificar fim de jogo
   - [ ] Declarar vencedor

### 4.3 Testes de Edge Cases
- [ ] Jogador desconecta durante o jogo
- [ ] Ações simultâneas de múltiplos jogadores
- [ ] Cartas com efeitos especiais
- [ ] Combinações complexas de equipamentos

## 5. Cronograma de Implementação

### Fase 1: Correção Crítica (Prioridade ALTA)
**Tempo estimado: 2-3 horas**

1. **Diagnóstico do Erro "Jogador não encontrado"** (30 min)
   - Analisar GameManager.ts
   - Verificar MunchkinEngine.startGame()
   - Revisar fluxo de inicialização

2. **Correção do Problema de Inicialização** (1-2 horas)
   - Corrigir validação de jogadores
   - Ajustar inicialização do engine
   - Testar botão "Iniciar Partida"

3. **Testes de Inicialização** (30 min)
   - Criar sala de teste
   - Adicionar jogadores
   - Iniciar partida com sucesso

### Fase 2: Validação das Regras (Prioridade MÉDIA)
**Tempo estimado: 4-6 horas**

1. **Revisão das Mecânicas Básicas** (2 horas)
   - Verificar sistema de níveis
   - Validar cálculos de combate
   - Testar condição de vitória

2. **Validação do Sistema de Cartas** (2 horas)
   - Verificar distribuição de cartas
   - Testar limite de cartas na mão
   - Validar descarte obrigatório

3. **Testes de Combate** (2 horas)
   - Testar todos os cenários de combate
   - Verificar sistema de ajuda/interferência
   - Validar recompensas e penalidades

### Fase 3: Refinamento e Otimização (Prioridade BAIXA)
**Tempo estimado: 2-4 horas**

1. **Melhorias na Interface** (1-2 horas)
   - Feedback visual para ações
   - Animações de cartas
   - Indicadores de estado

2. **Otimização de Performance** (1 hora)
   - Reduzir chamadas desnecessárias ao Supabase
   - Otimizar renderização de componentes
   - Implementar cache local quando apropriado

3. **Testes Finais** (1 hora)
   - Partida completa de teste
   - Verificação de todos os cenários
   - Validação final da experiência do usuário

## 6. Critérios de Aceitação

### 6.1 Funcionalidade Mínima
- [ ] Criar sala e adicionar jogadores (2-6)
- [ ] Iniciar partida sem erros
- [ ] Executar turnos básicos (chutar porta, combate, finalizar turno)
- [ ] Sistema de equipamentos funcionando
- [ ] Condição de vitória implementada

### 6.2 Qualidade
- [ ] Zero erros críticos
- [ ] Interface responsiva e intuitiva
- [ ] Sincronização em tempo real funcionando
- [ ] Logs adequados para debugging

### 6.3 Performance
- [ ] Tempo de resposta < 2 segundos para ações
- [ ] Sincronização em tempo real < 1 segundo
- [ ] Suporte para até 6 jogadores simultâneos

## 7. Próximos Passos

1. **IMEDIATO**: Executar Fase 1 - Correção do erro crítico
2. **CURTO PRAZO**: Executar Fase 2 - Validação completa das regras
3. **MÉDIO PRAZO**: Executar Fase 3 - Refinamentos e otimizações
4. **LONGO PRAZO**: Implementar funcionalidades avançadas (expansões, torneios, etc.)

---

**Status**: Plano criado - Aguardando execução
**Última atualização**: Janeiro 2025
**Responsável**: Equipe de Desenvolvimento