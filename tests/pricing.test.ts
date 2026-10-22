import { describe, expect, it } from 'vitest'
import { bestInstallment, installmentOptions, pixTotal } from '@/lib/pricing'
import { discountPercent, formatBRL } from '@/lib/format/money'

describe('parcelamento sem juros (máx. 6x, parcela mínima R$ 35)', () => {
  it.each([
    [269.8, 6, 44.97],
    [198.8, 5, 39.76],
    [119.8, 3, 39.93],
    [299.8, 6, 49.97],
    [16.8, 1, 16.8],
    [388.8, 6, 64.8],
  ])('R$ %s → %ix de R$ %s', (total, count, value) => {
    expect(bestInstallment(total)).toMatchObject({ count, value })
  })
  it('lista de 1x até o máximo', () => {
    expect(installmentOptions(119.8).map((i) => i.count)).toEqual([1, 2, 3])
  })
})

describe('preços', () => {
  it('Pix com 5% de desconto', () => expect(pixTotal(200)).toBe(190))
  it('percentual de desconto', () => {
    expect(discountPercent(875.11, 656.33)).toBe(25)
    expect(discountPercent(100, 100)).toBe(0)
  })
  it('formata em reais', () => expect(formatBRL(1234.5).replace(/\s/g, ' ')).toBe('R$ 1.234,50'))
})
