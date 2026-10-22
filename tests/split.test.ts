import { describe, expect, it } from 'vitest'
import { buildOrder, computeTotals } from '@/lib/orders/build'
import { clampShare, MIN_PART, pixDiscountFor, planSplit } from '@/lib/orders/split'
import { randomCPF, randomCustomer } from '@/lib/demo/random'
import { isValidCPF } from '@/lib/validators/cpf'
import { isValidPhone } from '@/lib/validators/phone'
import { luhn } from '@/lib/validators/card'
import type { OrderInput } from '@/lib/commerce/types'

const NOW = '2026-10-22T13:00:00Z'
const input = (payment: OrderInput['payment']): OrderInput => ({
  contact: { email: 'a@b.co', phone: '41999990000', marketing: false },
  customer: { firstName: 'Maria', lastName: 'Teste', cpf: '52998224725' },
  address: { cep: '80010000', street: 'Rua A', number: '1', neighborhood: 'Centro', city: 'Curitiba', uf: 'PR' },
  shippingMethod: 'economica',
  payment,
  items: [{ variantId: '1', slug: 's', name: 'Produto', variantLabel: '30ml', image: '/x.webp', qty: 1, unitPrice: 398.8 }],
  coupon: null,
})

describe('pagamento combinado', () => {
  it('desconto Pix vale só sobre produtos, não sobre o frete', () => {
    expect(pixDiscountFor(100, 40)).toBe(2)
    expect(pixDiscountFor(100, 130)).toBe(5)
  })

  it('limita a fatia: cada forma cobre ao menos R$ 10', () => {
    expect(clampShare(200, 1)).toBe(MIN_PART)
    expect(clampShare(200, 199)).toBe(190)
    expect(clampShare(200, 120)).toBe(120)
  })

  it('Pix + cartão: Pix com 5% off sobre a fatia, cartão paga o restante', () => {
    const plan = planSplit({ base: 398.8, payable: 398.8, mode: 'pix_card', share: 200 })
    expect(plan.parts[0]).toEqual({ method: 'pix', share: 200, charge: 190 })
    expect(plan.parts[1]).toEqual({ method: 'card', share: 198.8, charge: 198.8 })
    expect(plan.total).toBe(388.8)
    expect(plan.parts[0].charge + plan.parts[1].charge).toBe(plan.total)
  })

  it('dois cartões: sem desconto, soma fecha o total', () => {
    const plan = planSplit({ base: 398.8, payable: 418.7, mode: 'card_card', share: 100 })
    expect(plan.pixDiscount).toBe(0)
    expect(plan.parts[0].charge + plan.parts[1].charge).toBe(418.7)
  })

  it('totais do pedido com Pix parcial', () => {
    const t = computeTotals({ subtotal: 398.8, payment: 'split', shipping: 19.9, pixShare: 200 })
    expect(t.pixDiscount).toBe(10)
    expect(t.total).toBe(408.7)
  })

  it('pedido Pix + cartão: aguarda o Pix, QR com o valor do Pix', () => {
    const o = buildOrder(input({ method: 'split', split: [{ method: 'pix', share: 200 }, { method: 'card', share: 1, installments: 3, cardBrand: 'Visa' }] }), Date.parse(NOW))
    expect(o.status).toBe('awaiting_payment')
    expect(o.parts?.map((p) => [p.method, p.status])).toEqual([['pix', 'awaiting_payment'], ['card', 'paid']])
    expect(o.pix?.amount).toBe(190)
    expect(o.pix?.code).toContain('5406190.00')
    expect(o.parts!.reduce((s, p) => s + p.charge, 0)).toBeCloseTo(o.totals.total, 2)
  })

  it('pedido com dois cartões é aprovado na hora', () => {
    const o = buildOrder(input({ method: 'split', split: [{ method: 'card', share: 150, installments: 2 }, { method: 'card', share: 1, installments: 1 }] }), Date.parse(NOW))
    expect(o.status).toBe('paid')
    expect(o.pix).toBeUndefined()
    expect(o.parts![0]!.share + o.parts![1]!.share).toBeCloseTo(o.totals.total, 2)
  })
})

describe('dados aleatórios da demonstração', () => {
  it('gera CPF, telefone e cartões válidos', () => {
    for (let i = 0; i < 50; i++) {
      const c = randomCustomer()
      expect(isValidCPF(c.cpf)).toBe(true)
      expect(isValidPhone(c.phone)).toBe(true)
      expect(luhn(c.cardA.number)).toBe(true)
      expect(luhn(c.cardB.number)).toBe(true)
      expect(c.cardB.number).not.toBe(c.cardA.number)
    }
    expect(isValidCPF(randomCPF())).toBe(true)
  })
})
