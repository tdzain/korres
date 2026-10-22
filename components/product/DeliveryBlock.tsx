'use client'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { ClockIcon, PinIcon, TruckIcon } from '@/components/ui/Icons'
import { Popover } from '@/components/ui/misc'
import { FREE_SHIPPING_THRESHOLD } from '@/config/shipping'
import { cn } from '@/lib/cn'
import { formatCountdown, formatShortDate } from '@/lib/format/date'
import { formatBRL } from '@/lib/format/money'
import { useNow } from '@/lib/hooks'
import { cutoffInfo } from '@/lib/shipping/calendar'
import { arrivalText, pickOption, type ShippingOption } from '@/lib/shipping/quote'
import { useLocation } from '@/lib/store/location'
import { useShipping } from '@/lib/useShipping'

const ease = [0.22, 1, 0.36, 1] as const

/** Datas em crossfade: a chave muda quando as datas mudam. */
function Dates({ option }: { option: ShippingOption }) {
  const text = arrivalText(option, formatShortDate)
  return (
    <span className="relative inline-grid">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={text} initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(3px)' }} transition={{ duration: 0.4, ease }}>
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function Price({ option }: { option: ShippingOption }) {
  return option.free ? (
    <motion.span key="free" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="font-medium text-success">Frete grátis</motion.span>
  ) : (
    <span>por <AnimatedNumber value={option.price} className="font-medium" /></span>
  )
}

function Countdown() {
  const now = useNow(1000)
  if (now === undefined) return <span className="skeleton inline-block h-4 w-56 align-middle" />
  const info = cutoffInfo(now)
  if (info.beforeCutoff && info.msUntilCutoff !== null) {
    return <span>Comprando nas próximas <b className="font-medium tabular-nums text-brand" data-testid="cutoff-countdown">{formatCountdown(info.msUntilCutoff)}</b>, o pedido sai hoje</span>
  }
  return <span>Pedidos feitos agora saem em <b className="font-medium text-brand">{formatShortDate(info.dispatchDate)}</b></span>
}

/**
 * Entrega inteligente no estilo Mercado Livre: prazo e frete já na PDP, pela cidade detectada, sem pedir CEP.
 * `subtotal` é o valor da linha (preço × quantidade) e define a elegibilidade ao frete grátis.
 */
export function DeliveryBlock({ subtotal }: { subtotal: number }) {
  const location = useLocation((s) => s.location)
  const setModal = useLocation((s) => s.setModalOpen)
  const { status, options, retry } = useShipping(subtotal)
  const [open, setOpen] = useState(false)
  const eco = options.length ? pickOption(options, 'economica') : null
  const missing = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)

  return (
    <section aria-label="Entrega" className="border border-hairline p-4 text-[14px] font-normal text-brand" data-testid="delivery-block" aria-live="polite">
      {!location || (!eco && status !== 'error') ? (
        <div className="space-y-3" aria-busy="true" data-testid="delivery-skeleton">
          <div className="skeleton h-5 w-4/5" /><div className="skeleton h-4 w-3/5" /><div className="skeleton h-4 w-2/3" />
        </div>
      ) : status === 'error' && !eco ? (
        <div className="flex items-center justify-between gap-3">
          <p>Não conseguimos calcular o prazo agora.</p>
          <button type="button" onClick={retry} className="link-static-underline shrink-0">Tentar de novo</button>
        </div>
      ) : eco ? (
        <div className={cn('space-y-3 transition-opacity duration-300', status === 'loading' && 'opacity-60')}>
          <div className="flex items-start gap-3">
            <TruckIcon size={20} className="mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-[15.5px] font-medium leading-snug" data-testid="delivery-dates"><Dates option={eco} /></p>
              <p className="mt-0.5 text-[14px] text-body" data-testid="delivery-price"><Price option={eco} /></p>
              {!eco.free && missing > 0 && <p className="t-mono mt-1">Frete grátis nas compras acima de {formatBRL(FREE_SHIPPING_THRESHOLD).replace(/,00$/, '')} (faltam {formatBRL(missing)}).</p>}
            </div>
          </div>
          <div className="flex items-start gap-3 text-[13.5px] text-body"><ClockIcon size={18} className="mt-0.5 shrink-0 text-brand" /><p><Countdown /></p></div>
          <div className="flex items-start gap-3 text-[13.5px] text-body">
            <PinIcon size={18} className="mt-0.5 shrink-0 text-brand" />
            <p>
              Estimativa para <b className="font-medium text-brand">{location.city} – {location.uf}</b>
              {location.cep ? <> (CEP {location.cep}). </> : <>. </>}
              <button type="button" onClick={() => setModal(true)} className="link-static-underline font-medium text-brand" data-testid="confirm-cep">{location.cep ? 'Alterar CEP' : 'Informe seu CEP para confirmar'}</button>
            </p>
          </div>
          <div className="relative border-t border-hairline pt-3">
            <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="link-static-underline text-[13.5px] text-brand" data-testid="other-shipping">Ver outras formas de entrega</button>
            <Popover open={open} onClose={() => setOpen(false)} className="!mt-2">
              <ul className="divide-y divide-hairline" aria-label="Formas de entrega">
                {options.map((o) => (
                  <li key={o.id} className="flex items-start justify-between gap-3 p-3">
                    <div>
                      <p className="text-[14px] font-medium text-brand">{o.label}</p>
                      <p className="text-[13px] text-body">{o.id === 'retirada' ? `Pronto para retirada ${formatShortDate(o.earliest)}` : arrivalText(o, formatShortDate)}</p>
                      {o.id === 'retirada' && <p className="t-mono">{o.description}</p>}
                    </div>
                    <p className={cn('shrink-0 text-[14px]', o.free ? 'font-medium text-success' : 'text-brand')}>{o.free ? 'Grátis' : formatBRL(o.price)}</p>
                  </li>
                ))}
              </ul>
            </Popover>
          </div>
        </div>
      ) : null}
    </section>
  )
}
