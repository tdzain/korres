import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { acceptCookies, mockExternal } from './helpers'

const pages = [
  ['home', '/'],
  ['plp', '/colecao/rosto/'],
  ['pdp', '/produto/smart-yoghurt-probiotic-super-serum/'],
  ['checkout', '/checkout/'],
]

for (const [name, url] of pages) {
  test(`axe sem violações graves: ${name}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' }) // sem animações em andamento durante a medição
    await mockExternal(page)
    await page.goto('/produto/sabonete-em-barra-jasmim/')
    await acceptCookies(page)
    await page.getByTestId('add-to-bag').click()
    await expect(page.getByRole('dialog', { name: 'Sacola de compras' }).getByTestId('cart-line')).toHaveCount(1)
    await page.goto(url!)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2500) // fades de entrada (hero, balão de cidade) terminam antes da medição
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`), JSON.stringify(serious.map((v) => v.id))).toEqual([])
  })
}
