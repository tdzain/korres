'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDeferredValue, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { POPULAR_SEARCHES } from '@/data/menu'
import { searchProducts } from '@/lib/commerce/catalog'
import { formatBRL } from '@/lib/format/money'
import { usePrefs } from '@/lib/store/prefs'
import { useUI } from '@/lib/store/ui'
import { useFocusTrap } from '@/lib/useFocusTrap'
import { ProductImage } from '@/components/product/ProductImage'
import { CloseButton } from '@/components/ui/Overlay'
import { SearchIcon } from '@/components/ui/Icons'

/** Overlay de busca: buscas recentes, populares e sugestões em tempo real. */
export function SearchOverlay() {
  const open = useUI((s) => s.searchOpen)
  const setOpen = useUI((s) => s.setSearchOpen)
  const recent = usePrefs((s) => s.recentSearches)
  const addSearch = usePrefs((s) => s.addSearch)
  const clear = usePrefs((s) => s.clearSearches)
  const router = useRouter()
  const [q, setQ] = useState('')
  const deferred = useDeferredValue(q)
  const ref = useRef<HTMLDivElement>(null)
  const close = () => setOpen(false)
  useFocusTrap(ref, open, close)
  useEffect(() => { if (!open) setQ('') }, [open])
  const results = deferred.trim().length >= 2 ? searchProducts(deferred, 6) : []

  const go = (term: string) => {
    const t = term.trim()
    if (!t) return
    addSearch(t)
    setOpen(false)
    router.push(`/busca/?q=${encodeURIComponent(t)}`)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[85]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <div className="absolute inset-0 bg-[rgb(6_16_150/0.28)]" onClick={close} aria-hidden />
          <motion.div ref={ref} role="dialog" aria-modal="true" aria-label="Busca" initial={{ y: -24 }} animate={{ y: 0 }} exit={{ y: -24 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="absolute left-0 right-0 top-0 max-h-[100dvh] overflow-auto bg-white">
            <form onSubmit={(e) => { e.preventDefault(); go(q) }} className="flex items-center gap-3 border-b border-hairline px-4 py-2" role="search">
              <SearchIcon size={20} className="text-brand" />
              <input data-autofocus type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Procure por produto, ingrediente ou necessidade da pele..." aria-label="Buscar" className="h-12 flex-1 bg-transparent text-[16px] font-normal text-brand outline-none placeholder:font-light placeholder:text-muted" />
              <CloseButton onClick={close} label="Fechar busca" />
            </form>
            <div className="grid gap-0 md:grid-cols-[1fr_2fr]">
              <div className="border-hairline p-5 md:border-r">
                {recent.length > 0 && (
                  <section className="mb-6">
                    <div className="flex items-center justify-between"><h3 className="t-caps text-brand">Buscas recentes</h3><button type="button" onClick={clear} className="t-mono underline">limpar</button></div>
                    <ul className="mt-3 flex flex-col">{recent.map((r) => <li key={r}><button type="button" onClick={() => go(r)} className="link-underline py-1 text-[14px] font-normal text-brand">{r}</button></li>)}</ul>
                  </section>
                )}
                <section>
                  <h3 className="t-caps text-brand">Buscas populares</h3>
                  <ul className="mt-3 flex flex-col">{POPULAR_SEARCHES.map((r) => <li key={r}><button type="button" onClick={() => go(r)} className="link-underline py-1 text-[14px] font-normal text-brand">{r}</button></li>)}</ul>
                </section>
              </div>
              <div className="p-5" aria-live="polite">
                <h3 className="t-caps text-brand">{results.length ? 'Sugestões' : 'Comece a digitar'}</h3>
                {deferred.trim().length >= 2 && results.length === 0 && <p className="t-mono mt-3">Nenhum produto encontrado para “{deferred}”.</p>}
                <ul className="mt-3 grid gap-px sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((p) => (
                    <li key={p.id}>
                      <Link href={`/produto/${p.slug}/`} onClick={() => { addSearch(deferred.trim()); close() }} className="flex items-center gap-3 border border-transparent p-2 hover:border-hairline">
                        <div className="size-16 shrink-0"><ProductImage src={p.images[0]!} alt="" sizes="64px" /></div>
                        <div><p className="t-label">{p.name}</p><p className="t-mono">{formatBRL(p.price)}</p></div>
                      </Link>
                    </li>
                  ))}
                </ul>
                {results.length > 0 && <button type="button" onClick={() => go(q)} className="link-underline mt-4 text-[14px] uppercase text-brand">Ver todos os resultados ›</button>}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
