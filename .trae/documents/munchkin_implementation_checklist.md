# Checklist de Implementação - Jogo Munchkin

## ✅ Status de Implementação

### 🔴 CRÍTICO - Correção Imediata

#### Problema: "Jogador não encontrado" ao iniciar partida
- [ ] **Investigar GameManager.ts**
  - [ ] Verificar método `initializeGame()`
  - [ ] Validar recuperação de jogadores do Supabase
  - [ ] Confirmar se `players` array está populado

- [ ] **Investigar MunchkinEngine.ts**
  - [ ] Verificar método `startGame()`
  - [ ] Validar `this.players.length >= this.minPlayers`
  - [ ] Confirmar inicialização do estado do jogo

- [ ] **Investigar Room.tsx**
  - [ ] Verificar estado `room.players` antes de iniciar
  - [ ] Validar sincronização em tempo real
  - [ ] Confirmar chamada correta para `gameManager.startGame()`

#### Correções Específicas
- [ ] **Adicionar logs de debug detalhados**
  ```typescript
  console.log('🎮 Debug - Iniciando jogo:', {
    roomId,
    playersCount: players?.length,
    gameState: currentState
  });
  ```

- [ ] **Implementar validações robustas**
  ```typescript
  if (!players || players.length === 0) {
    throw new Error('Nenhum jogador encontrado na sala');
  }
  ```

- [ ] **Melhorar tratamento de erros**
  ```typescript
  try {
    await gameManager.startGame(roomId);
  } catch (error) {
    console.error('❌ Erro detalhado:', error);
    setError(`Falha ao iniciar: ${error.message}`);
  }
  ```

### 🟡 IMPORTANTE - Validação das Regras

#### Sistema de Cartas
- [ ] **Baralho de Porta (Door Deck)**
  - [ ] Verificar criação do baralho
  - [ ] Validar cartas de monstro
  - [ ] Confirmar cartas de classe/raça
  - [ ] Testar cartas de maldição

- [ ] **Baralho de Tesouro (Treasure Deck)**
  - [ ] Verificar criação do baralho
  - [ ] Validar equipamentos
  - [ ] Confirmar cartas de ouro
  - [ ] Testar itens especiais

- [ ] **Distribuição de Cartas**
  - [ ] 4 cartas de porta iniciais por jogador
  - [ ] 4 cartas de tesouro iniciais por jogador
  - [ ] Limite de 5 cartas na mão
  - [ ] Descarte obrigatório no final do turno

#### Sistema de Combate
- [ ] **Cálculo de Força**
  - [ ] Força do jogador = nível + bônus de equipamentos
  - [ ] Força do monstro = valor base + modificadores
  - [ ] Bônus de ajuda de outros jogadores
  - [ ] Penalidades de interferência

- [ ] **Mecânicas de Combate**
  - [ ] Vitória: força jogador > força monstro
  - [ ] Derrota: força jogador ≤ força monstro
  - [ ] Fuga: teste de dado ou carta especial
  - [ ] Recompensas: níveis + tesouros
  - [ ] Penalidades: Bad Stuff do monstro

#### Fases do Turno
- [ ] **Fase 1: Chutar a Porta**
  - [ ] Revelar carta do topo do baralho de porta
  - [ ] Se monstro: iniciar combate
  - [ ] Se não monstro: adicionar à mão

- [ ] **Fase 2: Procurar Encrenca (opcional)**
  - [ ] Jogar monstro da mão
  - [ ] Iniciar combate voluntário
  - [ ] Apenas se não houve combate na Fase 1

- [ ] **Fase 3: Saquear a Sala**
  - [ ] Apenas se não houve combate
  - [ ] Pegar carta do baralho de porta
  - [ ] Adicionar à mão (face down)

- [ ] **Fase 4: Caridade**
  - [ ] Descartar cartas extras (limite 5)
  - [ ] Doar para jogador de nível mais baixo
  - [ ] Se empate, escolher quem recebe

### 🟢 DESEJÁVEL - Melhorias e Otimizações

#### Interface do Usuário
- [ ] **Indicadores Visuais**
  - [ ] Turno atual destacado
  - [ ] Fase do turno visível
  - [ ] Contador de cartas na mão
  - [ ] Nível e força de cada jogador

- [ ] **Animações**
  - [ ] Distribuição de cartas
  - [ ] Movimento de cartas entre áreas
  - [ ] Efeitos de combate
  - [ ] Transição entre turnos

- [ ] **Feedback do Usuário**
  - [ ] Confirmação de ações
  - [ ] Mensagens de erro claras
  - [ ] Notificações de eventos
  - [ ] Som/vibração para ações importantes

