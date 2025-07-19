# Changelog

## [0.1.0-alpha.2] - 2024-08-01

### Fixed
- A lógica de distribuição de pontos de ação foi corrigida para calcular e distribuir PAs para cada período de 24 horas decorrido, evitando distribuições incorretas e logs duplicados.

## [0.1.0-alpha.1] - 2024-08-01

### Added
- **Sistema de Logs Aprimorado:**
  - Quando um jogador destrói uma nave inimiga, o log de ataque agora é registrado como uma ação de "DESTRUIR".
  - Se a nave destruída possuir Pontos de Ação (PA), um novo log de "TRANSFER_AP" é criado, indicando a transferência desses pontos para o atacante e a quantidade transferida.

### Changed
- A lógica de combate na função `performAction` em `GameContext.tsx` foi atualizada para lidar com a destruição de naves e a transferência de pontos de ação.
- O tipo `GameLog` em `game.ts` foi estendido para incluir os novos tipos de ação `DESTROY` e `TRANSFER_AP`, além de campos adicionais para detalhar a transferência.
- O componente `GameLog.tsx` foi modificado para exibir corretamente as novas mensagens de log para as ações de destruição e transferência de pontos.