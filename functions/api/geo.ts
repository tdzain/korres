import { json, resolveGeo } from '../../lib/server/geo'

// GET /api/geo → { city, uf, source }. Lê a geolocalização de borda do Cloudflare (`request.cf`).
export const onRequestGet: PagesFunction = async ({ request }) => {
  const cf = (request as Request & { cf?: Record<string, string> }).cf
  const geo = await resolveGeo(request, cf)
  return json(geo, { headers: { 'cache-control': 'private, max-age=300' } })
}
