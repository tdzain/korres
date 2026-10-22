import type { QuoteRequest, ShippingMethodId, ShippingOption } from '@/lib/shipping/quote'

export type ProductGroup = 'rosto' | 'corpo' | 'fragrancias' | 'gifts' | 'men'

export interface Variant {
  id: string
  label: string
  sku: string | null
  price: number
  listPrice: number
  size: string
  image?: string
}

export interface ProductSummary {
  id: string
  slug: string
  name: string
  subtitle: string
  line: string
  lineSlug: string | null
  group: ProductGroup
  size: string
  price: number
  listPrice: number
  images: string[]
  badges: string[]
  rating: number
  reviewCount: number
  types: string[]
  needs: string[]
  bodyLines: string[]
  bodyLineLabels: string[]
  families: string[]
  gender: string | null
  hasMini: boolean
  bestSellerRank: number | null
  variants: Variant[]
  available: boolean
  keywords: string
}

export interface ProductSection {
  key: 'benefits' | 'results' | 'how' | 'ingredients' | 'actives' | 'other'
  title: string
  paragraphs: string[]
  items: string[]
  ordered: boolean
}

export interface Product extends Omit<ProductSummary, 'images'> {
  sourceUrl: string
  description: string[]
  sections: ProductSection[]
  images: string[]
  sku: string | null
  gtin: string | null
  source: string
}

export interface Collection {
  slug: string
  title: string
  subtitle: string
  kind: 'categoria' | 'linha' | 'necessidade' | 'tipo' | 'corpo' | 'fragrancia' | 'especial'
  cover?: string
}

export interface OrderItemInput {
  variantId: string
  slug: string
  name: string
  variantLabel: string
  image: string
  qty: number
  unitPrice: number
}

export interface OrderInput {
  contact: { email: string; phone: string; marketing: boolean }
  customer: { firstName: string; lastName: string; cpf: string }
  address: { cep: string; street: string; number: string; complement?: string; neighborhood: string; city: string; uf: string; reference?: string }
  shippingMethod: ShippingMethodId
  payment: { method: 'pix' | 'card' | 'boleto'; installments?: number; cardBrand?: string }
  items: OrderItemInput[]
  coupon?: string | null
}

export interface OrderTotals {
  subtotal: number
  couponDiscount: number
  pixDiscount: number
  shipping: number
  total: number
}

export type OrderStatus = 'awaiting_payment' | 'paid'

export interface Order extends OrderInput {
  id: string
  createdAt: string
  status: OrderStatus
  totals: OrderTotals
  shipping: ShippingOption
  pix?: { code: string; expiresAt: string }
  boleto?: { line: string; dueDate: string }
}

export interface CommerceProvider {
  getProducts(): Promise<ProductSummary[]>
  getProduct(slug: string): Promise<Product | null>
  getCollection(slug: string): Promise<{ collection: Collection; products: ProductSummary[] } | null>
  search(query: string, limit?: number): Promise<ProductSummary[]>
  quoteShipping(req: QuoteRequest): Promise<ShippingOption[]>
  createOrder(input: OrderInput): Promise<Order>
}
