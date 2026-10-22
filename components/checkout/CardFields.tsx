'use client'
import type { UseFormReturn } from 'react-hook-form'
import { Field, SelectField } from '@/components/ui/Field'
import { formatBRL } from '@/lib/format/money'
import { installmentOptions } from '@/lib/pricing'
import { brandLabel, cvvLength, detectBrand, maskCardNumber, maskExpiry } from '@/lib/validators/card'
import { CardPreview } from './CardPreview'
import type { CheckoutValues } from './schema'

const NAMES = {
  a: { number: 'cardNumber', name: 'cardName', expiry: 'cardExpiry', cvv: 'cardCvv', inst: 'installments' },
  b: { number: 'card2Number', name: 'card2Name', expiry: 'card2Expiry', cvv: 'card2Cvv', inst: 'installments2' },
} as const

/** Formulário de um cartão (cartão ilustrado que vira no CVV + campos + parcelas). Reutilizado para o 1º e o 2º cartão. */
export function CardFields({ slot, form, amount, title, flipped, onFlip }: { slot: 'a' | 'b'; form: UseFormReturn<CheckoutValues>; amount: number; title?: string; flipped: boolean; onFlip: (v: boolean) => void }) {
  const n = NAMES[slot]
  const { register, watch, formState: { errors } } = form
  const v = watch()
  const number = (v[n.number] as string) ?? ''
  const brand = detectBrand(number)

  const masked = (key: 'number' | 'expiry', fn: (s: string) => string) => {
    const r = register(n[key])
    return { ...r, onChange: (e: React.ChangeEvent<HTMLInputElement>) => { e.target.value = fn(e.target.value); return r.onChange(e) } }
  }
  const cvvReg = register(n.cvv)

  return (
    <div className="space-y-3">
      {title && <p className="t-caps text-brand">{title} <span className="ml-1 font-mono normal-case text-muted">· {formatBRL(amount)}</span></p>}
      <CardPreview number={number} name={(v[n.name] as string) ?? ''} expiry={(v[n.expiry] as string) ?? ''} cvv={(v[n.cvv] as string) ?? ''} brand={brand} flipped={flipped} />
      <Field label="Número do cartão" autoComplete="cc-number" inputMode="numeric" error={errors[n.number]?.message} suffix={brand !== 'unknown' ? <span className="font-mono text-[11px] uppercase">{brandLabel[brand]}</span> : undefined} {...masked('number', maskCardNumber)} />
      <Field label="Nome impresso no cartão" autoComplete="cc-name" error={errors[n.name]?.message} {...register(n.name)} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Validade (MM/AA)" autoComplete="cc-exp" inputMode="numeric" maxLength={5} error={errors[n.expiry]?.message} {...masked('expiry', maskExpiry)} />
        <Field label="CVV" autoComplete="cc-csc" inputMode="numeric" maxLength={cvvLength(brand)} error={errors[n.cvv]?.message} {...cvvReg} onFocus={() => onFlip(true)} onBlur={(e) => { onFlip(false); return cvvReg.onBlur(e) }} />
      </div>
      <SelectField label="Parcelas" {...register(n.inst, { valueAsNumber: true })}>
        {installmentOptions(amount).map((o) => <option key={o.count} value={o.count}>{o.count}x de {formatBRL(o.value)} sem juros</option>)}
      </SelectField>
    </div>
  )
}
