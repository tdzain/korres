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
    payment: z.enum(['pix', 'card', 'boleto']),
    cardNumber: z.string().optional(),
    cardName: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvv: z.string().optional(),
    installments: z.number().int().min(1).max(6),
  })
  .superRefine((v, ctx) => {
    if (v.payment !== 'card') return
    const add = (path: keyof typeof v, message: string) => ctx.addIssue({ code: 'custom', path: [path], message })
    const brand = detectBrand(v.cardNumber ?? '')
    if (!luhn(v.cardNumber ?? '')) add('cardNumber', 'Número de cartão inválido')
    if (!(v.cardName ?? '').trim().includes(' ')) add('cardName', 'Informe o nome como está no cartão')
    if (!isValidExpiry(v.cardExpiry ?? '')) add('cardExpiry', 'Validade inválida')
    if (onlyDigits(v.cardCvv ?? '').length !== cvvLength(brand)) add('cardCvv', `CVV com ${cvvLength(brand)} dígitos`)
  })

export type CheckoutValues = z.infer<typeof checkoutSchema>

/** Ordem visual dos campos: usada para rolar/focar o primeiro erro. */
export const FIELD_ORDER: (keyof CheckoutValues)[] = ['email', 'phone', 'cep', 'firstName', 'lastName', 'cpf', 'street', 'number', 'neighborhood', 'city', 'uf', 'cardNumber', 'cardName', 'cardExpiry', 'cardCvv']
