import { BRT_OFFSET_HOURS, CUTOFF_HOUR } from '@/config/shipping'
import { NATIONAL_HOLIDAYS } from '@/data/holidays'
import { type DateKey, fromDateKey, toDateKey } from '@/lib/format/date'

const HOLIDAYS = new Set(NATIONAL_HOLIDAYS)

export type NowInput = number | string | Date | undefined

/** Date cujos campos UTC representam o relógio de Brasília. */
export function brt(now: NowInput = Date.now()): Date {
  const t = now instanceof Date ? now.getTime() : typeof now === 'string' ? new Date(now).getTime() : now
  return new Date(t + BRT_OFFSET_HOURS * 3600_000)
}

export const todayKey = (now?: NowInput): DateKey => toDateKey(brt(now))

export function isBusinessDay(key: DateKey): boolean {
  const day = fromDateKey(key).getUTCDay()
  return day !== 0 && day !== 6 && !HOLIDAYS.has(key)
}

export function addDays(key: DateKey, n: number): DateKey {
  const d = fromDateKey(key)
  d.setUTCDate(d.getUTCDate() + n)
  return toDateKey(d)
}

/** Soma n dias úteis (o dia de partida é o dia 0). */
export function addBusinessDays(key: DateKey, n: number): DateKey {
  let cur = key
  let left = n
  while (left > 0) {
    cur = addDays(cur, 1)
    if (isBusinessDay(cur)) left--
  }
  return cur
}

export const nextBusinessDay = (key: DateKey): DateKey => addBusinessDays(key, 1)

export interface CutoffInfo {
  /** Verdadeiro se um pedido feito agora ainda entra na expedição de hoje. */
  beforeCutoff: boolean
  /** Milissegundos até o horário de corte (somente antes do corte). */
  msUntilCutoff: number | null
  dispatchDate: DateKey
}

export function cutoffInfo(now?: NowInput): CutoffInfo {
  const local = brt(now)
  const today = toDateKey(local)
  const secondsOfDay = local.getUTCHours() * 3600 + local.getUTCMinutes() * 60 + local.getUTCSeconds() + local.getUTCMilliseconds() / 1000
  const before = isBusinessDay(today) && secondsOfDay < CUTOFF_HOUR * 3600
  return {
    beforeCutoff: before,
    msUntilCutoff: before ? Math.round((CUTOFF_HOUR * 3600 - secondsOfDay) * 1000) : null,
    dispatchDate: before ? today : nextBusinessDay(today),
  }
}
