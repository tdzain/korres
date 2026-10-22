'use client'
import { AnimatePresence, m as motion } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { brand } from '@/config/brand'
import { cn } from '@/lib/cn'
import { useCartLines } from '@/lib/store/lines'
import { useLocation } from '@/lib/store/location'
import { usePrefs } from '@/lib/store/prefs'
import { useReady } from '@/lib/store/ready'
import { CloseIcon } from '@/components/ui/Icons'

const EASE = [0.32, 0.72, 0, 1] as const

function WhatsAppGlyph({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

const INTENTS = [
  'Quero montar minha rotina de skincare',
  'Quero saber o prazo e o frete para minha cidade',
  'Preciso de ajuda com meu pedido',
  'Quero ideias de presentes e kits',
]

/** Botão flutuante do WhatsApp como concierge: abre um cartão de boas-vindas e leva para o WhatsApp com a mensagem pronta e o contexto da navegação. */
export function WhatsAppConcierge() {
  const ready = useReady((s) => s.ready)
  const cookies = usePrefs((s) => s.cookies)
  const pathname = usePathname()
  const location = useLocation((s) => s.location)
  const { count } = useCartLines()
  const [open, setOpen] = useState(false)
  const [tip, setTip] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Balãozinho de chamada, uma vez por sessão.
  useEffect(() => {
    if (!ready || cookies === null) return
    try { if (sessionStorage.getItem('kr_wa_tip')) return } catch { /* ignore */ }
    const t1 = setTimeout(() => setTip(true), 5000)
    const t2 = setTimeout(() => { setTip(false); try { sessionStorage.setItem('kr_wa_tip', '1') } catch { /* ignore */ } }, 11000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [ready, cookies])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  if (!ready || cookies === null) return null // espera a decisão de cookies: o banner ocupa o mesmo canto

  const send = (intent: string) => {
    const page = document.title.split('|')[0]?.trim() || 'Loja'
    const ctx = [`Página: ${page}`, count ? `${count} ${count === 1 ? 'item' : 'itens'} na sacola` : null, location ? `Entrega para ${location.city} – ${location.uf}` : null].filter(Boolean).join(' · ')
    const text = `Olá, concierge KORRES! ${intent}.\n\n(${ctx})`
    const { number } = brand.whatsapp
    const url = `https://wa.me/${number}${number ? '' : '/'}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Acima das barras fixas do mobile (PDP e checkout).
  const raised = /^\/(produto|checkout|pedido)\//.test(pathname)

  return (
    <div className={cn('fixed right-4 z-[72] flex flex-col items-end gap-3 md:right-5', raised ? 'bottom-[calc(88px+env(safe-area-inset-bottom))] lg:bottom-5' : 'bottom-[calc(20px+env(safe-area-inset-bottom))] md:bottom-5')} data-testid="whatsapp-concierge">
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-label="Concierge KORRES no WhatsApp"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE } }}
            exit={{ opacity: 0, y: 10, scale: 0.97, transition: { duration: 0.2 } }}
            style={{ transformOrigin: 'bottom right' }}
            className="w-[min(92vw,340px)] overflow-hidden border border-hairline bg-white shadow-[0_18px_50px_rgb(6_16_150/0.22)]"
          >
            <div className="flex items-center gap-3 bg-brand px-4 py-3 text-white">
              <span className="grid size-10 shrink-0 place-items-center bg-white font-medium text-brand" aria-hidden>K</span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium leading-tight">Concierge KORRES</p>
                <p className="flex items-center gap-1.5 font-mono text-[11.5px] font-light opacity-90"><span className="size-1.5 rounded-full bg-[#25D366]" aria-hidden /> Online · responde em minutos</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fechar concierge" className="-mr-2 grid size-11 place-items-center active:opacity-70"><CloseIcon size={18} /></button>
            </div>
            <div className="space-y-3 bg-[#f3f4fb] p-4">
              <p className="max-w-[88%] bg-white p-3 text-[14px] font-normal leading-snug text-brand">Olá! Sou o concierge KORRES. Posso indicar a rotina ideal para a sua pele, confirmar prazo e frete ou ajudar com o seu pedido. Como posso ajudar?</p>
              <ul className="flex flex-col gap-2" aria-label="Sugestões de conversa">
                {INTENTS.map((i) => (
                  <li key={i}><button type="button" onClick={() => send(i)} className="min-h-11 w-full border border-hairline bg-white px-3 py-2 text-left text-[13.5px] font-normal text-brand transition-colors hover:border-brand active:bg-tint" data-testid="wa-intent">{i}</button></li>
                ))}
              </ul>
            </div>
            <div className="border-t border-hairline p-3">
              <button type="button" onClick={() => send('Gostaria de falar com um especialista')} className="flex min-h-12 w-full items-center justify-center gap-2 bg-[#128C4A] px-4 text-[14px] uppercase tracking-[0.5px] text-white transition-colors hover:bg-[#0f7a40] active:scale-[0.99]" data-testid="wa-open">
                <WhatsAppGlyph size={20} /> Conversar no WhatsApp
              </button>
              <p className="t-mono mt-2 text-center">Demonstração: abre o WhatsApp com uma mensagem pronta.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-center gap-3">
        <AnimatePresence>
          {tip && !open && (
            <motion.p initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } }} exit={{ opacity: 0, x: 8, transition: { duration: 0.2 } }} className="hidden border border-hairline bg-white px-3 py-2 text-[13px] font-normal text-brand shadow-[0_8px_24px_rgb(6_16_150/0.15)] sm:block" role="status">
              Precisa de ajuda? Fale com o concierge
            </motion.p>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={() => { setOpen((o) => !o); setTip(false) }}
          aria-expanded={open}
          aria-label={open ? 'Fechar concierge' : 'Falar com o concierge no WhatsApp'}
          className="relative grid size-14 place-items-center rounded-full bg-[#128C4A] text-white shadow-[0_8px_24px_rgb(18_140_74/0.45)] transition-transform duration-300 ease-[var(--ease-ios)] hover:scale-105 active:scale-95"
          data-testid="wa-fab"
        >
          {!open && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366] opacity-30 [animation-duration:2.6s]" aria-hidden />}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={open ? 'x' : 'wa'} initial={{ opacity: 0, rotate: -30, scale: 0.7 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: 30, scale: 0.7 }} transition={{ duration: 0.22 }} className="grid place-items-center">
              {open ? <CloseIcon size={24} /> : <WhatsAppGlyph size={28} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </div>
  )
}
