'use client'
import Link from 'next/link'
import { AnimatePresence, m as motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MEGA, NAV, SEASONAL } from '@/data/menu'
import { bestSellers } from '@/lib/commerce/catalog'
import { cn } from '@/lib/cn'
import { useCart } from '@/lib/store/cart'
import { useCartLines } from '@/lib/store/lines'
import { useFavorites } from '@/lib/store/favorites'
import { useUI } from '@/lib/store/ui'
import { BagIcon, BookmarkIcon, MenuIcon, SearchIcon, UserIcon } from '@/components/ui/Icons'
import { Logo } from '@/components/ui/Logo'
import { ProductImage } from '@/components/product/ProductImage'
import { LocationChip } from './LocationChip'

const cell = 'relative grid h-full place-items-center border-l border-hairline text-brand transition-colors hover:bg-tint'

function Counter({ n, bumpKey }: { n: number; bumpKey?: number }) {
  return <span key={bumpKey} className={cn('font-mono text-[12.5px] font-normal leading-none tabular-nums', bumpKey ? 'anim-bump' : '')}>{n}</span>
}

export function Header() {
  const ref = useRef<HTMLElement>(null)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mega, setMega] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const { count } = useCartLines()
  const bump = useCart((s) => s.bump)
  const setCartOpen = useCart((s) => s.setOpen)
  const favs = useFavorites((s) => s.ids.length)
  const setSearchOpen = useUI((s) => s.setSearchOpen)
  const setMenuOpen = useUI((s) => s.setMenuOpen)

  // Esconde ao rolar para baixo, volta ao rolar para cima; sombra após 8px.
  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 8)
      if (Math.abs(y - last) > 6) { setHidden(y > last && y > 120); last = y }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Informa às colunas sticky (PDP) quanto espaço o header ocupa.
  useEffect(() => {
    const h = ref.current?.offsetHeight ?? 36
    document.documentElement.style.setProperty('--sticky-top', hidden && !mega ? '0px' : `${h}px`)
  }, [hidden, mega])

  const openMega = useCallback(() => { clearTimeout(closeTimer.current); setMega(true) }, [])
  const closeMega = useCallback(() => { closeTimer.current = setTimeout(() => setMega(false), 140) }, [])
  useEffect(() => {
    if (!mega) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMega(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mega])

  const picks = bestSellers().slice(0, 1)[0]

  return (
    <header
      ref={ref}
      data-testid="site-header"
      className={cn('sticky top-0 z-50 bg-white transition-[transform,box-shadow] duration-300 ease-[var(--ease-out)]', hidden && !mega ? '-translate-y-full' : 'translate-y-0', scrolled && 'shadow-[0_6px_18px_rgb(6_16_150/0.07)]')}
      onMouseLeave={closeMega}
    >
      <div className="grid h-[44px] grid-cols-[1fr_auto] lg:h-9 lg:grid-cols-2">
        {/* Metade esquerda (desktop): navegação + chip de entrega */}
        <nav aria-label="Principal" className="hidden items-center gap-[18px] whitespace-nowrap pl-4 lg:flex xl:gap-5">
          {NAV.map((n) =>
            n.mega ? (
              <button key={n.label} type="button" aria-expanded={mega} aria-haspopup="true" onMouseEnter={openMega} onFocus={openMega} onClick={() => setMega((v) => !v)} className={cn('relative py-2 text-[14px] font-normal text-brand', mega && 'after:absolute after:inset-x-0 after:bottom-1 after:h-px after:bg-brand')}>
                {n.label}
              </button>
            ) : (
              <Link key={n.label} href={n.href} onMouseEnter={closeMega} className="link-underline py-2 text-[14px] font-normal text-brand">{n.label}</Link>
            ),
          )}
          <Link href={SEASONAL.href} className="link-underline hidden py-2 text-[14px] font-normal text-seasonal min-[1760px]:inline">{SEASONAL.label}</Link>
          <LocationChip compact className="ml-auto hidden pr-4 xl:block" />
        </nav>

        {/* Mobile: logo à esquerda */}
        <Link href="/" className="flex items-center px-4 text-brand lg:hidden" aria-label="KORRES Brasil, página inicial">
          <Logo height={19} />
        </Link>

        {/* Metade direita */}
        <div className="flex h-full items-stretch justify-end border-hairline lg:border-l">
          <button type="button" onClick={() => setSearchOpen(true)} className="hidden flex-1 items-center gap-3 px-4 text-left text-[14px] font-light text-muted lg:flex" aria-label="Buscar produtos">
            <SearchIcon size={16} className="text-brand" />
            <span className="truncate">Procure por produto, ingrediente ou necessidade da pele...</span>
          </button>
          <Link href="/" className="hidden items-center px-5 text-brand lg:flex" aria-label="KORRES Brasil, página inicial"><Logo height={20} /></Link>
          <button type="button" onClick={() => setSearchOpen(true)} className={cn(cell, 'w-[52px] lg:hidden')} aria-label="Buscar"><SearchIcon size={19} /></button>
          <Link href="/conta/" className={cn(cell, 'w-[52px] lg:w-[59px]')} aria-label="Minha conta"><UserIcon size={19} /></Link>
          <Link href="/favoritos/" className={cn(cell, 'hidden w-[61px] grid-flow-col gap-1 lg:grid')} aria-label={`Favoritos (${favs})`}><Counter n={favs} /><BookmarkIcon size={17} /></Link>
          <button type="button" onClick={() => setCartOpen(true)} className={cn(cell, 'w-[60px] grid-flow-col gap-1 lg:w-[58px]')} aria-label={`Abrir sacola (${count} itens)`} data-testid="bag-button">
            <Counter n={count} bumpKey={bump || undefined} />
            <span data-bag-icon><BagIcon size={19} /></span>
          </button>
          <button type="button" onClick={() => setMenuOpen(true)} className={cn(cell, 'w-[52px] lg:hidden')} aria-label="Abrir menu"><MenuIcon size={21} /></button>
        </div>
      </div>

      {/* Faixa de localização quando o chip não cabe na metade esquerda */}
      <div className="flex min-h-8 items-center border-t border-hairline bg-white px-4 py-0.5 xl:hidden">
        <LocationChip strip />
      </div>

      <AnimatePresence>
        {mega && (
          <motion.div
            key="mega"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={openMega}
            className="absolute left-0 right-0 top-full hidden border-t border-hairline bg-white shadow-[0_18px_30px_rgb(6_16_150/0.08)] lg:block"
            data-testid="mega-menu"
          >
            <div className="grid grid-cols-[repeat(4,1fr)_1.2fr]">
              {MEGA.map((col, ci) => (
                <div key={col.title} className="border-r border-hairline p-6">
                  <h3 className="t-caps mb-4 text-brand">{col.title}</h3>
                  <motion.ul initial="hidden" animate="shown" variants={{ shown: { transition: { staggerChildren: 0.02, delayChildren: 0.05 + ci * 0.02 } } }} className="flex flex-col">
                    {col.links.map((l) => (
                      <motion.li key={l.label} variants={{ hidden: { opacity: 0, y: 8 }, shown: { opacity: 1, y: 0 } }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                        <Link href={l.href} onClick={() => setMega(false)} className="link-underline inline-block py-[5px] text-[14px] font-normal text-brand">{l.label}</Link>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              ))}
              {picks && (
                <Link href={`/produto/${picks.slug}/`} onClick={() => setMega(false)} className="group block p-6">
                  <h3 className="t-caps mb-4 text-brand">Nossas escolhas</h3>
                  <div className="aspect-[4/4.2] overflow-hidden bg-white"><ProductImage src={picks.images[0]!} alt={picks.name} className="transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-105" sizes="260px" /></div>
                  <p className="t-label mt-3">{picks.name}</p>
                  <p className="t-mono">{picks.subtitle}</p>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
