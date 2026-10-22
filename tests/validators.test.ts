import { describe, expect, it } from 'vitest'
import { isValidCPF, maskCPF } from '@/lib/validators/cpf'
import { detectBrand, isValidExpiry, luhn, maskCardNumber } from '@/lib/validators/card'
import { isValidCEP, maskCEP } from '@/lib/validators/cep'
import { isValidPhone, maskPhone } from '@/lib/validators/phone'

describe('CPF', () => {
  it('valida dígitos verificadores', () => {
    expect(isValidCPF('529.982.247-25')).toBe(true)
    expect(isValidCPF('52998224725')).toBe(true)
    expect(isValidCPF('529.982.247-24')).toBe(false)
    expect(isValidCPF('111.111.111-11')).toBe(false)
    expect(isValidCPF('123')).toBe(false)
  })
  it('aplica máscara', () => expect(maskCPF('52998224725')).toBe('529.982.247-25'))
})

describe('cartão', () => {
  it('Luhn', () => {
    expect(luhn('4242 4242 4242 4242')).toBe(true)
    expect(luhn('4242 4242 4242 4241')).toBe(false)
    expect(luhn('5555 5555 5555 4444')).toBe(true)
  })
  it('detecta bandeira', () => {
    expect(detectBrand('4242424242424242')).toBe('visa')
    expect(detectBrand('5555555555554444')).toBe('mastercard')
    expect(detectBrand('2221000000000009')).toBe('mastercard')
    expect(detectBrand('378282246310005')).toBe('amex')
    expect(detectBrand('6362970000457013')).toBe('elo')
    expect(detectBrand('6062825624254001')).toBe('hipercard')
  })
  it('máscara e validade', () => {
    expect(maskCardNumber('4242424242424242')).toBe('4242 4242 4242 4242')
    expect(maskCardNumber('378282246310005')).toBe('3782 822463 10005')
    const now = new Date('2026-10-22T12:00:00Z')
    expect(isValidExpiry('10/26', now)).toBe(true)
    expect(isValidExpiry('09/26', now)).toBe(false)
    expect(isValidExpiry('13/30', now)).toBe(false)
  })
})

describe('CEP e telefone', () => {
  it('CEP', () => {
    expect(isValidCEP('80010-000')).toBe(true)
    expect(isValidCEP('8001000')).toBe(false)
    expect(maskCEP('80010000')).toBe('80010-000')
  })
  it('celular', () => {
    expect(isValidPhone('(41) 99999-0000')).toBe(true)
    expect(isValidPhone('(41) 3333-0000')).toBe(false)
    expect(maskPhone('41999990000')).toBe('(41) 99999-0000')
  })
})