#### Performance
- [ ] **Otimizações**
  - [ ] Cache local de estado do jogo
  - [ ] Debounce em ações rápidas
  - [ ] Lazy loading de componentes
  - [ ] Compressão de dados do Supabase

## 📋 Checklist de Testes

### Testes de Inicialização
- [ ] **Criar Sala**
  - [ ] Sala criada no Supabase
  - [ ] ID único gerado
  - [ ] Estado inicial correto

- [ ] **Adicionar Jogadores**
  - [ ] Mínimo 2 jogadores
  - [ ] Máximo 6 jogadores
  - [ ] Sincronização em tempo real

- [ ] **Iniciar Partida**
  - [ ] Botão habilitado com 2+ jogadores
  - [ ] Distribuição de cartas
  - [ ] Primeiro jogador definido
  - [ ] Estado do jogo atualizado

### Testes de Gameplay
- [ ] **Turno Básico**
  - [ ] Chutar porta funciona
  - [ ] Combate ou tesouro processado
  - [ ] Finalizar turno passa para próximo jogador

- [ ] **Combate Completo**
  - [ ] Cálculo de força correto
  - [ ] Vitória concede recompensas
  - [ ] Derrota aplica penalidades
  - [ ] Fuga funciona quando possível

- [ ] **Sistema de Equipamentos**
  - [ ] Equipar item aumenta força
  - [ ] Desequipar item diminui força
  - [ ] Limitações respeitadas (1 armadura, etc.)
  - [ ] Restrições de classe/raça funcionam

- [ ] **Condição de Vitória**
  - [ ] Jogador alcança nível 10
  - [ ] Jogo termina automaticamente
  - [ ] Vencedor declarado
  - [ ] Estatísticas finais exibidas

### Testes de Edge Cases
- [ ] **Desconexão de Jogador**
  - [ ] Jogo continua com jogadores restantes
  - [ ] Turno do jogador desconectado é pulado
  - [ ] Reconexão restaura estado

- [ ] **Ações Simultâneas**
  - [ ] Apenas um jogador pode agir por vez
  - [ ] Ações em fila processadas em ordem
  - [ ] Estado consistente mantido

- [ ] **Cartas Especiais**
  - [ ] Efeitos únicos funcionam
  - [ ] Interações complexas resolvidas
  - [ ] Timing de efeitos respeitado

## 🚀 Plano de Execução

### Fase 1: Debugging Crítico (2-3 horas)
1. [ ] **Análise do Erro** (30 min)
   - Reproduzir erro "jogador não encontrado"
   - Identificar ponto exato da falha
   - Documentar cenário de erro

2. [ ] **Implementação da Correção** (1-2 horas)
   - Adicionar logs de debug
   - Corrigir validações
   - Melhorar tratamento de erros

3. [ ] **Teste da Correção** (30 min)
   - Criar sala de teste
   - Adicionar jogadores
   - Iniciar partida com sucesso

### Fase 2: Validação Completa (4-6 horas)
1. [ ] **Testes de Regras** (2-3 horas)
   - Executar checklist de regras
   - Corrigir inconsistências encontradas
   - Validar mecânicas principais

2. [ ] **Testes de Integração** (1-2 horas)
   - Partida completa de teste
   - Todos os cenários de gameplay
   - Verificação de sincronização

3. [ ] **Correções Finais** (1 hora)
   - Ajustes baseados nos testes
   - Otimizações de performance
   - Polimento da interface

### Fase 3: Entrega Final (1-2 horas)
1. [ ] **Teste de Aceitação** (30 min)
   - Partida completa sem erros
   - Todas as funcionalidades operacionais
   - Performance adequada

2. [ ] **Documentação** (30 min)
   - Atualizar README
   - Documentar mudanças
   - Criar guia do usuário

3. [ ] **Deploy** (30 min)
   - Build de produção
   - Deploy no ambiente
   - Verificação final

## ✅ Critérios de Sucesso

### Funcionalidade Mínima
- [x] Criar sala e adicionar jogadores
- [ ] Iniciar partida sem erros
- [ ] Executar turnos básicos
- [ ] Sistema de combate funcionando
- [ ] Equipamentos operacionais
- [ ] Condição de vitória implementada

### Qualidade
- [ ] Zero erros críticos
- [ ] Interface responsiva
- [ ] Sincronização < 1 segundo
- [ ] Logs adequados para debugging

### Performance
- [ ] Ações respondem em < 2 segundos
- [ ] Suporte para 6 jogadores simultâneos
- [ ] Uso eficiente do Supabase

---

**Status Atual**: 🔴 Erro crítico identificado - Iniciando correção
**Próximo Passo**: Executar Fase 1 - Debugging do erro "jogador não encontrado"
**Responsável**: Equipe de Desenvolvimento
**Prazo**: 3 horas para correção crítica