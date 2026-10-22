'use client'
import { AnimatePresence, m as motion } from 'motion/react'
import { MAX_QTY, useCart } from '@/lib/store/cart'
import { addToBag } from '@/lib/addToBag'
import { cn } from '@/lib/cn'
import { MinusIcon, PlusIcon } from '@/components/ui/Icons'
import type { ProductSummary } from '@/lib/commerce/types'

/**
 * "Adicionar" que vira controle de quantidade (− 1 +) no próprio lugar, sem abrir o drawer:
 * no varejo brasileiro a pessoa costuma levar vários itens e ajustar a quantidade ali mesmo.
 */
export function QuickAdd({ product: p, getSource, fly = true, flyTarget, className, size = 'md' }: { product: ProductSummary; getSource?: () => Element | null; fly?: boolean; flyTarget?: string; className?: string; size?: 'md' | 'lg' }) {
  const variant = p.variants[0]!
  const qty = useCart((s) => s.items.find((i) => i.variantId === variant.id)?.qty ?? 0)
  const setQty = useCart((s) => s.setQty)
  const h = size === 'lg' ? 'h-12' : 'h-11'
  const step = (n: number) => setQty(variant.id, n)

  return (
    <div className={cn('relative', h, className)}>
      <AnimatePresence mode="wait" initial={false}>
        {qty === 0 ? (
          <motion.button
            key="add"
            type="button"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); void addToBag({ slug: p.slug, variantId: variant.id, name: p.name, image: p.images[0]! }, 1, fly ? (getSource?.() ?? null) : null, { openDrawer: false, silent: true, flyTarget }) }}
            className={cn('absolute inset-0 w-full border border-brand bg-brand text-[13px] uppercase tracking-[0.5px] text-white transition-colors active:bg-[#04106f]', 'hover:bg-[#0a14b8]')}
            data-testid="quick-add"
          >
            Adicionar
          </motion.button>
        ) : (
          <motion.div
            key="step"
            role="group"
            aria-label={`Quantidade de ${p.name}`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0 grid grid-cols-[44px_1fr_44px] items-stretch border border-brand bg-white text-brand"
            onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
          >
            <button type="button" aria-label={qty === 1 ? `Remover ${p.name} da sacola` : 'Diminuir quantidade'} onClick={() => step(qty - 1)} className="grid place-items-center transition-colors hover:bg-tint active:bg-tint"><MinusIcon size={16} /></button>
            <span className="grid place-items-center font-mono text-[14px] tabular-nums" aria-live="polite" data-testid="quick-qty">{qty}<span className="sr-only"> na sacola</span></span>
            <button type="button" aria-label="Aumentar quantidade" disabled={qty >= MAX_QTY} onClick={() => step(qty + 1)} className="grid place-items-center transition-colors hover:bg-tint active:bg-tint disabled:opacity-40"><PlusIcon size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
