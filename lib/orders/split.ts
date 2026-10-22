import { PIX_DISCOUNT } from '@/config/features'
import { roundMoney } from '@/lib/format/money'

/** Cada forma de pagamento de um pedido combinado precisa cobrir ao menos este valor. */
export const MIN_PART = 10

export type SplitMode = 'pix_card' | 'card_card'

/** Limites da fatia da 1ª forma de pagamento (a 2ª é o restante). */
export function shareBounds(payable: number) {
  return { min: MIN_PART, max: Math.max(MIN_PART, roundMoney(payable - MIN_PART)) }
}

export const clampShare = (payable: number, share: number) => {
  const { min, max } = shareBounds(payable)
  return roundMoney(Math.min(max, Math.max(min, share)))
}

/** O desconto de 5% do Pix vale só sobre produtos (não sobre o frete). */
export const pixDiscountFor = (base: number, pixShare: number) => roundMoney(Math.min(pixShare, base) * PIX_DISCOUNT)

export interface PlannedPart {
  method: 'pix' | 'card'
  share: number
  charge: number
}

/**
 * Plano de pagamento combinado.
 * `base` = produtos − cupom; `payable` = base + frete (antes do desconto Pix); `share` = fatia da 1ª forma.
 * Pix + cartão: a 1ª é o Pix. Cartão + cartão: a 1ª é o cartão A.
 */
export function planSplit({ base, payable, mode, share }: { base: number; payable: number; mode: SplitMode; share: number }): { parts: [PlannedPart, PlannedPart]; pixDiscount: number; total: number } {
  const first = clampShare(payable, share)
  const second = roundMoney(payable - first)
  if (mode === 'pix_card') {
    const discount = pixDiscountFor(base, first)
    return {
      parts: [{ method: 'pix', share: first, charge: roundMoney(first - discount) }, { method: 'card', share: second, charge: second }],
      pixDiscount: discount,
      total: roundMoney(payable - discount),
    }
  }
  return { parts: [{ method: 'card', share: first, charge: first }, { method: 'card', share: second, charge: second }], pixDiscount: 0, total: payable }
}
