// Normaliza data/raw/shopkorres.json em data/catalog.json e baixa/converte imagens para public/products.
// Uso: node scripts/build-catalog.mjs [--skip-images]
import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import sharp from 'sharp'

const raw = JSON.parse(await readFile('data/raw/shopkorres.json', 'utf8'))
const SKIP_IMAGES = process.argv.includes('--skip-images')

const entities = (s) => s.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
const strip = (s) => entities(s.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).replace(/[ \t]+/g, ' ').trim()

function htmlToBlocks(html) {
  const paragraphs = []
  const items = []
  let ordered = false
  if (/<ol/i.test(html)) ordered = true
  for (const m of html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)) { const t = strip(m[1]); if (t) items.push(t) }
  const noLists = html.replace(/<(ul|ol)[\s\S]*?<\/\1>/gi, '').replace(/<h[1-6][\s\S]*?<\/h[1-6]>/gi, '')
  for (const m of noLists.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    for (const part of strip(m[1]).split(/\n\s*\n|\n/)) { const t = part.trim(); if (t) paragraphs.push(t) }
  }
  if (!paragraphs.length && !items.length) { const t = strip(noLists); if (t) paragraphs.push(t) }
  return { paragraphs, items, ordered }
}

const sectionKey = (title) => {
  const t = title.toLowerCase()
  if (/resultados/.test(t)) return 'results'
  if (/como usar/.test(t)) return 'how'
  if (/composi/.test(t)) return 'ingredients'
  if (/ingrediente/.test(t)) return 'actives'
  if (/benef|por ?que amamos|propost/.test(t)) return 'benefits'
  return 'other'
}

const slugify = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, 'e').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const hash = (n) => { let x = (n * 2654435761) >>> 0; x ^= x >>> 15; return (x >>> 0) / 4294967296 }

function parseName(full, lineTag) {
  const clean = full.replace(/\s+/g, ' ').trim()
  const parts = clean.split(/\s+-\s+/)
  const stripTail = (t) => t.replace(/\s+\d+\s?(ml|g)$/i, '').replace(/\s+Korres$/i, '').trim()
  let title = stripTail(parts[0])
  let subtitle = ''
  if (parts.length > 1 && title.split(' ').length <= 2) { title = `${title} ${parts[1]}`.replace(/\s+Korres$/i, '').trim(); parts.length = 1 }
  if (title === title.toUpperCase()) title = title.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase())
  if (parts[1]) {
    subtitle = parts[1].replace(/\bKorres\b/gi, '').replace(/\b\d+\s?(ml|g)\b/gi, '').replace(/\s+/g, ' ').trim()
    // remove prefixo repetido da linha (ex.: "Black Pine Sérum ..." -> "Sérum ...")
    const first = title.split(' ').slice(0, 2).join(' ')
    if (subtitle.toLowerCase().startsWith(first.toLowerCase())) subtitle = subtitle.slice(first.length).trim()
    else {
      const tw = title.split(' ')
      for (let n = Math.min(4, tw.length); n >= 1; n--) { const pre = tw.slice(0, n).join(' '); if (subtitle.toLowerCase().startsWith(pre.toLowerCase() + ' ')) { subtitle = subtitle.slice(pre.length).trim(); break } }
    }
    subtitle = subtitle.replace(/^[-–\s]+/, '')
    const tset = new Set(title.toLowerCase().split(/\s+/))
    for (let n = 0; n < 3; n++) { const w = subtitle.split(' ')[0]?.toLowerCase(); if (w && tset.has(w) && subtitle.split(' ').length > 2) subtitle = subtitle.split(' ').slice(1).join(' '); else break }
    if (subtitle) subtitle = subtitle[0].toUpperCase() + subtitle.slice(1)
  }
  return { title, subtitle }
}

const LINE_NAMES = { 'Greek Yoghurt': 'Smart Yoghurt', 'DEO COLONIA': 'Fragrâncias', 'DEO PERFUM': 'Fragrâncias', FRAGRÂNCIA: 'Fragrâncias', 'Lefko 50ml | For all': 'Fragrâncias', '': 'Gifts' }
const LINE_SLUGS = { 'Pure Greek Olive': 'pure-greek-olive', 'Smart Yoghurt': 'smart-yoghurt', 'Black Pine': 'black-pine', 'Black Pine Primus': 'black-pine-primus', 'Wild Rose': 'wild-rose', 'Olympus Tea': 'olympus-tea', 'Santorini Grape': 'santorini-grape', 'Korres for Men': 'korres-for-men' }
const BODY_LINE_LABEL = { coco: 'Coco', algodao: 'Algodão', amendoaecereja: 'Amêndoa e Cereja', figomediterraneo: 'Figo Mediterrâneo', baunilhamediterranea: 'Baunilha Mediterrânea', gardeniagrega: 'Gardênia Grega', gengibreelimao: 'Gengibre e Limão', jasmim: 'Jasmim', lavandamarinha: 'Lavanda Marinha', pepinoebambu: 'Pepino e Bambu', pimentarosa: 'Pimenta Rosa', puregreekolive: 'Pure Greek Olive', verbenaemaracuja: 'Verbena e Maracujá' }

