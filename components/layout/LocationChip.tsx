'use client'
import { AnimatePresence, m as motion } from 'motion/react'
import { PinIcon } from '@/components/ui/Icons'
import { useLocation } from '@/lib/store/location'
import { cn } from '@/lib/cn'

/** "Entregar em Curitiba – PR · Alterar". Na primeira visita pergunta "Detectamos sua cidade. Está certo?". */
export function LocationChip({ className, bubble = true, compact = false, strip = false }: { className?: string; bubble?: boolean; compact?: boolean; strip?: boolean }) {
  const location = useLocation((s) => s.location)
  const status = useLocation((s) => s.status)
  const setOpen = useLocation((s) => s.setModalOpen)
  const confirm = useLocation((s) => s.confirm)
  const ask = (bubble || strip) && status === 'ready' && location && !location.confirmed && location.source !== 'fallback'
  // No mobile (faixa sob o header) a pergunta vira uma linha inline: nada de balão cobrindo o conteúdo.
  if (strip && ask) {
    return (
      <div className={cn('flex w-full items-center justify-between gap-2', className)} role="status" data-testid="location-ask">
        <p className="min-w-0 truncate text-[13px] font-normal text-brand">Entregar em <b className="font-medium">{location.city} – {location.uf}</b>?</p>
        <div className="flex shrink-0 gap-1.5">
          <button type="button" onClick={confirm} className="min-h-9 bg-brand px-3 text-[12px] uppercase tracking-wide text-white active:opacity-80">Sim</button>
          <button type="button" onClick={() => setOpen(true)} className="min-h-9 border border-hairline px-3 text-[12px] uppercase tracking-wide text-brand active:bg-tint">Alterar</button>
        </div>
      </div>
    )
  }
  return (
    <div className={cn('relative', className)}>
      <button type="button" onClick={() => setOpen(true)} className={cn('group relative flex items-center gap-1.5 text-[13px] font-normal leading-none text-brand after:absolute after:-inset-x-2 after:-inset-y-3 after:content-[""]', compact && 'max-w-[200px]')} data-testid="location-chip" aria-label={location ? `Entregar em ${location.city}, ${location.uf}. Alterar` : 'Informar localização'}>
        <PinIcon size={15} />
        {location ? (
          <motion.span key={`${location.city}-${location.uf}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="truncate whitespace-nowrap">
            {!compact && 'Entregar em '}<b className="font-medium">{location.city} – {location.uf}</b>
          </motion.span>
        ) : (
          <span className="skeleton inline-block h-3 w-28" />
        )}
        <span className="link-underline ml-1 shrink-0 text-muted group-hover:text-brand">· Alterar</span>
      </button>
      <AnimatePresence>
        {ask && !strip && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }} transition={{ delay: 0.8, duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="absolute right-0 top-[calc(100%+10px)] z-40 w-[260px] border border-brand bg-white p-3 text-left shadow-[0_10px_30px_rgb(6_16_150/0.16)] max-xl:left-0 max-xl:right-auto" role="status">
            <span className="absolute -top-[6px] right-8 size-3 rotate-45 border-l border-t border-brand bg-white max-xl:left-8 max-xl:right-auto" aria-hidden />
            <p className="text-[13px] font-normal leading-snug text-brand">Detectamos sua cidade. Está certo?</p>
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={confirm} className="bg-brand px-3 py-1.5 text-[12px] uppercase tracking-wide text-white">Sim, é aqui</button>
              <button type="button" onClick={() => setOpen(true)} className="border border-hairline px-3 py-1.5 text-[12px] uppercase tracking-wide text-brand">Alterar</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
