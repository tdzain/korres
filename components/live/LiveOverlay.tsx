'use client'
import { AnimatePresence, m as motion } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FREE_SHIPPING_THRESHOLD } from '@/config/shipping'
import { BLACK_FRIDAY, sceneAt, type LiveStream } from '@/data/live'
import { QuickAdd } from '@/components/product/QuickAdd'
import { ProductImage } from '@/components/product/ProductImage'
import { BagIcon, ChevronDownIcon, CloseIcon, HeartFilledIcon, HeartIcon, InfoIcon, MuteIcon, SendIcon, VolumeIcon } from '@/components/ui/Icons'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { getSummary } from '@/lib/commerce/catalog'
import type { ProductSummary } from '@/lib/commerce/types'
import { cn } from '@/lib/cn'
import { formatBRL, discountPercent } from '@/lib/format/money'
import { useNow } from '@/lib/hooks'
import { hasFreeShipping } from '@/lib/shipping/quote'
import { useCartLines } from '@/lib/store/lines'
import type { SheetStep } from '@/lib/store/live'
import { LiveSheet } from './LiveSheet'
import { LiveBadge, formatViewers } from './parts'

const EASE = [0.32, 0.72, 0, 1] as const
const SHADOW = '[text-shadow:0_1px_4px_rgb(0_0_0/0.55)]'
const BAG = '[data-live-bag]'

interface Props {
  live: LiveStream
  sec: number
  viewers: number
  muted: boolean
  sheet: SheetStep | null
  onMute: () => void
  onMinimize: () => void
  onClose: () => void
  onSheet: (s: SheetStep | null) => void
}

