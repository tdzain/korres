import { PIX_DISCOUNT } from '@/config/features'
import { roundMoney } from '@/lib/format/money'

export const MAX_INSTALLMENTS = 6
/** Parcela mínima inferida do parcelamento da loja atual (R$ 198,80 → 5x de R$ 39,76). */
export const MIN_INSTALLMENT = 35

export interface Installment {
  count: number
  value: number
  total: number
}

/** Maior número de parcelas sem juros respeitando a parcela mínima. */
export function bestInstallment(total: number): Installment {
  const count = Math.max(1, Math.min(MAX_INSTALLMENTS, Math.floor(total / MIN_INSTALLMENT)))
  return { count, value: roundMoney(total / count), total }
}

/** Todas as opções de 1x até o máximo permitido. */
export function installmentOptions(total: number): Installment[] {
  const max = bestInstallment(total).count
  return Array.from({ length: max }, (_, i) => ({ count: i + 1, value: roundMoney(total / (i + 1)), total }))
}

export const pixTotal = (total: number) => roundMoney(total * (1 - PIX_DISCOUNT))
export const pixDiscountValue = (total: number) => roundMoney(total - pixTotal(total))
