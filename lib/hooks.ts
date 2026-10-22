'use client'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { useDemo } from '@/lib/store/ui'

const noop = () => () => {}
/** false no servidor e na primeira pintura do cliente; true depois. */
export const useHydrated = () => useSyncExternalStore(noop, () => true, () => false)

/** Relógio que respeita a hora simulada do modo demo. Só existe no cliente (undefined antes de montar). */
export function useNow(intervalMs = 1000): number | undefined {
  const hour = useDemo((s) => s.simulatedHour)
  const [tick, setTick] = useState<number | undefined>(undefined)
  useEffect(() => {
    setTick(Date.now())
    const id = setInterval(() => setTick(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  if (tick === undefined) return undefined
  if (hour === null) return tick
  // Mantém o dia real, mas fixa a hora (BRT) e deixa os segundos correrem.
  const brt = new Date(tick - 3 * 3600_000)
  brt.setUTCHours(hour, brt.getUTCMinutes(), brt.getUTCSeconds(), 0)
  return brt.getTime() + 3 * 3600_000
}

export function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(false)
  useEffect(() => {
    const m = window.matchMedia(query)
    const on = () => setMatch(m.matches)
    on()
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [query])
  return match
}

export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