const IconBtn = ({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) => (
  <button type="button" onClick={onClick} aria-label={label} className="grid size-10 place-items-center text-white transition-opacity active:opacity-60 min-[400px]:size-11"><span className="drop-shadow-[0_1px_3px_rgb(0_0_0/0.6)]">{children}</span></button>
)

function Countdown() {
  const now = useNow(60_000)
  if (now === undefined) return null
  const left = BLACK_FRIDAY - now
  const days = Math.floor(left / 86_400_000)
  const hours = Math.floor((left % 86_400_000) / 3_600_000)
  return <span>{left > 0 ? `Black Friday em ${days}d ${hours}h` : 'Black Friday: agora'}</span>
}

/** Cartão compacto do carrossel: adicionar vira − N + no lugar (QuickAdd) e a miniatura voa até a sacola do player. */
function ProductCard({ p, tag }: { p: ProductSummary; tag: string }) {
  const imgRef = useRef<HTMLDivElement>(null)
  const off = discountPercent(p.listPrice, p.price)
  return (
    <motion.li layout="position" transition={{ duration: 0.4, ease: EASE }} className="w-[236px] shrink-0 snap-start border border-hairline bg-white p-2" data-testid="live-product">
      <p className="t-caps mb-1.5 text-[10px] leading-none text-badge">{tag}</p>
      <div className="flex gap-2.5">
        <div ref={imgRef} className="size-[60px] shrink-0 bg-surface p-1"><ProductImage src={p.images[0]!} alt="" sizes="64px" /></div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[12.5px] font-medium leading-tight text-brand">{p.name}</p>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 text-brand">
            <span className="text-[13.5px]">{formatBRL(p.price)}</span>
            {off > 0 && <span className="text-[11.5px] text-muted line-through">{formatBRL(p.listPrice)}</span>}
            {off >= 3 && <span className="bg-badge px-1 text-[10px] leading-4 text-white">{off}% off</span>}
          </p>
        </div>
      </div>
      <QuickAdd product={p} flyTarget={BAG} getSource={() => imgRef.current} className="mt-2" />
    </motion.li>
  )
}

interface Msg { id: string; user: string; text: string; fromBrand?: boolean; mine?: boolean }

/** Camada de venda do modo ampliado: header, chat simulado, produtos da cena, sacola do player e sheet de compra. */
export function LiveOverlay({ live, sec, viewers, muted, sheet, onMute, onMinimize, onClose, onSheet }: Props) {
  const pathname = usePathname()
  const { count, subtotal } = useCartLines()
  const { index, scene } = sceneAt(live, sec)
  const [info, setInfo] = useState(false)
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([])
  const [mine, setMine] = useState<Msg[]>([])
  const [draft, setDraft] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const prevIndex = useRef(index)
  const lastTap = useRef(0)
  const heartId = useRef(0)
  const rail = useRef<HTMLUListElement>(null)

  const pdpSlug = pathname.split('/').filter(Boolean)[1]
  const products = useMemo(() => {
    const pdp = pdpSlug ? getSummary(pdpSlug) : undefined
    const inScene = scene.slugs.map(getSummary).filter((p): p is ProductSummary => !!p)
    const rest = pdp && !inScene.some((p) => p.id === pdp.id) ? [{ p: pdp, tag: 'Você está vendo' }] : []
    const sceneCards = inScene.map((p, i) => ({ p, tag: pdp?.id === p.id ? 'Você está vendo · em destaque' : i === 0 ? 'Em destaque agora' : 'Também no ritual' }))
    return [...sceneCards, ...rest]
  }, [pdpSlug, scene])

  // Troca de cena: aviso curto e carrossel volta ao início.
  useEffect(() => {
    if (prevIndex.current === index) return
    prevIndex.current = index
    setNotice(`Agora: ${scene.caption}`)
    rail.current?.scrollTo({ left: 0, behavior: 'smooth' })
    const t = setTimeout(() => setNotice(null), 3200)
    return () => clearTimeout(t)
  }, [index, scene.caption])

  const chat = useMemo<Msg[]>(() => {
    const scripted = live.chat.filter((m) => m.at <= sec).map((m, i) => ({ id: `s${m.at}-${i}`, user: m.user, text: m.text, fromBrand: m.fromBrand }))
    return [...scripted.slice(-4), ...mine].slice(-5)
  }, [live, sec, mine])

  const heart = () => {
    const id = ++heartId.current
    setHearts((h) => [...h.slice(-8), { id, x: Math.round((Math.random() - 0.5) * 60) }])
    setTimeout(() => setHearts((h) => h.filter((x) => x.id !== id)), 1600)
  }
  const tap = () => {
    const now = Date.now()
    if (now - lastTap.current < 300) heart()
    lastTap.current = now
  }
  const send = (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setMine((m) => [...m, { id: `me${Date.now()}`, user: 'Você', text, mine: true }])
    setDraft('')
  }

  const free = hasFreeShipping(subtotal)
  const pct = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD)

  return (
    <div className="absolute inset-0 flex flex-col text-white" data-testid="live-overlay">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.5),transparent_22%,transparent_38%,rgb(0_0_0/0.7)_72%,rgb(0_0_0/0.8))]" />

      <header className="relative flex items-center gap-2 pl-3 pr-0.5 pt-[max(10px,env(safe-area-inset-top))]">
        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/70 bg-brand text-[12px] font-medium" aria-hidden>{live.host.initials}</span>
        <div className="min-w-0 flex-1">
          <p className={cn('truncate text-[13px] font-medium leading-tight', SHADOW)}>{live.host.name}<span className="font-normal opacity-80"> · {live.host.role}</span></p>
          <p className="mt-1 flex items-center gap-2"><LiveBadge /><span className={cn('whitespace-nowrap text-[11.5px]', SHADOW)}>{formatViewers(viewers)} assistindo</span></p>
        </div>
        <IconBtn label="Sobre esta demonstração" onClick={() => setInfo(true)}><InfoIcon size={20} /></IconBtn>
        <IconBtn label={muted ? 'Ativar o som' : 'Desativar o som'} onClick={onMute}>{muted ? <MuteIcon size={21} /> : <VolumeIcon size={21} />}</IconBtn>
        <IconBtn label="Minimizar a live" onClick={onMinimize}><ChevronDownIcon size={22} /></IconBtn>
        <IconBtn label="Fechar a live" onClick={onClose}><CloseIcon size={21} /></IconBtn>
      </header>

      <div className="relative flex items-center gap-2 px-3 pt-0.5">
        <span className={cn('border border-white/60 px-1.5 py-[3px] text-[10.5px] uppercase leading-none tracking-wide', SHADOW)}><Countdown /></span>
        <AnimatePresence mode="wait">
          {notice && <motion.span key={notice} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="min-w-0 truncate bg-white px-2 py-[3px] text-[11.5px] leading-none text-brand" role="status">{notice}</motion.span>}
        </AnimatePresence>
      </div>

      {/* Área do vídeo: toque duplo = coração; arrastar para baixo = minimizar. */}
      <motion.div className="relative min-h-0 flex-1 touch-none" onClick={tap} onPanEnd={(_, i) => { if (i.offset.y > 90 && Math.abs(i.offset.x) < 70) onMinimize() }} data-testid="live-stage">
        <ul className="pointer-events-none absolute inset-x-3 bottom-1 max-h-full space-y-1 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_30%)]" aria-label="Chat da live" aria-live="off">
          <AnimatePresence initial={false}>
            {chat.map((m) => (
              <motion.li key={m.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} className={cn('w-fit max-w-[82%] rounded-sm px-2 py-1 text-[12.5px] leading-snug', m.fromBrand ? 'bg-white text-brand' : 'bg-black/40 text-white')}>
                <b className="mr-1.5 font-medium">{m.user}</b>{m.text}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <div className="pointer-events-none absolute bottom-2 right-5">
          <AnimatePresence>
            {hearts.map((h) => (
              <motion.span key={h.id} className="absolute bottom-0 text-white" initial={{ opacity: 1, y: 0, x: 0, scale: 0.6 }} animate={{ opacity: 0, y: -170, x: h.x, scale: 1.2 }} transition={{ duration: 1.5, ease: 'easeOut' }}><HeartFilledIcon size={26} /></motion.span>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      <form onSubmit={send} className="relative flex items-center gap-2 px-3 pb-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Diga algo…" aria-label="Mensagem para o chat" maxLength={120} className="h-10 min-w-0 flex-1 rounded-full border border-white/60 bg-black/30 px-4 text-[16px] text-white placeholder:text-white/70 focus:border-white focus:outline-none" />
        <button type="submit" aria-label="Enviar mensagem" disabled={!draft.trim()} className="grid size-10 place-items-center text-white disabled:opacity-40"><SendIcon size={20} /></button>
        <button type="button" onClick={heart} aria-label="Curtir" className="grid size-10 place-items-center text-white active:scale-90"><HeartIcon size={22} /></button>
      </form>

      <ul ref={rail} className="scroll-x relative flex snap-x snap-mandatory gap-2 px-3 pb-2 [scroll-padding-inline:12px]" aria-label="Produtos em destaque na live" data-testid="live-products">
        {products.map(({ p, tag }) => <ProductCard key={p.id} p={p} tag={tag} />)}
      </ul>

      <div className="relative border-t border-hairline bg-white px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-2.5 text-brand">
        <div className="mb-2 h-[3px] w-full overflow-hidden bg-[#e4e6f4]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct * 100)} aria-label="Progresso para o frete grátis">
          <motion.div className={cn('h-full origin-left', free ? 'bg-success' : 'bg-brand')} initial={false} animate={{ scaleX: pct }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
        </div>
        <div className="flex items-center gap-3">
          <span className="relative grid size-11 shrink-0 place-items-center" data-live-bag>
            <BagIcon size={22} />
            {count > 0 && <span key={count} className="anim-bump absolute right-0.5 top-0.5 grid min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] leading-4 text-white" data-testid="live-bag-count">{count}</span>}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] leading-tight"><AnimatedNumber value={subtotal} /></p>
            <p className={cn('truncate text-[11.5px] leading-tight', free ? 'text-success' : 'text-muted')}>{free ? 'Frete grátis conquistado' : `${formatBRL(Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal))} para frete grátis`}</p>
          </div>
          <button type="button" onClick={() => onSheet('bag')} className="h-11 shrink-0 border border-brand bg-brand px-4 text-[13px] uppercase tracking-[0.5px] text-white transition-colors hover:bg-[#0a14b8] active:bg-[#04106f]" data-testid="live-checkout">
            {count > 0 ? 'Finalizar compra' : 'Ver sacola'}
          </button>
        </div>
      </div>

      <LiveSheet step={sheet} onStep={onSheet} />

      <AnimatePresence>
        {info && (
          <motion.div className="absolute inset-0 z-10 flex items-end bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setInfo(false)}>
            <motion.div role="dialog" aria-label="Sobre esta demonstração" className="w-full bg-white p-5 pb-[max(20px,env(safe-area-inset-bottom))] text-brand" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ duration: 0.4, ease: EASE }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-4">
                <h2 className="t-caps text-brand">Sobre esta demonstração</h2>
                <button type="button" onClick={() => setInfo(false)} aria-label="Fechar" className="-mr-2 -mt-2 grid size-11 place-items-center"><CloseIcon size={18} /></button>
              </div>
              <p className="mt-2 text-[13.5px] font-normal leading-relaxed text-body">É uma simulação de <b className="font-medium">live commerce</b> para a Black Friday: o vídeo é gravado e sorteado a cada visita. Numa operação real, a mesma transmissão sairia ao vivo em todos os canais e dentro da loja, com o catálogo conectado.</p>
              <p className="t-mono mt-4">Transmitindo ao mesmo tempo em</p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5 text-[12px]">
                {['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Este site'].map((c) => <li key={c} className="flex items-center gap-1.5 border border-hairline px-2 py-1"><span className="size-1.5 rounded-full bg-danger" aria-hidden />{c}</li>)}
              </ul>
              <p className="t-mono mt-4">Na live: produtos da cena, chat, adicionar à sacola e fechar o pedido sem sair da transmissão.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
