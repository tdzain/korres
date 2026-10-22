// Extrai o catálogo público de shopkorres.com.br (VNDA) para data/raw/shopkorres.json.
// Uso: node scripts/scrape-shopkorres.mjs
import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

const BASE = 'https://www.shopkorres.com.br'
const SKIP = /^\/(produto|p|conta|carrinho|checkout|busca|cdn-cgi|images|login|$)/

const browser = await chromium.launch()
const ctx = await browser.newContext({ locale: 'pt-BR', viewport: { width: 1280, height: 900 } })
// Bloqueia rastreadores e mídia para ir mais rápido.
await ctx.route(/(google|doubleclick|facebook|stamped|hotjar|clarity|tiktok|analytics)/, (r) => r.abort())

const home = await ctx.newPage()
await home.goto(BASE, { waitUntil: 'domcontentloaded' })
const navPaths = await home.$$eval('a[href^="/"]', (as) => [...new Set(as.map((a) => a.getAttribute('href').split('?')[0]))])
await home.close()
const categories = navPaths.filter((p) => !SKIP.test(p))
console.log(`categorias: ${categories.length}`)

const bySlug = new Map() // path -> { categories:Set }
async function crawlCategory(path) {
  const page = await ctx.newPage()
  try {
    for (let n = 1; n <= 8; n++) {
      const resp = await page.goto(`${BASE}${path}${n > 1 ? `?page=${n}` : ''}`, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => null)
      if (!resp || resp.status() >= 400) break
      const links = await page.$$eval('.list-products a[href^="/produto/"], .product-block a[href^="/produto/"]', (as) => [...new Set(as.map((a) => a.getAttribute('href').split('?')[0]))])
      let added = 0
      for (const l of links) {
        if (!bySlug.has(l)) bySlug.set(l, { categories: new Set() })
        if (!bySlug.get(l).categories.has(path)) { bySlug.get(l).categories.add(path); added++ }
      }
      if (!added) break
    }
  } finally { await page.close() }
}
const queue = [...categories]
await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) await crawlCategory(queue.shift()) }))
// Produtos da home (alguns só aparecem lá)
const h2 = await ctx.newPage()
await h2.goto(BASE, { waitUntil: 'domcontentloaded' })
for (const l of await h2.$$eval('a[href^="/produto/"]', (as) => [...new Set(as.map((a) => a.getAttribute('href').split('?')[0]))])) if (!bySlug.has(l)) bySlug.set(l, { categories: new Set() })
await h2.close()
console.log(`produtos encontrados: ${bySlug.size}`)

async function scrapeProduct(path) {
  const page = await ctx.newPage()
  try {
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 40000 })
    await page.waitForSelector('.cmp-price-container, [data-main-product-price]', { timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(600)
    return await page.evaluate(() => {
      const txt = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '')
      const num = (s) => { const m = s && s.replace(/ /g, ' ').match(/R\$\s*([\d.]+,\d{2})/); return m ? parseFloat(m[1].replace(/\./g, '').replace(',', '.')) : null }
      const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => { try { return JSON.parse(s.textContent) } catch { return null } }).find((j) => j && j['@type'] === 'Product')
      const priceBox = document.querySelector('[data-main-product-price]')
      const original = num(txt(priceBox?.querySelector('.cmp-price-original-price')))
      const sale = num(txt(priceBox?.querySelector('.cmp-price-sale-price')))
      const plain = num(txt(priceBox))
      const price = sale ?? plain ?? ld?.offers?.[0]?.price ?? null
      const listPrice = original ?? price
      const inst = txt(priceBox?.querySelector('.cmp-price-installments'))
      const images = [...document.querySelectorAll('[data-main-slider] a[data-image-product]')].map((a) => a.getAttribute('href'))
      const sections = [...document.querySelectorAll('.secondary-infos .titulo')].map((t) => ({ title: txt(t), html: document.querySelector(t.getAttribute('data-content'))?.innerHTML.trim() ?? '' }))
      const sizes = [...document.querySelectorAll('.option-Tamanho input')].map((i) => i.value)
      const desc = document.querySelector('.short-description')
      return {
        id: Number(document.querySelector('[data-product-box]')?.getAttribute('data-product-box')),
        name: txt(document.querySelector('h1.name')),
        lineTag: txt(document.querySelector('.product-line_tag')),
        metaTitle: document.title,
        sku: ld?.sku ?? null,
        gtin: ld?.gtin13 ?? null,
        price, listPrice, installmentsText: inst,
        descriptionHtml: desc ? desc.innerHTML.trim() : '',
        sizes, images, sections,
        available: !document.querySelector('.add-to-cart-button[disabled]'),
      }
    })
  } finally { await page.close() }
}

const out = []
const pq = [...bySlug.keys()]
let done = 0
await Promise.all(Array.from({ length: 4 }, async () => {
  while (pq.length) {
    const path = pq.shift()
    try {
      const p = await scrapeProduct(path)
      out.push({ path, categories: [...bySlug.get(path).categories], ...p })
    } catch (e) { console.warn('falhou', path, e.message) }
    if (++done % 10 === 0) console.log(`${done}/${bySlug.size}`)
  }
}))
out.sort((a, b) => a.id - b.id)
await mkdir('data/raw', { recursive: true })
await writeFile('data/raw/shopkorres.json', JSON.stringify({ scrapedAt: new Date().toISOString(), source: BASE, categories, products: out }, null, 2))
console.log(`ok: ${out.length} produtos`)
await browser.close()
