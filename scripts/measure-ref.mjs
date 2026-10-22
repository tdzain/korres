import { chromium } from '@playwright/test'
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
await p.goto('https://www.korres.com/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(4000)
const pick = ['body','header nav a','.announcement-bar, [class*=announcement]','h1','h2','[class*=badge], [class*=Badge]','a[href*="/products/"]','button']
const out = await p.evaluate(() => {
  const g = (el) => { if (!el) return null; const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return { tag: el.tagName, cls: String(el.className).slice(0,60), text: el.textContent.trim().slice(0,40), ff: s.fontFamily.slice(0,70), fs: s.fontSize, fw: s.fontWeight, lh: s.lineHeight, ls: s.letterSpacing, color: s.color, bg: s.backgroundColor, tt: s.textTransform, h: Math.round(r.height), w: Math.round(r.width), border: s.border.slice(0,50), pad: s.padding } }
  const q = (sel, i = 0) => g([...document.querySelectorAll(sel)][i])
  const byText = (t) => g([...document.querySelectorAll('a,button,span,div,h1,h2,h3,p')].find((e) => e.children.length === 0 && e.textContent.trim().toLowerCase() === t.toLowerCase()))
  return {
    body: q('body'), shopLink: byText('Shop'), trending: byText('Trending Now'), sub: byText('These favorites are waiting for you.'),
    shopNow: byText('Shop now'), offer: [...document.querySelectorAll('*')].filter((e)=>e.children.length===0 && /Offer excludes/.test(e.textContent)).map(g)[0],
    badge: byText('30% OFF'), priceCurrent: g([...document.querySelectorAll('*')].find((e)=>e.children.length===0 && /^\$33\.60$/.test(e.textContent.trim()))),
    productName: byText('Pure Greek Olive 3-In-1 Nourishing Oil'), shopAll: byText('Shop All'), search: q('input[type=search], input[type=text]'),
    announce: byText('Join KORRES Circle. Earn Up To 1.5X Points Per Order'), cookie: byText('Accept'), footerHead: byText('Help & Information'), footerLink: byText('FAQ'),
    logo: g(document.querySelector('header a[href="/"] svg, header a[href="/"] img')),
    headerH: g(document.querySelector('header')),
  }
})
console.log(JSON.stringify(out, null, 1))
await b.close()
