'use client'
import { AnimatePresence, m as motion } from 'motion/react'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { CheckIcon, CopyIcon, PixIcon } from '@/components/ui/Icons'
import { Logo } from '@/components/ui/Logo'
import { ProductImage } from '@/components/product/ProductImage'
import { cn } from '@/lib/cn'
import type { Order } from '@/lib/commerce/types'
import { formatShortDate } from '@/lib/format/date'
import { formatBRL } from '@/lib/format/money'
import { useNow } from '@/lib/hooks'
import { arrivalText } from '@/lib/shipping/quote'
import { useOrders } from '@/lib/store/orders'
import { useReady } from '@/lib/store/ready'
import { useDemo } from '@/lib/store/ui'

function useOrderId() {
  const [id, setId] = useState<string | null>(null)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('id')
    const seg = window.location.pathname.split('/').filter(Boolean)
    setId(q ?? (seg[0] === 'pedido' && seg[1] ? seg[1] : null))
  }, [])
  return id
}

/** Checkmark que se desenha (stroke). */
function DrawnCheck({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" aria-hidden>
      <motion.circle cx="36" cy="36" r="33" stroke="#2f7d3a" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
      <motion.path d="m22 37 9 9 19-20" stroke="#2f7d3a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }} />
    </svg>
  )
}

function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(value) } catch { /* clipboard indisponível: o texto continua selecionável */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }
  return (
    <div>
      <p className="t-caps mb-2 text-brand">{label}</p>
      <div className="flex items-stretch border border-hairline">
        <p className="min-w-0 flex-1 break-all px-3 py-2.5 font-mono text-[12px] leading-snug text-brand select-all" data-testid="copy-value">{value}</p>
        <button type="button" onClick={copy} className={cn('relative flex w-[104px] shrink-0 items-center justify-center gap-1.5 border-l border-hairline text-[13px] uppercase tracking-wide transition-colors', copied ? 'bg-success text-white' : 'bg-white text-brand hover:bg-tint')} aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={String(copied)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="flex items-center gap-1.5">
              {copied ? <><CheckIcon size={14} /> Copiado</> : <><CopyIcon size={14} /> Copiar</>}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </div>
  )
}

function Ring({ remaining, total }: { remaining: number; total: number }) {
  const r = 34
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, remaining / total))
  const mm = Math.floor(remaining / 60000)
  const ss = Math.floor((remaining % 60000) / 1000)
  return (
    <div className="relative size-[84px] shrink-0" role="timer" aria-label={`Expira em ${mm} minutos e ${ss} segundos`}>
      <svg viewBox="0 0 84 84" className="size-full -rotate-90">
        <circle cx="42" cy="42" r={r} fill="none" stroke="#e4e6f4" strokeWidth="4" />
        <circle cx="42" cy="42" r={r} fill="none" stroke="#061096" strokeWidth="4" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="butt" style={{ transition: 'stroke-dashoffset 1s linear' }} />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-mono text-[15px] tabular-nums text-brand">{String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}</span>
    </div>
  )
}

