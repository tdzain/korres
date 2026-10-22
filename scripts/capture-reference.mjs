// Captura screenshots de referência do korres.com (home, coleção, PDP) em 1440 e 390.
import { chromium } from '@playwright/test'
const targets = process.argv[2] === 'local'
  ? { base: process.argv[3] ?? 'http://localhost:3000', prefix: 'local', pages: JSON.parse(process.argv[4] ?? '[["home","/"]]') }
  : { base: 'https://www.korres.com', prefix: 'ref', pages: [['home', '/'], ['colecao', '/collections/protein-facial-collection'], ['pdp', '/products/pure-greek-olive-3-in-1-nourishing-oil']] }
const b = await chromium.launch()
for (const [w, h, tag] of [[1440, 900, 'd'], [390, 844, 'm']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, locale: 'pt-BR' })
  for (const [name, path] of targets.pages) {
    const p = await ctx.newPage()
    await p.goto(targets.base + path, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch((e) => console.warn(name, e.message))
    await p.waitForTimeout(3500)
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)) } window.scrollTo(0, 0) })
    await p.waitForTimeout(800)
    await p.screenshot({ path: `docs/reference/${targets.prefix}-${name}-${tag}.png` })
    await p.screenshot({ path: `docs/reference/${targets.prefix}-${name}-${tag}-full.png`, fullPage: true }).catch(() => {})
    console.log('ok', name, tag, p.url())
    await p.close()
  }
  await ctx.close()
}
await b.close()
