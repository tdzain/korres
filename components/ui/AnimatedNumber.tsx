'use client'
import { animate } from 'motion/react'
import { useEffect, useRef } from 'react'
import { formatBRL } from '@/lib/format/money'
import { prefersReducedMotion } from '@/lib/hooks'

/** Números rolando: interpola do valor anterior ao novo sem re-renderizar a cada frame. */
export function AnimatedNumber({ value, format = formatBRL, duration = 0.6, className }: { value: number; format?: (n: number) => string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const prev = useRef(value)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion() || prev.current === value) {
      el.textContent = format(value)
      prev.current = value
      return
    }
    const controls = animate(prev.current, value, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => { el.textContent = format(v) } })
    prev.current = value
    return () => controls.stop()
  }, [value, duration, format])

  return <span ref={ref} className={className}>{format(value)}</span>
}
