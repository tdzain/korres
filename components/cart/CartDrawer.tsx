'use client'
import Link from 'next/link'
import { AnimatePresence, m as motion } from 'motion/react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { CloseButton, Drawer, EASE_IOS, cascade } from '@/components/ui/Overlay'
import { PriceTag, Stepper } from '@/components/ui/misc'
import { ProductImage } from '@/components/product/ProductImage'
import { QuickAdd } from '@/components/product/QuickAdd'
import { allProducts, bestSellers } from '@/lib/commerce/catalog'
import type { ProductSummary } from '@/lib/commerce/types'
import { formatBRL } from '@/lib/format/money'
import { bestInstallment } from '@/lib/pricing'
import { MAX_QTY, useCart } from '@/lib/store/cart'
import { type CartLine, useCartLines } from '@/lib/store/lines'
import { DeliveryEstimate } from './DeliveryEstimate'
import { FreeShippingBar } from './FreeShippingBar'

/** "Complete a rotina": produtos da mesma linha/grupo que ainda não estão na sacola. */
function routineSuggestions(lines: CartLine[]): ProductSummary[] {
  const inCart = new Set(lines.map((l) => l.product.id))
  const lineSlugs = new Set(lines.map((l) => l.product.lineSlug).filter(Boolean))
  const groups = new Set(lines.map((l) => l.product.group))
  const score = (p: ProductSummary) => (p.lineSlug && lineSlugs.has(p.lineSlug) ? 3 : 0) + (groups.has(p.group) ? 1 : 0) + (p.bestSellerRank ? 1 : 0)
  const pool = lines.length ? allProducts : bestSellers()
  return pool.filter((p) => !inCart.has(p.id) && p.price <= 400).sort((a, b) => score(b) - score(a)).slice(0, 5)
}

/** A linha expande a altura (conteúdo interno com padding próprio: sem salto) e some para o lado ao remover. */
function Line({ line }: { line: CartLine }) {
  const setQty = useCart((s) => s.setQty)
  const remove = useCart((s) => s.remove)
  const close = () => useCart.getState().setOpen(false)
  const { product: p, variant: v } = line
  return (
    <motion.li
      layout="position"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1, transition: { height: { duration: 0.45, ease: EASE_IOS }, opacity: { duration: 0.35, delay: 0.1 } } }}
      exit={{ height: 0, opacity: 0, x: 32, transition: { duration: 0.3, ease: EASE_IOS } }}
      className="overflow-hidden border-b border-hairline"
      data-testid="cart-line"
    >
      <div className="flex gap-3 p-4">
        <Link href={`/produto/${p.slug}/`} onClick={close} className="size-[88px] shrink-0 border border-hairline"><ProductImage src={line.image} alt={p.name} sizes="88px" /></Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/produto/${p.slug}/`} onClick={close} className="t-label line-clamp-2 text-[14px] leading-snug hover:underline">{p.name}</Link>
            <button type="button" onClick={() => remove(v.id)} className="-mr-2 -mt-2 grid min-h-11 min-w-11 place-items-center font-mono text-[12.5px] text-muted underline" aria-label={`Remover ${p.name}`}>remover</button>
          </div>
          {(p.variants.length > 1 || v.size) && <p className="t-mono">{v.label}</p>}
          <div className="mt-auto flex items-end justify-between gap-2 pt-2">
            <Stepper size="sm" value={line.qty} min={0} max={MAX_QTY} onChange={(n) => setQty(v.id, n)} label={`Quantidade de ${p.name}`} />
            <PriceTag price={line.lineTotal} listPrice={v.listPrice * line.qty} />
          </div>
        </div>
      </div>
    </motion.li>
  )
}

export function CartDrawer() {
  const open = useCart((s) => s.open)
  const setOpen = useCart((s) => s.setOpen)
  const { lines, subtotal, count } = useCartLines()
  const close = () => setOpen(false)
  const suggestions = useMemo(() => routineSuggestions(lines), [lines])
  const inst = bestInstallment(subtotal)

  return (
    <Drawer open={open} onClose={close} label="Sacola de compras">
      <motion.div variants={cascade} className="flex items-center justify-between border-b border-hairline pl-4 pr-1">
        <h2 className="text-[16px] font-medium uppercase tracking-[0.5px] text-brand">Sacola <span className="font-mono font-normal">({count})</span></h2>
        <CloseButton onClick={close} label="Fechar sacola" />
      </motion.div>

      <AnimatePresence mode="wait" initial={false}>
        {lines.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.1 } }} exit={{ opacity: 0, transition: { duration: 0.15 } }} className="flex flex-1 flex-col overflow-auto">
            <div className="p-8 text-center">
              <p className="font-hand text-[44px] leading-none text-brand">Sua sacola está vazia</p>
              <p className="t-mono mt-3">Que tal começar pelos mais vendidos?</p>
              <div className="mt-6 flex justify-center"><Button href="/colecao/mais-vendidos/" onClick={close}>Ver mais vendidos</Button></div>
            </div>
            <Suggestions items={suggestions} title="Queridinhos da Grécia" />
          </motion.div>
        ) : (
          <motion.div key="full" className="flex min-h-0 flex-1 flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.25 } }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
            <motion.div variants={cascade}><FreeShippingBar subtotal={subtotal} className="border-b border-hairline" /></motion.div>
            <motion.div variants={cascade} className="min-h-0 flex-1 overflow-auto overscroll-contain">
              <ul>
                <AnimatePresence initial={false}>{lines.map((l) => <Line key={l.variant.id} line={l} />)}</AnimatePresence>
              </ul>
              <Suggestions items={suggestions} title="Complete a rotina" subtitle="The routine edit" />
            </motion.div>
            <motion.div variants={cascade} className="space-y-3 border-t border-hairline bg-white p-4 pb-safe-lg">
              <DeliveryEstimate subtotal={subtotal} />
              <div className="flex items-baseline justify-between text-brand">
                <span className="t-caps">Subtotal</span>
                <AnimatedNumber value={subtotal} className="text-[20px] font-normal" />
              </div>
              <p className="t-mono -mt-2 text-right">ou {inst.count}x de {formatBRL(inst.value)} sem juros · Pix com 5% off</p>
              <Button href="/checkout/" onClick={close} full size="lg" arrow>Prosseguir com sua compra</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Drawer>
  )
}

/** Carrossel com snap; os cartões têm quantidade inline (sem fechar nem abrir nada). */
function Suggestions({ items, title, subtitle }: { items: ProductSummary[]; title: string; subtitle?: string }) {
  if (!items.length) return null
  return (
    <section className="border-b border-hairline py-5" aria-label={title}>
      <div className="px-4">
        <h3 className="t-caps text-brand">{title}</h3>
        {subtitle && <p className="t-mono">{subtitle}</p>}
      </div>
      <ul className="scroll-x mt-3 flex gap-3 px-4 pb-1 [scroll-padding-inline:16px]">
        {items.map((p) => (
          <li key={p.id} className="w-[172px] shrink-0 border border-hairline bg-white">
            <Link href={`/produto/${p.slug}/`} onClick={() => useCart.getState().setOpen(false)} className="block aspect-square p-2"><ProductImage src={p.images[0]!} alt={p.name} sizes="172px" /></Link>
            <div className="p-2 pt-0">
              <p className="t-label line-clamp-2 min-h-8 text-[13px]">{p.name}</p>
              <p className="t-mono mb-2">{formatBRL(p.price)}</p>
              <QuickAdd product={p} fly={false} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
