'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Accordion, type AccordionItem } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { Badge, PriceTag, Rating, Stepper, VariantChips } from '@/components/ui/misc'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { addToBag } from '@/lib/addToBag'
import type { Product, ProductSection } from '@/lib/commerce/types'
import { discountPercent, formatBRL, roundMoney } from '@/lib/format/money'
import { bestInstallment, pixTotal } from '@/lib/pricing'
import { MAX_QTY, useCart } from '@/lib/store/cart'
import { FavoriteButton } from './FavoriteButton'
import { DeliveryBlock } from './DeliveryBlock'
import { ProductGallery } from './ProductGallery'
import { ProductImage } from './ProductImage'
import { cn } from '@/lib/cn'

const sec = (p: Product, key: ProductSection['key']) => p.sections.filter((s) => s.key === key)

function List({ s }: { s: ProductSection }) {
  const Tag = s.ordered ? 'ol' : 'ul'
  return (
    <div className="space-y-2">
      {s.paragraphs.map((t, i) => <p key={i}>{t}</p>)}
      {s.items.length > 0 && <Tag className={cn('space-y-1.5 pl-4', s.ordered ? 'list-decimal' : 'list-disc')}>{s.items.map((t, i) => <li key={i}>{t}</li>)}</Tag>}
    </div>
  )
}

function naturalContent(p: Product): string | null {
  const text = [...p.description, ...p.sections.flatMap((s) => [...s.paragraphs, ...s.items])].join(' ')
  const m = /(\d{1,3}(?:[.,]\d+)?)\s?%[^.\n]{0,50}origem natural/i.exec(text)
  return m ? `${m[1]}%` : null
}

function Ingredients({ p }: { p: Product }) {
  const [all, setAll] = useState(false)
  const actives = sec(p, 'actives')
  const inci = sec(p, 'ingredients')
  const natural = naturalContent(p)
  return (
    <div className="space-y-3">
      {actives.map((s, i) => <List key={i} s={s} />)}
      {natural && <p className="text-brand">Conteúdo natural: <b className="font-medium">{natural}</b></p>}
      {inci.length > 0 && (
        <div>
          <button type="button" onClick={() => setAll((v) => !v)} aria-expanded={all} className="link-static-underline text-brand">{all ? 'Ocultar lista' : 'Ver todos'}</button>
          {all && <div className="mt-2 space-y-2">{inci.map((s, i) => <List key={i} s={s} />)}</div>}
        </div>
      )}
    </div>
  )
}

function buildAccordion(p: Product): AccordionItem[] {
  const items: AccordionItem[] = []
  const benefits = sec(p, 'benefits')
  if (benefits.length) items.push({ id: 'benefits', title: 'Principais benefícios', content: <div className="space-y-3">{benefits.map((s, i) => <List key={i} s={s} />)}</div> })
  const results = sec(p, 'results')
  if (results.length) items.push({ id: 'results', title: 'Resultados clínicos', content: <div className="space-y-3">{results.map((s, i) => <List key={i} s={s} />)}<p className="border-t border-hairline pt-2 text-[11.5px] leading-snug">*Avaliação in vivo com voluntárias, sob supervisão dermatológica. Os resultados podem variar de pessoa para pessoa.</p></div> })
  const how = sec(p, 'how')
  if (how.length) items.push({ id: 'how', title: 'Como usar', content: <div className="space-y-3">{how.map((s, i) => <List key={i} s={s} />)}</div> })
  if (sec(p, 'actives').length || sec(p, 'ingredients').length) items.push({ id: 'ingredients', title: 'Ingredientes', content: <Ingredients p={p} /> })
  const other = sec(p, 'other')
  other.forEach((s, i) => items.push({ id: `other-${i}`, title: s.title.replace(/\?$/, ''), content: <List s={s} /> }))
  return items
}

