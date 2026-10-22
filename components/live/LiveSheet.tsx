'use client'
import { AnimatePresence, m as motion } from 'motion/react'
import QRCode from 'qrcode'
import { useMemo, useState } from 'react'
import { FREE_SHIPPING_THRESHOLD } from '@/config/shipping'
import { ProductImage } from '@/components/product/ProductImage'
import { CheckIcon, CloseIcon, CopyIcon, PixIcon } from '@/components/ui/Icons'
import { Stepper } from '@/components/ui/misc'
import { getCommerce } from '@/lib/commerce/provider'
import type { Order } from '@/lib/commerce/types'
import { randomCustomer } from '@/lib/demo/random'
import { formatShortDate } from '@/lib/format/date'
import { formatBRL } from '@/lib/format/money'
import { computeTotals } from '@/lib/orders/build'
import { bestInstallment } from '@/lib/pricing'
import { arrivalText, pickOption, quoteShipping } from '@/lib/shipping/quote'
import { MAX_QTY, useCart } from '@/lib/store/cart'
import { useCartLines } from '@/lib/store/lines'
import type { SheetStep } from '@/lib/store/live'
import { useOrders } from '@/lib/store/orders'
import { cn } from '@/lib/cn'

const EASE = [0.32, 0.72, 0, 1] as const
const onlyDigits = (s: string) => s.replace(/\D/g, '')

function DrawnCheck() {
  return (
    <svg width="64" height="64" viewBox="0 0 72 72" fill="none" aria-hidden>
      <motion.circle cx="36" cy="36" r="33" stroke="#2f7d3a" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
      <motion.path d="m22 37 9 9 19-20" stroke="#2f7d3a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.45, ease: [0.22, 1, 0.36, 1] }} />
    </svg>
  )
}

/**
 * Sheet de compra sobre o vídeo (o vídeo segue tocando acima dele). Checkout expresso de demonstração:
 * usa o mesmo carrinho, as mesmas regras de frete/Pix/parcelas e o mesmo createOrder do checkout do site,
 * com dados de entrega aleatórios (porém válidos), como o "Preencher com dados aleatórios".
 */
