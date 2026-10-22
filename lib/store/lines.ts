'use client'
import { useMemo } from 'react'
import { getByVariant } from '@/lib/commerce/catalog'
import type { ProductSummary, Variant } from '@/lib/commerce/types'
import { roundMoney } from '@/lib/format/money'
import { useCart } from './cart'

export interface CartLine {
  product: ProductSummary
  variant: Variant
  qty: number
  image: string
  lineTotal: number
}

/** Linhas do carrinho resolvidas contra o catálogo + subtotal e contagem. */
export function useCartLines() {
  const items = useCart((s) => s.items)
  return useMemo(() => {
    const lines: CartLine[] = []
    for (const it of items) {
      const hit = getByVariant(it.variantId)
      if (!hit) continue
      const { product, variant } = hit
      lines.push({ product, variant, qty: it.qty, image: variant.image ?? product.images[0] ?? '', lineTotal: roundMoney(variant.price * it.qty) })
    }
    const subtotal = roundMoney(lines.reduce((s, l) => s + l.lineTotal, 0))
    const count = lines.reduce((s, l) => s + l.qty, 0)
    return { lines, subtotal, count }
  }, [items])
}
