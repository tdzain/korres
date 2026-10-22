'use client'
import { useEffect, useRef, useState } from 'react'
import { getCommerce } from '@/lib/commerce/provider'
import { cutoffInfo } from '@/lib/shipping/calendar'
import type { ShippingOption } from '@/lib/shipping/quote'
import { useNow } from '@/lib/hooks'
import { useLocation } from '@/lib/store/location'

export type ShippingState = { status: 'idle' | 'loading' | 'ready' | 'error'; options: ShippingOption[]; dispatchDate?: string }

/**
 * Fonte única da cotação para PDP, drawer do carrinho e checkout.
 * Mantém as opções anteriores enquanto recalcula (a UI anima a troca) e recota ao mudar cidade, valor ou dia de expedição.
 */
export function useShipping(subtotal: number, override?: { uf: string; city?: string; cep?: string } | null): ShippingState & { retry: () => void } {
  const location = useLocation((s) => s.location)
  const now = useNow(15_000)
  const nowRef = useRef<number | undefined>(undefined)
  nowRef.current = now
  const [state, setState] = useState<ShippingState>({ status: 'idle', options: [] })
  const [nonce, setNonce] = useState(0)

  const dest = override ?? (location ? { uf: location.uf, city: location.city, cep: location.cep } : null)
  const dispatchDate = now === undefined ? undefined : cutoffInfo(now).dispatchDate
  const key = dest ? `${dest.uf}|${dest.city ?? ''}|${dest.cep ?? ''}` : ''

  useEffect(() => {
    if (!dest || dispatchDate === undefined) return
    let cancelled = false
    setState((s) => ({ ...s, status: 'loading' }))
    getCommerce()
      .quoteShipping({ destination: dest, subtotal, now: nowRef.current })
      .then((options) => { if (!cancelled) setState({ status: 'ready', options, dispatchDate }) })
      .catch(() => { if (!cancelled) setState((s) => ({ ...s, status: 'error' })) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, subtotal, dispatchDate, nonce])

  return { ...state, retry: () => setNonce((n) => n + 1) }
}
