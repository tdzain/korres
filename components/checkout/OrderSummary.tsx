'use client'
import { AnimatePresence, m as motion } from 'motion/react'
import { useState } from 'react'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { LockIcon, ShieldIcon, CheckIcon, CloseIcon } from '@/components/ui/Icons'
import { ProductImage } from '@/components/product/ProductImage'
import { cn } from '@/lib/cn'
import { formatBRL } from '@/lib/format/money'
import { bestInstallment } from '@/lib/pricing'
import type { OrderTotals } from '@/lib/commerce/types'
import type { CartLine } from '@/lib/store/lines'

export type CouponState = { status: 'idle' | 'checking' | 'valid' | 'invalid'; code?: string; label?: string; message?: string }

function Row({ label, value, strong, accent }: { label: string; value: React.ReactNode; strong?: boolean; accent?: boolean }) {
  return <div className={cn('flex items-baseline justify-between gap-3 text-[14px]', strong ? 'text-brand' : 'text-body', accent && 'text-success')}><dt>{label}</dt><dd className="tabular-nums">{value}</dd></div>
}

/** Linha animada de desconto: o motion.div é o próprio grupo dt/dd (estrutura válida dentro de <dl>). */
function DiscountRow({ id, label, amount }: { id: string; label: string; amount: number }) {
  return (
    <motion.div key={id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-baseline justify-between gap-3 overflow-hidden text-[14px] text-success">
      <dt>{label}</dt><dd className="tabular-nums">− <AnimatedNumber value={amount} /></dd>
    </motion.div>
  )
}

export function CouponBox({ coupon, onApply, onRemove, idPrefix = 'main' }: { coupon: CouponState; onApply: (code: string) => void; onRemove: () => void; idPrefix?: string }) {
  const [code, setCode] = useState('')
  const invalid = coupon.status === 'invalid'
  return (
    <div>
      {coupon.status === 'valid' ? (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-2 border border-success bg-white px-3 py-2.5 text-[13.5px] text-success" role="status">
          <span className="flex items-center gap-2"><CheckIcon size={16} /> <b className="font-medium">{coupon.code}</b> · {coupon.label}</span>
          <button type="button" onClick={onRemove} aria-label="Remover cupom" className="text-brand"><CloseIcon size={14} /></button>
        </motion.div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (code.trim()) onApply(code) }} className="flex gap-2" noValidate>
          <div className={cn('flex-1 border bg-white', invalid ? 'anim-shake border-danger' : 'border-hairline focus-within:border-brand')}>
            <label htmlFor={`coupon-${idPrefix}`} className="sr-only">Código de desconto</label>
            <input id={`coupon-${idPrefix}`} name="coupon" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Código de desconto" autoComplete="off" className="h-11 w-full bg-transparent px-3 text-[14px] font-normal uppercase text-brand outline-none placeholder:normal-case placeholder:text-muted" />
          </div>
          <button type="submit" disabled={!code.trim() || coupon.status === 'checking'} className="min-w-[96px] border border-hairline bg-white px-4 text-[13px] uppercase tracking-wide text-brand transition-colors hover:bg-tint disabled:opacity-50">
            {coupon.status === 'checking' ? <span className="anim-pulse">Validando…</span> : 'Aplicar'}
          </button>
        </form>
      )}
      {invalid && <p role="alert" className="mt-1.5 text-[12.5px] font-normal text-danger">{coupon.message}</p>}
    </div>
  )
}

export function SummaryBody({ lines, totals, shippingLabel, payment, coupon, onApply, onRemove, idPrefix, splitParts }: { splitParts?: { label: string; amount: number }[]; idPrefix?: string; lines: CartLine[]; totals: OrderTotals; shippingLabel: React.ReactNode; payment: 'pix' | 'card' | 'boleto' | 'split'; coupon: CouponState; onApply: (c: string) => void; onRemove: () => void }) {
  const inst = bestInstallment(totals.total)
  return (
    <div className="space-y-5">
      <ul className="space-y-4" aria-label="Itens do pedido">
        {lines.map((l) => (
          <li key={l.variant.id} className="flex items-center gap-3">
            <div className="relative size-16 shrink-0 border border-hairline bg-white">
              <ProductImage src={l.image} alt="" sizes="64px" />
              <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-brand font-mono text-[11px] text-white">{l.qty}</span>
            </div>
            <div className="min-w-0 flex-1"><p className="t-label line-clamp-2">{l.product.name}</p>{l.product.variants.length > 1 && <p className="t-mono">{l.variant.label}</p>}</div>
            <p className="text-[14px] font-normal text-brand">{formatBRL(l.lineTotal)}</p>
          </li>
        ))}
      </ul>
      <CouponBox coupon={coupon} onApply={onApply} onRemove={onRemove} idPrefix={idPrefix} />
      <dl className="space-y-2 border-t border-hairline pt-4" aria-live="polite" data-testid="totals">
        <Row label="Subtotal" value={<AnimatedNumber value={totals.subtotal} />} />
        <AnimatePresence initial={false}>
          {totals.couponDiscount > 0 && <DiscountRow key="c" id="c" label="Cupom" amount={totals.couponDiscount} />}
          {totals.pixDiscount > 0 && <DiscountRow key="p" id="p" label="Desconto Pix (5%)" amount={totals.pixDiscount} />}
        </AnimatePresence>
        <Row label="Frete" value={shippingLabel} />
        <div className="flex items-baseline justify-between border-t border-hairline pt-3 text-brand">
          <dt className="text-[16px] font-medium uppercase tracking-wide">Total</dt>
          <dd className="text-[24px] font-normal tabular-nums" data-testid="order-total"><AnimatedNumber value={totals.total} /></dd>
        </div>
      </dl>
      {payment === 'split' && splitParts && (
        <ul className="-mt-3 space-y-1 border border-hairline bg-white p-3 text-[13px] text-body" aria-label="Como você vai pagar" data-testid="summary-split">
          {splitParts.map((p, i) => <li key={i} className="flex justify-between gap-3"><span>{p.label}</span><span className="tabular-nums text-brand">{formatBRL(p.amount)}</span></li>)}
        </ul>
      )}
      {payment !== 'pix' && payment !== 'split' && inst.count > 1 && <p className="t-mono -mt-3 text-right">ou {inst.count}x de {formatBRL(inst.value)} sem juros</p>}
      {payment === 'pix' && <p className="t-mono -mt-3 text-right">Valor com 5% de desconto no Pix</p>}
      <ul className="grid gap-2 border-t border-hairline pt-4 text-[12.5px] font-normal text-body">
        <li className="flex items-center gap-2"><LockIcon size={15} className="text-brand" /> Ambiente seguro, dados protegidos</li>
        <li className="flex items-center gap-2"><ShieldIcon size={15} className="text-brand" /> Troca em até 30 dias</li>
      </ul>
      <p className="border border-hairline bg-white p-3 text-[12.5px] font-normal leading-snug text-brand" data-testid="demo-note">Ambiente de demonstração: nenhuma cobrança será feita e nenhum dado de pagamento é enviado.</p>
    </div>
  )
}
