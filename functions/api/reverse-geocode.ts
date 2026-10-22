import { json, reverseGeocodeServer } from '../../lib/server/geo'

// GET /api/reverse-geocode?lat=..&lon=.. → { city, uf, cep? }. Coordenadas não são armazenadas nem registradas.
export const onRequestGet: PagesFunction = async ({ request }) => {
  const url = new URL(request.url)
  const result = await reverseGeocodeServer(Number(url.searchParams.get('lat')), Number(url.searchParams.get('lon')))
  if (!result) return json({ error: 'Localização indisponível' }, { status: 404 })
  return json(result, { headers: { 'cache-control': 'private, no-store' } })
}
