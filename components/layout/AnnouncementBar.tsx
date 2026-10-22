'use client'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { FREE_SHIPPING_THRESHOLD } from '@/config/shipping'
import { formatBRL } from '@/lib/format/money'
import { usePrefs } from '@/lib/store/prefs'
import { CloseIcon } from '@/components/ui/Icons'

const MESSAGES = [
  `Frete grátis em compras acima de ${formatBRL(FREE_SHIPPING_THRESHOLD).replace(/,00$/, '')}`,
  'Pix com 5% de desconto · até 6x sem juros',
  'Primeira compra: 15% off com o cupom BEMVINDO15',
]

/** Barra de anúncio de 34px: indicador de slides à esquerda, mensagem ao centro, "Fechar ×" à direita. */
export function AnnouncementBar() {
  const closed = usePrefs((s) => s.announcementClosed)
  const close = usePrefs((s) => s.closeAnnouncement)
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % MESSAGES.length), 4500)
    return () => clearInterval(id)
  }, [])
  if (closed) return null
  return (
    <div className="relative flex h-[34px] items-center justify-center bg-surface px-10 text-[13px] text-muted md:text-[14px]" role="region" aria-label="Avisos da loja">
      <div className="absolute left-4 flex gap-1" aria-hidden>
        {MESSAGES.map((_, n) => <span key={n} className={`size-[5px] rounded-full transition-colors duration-300 ${n === i ? 'bg-brand' : 'bg-[#cfd1e6]'}`} />)}
      </div>
      <div className="relative h-5 w-full overflow-hidden text-center" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={i} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 truncate leading-5">
            {MESSAGES[i]}
          </motion.p>
        </AnimatePresence>
      </div>
      <button type="button" onClick={close} className="absolute right-4 flex items-center gap-1 text-[13px] text-muted hover:text-brand md:text-[14px]" aria-label="Fechar aviso">
        <span className="hidden sm:inline">Fechar</span> <CloseIcon size={12} />
      </button>
    </div>
  )
}
