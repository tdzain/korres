import { z } from 'zod'
import { json } from '../../../lib/server/geo'
import { quoteShipping } from '../../../lib/shipping/quote'

const schema = z.object({
  destination: z.object({ uf: z.string().length(2), city: z.string().optional(), cep: z.string().optional() }),
  subtotal: z.number().nonnegative(),
})

// POST /api/shipping/quote { destination, subtotal } → ShippingOption[]
export const onRequestPost: PagesFunction = async ({ request }) => {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return json({ error: 'Requisição inválida' }, { status: 400 })
  return json(quoteShipping({ ...parsed.data, now: Date.now() }))
}
