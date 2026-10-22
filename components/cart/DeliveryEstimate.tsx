'use client'
import { AnimatePresence, m as motion } from 'motion/react'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { formatShortDate } from '@/lib/format/date'
import { arrivalText, pickOption, type ShippingMethodId } from '@/lib/shipping/quote'
import { useLocation } from '@/lib/store/location'
import { useShipping } from '@/lib/useShipping'

/** Estimativa curta (drawer do carrinho): mesma fonte única de frete da PDP e do checkout. */
export function DeliveryEstimate({ subtotal, method = 'economica' }: { subtotal: number; method?: ShippingMethodId }) {
  const loc = useLocation((s) => s.location)
  const { status, options } = useShipping(subtotal)
  const opt = options.length ? pickOption(options, method) : null
  if (!loc) return null
  return (
    <div className="border border-hairline p-3 text-[13px] font-normal text-brand" aria-live="polite" data-testid="cart-estimate">
      <div className="flex items-start justify-between gap-3">
        <div className="min-h-10">
          <p className="t-mono">Entrega para {loc.city} – {loc.uf}</p>
          {opt ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.p key={`${opt.earliest}-${opt.latest}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="mt-0.5">{arrivalText(opt, formatShortDate)}</motion.p>
            </AnimatePresence>
          ) : (
            <div className="skeleton mt-1.5 h-4 w-48" />
          )}
        </div>
        <div className={status === 'loading' ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
          {opt && (opt.free ? <span className="font-medium text-success">Grátis</span> : <AnimatedNumber value={opt.price} className="font-medium" />)}
        </div>
      </div>
    </div>
  )
}
