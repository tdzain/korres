import { onlyDigits } from './cpf'

export type CardBrand = 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard' | 'diners' | 'unknown'

export function luhn(input: string): boolean {
  const d = onlyDigits(input)
  if (d.length < 12) return false
  let sum = 0
  let alt = false
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i])
    if (alt) { n *= 2; if (n > 9) n -= 9 }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}

const ELO = /^(4011(78|79)|43(1274|8935)|45(1416|7393|763(1|2))|50(4175|6699|67[0-7][0-9]|9[0-9]{3})|5090[0-9]{2}|627780|63(6297|6368|6369)|650(03[^4]|04[0-9]|05[0-9]|0(5[3-9]|6[0-9]|7[0-9]|8[0-9]|9[0-8]))|6504(0[5-9]|1[0-9]|2[0-9]|3[0-9])|6505(2[1-9]|3[0-8])|6507(0[0-9]|1[0-8])|65072[0-7]|6509(0[1-9]|1[0-9]|20)|6516(5[2-9]|6[0-9]|7[0-9])|6550([0-1][0-9]|2[1-9]|3[0-9]|4[0-9]|5[0-8]))/

export function detectBrand(input: string): CardBrand {
  const d = onlyDigits(input)
  if (!d) return 'unknown'
  if (/^(606282|3841)/.test(d)) return 'hipercard'
  if (ELO.test(d)) return 'elo'
  if (/^3[47]/.test(d)) return 'amex'
  if (/^3(0[0-5]|[68])/.test(d)) return 'diners'
  if (/^(5[1-5]|2(2[2-9]|[3-6]|7[01]|720))/.test(d)) return 'mastercard'
  if (/^4/.test(d)) return 'visa'
  return 'unknown'
}

export const brandLabel: Record<CardBrand, string> = {
  visa: 'Visa', mastercard: 'Mastercard', elo: 'Elo', amex: 'American Express', hipercard: 'Hipercard', diners: 'Diners', unknown: 'Cartão',
}

export const cvvLength = (brand: CardBrand) => (brand === 'amex' ? 4 : 3)

export function maskCardNumber(input: string): string {
  const brand = detectBrand(input)
  const d = onlyDigits(input).slice(0, brand === 'amex' ? 15 : 16)
  if (brand === 'amex') return d.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' '))
  return d.replace(/(\d{4})(?=\d)/g, '$1 ')
}

export function maskExpiry(input: string): string {
  const d = onlyDigits(input).slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

export function isValidExpiry(input: string, now = new Date()): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(input)
  if (!m) return false
  const month = Number(m[1])
  const year = 2000 + Number(m[2])
  if (month < 1 || month > 12) return false
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)
}