export function LiveSheet({ step, onStep }: { step: SheetStep | null; onStep: (s: SheetStep | null) => void }) {
  const { lines, subtotal, count } = useCartLines()
  const setQty = useCart((s) => s.setQty)
  const [customer] = useState(() => randomCustomer())
  const [method, setMethod] = useState<'pix' | 'card'>('pix')
  const [busy, setBusy] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [qr, setQr] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const dest = { uf: customer.address.uf, city: customer.address.city, cep: onlyDigits(customer.cep) }
  const ship = useMemo(() => pickOption(quoteShipping({ destination: dest, subtotal, now: Date.now() }), 'economica'), [dest.uf, dest.city, dest.cep, subtotal]) // eslint-disable-line react-hooks/exhaustive-deps
  const totals = computeTotals({ subtotal, payment: method, shipping: ship.price })
  const inst = bestInstallment(totals.total)

  const confirm = async () => {
    setBusy(true)
    try {
      const o = await getCommerce().createOrder({
        contact: { email: customer.email, phone: customer.phone, marketing: false },
        customer: { firstName: customer.firstName, lastName: customer.lastName, cpf: customer.cpf },
        address: { cep: dest.cep, street: customer.address.street, number: customer.number, complement: customer.complement, neighborhood: customer.address.neighborhood, city: customer.address.city, uf: customer.address.uf, reference: customer.reference },
        shippingMethod: 'economica',
        payment: method === 'pix' ? { method: 'pix' } : { method: 'card', installments: inst.count, cardBrand: 'Visa' },
        items: lines.map((l) => ({ variantId: l.variant.id, slug: l.product.slug, name: l.product.name, variantLabel: l.variant.label, image: l.image, qty: l.qty, unitPrice: l.variant.price })),
        coupon: null,
      })
      useOrders.getState().add(o)
      useCart.getState().clear()
      setOrder(o)
      if (o.pix) QRCode.toDataURL(o.pix.code, { margin: 1, width: 168 }).then(setQr, () => setQr(null))
      onStep('done')
    } finally {
      setBusy(false)
    }
  }
  const copy = () => { if (order?.pix) navigator.clipboard?.writeText(order.pix.code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) }, () => {}) }
  const orderHref = order ? (process.env.NODE_ENV === 'production' ? `/pedido/${order.id}/` : `/pedido/?id=${order.id}`) : '#'

  const title = step === 'bag' ? 'Sua sacola' : step === 'pay' ? 'Finalizar compra' : 'Pedido confirmado'

  return (
    <AnimatePresence>
      {step && (
        <motion.div key="sheet" className="absolute inset-0 z-[5]" initial="h" animate="s" exit="h">
          <motion.div className="absolute inset-0 bg-black/45" variants={{ h: { opacity: 0 }, s: { opacity: 1 } }} onClick={() => onStep(null)} aria-hidden />
          <motion.section
            role="dialog"
            aria-label={title}
            className="absolute inset-x-0 bottom-0 top-[24%] flex flex-col bg-white text-brand"
            variants={{ h: { y: '100%', transition: { duration: 0.32, ease: EASE } }, s: { y: 0, transition: { duration: 0.45, ease: EASE } } }}
            data-testid="live-sheet"
            data-step={step}
          >
            <header className="flex items-center justify-between border-b border-hairline pl-4 pr-1">
              <h2 className="t-caps py-4 text-brand">{title}</h2>
              <button type="button" onClick={() => onStep(null)} aria-label="Voltar para a live" className="grid size-11 place-items-center" data-testid="live-sheet-close"><CloseIcon size={18} /></button>
            </header>

            <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
              {step === 'bag' && (
                lines.length === 0 ? (
                  <div className="p-8 text-center"><p className="font-hand text-[40px] leading-none">Sua sacola está vazia</p><p className="t-mono mt-3">Adicione os produtos da live para finalizar.</p></div>
                ) : (
                  <ul>
                    {lines.map((l) => (
                      <li key={l.variant.id} className="flex gap-3 border-b border-hairline p-3">
                        <div className="size-16 shrink-0 bg-surface p-1"><ProductImage src={l.image} alt="" sizes="64px" /></div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-[13px] font-medium leading-tight">{l.product.name}</p>
                          <p className="t-mono mt-0.5">{formatBRL(l.variant.price)}</p>
                          <div className="mt-1.5 flex items-center justify-between">
                            <Stepper size="sm" value={l.qty} max={MAX_QTY} onChange={(n) => setQty(l.variant.id, n)} label={`Quantidade de ${l.product.name}`} />
                            <span className="text-[14px]">{formatBRL(l.lineTotal)}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              )}

              {step === 'pay' && (
                <div className="space-y-4 p-4 text-[13px]">
                  <div className="border border-hairline p-3">
                    <p className="t-caps mb-1">Entrega</p>
                    <p className="font-normal">{customer.firstName} {customer.lastName}</p>
                    <p className="font-normal text-body">{customer.address.street}, {customer.number}{customer.complement ? ` · ${customer.complement}` : ''} · {customer.address.city}/{customer.address.uf}</p>
                    <p className="t-mono mt-1">{ship.label} · {ship.free ? 'grátis' : formatBRL(ship.price)} · {arrivalText(ship, formatShortDate)}</p>
                    <p className="t-mono mt-1 text-muted">Dados de demonstração preenchidos automaticamente.</p>
                  </div>
                  <fieldset>
                    <legend className="t-caps mb-1.5">Pagamento</legend>
                    <div className="grid gap-2">
                      {([['pix', 'Pix', `${formatBRL(computeTotals({ subtotal, payment: 'pix', shipping: ship.price }).total)} · 5% off nos produtos`], ['card', 'Cartão de crédito', `até ${inst.count}x de ${formatBRL(inst.value)} sem juros`]] as const).map(([id, label, hint]) => (
                        <label key={id} className={cn('flex min-h-14 cursor-pointer items-center gap-3 border px-3 py-2', method === id ? 'border-brand bg-tint' : 'border-hairline')}>
                          <input type="radio" name="live-pay" value={id} checked={method === id} onChange={() => setMethod(id)} className="size-4 accent-[#061096]" />
                          <span className="flex-1"><span className="flex items-center gap-1.5 font-medium">{id === 'pix' && <PixIcon size={16} />}{label}</span><span className="t-mono block">{hint}</span></span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              )}

              {step === 'done' && order && (
                <div className="flex flex-col items-center px-5 py-6 text-center">
                  <DrawnCheck />
                  <p className="font-hand mt-2 text-[40px] leading-none">Obrigada!</p>
                  <p className="t-mono mt-2" data-testid="live-order-id">Pedido {order.id} · {formatBRL(order.totals.total)}</p>
                  {order.pix ? (
                    <div className="mt-4 flex flex-col items-center gap-2">
                      <p className="text-[13px] font-normal text-body">Pague o Pix para confirmar. A live continua rolando.</p>
                      {qr && <img src={qr} alt="QR Code do Pix" width={132} height={132} className="border border-hairline" />}
                      <button type="button" onClick={copy} className="flex min-h-11 items-center gap-2 border border-hairline px-3 text-[12.5px] hover:bg-tint">{copied ? <><CheckIcon size={15} /> Copiado</> : <><CopyIcon size={15} /> Pix copia e cola</>}</button>
                    </div>
                  ) : (
                    <p className="mt-4 text-[13px] font-normal text-body">Pagamento no cartão aprovado. Você recebe os detalhes por e-mail.</p>
                  )}
                </div>
              )}
            </div>

            <footer className="space-y-2 border-t border-hairline p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
              {step === 'bag' && lines.length > 0 && (
                <>
                  <p className={cn('text-[12px]', subtotal >= FREE_SHIPPING_THRESHOLD ? 'text-success' : 'text-muted')}>{subtotal >= FREE_SHIPPING_THRESHOLD ? 'Frete grátis na entrega econômica' : `Faltam ${formatBRL(FREE_SHIPPING_THRESHOLD - subtotal)} para o frete grátis`}</p>
                  <div className="flex items-baseline justify-between"><span className="t-caps">Subtotal ({count})</span><span className="text-[18px]">{formatBRL(subtotal)}</span></div>
                  <button type="button" onClick={() => onStep('pay')} className="h-12 w-full border border-brand bg-brand text-[13px] uppercase tracking-[0.5px] text-white hover:bg-[#0a14b8]" data-testid="live-go-pay">Prosseguir com sua compra</button>
                </>
              )}
              {step === 'bag' && lines.length === 0 && <button type="button" onClick={() => onStep(null)} className="h-12 w-full border border-brand text-[13px] uppercase tracking-[0.5px]">Voltar para a live</button>}
              {step === 'pay' && (
                <>
                  <dl className="space-y-0.5 text-[12.5px]">
                    <div className="flex justify-between"><dt>Produtos</dt><dd>{formatBRL(totals.subtotal)}</dd></div>
                    <div className="flex justify-between"><dt>Frete</dt><dd>{ship.free ? 'Grátis' : formatBRL(ship.price)}</dd></div>
                    {totals.pixDiscount > 0 && <div className="flex justify-between text-success"><dt>Desconto Pix</dt><dd>−{formatBRL(totals.pixDiscount)}</dd></div>}
                    <div className="flex justify-between text-[16px]"><dt className="t-caps self-center">Total</dt><dd>{formatBRL(totals.total)}</dd></div>
                  </dl>
                  <button type="button" disabled={busy || lines.length === 0} onClick={confirm} className="h-12 w-full border border-brand bg-brand text-[13px] uppercase tracking-[0.5px] text-white hover:bg-[#0a14b8] disabled:border-muted disabled:bg-muted" data-testid="live-confirm">{busy ? 'Confirmando…' : `Confirmar pedido · ${formatBRL(totals.total)}`}</button>
                  <button type="button" onClick={() => onStep('bag')} className="h-9 w-full text-[12px] underline">Voltar à sacola</button>
                </>
              )}
              {step === 'done' && (
                <>
                  <button type="button" onClick={() => onStep(null)} className="h-12 w-full border border-brand bg-brand text-[13px] uppercase tracking-[0.5px] text-white" data-testid="live-continue">Continuar assistindo</button>
                  <a href={orderHref} target="_blank" rel="noopener" className="flex h-9 items-center justify-center text-[12px] underline">Ver pedido em nova aba</a>
                </>
              )}
            </footer>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
