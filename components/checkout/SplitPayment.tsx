'use client'
import { useEffect, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Field } from '@/components/ui/Field'
import { cn } from '@/lib/cn'
import { formatBRL, roundMoney } from '@/lib/format/money'
import { clampShare, MIN_PART, planSplit, shareBounds, type SplitMode } from '@/lib/orders/split'
import { CardFields } from './CardFields'
import type { CheckoutValues } from './schema'

const toText = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const parse = (t: string) => Number(t.replace(/\./g, '').replace(',', '.')) || 0
const maskMoney = (raw: string) => toText(Number(raw.replace(/\D/g, '') || '0') / 100)

const MODES: { id: SplitMode; label: string; hint: string }[] = [
  { id: 'pix_card', label: 'Pix + Cartão', hint: '5% off na parte do Pix' },
  { id: 'card_card', label: 'Dois cartões', hint: 'Cada um com suas parcelas' },
]

/** Pagamento combinado: define quanto vai na 1ª forma; a 2ª paga o restante. */
export function SplitPayment({ form, payable, base }: { form: UseFormReturn<CheckoutValues>; payable: number; base: number }) {
  const { watch, setValue, getValues } = form
  const v = watch()
  const mode = v.splitMode
  const { min, max } = shareBounds(payable)
  const share = clampShare(payable, v.splitShare)
  const plan = planSplit({ base, payable, mode, share })
  const [text, setText] = useState(() => toText(share))
  const [flipA, setFlipA] = useState(false)
  const [flipB, setFlipB] = useState(false)

  // Valor inicial (metade) e reajuste quando o total muda (cupom, frete).
  useEffect(() => {
    const cur = getValues('splitShare')
    const next = cur < min ? roundMoney(payable / 2) : clampShare(payable, cur)
    if (next !== cur) { setValue('splitShare', next); setText(toText(next)) }
  }, [payable, min, getValues, setValue])

  const setShare = (n: number) => { const c = clampShare(payable, n); setValue('splitShare', c, { shouldDirty: true }); setText(toText(c)) }
  const raw = parse(text)
  const outOfRange = raw < min || raw > max
  const firstLabel = mode === 'pix_card' ? 'Valor no Pix' : 'Valor no 1º cartão'

  return (
    <div className="space-y-5 border-t border-hairline p-4" data-testid="split-panel">
      <div role="radiogroup" aria-label="Combinação de pagamento" className="grid grid-cols-2 gap-0">
        {MODES.map((m, i) => {
          const active = mode === m.id
          return (
            <button key={m.id} type="button" role="radio" aria-checked={active} onClick={() => setValue('splitMode', m.id)} className={cn('min-h-14 border px-3 py-2 text-left transition-colors duration-300', i === 1 && '-ml-px', active ? 'relative z-10 border-brand bg-white text-brand' : 'border-hairline text-body hover:bg-tint')} data-testid={`split-mode-${m.id}`}>
              <span className="block text-[14px] font-medium leading-tight">{m.label}</span>
              <span className="block font-mono text-[11.5px] font-normal text-muted">{m.hint}</span>
            </button>
          )
        })}
      </div>

      <div className="space-y-2">
        <Field
          label={`${firstLabel} (R$)`}
          name="splitShareText"
          inputMode="decimal"
          autoComplete="off"
          value={text}
          onChange={(e) => { const t = maskMoney(e.target.value); setText(t); setValue('splitShare', parse(t), { shouldDirty: true }) }}
          onBlur={() => setShare(parse(text))}
          error={outOfRange ? `Informe entre ${formatBRL(min)} e ${formatBRL(max)}` : undefined}
          hint={`O restante é pago ${mode === 'pix_card' ? 'no cartão' : 'no 2º cartão'}. Mínimo de ${formatBRL(MIN_PART)} em cada forma.`}
        />
        <div className="flex flex-wrap gap-2" aria-label="Valores rápidos">
          {[0.25, 0.5, 0.75].map((p) => {
            const val = clampShare(payable, payable * p)
            return <button key={p} type="button" onClick={() => setShare(val)} className={cn('min-h-11 border px-4 font-mono text-[13px] transition-colors', share === val ? 'border-brand text-brand' : 'border-hairline text-body hover:bg-tint')}>{p * 100}%</button>
          })}
        </div>
      </div>

      <dl className="space-y-1.5 border border-hairline bg-tint p-3 text-[14px]" aria-live="polite" data-testid="split-breakdown">
        {plan.parts.map((p, i) => (
          <div key={i} className="flex items-baseline justify-between gap-3">
            <dt className="text-body">{mode === 'pix_card' ? (i === 0 ? 'Pix' : 'Cartão') : `Cartão ${i + 1}`}{i === 0 && mode === 'pix_card' && plan.pixDiscount > 0 && <span className="ml-1 font-mono text-[11.5px] text-success">−{formatBRL(plan.pixDiscount)}</span>}</dt>
            <dd className="font-medium tabular-nums text-brand">{formatBRL(p.charge)}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-3 border-t border-hairline pt-1.5"><dt className="text-brand">Total do pedido</dt><dd className="font-medium tabular-nums text-brand">{formatBRL(plan.total)}</dd></div>
      </dl>

      {mode === 'pix_card' ? (
        <>
          <p className="t-mono">O QR Code do Pix de {formatBRL(plan.parts[0].charge)} aparece ao finalizar. Pague o restante no cartão:</p>
          <CardFields slot="a" form={form} amount={plan.parts[1].charge} title="Cartão" flipped={flipA} onFlip={setFlipA} />
        </>
      ) : (
        <>
          <CardFields slot="a" form={form} amount={plan.parts[0].charge} title="Cartão 1" flipped={flipA} onFlip={setFlipA} />
          <div className="border-t border-hairline" />
          <CardFields slot="b" form={form} amount={plan.parts[1].charge} title="Cartão 2" flipped={flipB} onFlip={setFlipB} />
        </>
      )}
      <p className="t-mono">Demonstração: os dados dos cartões não saem deste formulário.</p>
    </div>
  )
}
