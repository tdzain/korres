import { describe, expect, it } from 'vitest'
import { addBusinessDays, cutoffInfo, isBusinessDay } from '@/lib/shipping/calendar'
import { arrivalText, hasFreeShipping, quoteShipping } from '@/lib/shipping/quote'
import { formatCountdown, formatRelativeDate, formatShortDate } from '@/lib/format/date'

// 2026-10-22 é quinta-feira. Horários abaixo em UTC (BRT = UTC-3).
const thu10h = '2026-10-22T13:00:00Z' // 10:00 BRT
const thu15h = '2026-10-22T18:00:00Z' // 15:00 BRT
const fri15h = '2026-10-23T18:00:00Z'

describe('calendário de dias úteis', () => {
  it('ignora fins de semana e feriados nacionais', () => {
    expect(isBusinessDay('2026-10-24')).toBe(false) // sábado
    expect(isBusinessDay('2026-11-02')).toBe(false) // Finados (segunda)
    expect(isBusinessDay('2026-11-03')).toBe(true)
    expect(addBusinessDays('2026-10-30', 1)).toBe('2026-11-03') // pula sáb, dom e feriado de 2/11
    expect(addBusinessDays('2027-03-25', 1)).toBe('2027-03-29') // Sexta-feira Santa 2027
  })

  it('antes das 14h expede hoje e conta o tempo até o corte', () => {
    const c = cutoffInfo(thu10h)
    expect(c.beforeCutoff).toBe(true)
    expect(c.dispatchDate).toBe('2026-10-22')
    expect(c.msUntilCutoff).toBe(4 * 3600_000)
  })

  it('depois das 14h desloca a expedição para o próximo dia útil', () => {
    expect(cutoffInfo(thu15h)).toMatchObject({ beforeCutoff: false, dispatchDate: '2026-10-23', msUntilCutoff: null })
    expect(cutoffInfo(fri15h).dispatchDate).toBe('2026-10-26') // sexta após o corte → segunda
  })

  it('no horário de corte exato já é depois do corte', () => {
    expect(cutoffInfo('2026-10-22T17:00:00Z').beforeCutoff).toBe(false)
    expect(cutoffInfo('2026-10-22T16:59:59Z').beforeCutoff).toBe(true)
  })
})

describe('motor de frete', () => {
  it('Sudeste/Sul: Econômica 3–5 dias úteis por R$ 19,90, Expressa 2 dias por R$ 29,90', () => {
    const [eco, exp] = quoteShipping({ destination: { uf: 'PR', city: 'Curitiba' }, subtotal: 100, now: thu10h })
    expect(eco).toMatchObject({ id: 'economica', price: 19.9, earliest: '2026-10-27', latest: '2026-10-29' })
    expect(exp).toMatchObject({ id: 'expressa', price: 29.9, earliest: '2026-10-26', latest: '2026-10-26' })
  })

  it('mesmo estado do CD tem tabela própria', () => {
    const [eco, exp] = quoteShipping({ destination: { uf: 'SP', city: 'São Paulo' }, subtotal: 100, now: thu10h })
    expect(eco).toMatchObject({ price: 14.9, minDays: 2, maxDays: 3 })
    expect(exp).toMatchObject({ price: 24.9, minDays: 1, maxDays: 1 })
  })

  it('Nordeste/Centro-Oeste e Norte', () => {
    const rec = quoteShipping({ destination: { uf: 'PE', city: 'Recife' }, subtotal: 100, now: thu10h })
    expect(rec[0]).toMatchObject({ price: 29.9, minDays: 5, maxDays: 8 })
    expect(rec[1]).toMatchObject({ price: 44.9, minDays: 3, maxDays: 4 })
    const man = quoteShipping({ destination: { uf: 'AM', city: 'Manaus' }, subtotal: 100, now: thu10h })
    expect(man[0]).toMatchObject({ price: 39.9, minDays: 7, maxDays: 12 })
    expect(man[1]).toMatchObject({ price: 59.9, minDays: 5, maxDays: 6 })
  })

  it('interior soma dias úteis (+2 Econômica, +1 Expressa)', () => {
    const [eco, exp] = quoteShipping({ destination: { uf: 'PR', city: 'Londrina' }, subtotal: 100, now: thu10h })
    expect(eco).toMatchObject({ minDays: 5, maxDays: 7 })
    expect(exp).toMatchObject({ minDays: 3, maxDays: 3 })
  })

  it('frete grátis na Econômica a partir de R$ 299 (e só nela)', () => {
    expect(hasFreeShipping(298.99)).toBe(false)
    expect(hasFreeShipping(299)).toBe(true)
    const [eco, exp, pick] = quoteShipping({ destination: { uf: 'PR', city: 'Curitiba' }, subtotal: 299.8, now: thu10h })
    expect(eco).toMatchObject({ free: true, price: 0 })
    expect(exp.free).toBe(false)
    expect(pick).toMatchObject({ id: 'retirada', price: 0 })
  })

  it('depois do corte as datas deslocam um dia útil', () => {
    const [before] = quoteShipping({ destination: { uf: 'PR', city: 'Curitiba' }, subtotal: 100, now: thu10h })
    const [after] = quoteShipping({ destination: { uf: 'PR', city: 'Curitiba' }, subtotal: 100, now: thu15h })
    expect(before.earliest).toBe('2026-10-27')
    expect(after.earliest).toBe('2026-10-28')
  })

  it('é determinístico', () => {
    const a = quoteShipping({ destination: { uf: 'BA', city: 'Salvador' }, subtotal: 50, now: thu10h })
    const b = quoteShipping({ destination: { uf: 'BA', city: 'Salvador' }, subtotal: 50, now: thu10h })
    expect(a).toEqual(b)
  })
})

describe('formatação de datas', () => {
  it('formata datas curtas e relativas', () => {
    expect(formatShortDate('2026-10-28')).toBe('qua, 28 out')
    expect(formatRelativeDate('2026-10-22', '2026-10-22')).toBe('hoje')
    expect(formatRelativeDate('2026-10-23', '2026-10-22')).toBe('amanhã')
    expect(formatRelativeDate('2026-10-28', '2026-10-22')).toBe('qua, 28 out')
  })
  it('monta o texto de chegada', () => {
    const [eco] = quoteShipping({ destination: { uf: 'PR', city: 'Curitiba' }, subtotal: 100, now: thu10h })
    expect(arrivalText(eco, formatShortDate)).toBe('Chegará entre ter, 27 out e qui, 29 out')
  })
  it('formata contagem regressiva', () => {
    expect(formatCountdown(2 * 3600_000 + 14 * 60_000 + 5000)).toBe('2 h 14 min')
    expect(formatCountdown(14 * 60_000 + 5000)).toBe('14 min 05 s')
  })
})
