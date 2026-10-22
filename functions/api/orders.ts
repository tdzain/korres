import { z } from 'zod'
import { json } from '../../lib/server/geo'
import { buildOrder } from '../../lib/orders/build'
import type { OrderInput } from '../../lib/commerce/types'

const schema = z.object({
  contact: z.object({ email: z.string().email(), phone: z.string().min(8), marketing: z.boolean() }),
  customer: z.object({ firstName: z.string().min(1), lastName: z.string().min(1), cpf: z.string().min(11) }),
  address: z.object({
    cep: z.string().min(8), street: z.string().min(1), number: z.string().min(1), complement: z.string().optional(),
    neighborhood: z.string().min(1), city: z.string().min(1), uf: z.string().length(2), reference: z.string().optional(),
  }),
  shippingMethod: z.enum(['economica', 'expressa', 'retirada']),
  // Nunca recebemos número, validade ou CVV: só método, parcelas e bandeira.
  payment: z.object({ method: z.enum(['pix', 'card', 'boleto']), installments: z.number().int().min(1).max(6).optional(), cardBrand: z.string().optional() }),
  items: z.array(z.object({
    variantId: z.string(), slug: z.string(), name: z.string(), variantLabel: z.string(), image: z.string(),
    qty: z.number().int().min(1).max(20), unitPrice: z.number().positive(),
  })).min(1),
  coupon: z.string().nullable().optional(),
})

// POST /api/orders → Order (simulado, sem persistência: o navegador guarda o pedido em localStorage)
export const onRequestPost: PagesFunction = async ({ request }) => {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return json({ error: 'Pedido inválido', issues: parsed.error.issues.slice(0, 5) }, { status: 400 })
  return json(buildOrder(parsed.data as OrderInput), { status: 201 })
}