function PixPanel({ order }: { order: Order }) {
  const [qr, setQr] = useState('')
  const now = useNow(1000)
  const demo = useDemo((s) => s.enabled)
  const paid = order.status === 'paid'
  const code = order.pix!.code
  useEffect(() => { void QRCode.toDataURL(code, { margin: 1, width: 240, color: { dark: '#061096', light: '#ffffff' } }).then(setQr) }, [code])
  const expires = new Date(order.pix!.expiresAt).getTime()
  const remaining = now === undefined ? 30 * 60_000 : Math.max(0, expires - Date.now())

  return (
    <section aria-label="Pagamento via Pix" className="border border-hairline" data-testid="pix-panel">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
        <h2 className="flex items-center gap-2 text-[16px] font-medium text-brand"><PixIcon size={18} /> Pagamento via Pix <span className="font-mono text-[13px] font-normal text-muted" data-testid="pix-amount">· {formatBRL(order.pix!.amount ?? order.totals.total)}</span></h2>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={paid ? 'paid' : 'wait'} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className={cn('flex items-center gap-2 text-[13px] font-medium', paid ? 'text-success' : 'text-brand')} role="status" data-testid="pix-status">
            {paid ? <><CheckIcon size={15} /> Pagamento aprovado</> : <><span className="anim-pulse size-2 rounded-full bg-brand" aria-hidden /> Aguardando pagamento</>}
          </motion.p>
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {paid ? (
          <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid place-items-center gap-3 px-4 py-12 text-center"><DrawnCheck size={64} /><p className="text-[16px] font-medium text-success">Recebemos o seu Pix. Obrigado!</p><p className="t-mono">Já estamos separando o seu pedido.</p></motion.div>
        ) : (
          <motion.div key="wait" exit={{ opacity: 0 }} className="grid gap-6 p-4 md:grid-cols-[240px_1fr]">
            <div className="mx-auto w-[240px]">
              {qr ? <img src={qr} alt="QR Code do Pix" width={240} height={240} className="border border-hairline" data-testid="pix-qr" /> : <div className="skeleton size-[240px]" />}
            </div>
            <div className="space-y-4">
              <p className="text-[14px] font-normal text-body">Abra o app do seu banco, escolha <b className="font-medium text-brand">Pix</b> e escaneie o QR Code ou use o código copia e cola.</p>
              <CopyField value={code} label="Pix copia e cola" />
              <div className="flex items-center gap-4"><Ring remaining={remaining} total={30 * 60_000} /><p className="t-mono">O código expira em 30 minutos. Verificando o pagamento automaticamente…</p></div>
              {demo && <Button variant="outline" onClick={() => useOrders.getState().markPaid(order.id)} data-testid="simulate-pix">Simular pagamento aprovado</Button>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

/** Pedido com mais de uma forma de pagamento: mostra cada parte e o status dela. */
function PartsPanel({ order }: { order: Order }) {
  const paidAll = order.status === 'paid'
  return (
    <section aria-label="Formas de pagamento" className="border border-hairline" data-testid="parts-panel">
      <h2 className="border-b border-hairline px-4 py-3 text-[16px] font-medium text-brand">Pagamento em duas formas</h2>
      <ul className="divide-y divide-hairline">
        {order.parts!.map((p, i) => {
          const done = p.status === 'paid' || paidAll
          const label = p.method === 'pix' ? 'Pix' : `Cartão${order.parts!.filter((x) => x.method === 'card').length > 1 ? ` ${order.parts!.filter((x) => x.method === 'card').indexOf(p) + 1}` : ''}${p.cardBrand && p.cardBrand !== 'Cartão' ? ` (${p.cardBrand})` : ''}`
          return (
            <li key={i} className="flex items-center justify-between gap-3 px-4 py-3 text-[14px]">
              <div>
                <p className="font-medium text-brand">{label}</p>
                <p className="t-mono">{p.method === 'card' ? `${p.installments ?? 1}x sem juros` : 'QR Code abaixo'}</p>
              </div>
              <div className="text-right">
                <p className="tabular-nums text-brand">{formatBRL(p.charge)}</p>
                <p className={cn('flex items-center justify-end gap-1 text-[12.5px]', done ? 'text-success' : 'text-muted')}>{done ? <><CheckIcon size={12} /> Aprovado</> : <><span className="anim-pulse size-1.5 rounded-full bg-brand" aria-hidden /> Aguardando</>}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function OrderConfirmation() {
  const id = useOrderId()
  const ready = useReady((s) => s.ready)
  const order = useOrders((s) => s.orders.find((o) => o.id === id))
  const [, setPoll] = useState(0)

  // Polling simulado do status do Pix.
  useEffect(() => {
    if (!order || order.status === 'paid' || !order.pix) return
    const t = setInterval(() => setPoll((n) => n + 1), 3000)
    return () => clearInterval(t)
  }, [order])

  if (!ready || id === null) return <div className="grid min-h-[50vh] place-items-center"><div className="skeleton h-6 w-48" /></div>
  if (!order) {
    return (
      <div className="gutter grid min-h-[60vh] place-items-center py-20 text-center">
        <div><p className="font-hand text-[48px] leading-none text-brand">Pedido não encontrado</p><p className="t-mono mt-3">Este protótipo guarda os pedidos apenas no seu navegador.</p><div className="mt-6 flex justify-center"><Button href="/">Voltar à loja</Button></div></div>
      </div>
    )
  }
  const paid = order.status === 'paid'
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 lg:py-16">
      <div className="flex flex-col items-center text-center">
        <DrawnCheck />
        <h1 className="mt-5 text-[28px] font-normal text-brand md:text-[38px]">{paid ? 'Pedido confirmado!' : 'Pedido recebido!'}</h1>
        <p className="mt-2 text-[15px] font-normal text-body">Número do pedido <b className="font-mono font-medium text-brand" data-testid="order-id">{order.id}</b></p>
        <p className="t-mono mt-1">Enviamos os detalhes para {order.contact.email}</p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.25fr_1fr]">
        <div className="space-y-6">
          {order.parts && <PartsPanel order={order} />}
          {order.pix && <PixPanel order={order} />}
          {order.payment.method === 'boleto' && order.boleto && (
            <section className="space-y-4 border border-hairline p-4" aria-label="Boleto"><h2 className="text-[16px] font-medium text-brand">Boleto bancário</h2><CopyField value={order.boleto.line} label="Linha digitável (exemplo)" /><p className="t-mono">Vencimento: {formatShortDate(order.boleto.dueDate)} · documento fictício de demonstração.</p></section>
          )}
          {order.payment.method === 'card' && (
            <section className="flex items-center gap-3 border border-hairline p-4 text-[14px] font-normal text-brand"><span className="grid size-6 place-items-center bg-success text-white"><CheckIcon size={14} /></span> Pagamento aprovado no cartão em {order.payment.installments ?? 1}x sem juros.</section>
          )}

          <section className="border border-hairline" aria-label="Entrega">
            <h2 className="border-b border-hairline px-4 py-3 text-[16px] font-medium text-brand">Previsão de entrega</h2>
            <div className="space-y-1 p-4 text-[14px] font-normal text-body">
              <p className="text-[16px] font-medium text-brand" data-testid="order-eta">{order.shipping.id === 'retirada' ? `Pronto para retirada ${formatShortDate(order.shipping.earliest)}` : arrivalText(order.shipping, formatShortDate)}</p>
              <p>{order.shipping.label}{order.shipping.free ? ' · frete grátis' : ` · ${formatBRL(order.shipping.price)}`}</p>
              <p className="t-mono pt-2">{order.address.street}, {order.address.number}{order.address.complement ? ` – ${order.address.complement}` : ''} · {order.address.neighborhood} · {order.address.city} – {order.address.uf} · CEP {order.address.cep.replace(/(\d{5})(\d{3})/, '$1-$2')}</p>
            </div>
          </section>
        </div>

        <aside className="h-fit border border-hairline bg-tint" aria-label="Resumo do pedido">
          <h2 className="border-b border-hairline px-4 py-3 text-[16px] font-medium text-brand">Resumo</h2>
          <ul className="divide-y divide-hairline">
            {order.items.map((i) => (
              <li key={i.variantId} className="flex items-center gap-3 p-4">
                <div className="relative size-14 shrink-0 border border-hairline bg-white"><ProductImage src={i.image} alt="" sizes="56px" /><span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-brand font-mono text-[11px] text-white">{i.qty}</span></div>
                <p className="t-label flex-1">{i.name}</p>
                <p className="text-[14px] text-brand">{formatBRL(i.unitPrice * i.qty)}</p>
              </li>
            ))}
          </ul>
          <dl className="space-y-1.5 border-t border-hairline p-4 text-[14px] text-body">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatBRL(order.totals.subtotal)}</dd></div>
            {order.totals.couponDiscount > 0 && <div className="flex justify-between text-success"><dt>Cupom</dt><dd>− {formatBRL(order.totals.couponDiscount)}</dd></div>}
            {order.totals.pixDiscount > 0 && <div className="flex justify-between text-success"><dt>Desconto Pix</dt><dd>− {formatBRL(order.totals.pixDiscount)}</dd></div>}
            <div className="flex justify-between"><dt>Frete</dt><dd>{order.totals.shipping === 0 ? 'Grátis' : formatBRL(order.totals.shipping)}</dd></div>
            <div className="flex justify-between border-t border-hairline pt-2 text-[18px] text-brand"><dt>Total</dt><dd data-testid="confirm-total">{formatBRL(order.totals.total)}</dd></div>
          </dl>
        </aside>
      </div>

      <div className="mt-12 flex flex-col items-center gap-4">
        <Button href="/" size="lg">Continuar comprando</Button>
        <Logo height={16} className="text-brand/60" />
        <p className="t-mono">Ambiente de demonstração · nenhuma cobrança foi feita.</p>
      </div>
    </div>
  )
}
