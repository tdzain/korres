const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'] as const
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'] as const

/** Datas do domínio são strings YYYY-MM-DD (calendário de Brasília). */
export type DateKey = string

export const toDateKey = (d: Date): DateKey => d.toISOString().slice(0, 10)
export const fromDateKey = (k: DateKey) => new Date(`${k}T00:00:00Z`)

/** "qua, 28 out" */
export function formatShortDate(key: DateKey): string {
  const d = fromDateKey(key)
  return `${WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`
}

/** "hoje", "amanhã" ou "qua, 28 out". */
export function formatRelativeDate(key: DateKey, todayKey: DateKey): string {
  const diff = Math.round((fromDateKey(key).getTime() - fromDateKey(todayKey).getTime()) / 86400000)
  if (diff === 0) return 'hoje'
  if (diff === 1) return 'amanhã'
  return formatShortDate(key)
}

/** "2 h 14 min" / "14 min 05 s" */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h} h ${String(m).padStart(2, '0')} min`
  return `${m} min ${String(s).padStart(2, '0')} s`
}

export const formatDateTimeBR = (d: Date) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(d)
