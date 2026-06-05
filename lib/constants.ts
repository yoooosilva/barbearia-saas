// ══════════════════════════════════════════
// lib/constants.ts — Constantes e helpers partilhados
// ══════════════════════════════════════════

export const CUR = '€'

export const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]

export const WEEKDAYS_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
export const WEEKDAYS_FULL = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']

export const STAFF_COLORS = [
  '#D4A853','#6B9FE8','#E07B52','#5CB87A',
  '#C76BE8','#E8A86B','#52C4E0','#E05288'
]

export const THEME = {
  bg: '#0A090D',
  surface: '#131219',
  border: '#2D2C3A',
  accent: '#D4A853',
  text: '#EDE9E0',
  muted: '#8D8899',
  dim: '#5C5768',
  success: '#5CB87A',
  error: '#E05252',
  warning: '#E0A830',
  info: '#6B9FE8',
}

export const STATUS_COLORS: Record<string, string> = {
  pendente: THEME.info,
  confirmado: THEME.accent,
  concluído: THEME.success,
  cancelado: THEME.error,
  faltou: THEME.warning,
}

export const STATUS_LABELS: Record<string, string> = {
  pendente: 'PENDENTE',
  confirmado: 'CONFIRMADO',
  concluído: 'CONCLUÍDO',
  cancelado: 'CANCELADO',
  faltou: 'FALTOU',
}

export const PLANS = {
  basic: {
    name: 'Básico',
    price: 0,
    label: 'Grátis',
    features: [
      '1 profissional',
      'Marcações ilimitadas',
      '50 emails/dia',
      'Link público de booking',
      'Dashboard (hoje + agenda)',
    ],
  },
  pro: {
    name: 'Pro',
    price: 19,
    label: '€19/mês',
    features: [
      'Profissionais ilimitados',
      'Marcações ilimitadas',
      'Emails ilimitados',
      'WhatsApp notificações',
      'Relatórios PDF',
      'Página personalizada',
      'Suporte prioritário',
    ],
  },
}

// ─── Time helpers ───

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

export function formatDatePT(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
