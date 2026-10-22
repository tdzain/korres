import type { Page } from '@playwright/test'

/** Falha o teste se aparecer erro no console (ignora ruído de terceiros). */
export function watchConsole(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    const t = m.text()
    if (/favicon|ipwho|nominatim|viacep|brasilapi|Failed to load resource|net::ERR|Failed to fetch RSC payload/i.test(t)) return
    errors.push(t)
  })
  return errors
}

/** Respostas determinísticas para serviços externos. */
export async function mockExternal(page: Page, { prefs = true }: { prefs?: boolean } = {}) {
  // Cookies decididos e newsletter dispensada: o pop-up de 9 s não interfere nos cliques.
  if (prefs) await page.addInitScript(() => { try { if (!localStorage.getItem('kr_prefs')) localStorage.setItem('kr_prefs', JSON.stringify({ state: { cookies: 'all', newsletter: 'dismissed', announcementClosed: false, recentSearches: [] }, version: 0 })) } catch { /* ignore */ } })
  await page.route('**/api/cep/80010000', (r) => r.fulfill({ json: { cep: '80010-000', street: 'Rua José Loureiro', neighborhood: 'Centro', city: 'Curitiba', uf: 'PR' } }))
  await page.route('**/api/cep/69005010', (r) => r.fulfill({ json: { cep: '69005-010', street: 'Rua Marcílio Dias', neighborhood: 'Centro', city: 'Manaus', uf: 'AM' } }))
  await page.route('**/api/geo', (r) => r.fulfill({ json: { city: 'Curitiba', uf: 'PR', source: 'edge' } }))
}

export async function acceptCookies(page: Page) {
  const accept = page.getByRole('button', { name: 'Aceitar', exact: true })
  if (await accept.isVisible().catch(() => false)) await accept.click()
}
