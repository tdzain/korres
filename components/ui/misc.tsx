'use client'
import { LayoutGroup, motion } from 'motion/react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { discountPercent, formatBRL } from '@/lib/format/money'
import { bestInstallment } from '@/lib/pricing'
import { AnimatedNumber } from './AnimatedNumber'
import { ChevronLeftIcon, ChevronRightIcon, MinusIcon, PlusIcon, StarIcon } from './Icons'

export function Badge({ kind = 'discount', children, className }: { kind?: 'discount' | 'new'; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-block px-[3px] py-[2px] font-mono text-[11px] font-medium uppercase leading-none tracking-[0.5px] text-white', kind === 'discount' ? 'bg-badge' : 'bg-new', className)}>
      {children}
    </span>
  )
}

export function Rating({ value, count, className }: { value: number; count?: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 font-mono text-[12.5px] font-normal text-brand', className)} aria-label={`Nota ${value.toFixed(1)} de 5${count ? `, ${count} avaliações` : ''}`}>
      <StarIcon size={11} />
      {value.toFixed(1).replace('.', ',')}
      {count !== undefined && <span className="text-muted">({count})</span>}
    </span>
  )
}

export function SectionTitle({ title, subtitle, className, as: Tag = 'h2' }: { title: string; subtitle?: string; className?: string; as?: 'h1' | 'h2' | 'h3' }) {
  return (
    <div className={cn('gutter pt-14 pb-5 md:pt-20 md:pb-6', className)}>
      <Tag className="t-section">{title}</Tag>
      {subtitle && <p className="t-mono mt-3">{subtitle}</p>}
    </div>
  )
}

export function Stepper({ value, onChange, min = 0, max = 10, label = 'Quantidade', size = 'md' }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label?: string; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'size-8' : 'size-10'
  return (
    <div className="inline-flex items-center border border-hairline text-brand" role="group" aria-label={label}>
      <button type="button" className={cn(dim, 'grid place-items-center transition-colors hover:bg-tint disabled:opacity-40')} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Diminuir quantidade"><MinusIcon size={14} /></button>
      <span className={cn('grid min-w-8 place-items-center text-center font-mono text-[14px] font-normal tabular-nums')} aria-live="polite">{value}</span>
      <button type="button" className={cn(dim, 'grid place-items-center transition-colors hover:bg-tint disabled:opacity-40')} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Aumentar quantidade"><PlusIcon size={14} /></button>
    </div>
  )
}

/** Preço atual, riscado, % de desconto e parcelamento. */
export function PriceTag({ price, listPrice, size = 'md', installments = false, animated = false, className }: { price: number; listPrice?: number; size?: 'sm' | 'md' | 'lg'; installments?: boolean; animated?: boolean; className?: string }) {
  const off = listPrice ? discountPercent(listPrice, price) : 0
  const inst = bestInstallment(price)
  const main = size === 'lg' ? 'text-[24px] leading-8' : size === 'md' ? 'text-[14px] leading-5' : 'text-[13px] leading-5'
  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 text-brand', className)}>
      <span className={cn(main, 'font-normal')}>{animated ? <AnimatedNumber value={price} /> : formatBRL(price)}</span>
      {off > 0 && listPrice && <span className={cn('text-muted line-through', size === 'lg' ? 'text-[16px]' : 'text-[13px]')}>{formatBRL(listPrice)}</span>}
      {installments && inst.count > 1 && <span className="t-mono ml-1 border-l border-hairline pl-2">{inst.count}x {formatBRL(inst.value)}</span>}
    </div>
  )
}

/** Chips de variante com indicador deslizante (layoutId). */
export function VariantChips<T extends { id: string; label: string }>({ options, value, onChange, label = 'Tamanho' }: { options: T[]; value: string; onChange: (id: string) => void; label?: string }) {
  const group = useId()
  return (
    <LayoutGroup id={group}>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-0">
        {options.map((o) => {
          const active = o.id === value
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.id)}
              className={cn('relative border border-hairline px-4 py-[10px] font-mono text-[13px] font-normal uppercase transition-colors duration-300 -ml-px first:ml-0', active ? 'text-brand' : 'text-muted hover:text-brand')}
            >
              {active && <motion.span layoutId="chip-ind" className="absolute -inset-px border border-brand" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <span className="relative">{o.label}</span>
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}

export function Tabs({ tabs, value, onChange, label }: { tabs: { id: string; label: string }[]; value: string; onChange: (id: string) => void; label: string }) {
  const group = useId()
  return (
    <LayoutGroup id={group}>
      <div role="tablist" aria-label={label} className="flex gap-6 border-b border-hairline">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={t.id === value} id={`tab-${t.id}`} onClick={() => onChange(t.id)} className={cn('relative py-3 text-[14px] uppercase tracking-[0.5px] transition-colors', t.id === value ? 'text-brand' : 'text-muted hover:text-brand')}>
            {t.label}
            {t.id === value && <motion.span layoutId="tab-ind" className="absolute inset-x-0 -bottom-px h-px bg-brand" />}
          </button>
        ))}
      </div>
    </LayoutGroup>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} aria-hidden />
}

/** Fileira horizontal com scroll-snap e setas (desktop). */
export function Carousel({ children, className, itemClass = 'w-[78%] sm:w-[46%] lg:w-1/4' }: { children: ReactNode[]; className?: string; itemClass?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState({ start: true, end: false })
  const update = () => {
    const el = ref.current
    if (el) setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 })
  }
  useEffect(() => { update() }, [])
  const go = (dir: 1 | -1) => { const el = ref.current; if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' }) }
  return (
    <div className={cn('relative', className)}>
      <div className="gutter hidden items-center justify-end gap-1 pb-2 lg:flex">
        <button type="button" aria-label="Anterior" disabled={edge.start} onClick={() => go(-1)} className="grid size-8 place-items-center text-brand disabled:opacity-30"><ChevronLeftIcon size={18} /></button>
        <button type="button" aria-label="Próximo" disabled={edge.end} onClick={() => go(1)} className="grid size-8 place-items-center text-brand disabled:opacity-30"><ChevronRightIcon size={18} /></button>
      </div>
      <div ref={ref} onScroll={update} className="scroll-x flex border-y border-hairline">
        {children.map((c, i) => <div key={i} className={cn('shrink-0 border-r border-hairline', itemClass)}>{c}</div>)}
      </div>
    </div>
  )
}

/** Popover simples ancorado, fecha com clique fora ou Esc. */
export function Popover({ open, onClose, children, className, align = 'left' }: { open: boolean; onClose: () => void; children: ReactNode; className?: string; align?: 'left' | 'right' }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open, onClose])
  if (!open) return null
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className={cn('absolute z-30 mt-1 w-[min(92vw,420px)] border border-hairline bg-white shadow-[0_10px_30px_rgb(6_16_150/0.12)]', align === 'right' ? 'right-0' : 'left-0', className)}>
      {children}
    </motion.div>
  )
}
