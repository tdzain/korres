import { COUPONS, PIX_DISCOUNT } from '@/config/features'
import { roundMoney } from '@/lib/format/money'
import { quoteShipping } from '@/lib/shipping/quote'
import { addDays, todayKey } from '@/lib/shipping/calendar'
import { buildPixPayload, mockBoletoLine } from './pix'
import { clampShare, pixDiscountFor } from './split'
import type { Order, OrderInput, OrderPart, OrderTotals } from '@/lib/commerce/types'

export type CouponCode = keyof typeof COUPONS

export const findCoupon = (code: string | null | undefined) => {
  const key = (code ?? '').trim().toUpperCase() as CouponCode
  return COUPONS[key] ? { code: key, ...COUPONS[key] } : null
}

export interface TotalsInput {
  subtotal: number
  couponPercent?: number
  payment: 'pix' | 'card' | 'boleto' | 'split'
  shipping: number
  /** Pagamento combinado: fatia do pedido paga via Pix (0 em dois cartões). */
  pixShare?: number
}

/** Ordem: cupom sobre os produtos → Pix sobre o restante → frete somado no final. */
export function computeTotals({ subtotal, couponPercent = 0, payment, shipping, pixShare = 0 }: TotalsInput): OrderTotals {
  const couponDiscount = roundMoney(subtotal * couponPercent)
  const base = roundMoney(subtotal - couponDiscount)
  const pixDiscount = payment === 'pix' ? roundMoney(base * PIX_DISCOUNT) : payment === 'split' ? pixDiscountFor(base, pixShare) : 0
  return { subtotal, couponDiscount, pixDiscount, shipping, total: roundMoney(base - pixDiscount + shipping) }
}

export function newOrderId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  return 'KR' + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}

/** Constrói o pedido (mock) a partir do payload validado. Usado pela Pages Function e pelo fallback local. */
export function buildOrder(input: OrderInput, now: number = Date.now()): Order {
  const subtotal = roundMoney(input.items.reduce((s, i) => s + i.unitPrice * i.qty, 0))
  const options = quoteShipping({ destination: { uf: input.address.uf, city: input.address.city, cep: input.address.cep }, subtotal, now })
  const shipping = options.find((o) => o.id === input.shippingMethod) ?? options[0]!
  const coupon = findCoupon(input.coupon)
  const base = roundMoney(subtotal - roundMoney(subtotal * (coupon?.percent ?? 0)))
  const payable = roundMoney(base + shipping.price)
  const id = newOrderId()

  // Pagamento combinado: normaliza as duas partes (a 2ª é sempre o restante) e calcula o desconto Pix só sobre produtos.
  let parts: OrderPart[] | undefined
  let pixShare = 0
  if (input.payment.method === 'split' && input.payment.split?.length === 2) {
    const [a, b] = input.payment.split as [NonNullable<OrderInput['payment']['split']>[number], NonNullable<OrderInput['payment']['split']>[number]]
    const first = clampShare(payable, a.share)
    const shares = [first, roundMoney(payable - first)]
    pixShare = [a, b].reduce((sum, p, i) => sum + (p.method === 'pix' ? shares[i]! : 0), 0)
    const discount = pixDiscountFor(base, pixShare)
    parts = [a, b].map((p, i) => ({
      method: p.method,
      share: shares[i]!,
      charge: p.method === 'pix' ? roundMoney(shares[i]! - discount) : shares[i]!,
      installments: p.method === 'card' ? p.installments ?? 1 : undefined,
      cardBrand: p.method === 'card' ? p.cardBrand : undefined,
      status: p.method === 'card' ? 'paid' : 'awaiting_payment',
    }))
  }
  const totals = computeTotals({ subtotal, couponPercent: coupon?.percent, payment: parts ? 'split' : (input.payment.method === 'split' ? 'card' : input.payment.method), shipping: shipping.price, pixShare })
  const order: Order = { ...input, id, createdAt: new Date(now).toISOString(), status: 'awaiting_payment', totals, shipping, parts }
  const pixPart = parts?.find((p) => p.method === 'pix')
  if (input.payment.method === 'pix' || pixPart) {
    const amount = pixPart ? pixPart.charge : totals.total
    order.pix = { code: buildPixPayload({ amount, txid: id }), expiresAt: new Date(now + 30 * 60_000).toISOString(), amount }
  }
  if (input.payment.method === 'boleto') {
    order.boleto = { line: mockBoletoLine(id, totals.total), dueDate: addDays(todayKey(now), 3) }
  }
  // Cartão (e dois cartões) é aprovado de imediato na simulação; Pix e boleto aguardam.
  if (input.payment.method === 'card' || (parts && !pixPart)) order.status = 'paid'
  return order
}