export function ProductInfo({ product: p, categoryLabel }: { product: Product; categoryLabel: { label: string; href: string } }) {
  const router = useRouter()
  const [variantId, setVariantId] = useState(p.variants[0]!.id)
  const [qty, setQty] = useState(1)
  const [more, setMore] = useState(false)
  const variant = p.variants.find((v) => v.id === variantId)!
  const total = roundMoney(variant.price * qty)
  const off = discountPercent(variant.listPrice, variant.price)
  const inst = bestInstallment(total)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [ctaVisible, setCtaVisible] = useState(true)
  const accordion = useMemo(() => buildAccordion(p), [p])
  const inCart = useCart((s) => s.items.find((i) => i.variantId === variantId)?.qty ?? 0)

  // Galeria: variante de viagem mostra suas próprias fotos primeiro.
  const images = useMemo(() => {
    if (!variant.image) return p.images
    const m2 = variant.image.replace('m1.webp', 'm2.webp')
    return [variant.image, ...(m2 !== variant.image ? [m2] : []), ...p.images]
  }, [p.images, variant.image])

  useEffect(() => {
    const el = ctaRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setCtaVisible(!!e?.isIntersecting), { threshold: 0.1 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const target = { slug: p.slug, variantId, name: p.name, image: variant.image ?? p.images[0]! }
  const add = (el?: Element | null) => addToBag(target, qty, el ?? document.querySelector('[data-gallery-main] img'))
  const buyNow = async () => { useCart.getState().add({ variantId, slug: p.slug }, qty); router.push('/checkout/') }
  const desc = p.description.join(' ')

  return (
    <>
      <div className="grid border-b border-hairline lg:grid-cols-2">
        <div className="border-hairline lg:border-r"><ProductGallery images={images} name={p.name} /></div>

        <div className="lg:sticky lg:top-[var(--sticky-top)] lg:max-h-[calc(100dvh-var(--sticky-top))] lg:self-start lg:overflow-y-auto lg:transition-[top] lg:duration-300 [scrollbar-width:none]">
          <div className="space-y-5 px-4 pb-10 pt-4">
            <div className="flex items-start justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {off >= 3 && <Badge>{off}% off</Badge>}
                {p.badges.includes('novo') && <Badge kind="new">Novo</Badge>}
                <nav aria-label="Navegação estrutural" className="t-mono"><Link href={categoryLabel.href} className="hover:underline">{categoryLabel.label}</Link></nav>
              </div>
              <FavoriteButton id={p.id} name={p.name} className="-mr-2 -mt-1" />
            </div>

            <div>
              <h1 className="text-[22px] font-medium leading-tight text-brand md:text-[26px]" data-testid="pdp-title">{p.name}</h1>
              {p.subtitle && <p className="t-mono mt-1">{p.subtitle}{p.size ? ` · ${variant.size || p.size}` : ''}</p>}
            </div>

            <div>
              <PriceTag price={variant.price} listPrice={variant.listPrice} size="lg" animated />
              <p className="t-mono mt-1" data-testid="pdp-installments">ou {bestInstallment(variant.price).count}x de {formatBRL(bestInstallment(variant.price).value)} sem juros</p>
              <p className="mt-0.5 text-[13.5px] font-normal text-brand"><AnimatedNumber value={pixTotal(variant.price)} className="font-medium" /> <span className="text-body">no Pix (5% off)</span></p>
            </div>

            <div className="flex items-center gap-3">
              <Rating value={p.rating} count={p.reviewCount} />
              <span className="h-3 w-px bg-hairline" aria-hidden />
              <a href="#avaliacoes" className="link-static-underline font-mono text-[12.5px] text-brand">Escrever avaliação</a>
            </div>

            <div className="font-mono text-[13px] font-light leading-relaxed text-muted">
              <p className={cn(!more && 'line-clamp-3')}>{desc}</p>
              {desc.length > 220 && <button type="button" onClick={() => setMore((m) => !m)} className="link-static-underline text-brand" aria-expanded={more}>{more ? 'Ler menos' : 'Ler mais'}</button>}
            </div>

            {p.variants.length > 1 && (
              <div>
                <p className="t-caps mb-2 text-brand">Tamanho</p>
                <VariantChips options={p.variants} value={variantId} onChange={setVariantId} />
              </div>
            )}

            <DeliveryBlock subtotal={total} />

            <div ref={ctaRef} className="space-y-2">
              <div className="flex items-stretch gap-2">
                <Stepper value={qty} min={1} max={MAX_QTY} onChange={setQty} />
                <div className="flex-1"><Button size="lg" full onClick={(e) => add(e.currentTarget.closest('[data-gallery-main]') ?? undefined)} data-testid="add-to-bag">Adicionar à sacola</Button></div>
              </div>
              <Button variant="outline" size="lg" full onClick={buyNow} data-testid="buy-now">Comprar agora</Button>
              {inCart > 0 && <p className="t-mono">Você já tem {inCart} deste item na sacola.</p>}
            </div>

            <Accordion items={accordion} defaultOpen={accordion[0]?.id} className="border-t border-hairline pt-3" />
          </div>
        </div>
      </div>

      {/* Barra fixa inferior no mobile */}
      <div className={cn('fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-hairline bg-white px-4 py-2.5 transition-transform duration-300 ease-[var(--ease-out)] lg:hidden', ctaVisible ? 'translate-y-full' : 'translate-y-0')} aria-hidden={ctaVisible} data-testid="sticky-bar">
        <div className="size-11 shrink-0 border border-hairline"><ProductImage src={variant.image ?? p.images[0]!} alt="" sizes="44px" /></div>
        <div className="min-w-0 flex-1"><p className="t-label truncate">{p.name}</p><p className="t-mono">{formatBRL(total)} · {inst.count}x sem juros</p></div>
        <Button onClick={() => add(document.querySelector('[data-gallery-main] img'))} magnetic={false}>Adicionar</Button>
      </div>
    </>
  )
}
