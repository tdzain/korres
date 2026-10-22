// Lógica de servidor (Cloudflare Pages Functions). Só usa APIs padrão de Fetch/Web: roda em Workers.
import { findUF, ufFromName } from '../../data/brazil'

export interface GeoResult {
  city: string
  uf: string
  source: 'edge' | 'ip' | 'fallback'
}

export interface CepResult {
  cep: string
  street: string
  neighborhood: string
  city: string
  uf: string
}

export const FALLBACK_LOCATION: GeoResult = { city: 'São Paulo', uf: 'SP', source: 'fallback' }

const json = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), { ...init, headers: { 'content-type': 'application/json; charset=utf-8', ...(init.headers ?? {}) } })

export { json }

async function fetchWithTimeout(url: string, ms: number, init: RequestInit = {}) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, { ...init, signal: ctrl.signal })
  } finally {
    clearTimeout(t)
  }
}

const safeDecode = (s: string) => {
  try { return decodeURIComponent(s) } catch { return s }
}

interface CfLike { city?: string; regionCode?: string; region?: string; country?: string }

/** Cascata: borda (Cloudflare `request.cf` / headers Vercel) → ipwho.is (1,5 s) → São Paulo. */
export async function resolveGeo(request: Request, cf?: CfLike): Promise<GeoResult> {
  // 1) Borda
  const city = cf?.city ?? request.headers.get('x-vercel-ip-city') ?? undefined
  const region = cf?.regionCode ?? cf?.region ?? request.headers.get('x-vercel-ip-country-region') ?? undefined
  const country = cf?.country ?? request.headers.get('x-vercel-ip-country') ?? undefined
  if (city && region && (!country || country === 'BR')) {
    const uf = findUF(region)?.uf ?? ufFromName(region)
    if (uf) return { city: safeDecode(city), uf, source: 'edge' }
  }
  // 2) ipwho.is (sem chave)
  try {
    const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    const res = await fetchWithTimeout(`https://ipwho.is/${ip ?? ''}?fields=success,city,region,region_code,country_code`, 1500)
    if (res.ok) {
      const d = (await res.json()) as { success?: boolean; city?: string; region?: string; region_code?: string; country_code?: string }
      if (d.success && d.country_code === 'BR' && d.city) {
        const uf = findUF(d.region_code ?? '')?.uf ?? ufFromName(d.region ?? '')
        if (uf) return { city: d.city, uf, source: 'ip' }
      }
    }
  } catch {
    /* timeout ou falha de rede: cai no fallback */
  }
  // 3) São Paulo
  return FALLBACK_LOCATION
}

/** ViaCEP com fallback para BrasilAPI. */
export async function lookupCepServer(raw: string): Promise<CepResult | null> {
  const cep = raw.replace(/\D/g, '')
  if (cep.length !== 8) return null
  try {
    const res = await fetchWithTimeout(`https://viacep.com.br/ws/${cep}/json/`, 4500)
    if (res.ok) {
      const d = (await res.json()) as { erro?: boolean | string; logradouro?: string; bairro?: string; localidade?: string; uf?: string }
      if (d.erro) return null
      if (d.localidade && d.uf) return { cep: `${cep.slice(0, 5)}-${cep.slice(5)}`, street: d.logradouro ?? '', neighborhood: d.bairro ?? '', city: d.localidade, uf: d.uf }
    }
  } catch {
    /* tenta o fallback */
  }
  try {
    const res = await fetchWithTimeout(`https://brasilapi.com.br/api/cep/v2/${cep}`, 4500)
    if (res.ok) {
      const d = (await res.json()) as { street?: string; neighborhood?: string; city?: string; state?: string }
      if (d.city && d.state) return { cep: `${cep.slice(0, 5)}-${cep.slice(5)}`, street: d.street ?? '', neighborhood: d.neighborhood ?? '', city: d.city, uf: d.state }
    }
  } catch {
    /* sem resultado */
  }
  return null
}

export interface ReverseResult { city: string; uf: string; cep?: string }

/** Geocodificação reversa (Nominatim). As coordenadas só trafegam nesta chamada; nada é persistido. */
export async function reverseGeocodeServer(lat: number, lon: number): Promise<ReverseResult | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=14&accept-language=pt-BR&lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`
  try {
    const res = await fetchWithTimeout(url, 4000, {
      headers: { 'user-agent': 'KorresBrasilPrototype/1.0 (+https://shopkorres.com.br; demo)', accept: 'application/json' },
      // Cache de borda do Cloudflare (coordenadas arredondadas a 4 casas).
      cf: { cacheTtl: 86400, cacheEverything: true },
    } as RequestInit)
    if (!res.ok) return null
    const d = (await res.json()) as { address?: Record<string, string> }
    const a = d.address
    if (!a || a.country_code !== 'br') return null
    const city = a.city ?? a.town ?? a.municipality ?? a.village ?? a.city_district
    const uf = findUF((a['ISO3166-2-lvl4'] ?? '').replace('BR-', ''))?.uf ?? ufFromName(a.state ?? '')
    if (!city || !uf) return null
    return { city, uf, cep: a.postcode }
  } catch {
    return null
  }
}
