import type { Region } from '@/data/brazil'

export type ShippingRate = { minDays: number; maxDays: number; price: number }
export type RateTable = { economica: ShippingRate; expressa: ShippingRate }

/** Centro de distribuição de origem (configurável). */
export const ORIGIN = { city: 'São Paulo', uf: 'SP', label: 'São Paulo – SP' } as const

/** Frete grátis na Econômica acima deste valor. A barra do carrinho usa o mesmo número. */
export const FREE_SHIPPING_THRESHOLD = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 299)

/** Horário de corte (hora cheia, fuso America/Sao_Paulo, UTC-3 sem horário de verão). */
export const CUTOFF_HOUR = 14
export const BRT_OFFSET_HOURS = -3

/** Dias úteis extras para destinos fora da capital. */
export const INTERIOR_EXTRA_DAYS = { economica: 2, expressa: 1 } as const

export const RATES: { sameState: RateTable } & Record<Region, RateTable> = {
  sameState: {
    economica: { minDays: 2, maxDays: 3, price: 14.9 },
    expressa: { minDays: 1, maxDays: 1, price: 24.9 },
  },
  'sudeste-sul': {
    economica: { minDays: 3, maxDays: 5, price: 19.9 },
    expressa: { minDays: 2, maxDays: 2, price: 29.9 },
  },
  'centro-oeste-nordeste': {
    economica: { minDays: 5, maxDays: 8, price: 29.9 },
    expressa: { minDays: 3, maxDays: 4, price: 44.9 },
  },
  norte: {
    economica: { minDays: 7, maxDays: 12, price: 39.9 },
    expressa: { minDays: 5, maxDays: 6, price: 59.9 },
  },
}

export const PICKUP = { label: 'Retirada no CD', address: 'Centro de distribuição KORRES · São Paulo – SP', readyInBusinessDays: 1 } as const
