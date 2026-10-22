import { json, lookupCepServer } from '../../../lib/server/geo'

// GET /api/cep/80010000 → { cep, street, neighborhood, city, uf } (ViaCEP com fallback BrasilAPI)
export const onRequestGet: PagesFunction<unknown, 'cep'> = async ({ params }) => {
  const cep = Array.isArray(params.cep) ? params.cep[0] : params.cep
  const result = await lookupCepServer(cep ?? '')
  if (!result) return json({ error: 'CEP não encontrado' }, { status: 404 })
  return json(result, { headers: { 'cache-control': 'public, max-age=86400' } })
}
