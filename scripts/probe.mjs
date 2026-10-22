import { chromium } from '@playwright/test'
const b = await chromium.launch()
const p = await b.newPage()
const reqs = []
p.on('request', r => { const u = r.url(); if (/vnda|shopkorres/.test(u) && /(price|promo|api|json)/i.test(u)) reqs.push(u) })
await p.goto('https://www.shopkorres.com.br/produto/black-pine-360-eye-lift-super-serum-black-pine-3d-eye-lift-super-serum-olhos-korres-15ml-66', { waitUntil: 'networkidle' })
console.log(reqs.slice(0, 20))
console.log(await p.locator('[data-main-product-price]').first().innerText())
console.log(await p.locator('[data-main-product-price]').first().innerHTML())
await b.close()
