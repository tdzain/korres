import { FREE_SHIPPING_THRESHOLD, INTERIOR_EXTRA_DAYS, ORIGIN, PICKUP, RATES } from '@/config/shipping'
import { findUF, isCapital } from '@/data/brazil'
import type { DateKey } from '@/lib/format/date'
import { roundMoney } from '@/lib/format/money'
import { addBusinessDays, cutoffInfo, type NowInput } from './calendar'

export type ShippingMethodId = 'economica' | 'expressa' | 'retirada'

export interface Destination {
  uf: string
  city?: string
  cep?: string
}

export interface QuoteRequest {
  destination: Destination
  /** Valor dos produtos (define a elegibilidade ao frete grátis). */
  subtotal: number
  now?: NowInput
}

export interface ShippingOption {
  id: ShippingMethodId
  label: string
  description: string
  price: number
  free: boolean
  minDays: number
  maxDays: number
  dispatchDate: DateKey
  earliest: DateKey
  latest: DateKey
}

const LABELS: Record<ShippingMethodId, { label: string; description: string }> = {
  economica: { label: 'Econômica', description: 'Entrega padrão pelos Correios/transportadora' },
  expressa: { label: 'Expressa', description: 'Prioridade na expedição e no transporte' },
  retirada: { label: PICKUP.label, description: PICKUP.address },
}

export const hasFreeShipping = (subtotal: number) => subtotal >= FREE_SHIPPING_THRESHOLD

/** Cotação determinística. Mesma assinatura que um provedor real (Melhor Envio, Correios...) teria. */
export function quoteShipping({ destination, subtotal, now }: QuoteRequest): ShippingOption[] {
  const uf = findUF(destination.uf)
  const dispatch = cutoffInfo(now).dispatchDate
  const table = destination.uf.toUpperCase() === ORIGIN.uf ? RATES.sameState : RATES[uf?.region ?? 'sudeste-sul']
  const interior = !!destination.city && !!uf && !isCapital(destination.city, uf.uf)

  const build = (id: 'economica' | 'expressa'): ShippingOption => {
    const rate = table[id]
    const extra = interior ? INTERIOR_EXTRA_DAYS[id] : 0
    const free = id === 'economica' && hasFreeShipping(subtotal)
    const minDays = rate.minDays + extra
    const maxDays = rate.maxDays + extra
    return {
      id, ...LABELS[id],
      price: free ? 0 : roundMoney(rate.price),
      free, minDays, maxDays,
      dispatchDate: dispatch,
      earliest: addBusinessDays(dispatch, minDays),
      latest: addBusinessDays(dispatch, maxDays),
    }
  }

  const ready = addBusinessDays(dispatch, PICKUP.readyInBusinessDays)
  const pickup: ShippingOption = {
    id: 'retirada', ...LABELS.retirada, price: 0, free: true,
    minDays: PICKUP.readyInBusinessDays, maxDays: PICKUP.readyInBusinessDays,
    dispatchDate: dispatch, earliest: ready, latest: ready,
  }
  return [build('economica'), build('expressa'), pickup]
}

export const pickOption = (options: ShippingOption[], id: ShippingMethodId = 'economica') =>
  options.find((o) => o.id === id) ?? options[0]!

/** "Chegará entre qua, 28 out e sex, 30 out" (ou data única quando min = max). */
export function arrivalText(o: Pick<ShippingOption, 'earliest' | 'latest'>, fmt: (k: DateKey) => string): string {
  return o.earliest === o.latest ? `Chegará ${fmt(o.earliest)}` : `Chegará entre ${fmt(o.earliest)} e ${fmt(o.latest)}`
}
