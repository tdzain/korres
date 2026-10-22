import lite from '@/data/catalog-lite.json'
import { COLLECTIONS, collectionMeta } from '@/data/collections'
import { normalizeName } from '@/data/brazil'
import type { Collection, ProductSummary } from './types'

export const allProducts = lite as unknown as ProductSummary[]

const bySlug = new Map(allProducts.map((p) => [p.slug, p]))
const byVariant = new Map(allProducts.flatMap((p) => p.variants.map((v) => [v.id, { product: p, variant: v }] as const)))

export const getSummary = (slug: string) => bySlug.get(slug)
export const getByVariant = (variantId: string) => byVariant.get(variantId)

export const bestSellers = () =>
  allProducts.filter((p) => p.bestSellerRank !== null).sort((a, b) => a.bestSellerRank! - b.bestSellerRank!)

export const collectionProducts = (slug: string): ProductSummary[] => {
  const def = COLLECTIONS.find((c) => c.slug === slug)
  if (!def) return []
  const list = allProducts.filter(def.match)
  return slug === 'mais-vendidos' ? list.sort((a, b) => a.bestSellerRank! - b.bestSellerRank!) : list
}

export const collections = (): Collection[] =>
  COLLECTIONS.filter((c) => collectionProducts(c.slug).length > 0).map((c) => {
    const first = collectionProducts(c.slug)[0]
    return { ...collectionMeta(c), cover: first?.images[0] }
  })

export const getCollectionBySlug = (slug: string) => collections().find((c) => c.slug === slug)

/** Peso por campo para a busca (nome > linha/tipo > palavras-chave). */
export function searchProducts(query: string, limit = 24): ProductSummary[] {
  const terms = normalizeName(query).split(' ').filter(Boolean)
  if (!terms.length) return []
  return allProducts
    .map((p) => {
      const name = normalizeName(`${p.name} ${p.subtitle}`)
      const meta = normalizeName(`${p.line} ${p.types.join(' ')} ${p.needs.join(' ')} ${p.bodyLineLabels.join(' ')} ${p.families.join(' ')} ${p.group}`)
      const kw = normalizeName(p.keywords)
      let score = 0
      for (const t of terms) {
        if (name.includes(t)) score += name.startsWith(t) ? 12 : 8
        else if (meta.includes(t)) score += 5
        else if (kw.includes(t)) score += 2
        else return { p, score: 0 }
      }
      return { p, score: score + (p.bestSellerRank ? 1 : 0) }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.p)
}

export const categoryFor = (p: { group: string }) => {
  const slug = p.group === 'men' ? 'korres-for-men' : p.group
  const c = getCollectionBySlug(slug)
  return { label: c?.title ?? 'Loja', href: `/colecao/${slug}/` }
}
