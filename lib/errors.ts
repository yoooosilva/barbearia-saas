// ══════════════════════════════════════════
// lib/errors.ts
// ══════════════════════════════════════════

export class AppError extends Error {
  constructor(public code: string, message: string, public details?: unknown) {
    super(message)
    this.name = 'AppError'
  }
}

export const ERROR_MESSAGES: Record<string, string> = {
  SALON_NOT_FOUND: 'Salão não encontrado ou desativado',
  SERVICE_NOT_FOUND: 'Serviço não encontrado',
  STAFF_NOT_FOUND: 'Profissional não encontrado',
  APPOINTMENT_NOT_FOUND: 'Agendamento não encontrado',
  APPOINTMENT_OVERLAP: 'Horário já ocupado. Escolha outro.',
  BOOKING_FAILED: 'Erro ao marcar. Tente novamente.',
  INVALID_INPUT: 'Dados inválidos. Verifique os campos.',
  NETWORK_ERROR: 'Sem conexão. Tente novamente.',
  QUOTA_EXCEEDED: 'Limite de emails/dia atingido. Upgrade para Pro.',
  UNAUTHORIZED: 'Não tem permissão para esta ação',
  SERVER_ERROR: 'Erro do servidor. Tente novamente.',
}

export function getUserMessage(error: unknown): string {
  if (error instanceof AppError) {
    return ERROR_MESSAGES[error.code] || error.message
  }
  if (error instanceof Error) {
    return ERROR_MESSAGES[error.message] || 'Algo correu mal. Tente novamente.'
  }
  return 'Erro desconhecido'
}
