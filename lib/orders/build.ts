import { COUPONS, PIX_DISCOUNT } from '@/config/features'
import { roundMoney } from '@/lib/format/money'
import { quoteShipping } from '@/lib/shipping/quote'
import { addDays, todayKey } from '@/lib/shipping/calendar'
import { buildPixPayload, mockBoletoLine } from './pix'
import type { Order, OrderInput, OrderTotals } from '@/lib/commerce/types'

export type CouponCode = keyof typeof COUPONS

export const findCoupon = (code: string | null | undefined) => {
  const key = (code ?? '').trim().toUpperCase() as CouponCode
  return COUPONS[key] ? { code: key, ...COUPONS[key] } : null
}

export interface TotalsInput {
  subtotal: number
  couponPercent?: number
  payment: 'pix' | 'card' | 'boleto'
  shipping: number
}

/** Ordem: cupom sobre os produtos → Pix sobre o restante → frete somado no final. */
export function computeTotals({ subtotal, couponPercent = 0, payment, shipping }: TotalsInput): OrderTotals {
  const couponDiscount = roundMoney(subtotal * couponPercent)
  const base = roundMoney(subtotal - couponDiscount)
  const pixDiscount = payment === 'pix' ? roundMoney(base * PIX_DISCOUNT) : 0
  return { subtotal, couponDiscount, pixDiscount, shipping, total: roundMoney(base - pixDiscount + shipping) }
}

export function newOrderId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = new Uint8Array(8)
  globalThis.crypto.getRandomValues(bytes)
  return 'KR' + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}

/** Constrói o pedido (mock) a partir do payload validado. Usado pela Pages Function e pelo fallback local. */
export function buildOrder(input: OrderInput, now: number = Date.now()): Order {
  const subtotal = roundMoney(input.items.reduce((s, i) => s + i.unitPrice * i.qty, 0))
  const options = quoteShipping({ destination: { uf: input.address.uf, city: input.address.city, cep: input.address.cep }, subtotal, now })
  const shipping = options.find((o) => o.id === input.shippingMethod) ?? options[0]!
  const coupon = findCoupon(input.coupon)
  const totals = computeTotals({ subtotal, couponPercent: coupon?.percent, payment: input.payment.method, shipping: shipping.price })
  const id = newOrderId()
  const order: Order = { ...input, id, createdAt: new Date(now).toISOString(), status: 'awaiting_payment', totals, shipping }
  if (input.payment.method === 'pix') {
    order.pix = { code: buildPixPayload({ amount: totals.total, txid: id }), expiresAt: new Date(now + 30 * 60_000).toISOString() }
  }
  if (input.payment.method === 'boleto') {
    order.boleto = { line: mockBoletoLine(id, totals.total), dueDate: addDays(todayKey(now), 3) }
  }
  // Cartão: aprovado de imediato na simulação.
  if (input.payment.method === 'card') order.status = 'paid'
  return order
}
