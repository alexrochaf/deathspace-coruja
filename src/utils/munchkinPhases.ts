// Utilitário para mapear fases do Munchkin

export type MunchkinPhaseName = 'door' | 'trouble' | 'treasure' | 'charity';

/**
 * Mapeia o número da fase (turnPhase) para o nome da fase
 * @param turnPhase - Número da fase (1-4)
 * @returns Nome da fase correspondente
 */
export function getTurnPhaseName(turnPhase: number): MunchkinPhaseName {
  switch (turnPhase) {
    case 1:
      return 'door';
    case 2:
      return 'trouble';
    case 3:
      return 'treasure';
    case 4:
      return 'charity';
    default:
      return 'door'; // Fallback para fase inicial
  }
}

/**
 * Verifica se uma fase específica está ativa
 * @param currentPhase - Fase atual (número)
 * @param targetPhase - Fase alvo (nome)
 * @returns true se a fase alvo está ativa
 */
export function isPhaseActive(currentPhase: number, targetPhase: MunchkinPhaseName): boolean {
  return getTurnPhaseName(currentPhase) === targetPhase;
}

/**
 * Retorna a descrição da fase atual
 * @param turnPhase - Número da fase (1-4)
 * @returns Descrição da fase
 */
export function getPhaseDescription(turnPhase: number): string {
  switch (turnPhase) {
    case 1:
      return 'Chutar a Porta';
    case 2:
      return 'Procurar Encrenca';
    case 3:
      return 'Saquear';
    case 4:
      return 'Caridade';
    default:
      return 'Fase Desconhecida';
  }
}

/**
 * Constantes das fases do Munchkin
 */
export const MUNCHKIN_PHASES = {
  DOOR: 1,
  TROUBLE: 2,
  TREASURE: 3,
  CHARITY: 4
} as const;