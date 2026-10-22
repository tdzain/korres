'use client'
import Link from 'next/link'
import { useRef } from 'react'
import { Badge, PriceTag, Rating } from '@/components/ui/misc'
import { discountPercent } from '@/lib/format/money'
import { addToBag } from '@/lib/addToBag'
import type { ProductSummary } from '@/lib/commerce/types'
import { cn } from '@/lib/cn'
import { FavoriteButton } from './FavoriteButton'
import { ProductImage } from './ProductImage'

/** Célula do grid hairline: badge, nota, imagem com 2ª imagem no hover e botão "Adicionar" que sobe de baixo. */
export function ProductCard({ product: p, priority, sizes }: { product: ProductSummary; priority?: boolean; sizes?: string }) {
  const imgRef = useRef<HTMLDivElement>(null)
  const off = discountPercent(p.listPrice, p.price)
  const href = `/produto/${p.slug}/`
  const variant = p.variants[0]!
  const second = p.images[1]
  return (
    <article className="group relative flex h-full flex-col bg-white p-3 md:p-4" data-testid="product-card">
      <div className="relative z-10 flex min-h-6 items-start justify-between">
        <div className="flex flex-col items-start gap-1">
          {off >= 3 && <Badge>{off}% off</Badge>}
          {p.badges.includes('novo') && <Badge kind="new">Novo</Badge>}
        </div>
        <div className="flex items-center gap-1">
          <Rating value={p.rating} />
        </div>
      </div>
      <FavoriteButton id={p.id} name={p.name} className="absolute right-2 top-7 z-10 md:right-3" />

      <Link href={href} className="relative mt-1 block" aria-label={p.name} tabIndex={-1}>
        <div ref={imgRef} className="relative aspect-[4/4.6] overflow-hidden">
          <ProductImage src={p.images[0]!} alt={p.name} priority={priority} sizes={sizes} className="transition-opacity duration-500 ease-[var(--ease-out)]" />
          {second && (
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 ease-[var(--ease-out)] group-hover:opacity-100 group-focus-within:opacity-100">
              <ProductImage src={second} alt="" sizes={sizes} className="bg-white" />
            </div>
          )}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); void addToBag({ slug: p.slug, variantId: variant.id, name: p.name, image: p.images[0]! }, 1, imgRef.current, { openDrawer: true }) }}
            className={cn('absolute inset-x-0 bottom-0 translate-y-full bg-brand py-3 text-[13px] uppercase tracking-[0.5px] text-white opacity-0 transition-[transform,opacity] duration-300 ease-[var(--ease-out)]', 'group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 max-md:hidden')}
          >
            Adicionar
          </button>
        </div>
      </Link>

      <div className="mt-3 flex flex-1 flex-col justify-end">
        <h3 className="t-label line-clamp-2 min-h-8">
          <Link href={href} className="hover:underline">{p.name}</Link>
        </h3>
        <PriceTag price={p.price} listPrice={p.listPrice} installments className="mt-1" />
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white p-4">
      <div className="skeleton h-5 w-16" />
      <div className="skeleton mt-3 aspect-[4/4.6] w-full" />
      <div className="skeleton mt-3 h-4 w-3/4" />
      <div className="skeleton mt-2 h-4 w-1/3" />
    </div>
  )
}
