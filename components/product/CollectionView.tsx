'use client'
import { AnimatePresence, m as motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { ProductCard, ProductCardSkeleton } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Field'
import { CloseIcon, FilterIcon, PlusIcon } from '@/components/ui/Icons'
import { CloseButton, Drawer } from '@/components/ui/Overlay'
import { SectionTitle } from '@/components/ui/misc'
import { COLLECTIONS } from '@/data/collections'
import { cn } from '@/lib/cn'
import type { Collection, ProductSummary } from '@/lib/commerce/types'
import { discountPercent } from '@/lib/format/money'

const PAGE = 12
const titleOf = (slug: string) => COLLECTIONS.find((c) => c.slug === slug)?.title ?? slug

const PRICE_BUCKETS = [
  { id: 'p1', label: 'Até R$ 100', test: (n: number) => n <= 100 },
  { id: 'p2', label: 'R$ 100 a R$ 250', test: (n: number) => n > 100 && n <= 250 },
  { id: 'p3', label: 'R$ 250 a R$ 400', test: (n: number) => n > 250 && n <= 400 },
  { id: 'p4', label: 'Acima de R$ 400', test: (n: number) => n > 400 },
]
const sizeNumber = (s: string) => Number((/(\d+)\s?(ml|g)/i.exec(s) ?? [])[1] ?? NaN)
const SIZE_BUCKETS = [
  { id: 's1', label: 'Mini (até 20 ml/g)', test: (n: number) => n <= 20 },
  { id: 's2', label: '30 a 50 ml/g', test: (n: number) => n > 20 && n <= 50 },
  { id: 's3', label: '75 a 150 ml/g', test: (n: number) => n > 50 && n <= 150 },
  { id: 's4', label: 'Acima de 150 ml/g', test: (n: number) => n > 150 },
]

const SORTS = [
  { id: 'rel', label: 'Relevância', fn: (a: ProductSummary, b: ProductSummary) => (a.bestSellerRank ?? 999) - (b.bestSellerRank ?? 999) || Number(a.id) - Number(b.id) },
  { id: 'asc', label: 'Menor preço', fn: (a: ProductSummary, b: ProductSummary) => a.price - b.price },
  { id: 'desc', label: 'Maior preço', fn: (a: ProductSummary, b: ProductSummary) => b.price - a.price },
  { id: 'rating', label: 'Mais bem avaliados', fn: (a: ProductSummary, b: ProductSummary) => b.rating - a.rating },
  { id: 'off', label: 'Maior desconto', fn: (a: ProductSummary, b: ProductSummary) => discountPercent(b.listPrice, b.price) - discountPercent(a.listPrice, a.price) },
  { id: 'az', label: 'Nome (A–Z)', fn: (a: ProductSummary, b: ProductSummary) => a.name.localeCompare(b.name, 'pt-BR') },
]

type Filters = { tipo: string[]; linha: string[]; necessidade: string[]; preco: string[]; tamanho: string[] }
const EMPTY: Filters = { tipo: [], linha: [], necessidade: [], preco: [], tamanho: [] }

export function CollectionView({ collection, products }: { collection: Collection; products: ProductSummary[] }) {
  const [filters, setFilters] = useState<Filters>(EMPTY)
  const [sort, setSort] = useState('rel')
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [visible, setVisible] = useState(PAGE)
  const [loadingMore, setLoadingMore] = useState(false)

  const facets = useMemo(() => {
    const uniq = <T,>(arr: T[]) => [...new Set(arr)]
    return {
      tipo: uniq(products.flatMap((p) => p.types)).map((id) => ({ id, label: titleOf(id) })),
      linha: uniq(products.map((p) => p.lineSlug).filter((x): x is string => !!x)).map((id) => ({ id, label: titleOf(id) })),
      necessidade: uniq(products.flatMap((p) => p.needs)).map((id) => ({ id, label: titleOf(id) })),
      preco: PRICE_BUCKETS.filter((b) => products.some((p) => b.test(p.price))),
      tamanho: SIZE_BUCKETS.filter((b) => products.some((p) => { const n = sizeNumber(p.size); return !Number.isNaN(n) && b.test(n) })),
    }
  }, [products])

  const filtered = useMemo(() => {
    const out = products.filter((p) => {
      if (filters.tipo.length && !p.types.some((t) => filters.tipo.includes(t))) return false
      if (filters.linha.length && !(p.lineSlug && filters.linha.includes(p.lineSlug))) return false
      if (filters.necessidade.length && !p.needs.some((n) => filters.necessidade.includes(n))) return false
      if (filters.preco.length && !PRICE_BUCKETS.some((b) => filters.preco.includes(b.id) && b.test(p.price))) return false
      if (filters.tamanho.length) { const n = sizeNumber(p.size); if (Number.isNaN(n) || !SIZE_BUCKETS.some((b) => filters.tamanho.includes(b.id) && b.test(n))) return false }
      return true
    })
    return [...out].sort(SORTS.find((s) => s.id === sort)!.fn)
  }, [products, filters, sort])

  const toggle = (key: keyof Filters, id: string) => { setFilters((f) => ({ ...f, [key]: f[key].includes(id) ? f[key].filter((x) => x !== id) : [...f[key], id] })); setVisible(PAGE) }
  const activeChips = (Object.keys(filters) as (keyof Filters)[]).flatMap((k) => filters[k].map((id) => ({ k, id, label: facets[k].find((o) => o.id === id)?.label ?? id })))
  const shown = filtered.slice(0, visible)
  const loadMore = () => { setLoadingMore(true); setTimeout(() => { setVisible((v) => v + PAGE); setLoadingMore(false) }, 550) }

  const groups: { key: keyof Filters; title: string; opts: { id: string; label: string }[] }[] = [
    { key: 'tipo', title: 'Tipo', opts: facets.tipo },
    { key: 'linha', title: 'Linha', opts: facets.linha },
    { key: 'necessidade', title: 'Necessidade da pele', opts: facets.necessidade },
    { key: 'preco', title: 'Preço', opts: facets.preco },
    { key: 'tamanho', title: 'Tamanho', opts: facets.tamanho },
  ]

  return (
    <div>
      <SectionTitle as="h1" title={collection.title} subtitle={`${collection.subtitle} · ${filtered.length} ${filtered.length === 1 ? 'produto' : 'produtos'}`} className="pt-10 md:pt-14" />

      {/* Barra: FILTROS | ORDENAR POR (duas metades, como no korres.com) */}
      <div className="relative grid grid-cols-2 border-y border-hairline bg-surface" data-testid="plp-bar">
        <button type="button" onClick={() => setFilterOpen(true)} className="flex h-12 items-center justify-between px-4 text-[14px] font-normal uppercase text-brand md:h-9" aria-haspopup="dialog" data-testid="open-filters">
          <span className="flex items-center gap-2"><FilterIcon size={15} /> Filtros{activeChips.length > 0 && <span className="font-mono text-[12px]">({activeChips.length})</span>}</span><PlusIcon size={14} />
        </button>
        <div className="relative border-l border-hairline">
          <button type="button" onClick={() => setSortOpen((o) => !o)} aria-expanded={sortOpen} aria-haspopup="listbox" className="flex h-12 w-full items-center justify-between px-4 text-[14px] font-normal uppercase text-brand md:h-9" data-testid="sort-button">
            <span>Ordenar por: <span className="normal-case">{SORTS.find((s) => s.id === sort)!.label}</span></span><PlusIcon size={14} className={cn('transition-transform duration-300', sortOpen && 'rotate-45')} />
          </button>
          <AnimatePresence>
            {sortOpen && (
              <motion.ul role="listbox" aria-label="Ordenar" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }} className="absolute inset-x-0 top-full z-20 border-x border-b border-hairline bg-white">
                {SORTS.map((s) => (
                  <li key={s.id} role="option" aria-selected={s.id === sort}>
                    <button type="button" onClick={() => { setSort(s.id); setSortOpen(false); setVisible(PAGE) }} className={cn('min-h-11 w-full px-4 py-2.5 text-left text-[14px] font-normal hover:bg-tint', s.id === sort ? 'text-brand' : 'text-body')}>{s.label}</button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-hairline px-4 py-3" aria-label="Filtros ativos">
          {activeChips.map((c) => (
            <button key={`${c.k}-${c.id}`} type="button" onClick={() => toggle(c.k, c.id)} className="flex items-center gap-1.5 border border-hairline px-2.5 py-1 text-[13px] font-normal text-brand hover:bg-tint">{c.label}<CloseIcon size={12} /></button>
          ))}
          <button type="button" onClick={() => setFilters(EMPTY)} className="t-mono underline">limpar tudo</button>
        </div>
      )}

      {shown.length === 0 ? (
        <div className="px-4 py-20 text-center"><p className="font-hand text-[40px] leading-none text-brand">Nada por aqui</p><p className="t-mono mt-3">Nenhum produto com esses filtros.</p><div className="mt-6 flex justify-center"><Button variant="outline" onClick={() => setFilters(EMPTY)}>Limpar filtros</Button></div></div>
      ) : (
        <div className="hairline-clip">
          <div className="hairline-grid" data-testid="plp-grid">
            {shown.map((p, i) => (
              <motion.div key={p.id} layout="position" initial={i < 4 ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: (i % PAGE) * 0.04, ease: [0.22, 1, 0.36, 1] }}>
                <ProductCard product={p} priority={i < 4} />
              </motion.div>
            ))}
            {loadingMore && Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={`sk${i}`} />)}
          </div>
        </div>
      )}

      {visible < filtered.length && (
        <div className="flex flex-col items-center gap-3 px-4 py-12">
          <p className="t-mono">Mostrando {shown.length} de {filtered.length}</p>
          <Button variant="outline" size="lg" onClick={loadMore} disabled={loadingMore}>{loadingMore ? 'Carregando…' : 'Carregar mais'}</Button>
        </div>
      )}

      <Drawer open={filterOpen} onClose={() => setFilterOpen(false)} label="Filtros" side="left">
        <div className="flex items-center justify-between border-b border-hairline pl-4 pr-1"><h2 className="text-[16px] font-medium uppercase tracking-[0.5px] text-brand">Filtros</h2><CloseButton onClick={() => setFilterOpen(false)} label="Fechar filtros" /></div>
        <div className="flex-1 space-y-7 overflow-auto p-4">
          {groups.filter((g) => g.opts.length > 1 || (g.opts.length === 1 && activeChips.some((c) => c.k === g.key))).map((g) => (
            <fieldset key={g.key}>
              <legend className="t-caps mb-3 text-brand">{g.title}</legend>
              <div className="flex flex-col gap-3">{g.opts.map((o) => <Checkbox key={o.id} label={o.label} checked={filters[g.key].includes(o.id)} onChange={() => toggle(g.key, o.id)} />)}</div>
            </fieldset>
          ))}
          {groups.every((g) => g.opts.length <= 1) && <p className="t-mono">Esta coleção não tem filtros adicionais.</p>}
        </div>
        <div className="flex gap-2 border-t border-hairline p-4">
          <Button variant="outline" onClick={() => setFilters(EMPTY)} full>Limpar</Button>
          <Button onClick={() => setFilterOpen(false)} full>Ver {filtered.length} {filtered.length === 1 ? 'produto' : 'produtos'}</Button>
        </div>
      </Drawer>
    </div>
  )
}
