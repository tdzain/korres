import { z } from 'zod'
import { isValidCEP } from '@/lib/validators/cep'
import { detectBrand, isValidExpiry, luhn, cvvLength } from '@/lib/validators/card'
import { isValidCPF, onlyDigits } from '@/lib/validators/cpf'
import { isValidPhone } from '@/lib/validators/phone'

export const checkoutSchema = z
  .object({
    email: z.string().trim().min(1, 'Informe seu e-mail').email('Esse e-mail parece inválido'),
    phone: z.string().refine(isValidPhone, 'Celular inválido: use DDD + 9 dígitos'),
    marketing: z.boolean(),
    firstName: z.string().trim().min(2, 'Informe seu nome'),
    lastName: z.string().trim().min(2, 'Informe seu sobrenome'),
    cpf: z.string().refine(isValidCPF, 'CPF inválido'),
    cep: z.string().refine(isValidCEP, 'CEP inválido: use 8 dígitos'),
    street: z.string().trim().min(2, 'Informe a rua'),
    number: z.string().trim().min(1, 'Informe o número'),
    complement: z.string().optional(),
    neighborhood: z.string().trim().min(2, 'Informe o bairro'),
    city: z.string().trim().min(2, 'Informe a cidade'),
    uf: z.string().length(2, 'UF inválida'),
    reference: z.string().optional(),
    shippingMethod: z.enum(['economica', 'expressa', 'retirada']),
    payment: z.enum(['pix', 'card', 'boleto', 'split']),
    splitMode: z.enum(['pix_card', 'card_card']),
    splitShare: z.number().min(0),
    cardNumber: z.string().optional(),
    cardName: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvv: z.string().optional(),
    installments: z.number().int().min(1).max(6),
    card2Number: z.string().optional(),
    card2Name: z.string().optional(),
    card2Expiry: z.string().optional(),
    card2Cvv: z.string().optional(),
    installments2: z.number().int().min(1).max(6),
  })
  .superRefine((v, ctx) => {
    const needA = v.payment === 'card' || v.payment === 'split'
    const needB = v.payment === 'split' && v.splitMode === 'card_card'
    const check = (slot: 'a' | 'b') => {
      const f = slot === 'a'
        ? { number: v.cardNumber, name: v.cardName, expiry: v.cardExpiry, cvv: v.cardCvv, keys: ['cardNumber', 'cardName', 'cardExpiry', 'cardCvv', 'card2Number', 'card2Name', 'card2Expiry', 'card2Cvv'] as const }
        : { number: v.card2Number, name: v.card2Name, expiry: v.card2Expiry, cvv: v.card2Cvv, keys: ['card2Number', 'card2Name', 'card2Expiry', 'card2Cvv'] as const }
      const add = (key: (typeof f.keys)[number], message: string) => ctx.addIssue({ code: 'custom', path: [key], message })
      const brand = detectBrand(f.number ?? '')
      if (!luhn(f.number ?? '')) add(f.keys[0], 'Número de cartão inválido')
      if (!(f.name ?? '').trim().includes(' ')) add(f.keys[1], 'Informe o nome como está no cartão')
      if (!isValidExpiry(f.expiry ?? '')) add(f.keys[2], 'Validade inválida')
      if (onlyDigits(f.cvv ?? '').length !== cvvLength(brand)) add(f.keys[3], `CVV com ${cvvLength(brand)} dígitos`)
    }
    if (needA) check('a')
    if (needB) check('b')
    if (needB && v.cardNumber && v.card2Number && onlyDigits(v.cardNumber) === onlyDigits(v.card2Number)) {
      ctx.addIssue({ code: 'custom', path: ['card2Number'], message: 'Use um segundo cartão diferente do primeiro' })
    }
  })

export type CheckoutValues = z.infer<typeof checkoutSchema>

/** Ordem visual dos campos: usada para rolar/focar o primeiro erro. */
export const FIELD_ORDER: (keyof CheckoutValues)[] = ['email', 'phone', 'cep', 'firstName', 'lastName', 'cpf', 'street', 'number', 'neighborhood', 'city', 'uf', 'cardNumber', 'cardName', 'cardExpiry', 'cardCvv', 'card2Number', 'card2Name', 'card2Expiry', 'card2Cvv']
