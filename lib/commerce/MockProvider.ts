import { collectionProducts, getCollectionBySlug, allProducts, searchProducts } from './catalog'
import { buildOrder } from '@/lib/orders/build'
import { quoteShipping, type QuoteRequest } from '@/lib/shipping/quote'
import type { CommerceProvider, Order, OrderInput, Product } from './types'

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Implementação 100% simulada. As chamadas de frete e pedido tentam primeiro a rota /api (Pages Function)
 * e caem para o cálculo local, que usa exatamente o mesmo código.
 */
export class MockProvider implements CommerceProvider {
  async getProducts() {
    return allProducts
  }

  async getProduct(slug: string): Promise<Product | null> {
    const full = (await import('@/data/catalog.json')).default as unknown as { products: Product[] }
    return full.products.find((p) => p.slug === slug) ?? null
  }

  async getCollection(slug: string) {
    const collection = getCollectionBySlug(slug)
    return collection ? { collection, products: collectionProducts(slug) } : null
  }

  async search(query: string, limit = 24) {
    return searchProducts(query, limit)
  }

  async quoteShipping(req: QuoteRequest) {
    // Latência curta e realista para exercitar os estados de carregamento.
    await wait(260)
    return quoteShipping({ ...req, now: req.now ?? Date.now() })
  }

  async createOrder(input: OrderInput): Promise<Order> {
    await wait(900)
    try {
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) })
      if (res.ok) return (await res.json()) as Order
    } catch {
      /* sem backend (ex.: next dev): segue com o cálculo local */
    }
    return buildOrder(input)
  }
}
