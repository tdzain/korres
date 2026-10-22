import { findUF, ufFromName } from '@/data/brazil'
import type { CepResult, GeoResult, ReverseResult } from '@/lib/server/geo'

export type LocationSource = 'edge' | 'ip' | 'fallback' | 'user' | 'cep' | 'gps' | 'demo'

export interface Location {
  city: string
  uf: string
  cep?: string
  source: LocationSource
  /** O usuário confirmou/escolheu esta localização (persiste em `kr_loc`). */
  confirmed: boolean
}

export const FALLBACK: Location = { city: 'São Paulo', uf: 'SP', source: 'fallback', confirmed: false }

async function getJson<T>(url: string, ms: number): Promise<T | null> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) return null
    const type = res.headers.get('content-type') ?? ''
    if (!type.includes('json')) return null // ex.: `next dev` devolve HTML 404 para /api
    return (await res.json()) as T
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

/** Borda/IP via /api/geo; sem backend (dev) tenta ipwho.is direto do navegador; por fim São Paulo. */
export async function detectLocation(): Promise<Location> {
  const api = await getJson<GeoResult>('/api/geo', 2500)
  if (api) return { city: api.city, uf: api.uf, source: api.source, confirmed: false }
  const direct = await getJson<{ success?: boolean; city?: string; region_code?: string; region?: string; country_code?: string }>(
    'https://ipwho.is/?fields=success,city,region,region_code,country_code', 1800,
  )
  if (direct?.success && direct.country_code === 'BR' && direct.city) {
    const uf = findUF(direct.region_code ?? '')?.uf ?? ufFromName(direct.region ?? '')
    if (uf) return { city: direct.city, uf, source: 'ip', confirmed: false }
  }
  return FALLBACK
}

/** ViaCEP via /api/cep (com fallback BrasilAPI no servidor); em dev consulta o ViaCEP direto. */
export async function lookupCep(raw: string): Promise<CepResult | null> {
  const cep = raw.replace(/\D/g, '')
  if (cep.length !== 8) return null
  const api = await getJson<CepResult>(`/api/cep/${cep}`, 4000)
  if (api) return api
  const d = await getJson<{ erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string }>(`https://viacep.com.br/ws/${cep}/json/`, 4000)
  if (!d || d.erro || !d.localidade || !d.uf) return null
  return { cep: `${cep.slice(0, 5)}-${cep.slice(5)}`, street: d.logradouro ?? '', neighborhood: d.bairro ?? '', city: d.localidade, uf: d.uf }
}

/** Pede a posição ao navegador (exige consentimento explícito do usuário). Coordenadas nunca são persistidas. */
export function getBrowserPosition(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('unsupported'))
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      (e) => reject(e),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    )
  })
}

export async function reverseGeocode(lat: number, lon: number): Promise<ReverseResult | null> {
  const api = await getJson<ReverseResult>(`/api/reverse-geocode?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`, 6000)
  if (api) return api
  // Dev sem Functions: o Nominatim permite CORS.
  const d = await getJson<{ address?: Record<string, string> }>(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=14&accept-language=pt-BR&lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`, 6000,
  )
  const a = d?.address
  if (!a || a.country_code !== 'br') return null
  const city = a.city ?? a.town ?? a.municipality ?? a.village
  const uf = findUF((a['ISO3166-2-lvl4'] ?? '').replace('BR-', ''))?.uf ?? ufFromName(a.state ?? '')
  return city && uf ? { city, uf, cep: a.postcode } : null
}
