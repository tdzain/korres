'use client'
import { useEffect, type RefObject } from 'react'

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

/** Prende o foco no contêiner, fecha com Esc, trava a rolagem do body e devolve o foco ao elemento anterior. */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean, onClose?: () => void) {
  useEffect(() => {
    if (!active) return
    const el = ref.current
    const previous = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const first = el?.querySelector<HTMLElement>('[data-autofocus]') ?? el?.querySelector<HTMLElement>(FOCUSABLE)
    first?.focus({ preventScroll: true })

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose?.(); return }
      if (e.key !== 'Tab' || !el) return
      const nodes = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null)
      if (!nodes.length) return
      const a = nodes[0]!, b = nodes[nodes.length - 1]!
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus() }
      else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      previous?.focus?.({ preventScroll: true })
    }
  }, [active, ref, onClose])
}