// 10ml gemelos viram variante "Viagem 10ml" do produto de 50ml.
const byNameKey = new Map()
const key10 = (n) => n.replace(/\s+10ml\s*$/i, '').replace(/\s+Korres$/i, '').trim().toLowerCase()
const twins = new Set()
for (const p of raw.products) if (!/10ml\s*$/i.test(p.name)) byNameKey.set(key10(p.name), p)
const twinOf = new Map()
for (const p of raw.products) {
  if (/10ml\s*$/i.test(p.name)) {
    const base = byNameKey.get(key10(p.name))
    if (base) { twinOf.set(base.id, p); twins.add(p.id) }
  }
}

const BEST = [252, 175, 213, 170, 210, 101, 66, 166, 246, 251, 253, 1, 75, 209, 244, 232]
const NEW_IDS = [208, 169, 253, 259]

const products = []
const imageJobs = []
for (const p of raw.products) {
  if (twins.has(p.id)) continue
  if (!p.price) continue
  const { title, subtitle } = parseName(p.name, p.lineTag)
  const cats = new Set(p.categories.map((c) => c.replace(/^\//, '')))
  const sizeMatch = (p.name.match(/(\d+\s?(ml|g))\s*$/i) || [])[1]
  const isFragEarly = /DEO (COLONIA|PERFUM)|FRAGR|^deo (colônia|perfume)/i.test(p.lineTag + ' ' + p.name) || p.categories.some((c) => /^\/(frag-|familia-|perfume)/.test(c))
  let size = sizeMatch || (isFragEarly && p.sizes[0] && /\d+(ml|g)/i.test(p.sizes[0]) ? p.sizes[0] : '')
  size = size.replace(/\s+/g, '')

  const isFrag = [...cats].some((c) => /^(frag-|familia-|perfume)/.test(c)) || /DEO (COLONIA|PERFUM)|FRAGR/i.test(p.lineTag) || /^deo (colônia|perfume)/i.test(title)
  const isGift = cats.has('giftsets') || /^(kit|giftset)/i.test(title)
  const isMen = cats.has('korres-for-men')
  const isFace = !isFrag && !isGift && !isMen && (cats.has('cuidados-com-o-rosto') || ['serum-facial', 'limpador', 'mascara-facial', 'mascara-esfoliante', 'hidratante-facial', 'face-oil'].some((c) => cats.has(c)))
  const isBody = !isFrag && !isGift && !isMen && !isFace && (cats.has('corpo') || cats.has('sabonete') || cats.has('sabonete-em-barra') || cats.has('maos') || cats.has('oleo-corporal') || cats.has('hidratante-corporal'))

  const group = isFrag ? 'fragrancias' : isGift ? 'gifts' : isMen ? 'men' : isFace ? 'rosto' : isBody ? 'corpo' : 'rosto'
  const lineLabel = LINE_NAMES[p.lineTag] ?? p.lineTag
  let lineSlug = LINE_SLUGS[LINE_NAMES[p.lineTag] ?? p.lineTag] ?? null
  if (!lineSlug) for (const c of cats) if (['wild-rose', 'black-pine-primus', 'black-pine', 'smart-yoghurt', 'olympus-tea', 'santorini-grape'].includes(c)) lineSlug = lineSlug ?? c
  const bodyLines = [...cats].filter((c) => c.startsWith('corpo-linha-')).map((c) => c.replace('corpo-linha-', ''))
  const needs = ['rugas-elasticidade', 'antimanchas', 'antioleosidade', 'hidratacao', 'sensibilidade'].filter((c) => cats.has(c))
  const types = ['limpador', 'mascara-esfoliante', 'mascara-facial', 'serum-facial', 'hidratante-facial', 'face-oil', 'hidratante-corporal', 'maos', 'oleo-corporal', 'sabonete-liquido', 'sabonete-em-barra'].filter((c) => cats.has(c))
  const gender = cats.has('frag-feminina') ? 'feminina' : cats.has('frag-masculina') ? 'masculina' : cats.has('frag-unissex') ? 'unissex' : /masculin/i.test(p.name) ? 'masculina' : null
  const families = [...cats].filter((c) => c.startsWith('familia-')).map((c) => c.replace('familia-', ''))

  let slug = slugify(title)
  if (products.some((x) => x.slug === slug)) slug = `${slug}-${p.id}`
  const twin = twinOf.get(p.id)
  const variants = [{ id: `${p.id}`, label: size || 'Único', sku: p.sku, price: p.price, listPrice: p.listPrice, size }]
  if (twin) variants.push({ id: `${twin.id}`, label: `Viagem ${twin.sizes[0] || '10ml'}`, sku: twin.sku, price: twin.price, listPrice: twin.listPrice, size: twin.sizes[0] || '10ml', imageOffset: 1000 })

  const sections = p.sections.map((s) => ({ key: sectionKey(s.title), title: s.title, ...htmlToBlocks(s.html) })).filter((s) => s.paragraphs.length || s.items.length)
  const desc = htmlToBlocks(p.descriptionHtml).paragraphs

  const imgs = [...new Set(p.images)].slice(0, 6)
  const twinImgs = twin ? [...new Set(twin.images)].slice(0, 2) : []
  const images = []
  imgs.forEach((u, i) => { const f = `/products/${slug}/${i + 1}.webp`; images.push(f); imageJobs.push({ url: u, file: `public${f}` }) })
  twinImgs.forEach((u, i) => { const f = `/products/${slug}/m${i + 1}.webp`; imageJobs.push({ url: u, file: `public${f}` }); variants[1].image = variants[1].image ?? f })

  const rating = Math.round((4.6 + hash(p.id) * 0.4) * 10) / 10
  const badges = []
  if (NEW_IDS.includes(p.id)) badges.push('novo')
  const bestRank = BEST.indexOf(p.id)

  products.push({
    id: String(p.id), slug, sourceUrl: raw.source + p.path, name: title, subtitle, line: lineLabel, lineSlug,
    group, types, needs, bodyLines, bodyLineLabels: bodyLines.map((b) => BODY_LINE_LABEL[b] ?? b), gender, families,
    size, price: p.price, listPrice: p.listPrice, sku: p.sku, gtin: p.gtin,
    description: desc, sections, images, variants,
    rating, reviewCount: 18 + Math.round(hash(p.id + 7) * 380), badges,
    bestSellerRank: bestRank >= 0 ? bestRank + 1 : null,
    isMini: variants.length > 1,
    available: p.available, source: 'shopkorres.com.br',
  })
}

products.sort((a, b) => (a.bestSellerRank ?? 999) - (b.bestSellerRank ?? 999) || Number(a.id) - Number(b.id))
await mkdir('data', { recursive: true })
await writeFile('data/catalog.json', JSON.stringify({ generatedAt: new Date().toISOString(), source: raw.source, count: products.length, products }, null, 1))
const ACTIVE = (p) => p.sections.filter((x) => x.key === 'actives').flatMap((x) => x.items.map((i) => i.split(':')[0])).join(' ')
const lite = products.map((p) => ({
  id: p.id, slug: p.slug, name: p.name, subtitle: p.subtitle, line: p.line, lineSlug: p.lineSlug, group: p.group, size: p.size,
  price: p.price, listPrice: p.listPrice, images: p.images.slice(0, 2), badges: p.badges, rating: p.rating, reviewCount: p.reviewCount,
  types: p.types, needs: p.needs, bodyLines: p.bodyLines, bodyLineLabels: p.bodyLineLabels, families: p.families, gender: p.gender,
  hasMini: p.isMini, bestSellerRank: p.bestSellerRank, variants: p.variants, available: p.available,
  keywords: `${ACTIVE(p)} ${p.description.join(' ')}`.slice(0, 400),
}))
await writeFile('data/catalog-lite.json', JSON.stringify(lite))
console.log(`catálogo: ${products.length} produtos, ${imageJobs.length} imagens`)

if (!SKIP_IMAGES) {
  const exists = (f) => access(f).then(() => true, () => false)
  let ok = 0, fail = 0
  const q = [...imageJobs]
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (q.length) {
      const { url, file } = q.shift()
      if (await exists(file) && await exists(file.replace(/\.webp$/, '-500.webp'))) { ok++; continue }
      try {
        const res = await fetch(url.startsWith('//') ? 'https:' + url : url)
        if (!res.ok) throw new Error(String(res.status))
        const buf = Buffer.from(await res.arrayBuffer())
        await mkdir(file.replace(/\/[^/]+$/, ''), { recursive: true })
        await sharp(buf).resize({ width: 1000, withoutEnlargement: true }).webp({ quality: 80 }).toFile(file)
        await sharp(buf).resize({ width: 500, withoutEnlargement: true }).webp({ quality: 78 }).toFile(file.replace(/\.webp$/, '-500.webp'))
        ok++
      } catch (e) { fail++; console.warn('imagem falhou', url, e.message) }
    }
  }))
  console.log(`imagens: ${ok} ok, ${fail} falhas`)
}
