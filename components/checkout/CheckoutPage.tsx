'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, m as motion } from 'motion/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type FieldErrors, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Checkbox, Field, RadioCard, SelectField } from '@/components/ui/Field'
import { PixIcon } from '@/components/ui/Icons'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { Logo } from '@/components/ui/Logo'
import { PIX_DISCOUNT } from '@/config/features'
import { features } from '@/config/features'
import { UFS } from '@/data/brazil'
import { cn } from '@/lib/cn'
import { getCommerce } from '@/lib/commerce/provider'
import { formatShortDate } from '@/lib/format/date'
import { formatBRL } from '@/lib/format/money'
import { lookupCep } from '@/lib/geo/client'
import { computeTotals, findCoupon } from '@/lib/orders/build'
import { installmentOptions, pixTotal } from '@/lib/pricing'
import { arrivalText, pickOption } from '@/lib/shipping/quote'
import { useAccount } from '@/lib/store/account'
import { useCart } from '@/lib/store/cart'
import { useLocation } from '@/lib/store/location'
import { useCartLines } from '@/lib/store/lines'
import { useOrders } from '@/lib/store/orders'
import { useReady } from '@/lib/store/ready'
import { useDemo } from '@/lib/store/ui'
import { useShipping } from '@/lib/useShipping'
import { detectBrand, maskCardNumber, maskExpiry, cvvLength, brandLabel } from '@/lib/validators/card'
import { maskCEP } from '@/lib/validators/cep'
import { maskCPF, onlyDigits } from '@/lib/validators/cpf'
import { maskPhone } from '@/lib/validators/phone'
import { CardPreview } from './CardPreview'
import { type CouponState, SummaryBody } from './OrderSummary'
import { checkoutSchema, FIELD_ORDER, type CheckoutValues } from './schema'

const Section = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <section aria-labelledby={`sec-${n}`} className="border-b border-hairline px-4 py-7 lg:px-10">
    <h2 id={`sec-${n}`} className="mb-5 flex items-baseline gap-3 text-[18px] font-medium text-brand"><span className="font-mono text-[12.5px] font-normal text-muted">0{n}</span>{title}</h2>
    {children}
  </section>
)

export function CheckoutPage() {
  const ready = useReady((s) => s.ready)
  const { lines, subtotal, count } = useCartLines()
  const location = useLocation((s) => s.location)
  const setLocation = useLocation((s) => s.set)
  const user = useAccount((s) => s.user)
  const demo = useDemo((s) => s.enabled)
  const [coupon, setCoupon] = useState<CouponState>({ status: 'idle' })
  const [cepState, setCepState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [flash, setFlash] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [flip, setFlip] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  // Entrega em duas etapas: só o CEP aparece primeiro; o restante entra (já preenchido) depois da consulta.
  const [revealed, setRevealed] = useState(false)
  const lastCep = useRef('')
  const typedCep = useRef(false)

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onTouched',
    defaultValues: { email: '', phone: '', marketing: true, firstName: '', lastName: '', cpf: '', cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', uf: '', reference: '', shippingMethod: 'economica', payment: 'pix', cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '', installments: 1 },
  })
  const { register, watch, setValue, setFocus, handleSubmit, formState: { errors, touchedFields }, trigger } = form
  const v = watch()

  // Pré-preenche com a conta simulada e com o CEP da geolocalização (quando houver).
  useEffect(() => {
    if (!ready) return
    if (user) {
      if (!form.getValues('email')) setValue('email', user.email)
      if (!form.getValues('firstName')) setValue('firstName', user.name.split(' ')[0] ?? '')
      if (!form.getValues('lastName')) setValue('lastName', user.name.split(' ').slice(1).join(' '))
      if (user.phone && !form.getValues('phone')) setValue('phone', maskPhone(user.phone))
    }
  }, [ready, user, setValue, form])
  useEffect(() => {
    if (location?.cep && !form.getValues('cep')) setValue('cep', maskCEP(location.cep))
  }, [location?.cep, setValue, form])

  // CEP completo → ViaCEP preenche rua, bairro, cidade e UF; foco vai para "Número".
  const fillFromCep = useCallback(async (cep: string, focusNumber: boolean) => {
    setCepState('loading')
    const res = await lookupCep(cep)
    setRevealed(true) // com ou sem resultado: se não achou, a pessoa preenche manualmente
    if (!res) { setCepState('error'); return }
    setCepState('idle')
    setValue('street', res.street, { shouldValidate: true })
    setValue('neighborhood', res.neighborhood, { shouldValidate: true })
    setValue('city', res.city, { shouldValidate: true })
    setValue('uf', res.uf, { shouldValidate: true })
    setFlash((f) => ({ street: (f.street ?? 0) + 1, neighborhood: (f.neighborhood ?? 0) + 1, city: (f.city ?? 0) + 1, uf: (f.uf ?? 0) + 1 }))
    setLocation({ city: res.city, uf: res.uf, cep: res.cep, source: 'cep' })
    if (focusNumber) setTimeout(() => setFocus('number'), 120)
  }, [setValue, setFocus, setLocation])
  useEffect(() => {
    if (v.cep.length === 9 && v.cep !== lastCep.current) { lastCep.current = v.cep; void fillFromCep(v.cep, typedCep.current) }
    if (v.cep.length < 9) { lastCep.current = ''; setCepState('idle') }
  }, [v.cep, fillFromCep])

  // Frete: destino = endereço digitado (se completo) ou cidade detectada. Fonte única: lib/shipping.
  const override = v.uf && v.city ? { uf: v.uf, city: v.city, cep: v.cep } : null
  const shipping = useShipping(subtotal, override)
  const selected = shipping.options.length ? pickOption(shipping.options, v.shippingMethod) : null
  const couponPercent = coupon.status === 'valid' ? (findCoupon(coupon.code)?.percent ?? 0) : 0
  const totals = useMemo(() => computeTotals({ subtotal, couponPercent, payment: v.payment, shipping: selected?.price ?? 0 }), [subtotal, couponPercent, v.payment, selected?.price])
  const cardBase = useMemo(() => computeTotals({ subtotal, couponPercent, payment: 'card', shipping: selected?.price ?? 0 }).total, [subtotal, couponPercent, selected?.price])
  const brand = detectBrand(v.cardNumber ?? '')

  const applyCoupon = (code: string) => {
    setCoupon({ status: 'checking' })
    setTimeout(() => {
      const c = findCoupon(code)
      setCoupon(c ? { status: 'valid', code: c.code, label: c.label } : { status: 'invalid', message: 'Cupom inválido ou expirado. Confira o código e tente de novo.' })
    }, 700)
  }

  const ok = (name: keyof CheckoutValues) => !!touchedFields[name] && !errors[name] && !!v[name]
  const mask = (name: 'phone' | 'cpf' | 'cep' | 'cardNumber' | 'cardExpiry', fn: (s: string) => string) => {
    const r = register(name)
    return { ...r, onChange: (e: React.ChangeEvent<HTMLInputElement>) => { e.target.value = fn(e.target.value); return r.onChange(e) } }
  }

  const onInvalid = (errs: FieldErrors<CheckoutValues>) => {
    const first = FIELD_ORDER.find((k) => errs[k])
    if (!first) return
    if (!document.querySelector(`[name="${first}"]`)) setRevealed(true)
    setTimeout(() => {
      document.querySelector<HTMLElement>(`[name="${first}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => setFocus(first), 300)
    }, 60)
  }

  const submit = handleSubmit(async (values) => {
    if (!selected) return
    setSubmitting(true)
    try {
      const order = await getCommerce().createOrder({
        contact: { email: values.email, phone: onlyDigits(values.phone), marketing: values.marketing },
        customer: { firstName: values.firstName, lastName: values.lastName, cpf: onlyDigits(values.cpf) },
        address: { cep: onlyDigits(values.cep), street: values.street, number: values.number, complement: values.complement, neighborhood: values.neighborhood, city: values.city, uf: values.uf, reference: values.reference },
        shippingMethod: values.shippingMethod,
        // Somente método, parcelas e bandeira: número, validade e CVV nunca saem do formulário.
        payment: { method: values.payment, installments: values.payment === 'card' ? values.installments : undefined, cardBrand: values.payment === 'card' ? brandLabel[brand] : undefined },
        items: lines.map((l) => ({ variantId: l.variant.id, slug: l.product.slug, name: l.product.name, variantLabel: l.variant.label, image: l.image, qty: l.qty, unitPrice: l.variant.price })),
        coupon: coupon.status === 'valid' ? coupon.code : null,
      })
      useOrders.getState().add(order)
      useCart.getState().clear()
      window.location.assign(process.env.NODE_ENV === 'production' ? `/pedido/${order.id}/` : `/pedido/?id=${order.id}`)
    } catch {
      setSubmitting(false)
    }
  }, onInvalid)

  if (ready && count === 0 && !submitting) {
    return (
      <div className="gutter grid min-h-[60vh] place-items-center py-20 text-center">
        <div>
          <p className="font-hand text-[48px] leading-none text-brand">Sua sacola está vazia</p>
          <p className="t-mono mt-3">Adicione produtos para finalizar a compra.</p>
          <div className="mt-6 flex justify-center"><Button href="/colecao/mais-vendidos/">Ver mais vendidos</Button></div>
        </div>
      </div>
    )
  }

  const shippingLabel = selected ? (selected.free ? <span className="text-success">Grátis</span> : <AnimatedNumber value={selected.price} />) : <span className="text-muted">Calculando…</span>
  const summaryProps = { lines, totals, shippingLabel, payment: v.payment, coupon, onApply: applyCoupon, onRemove: () => setCoupon({ status: 'idle' }) }
  const card = v.payment === 'card'

  return (
    <div className="lg:grid lg:grid-cols-[58fr_42fr]">
      {/* Resumo colapsável (mobile) */}
      <div className="border-b border-hairline bg-tint lg:hidden">
        <button type="button" onClick={() => setSummaryOpen((o) => !o)} aria-expanded={summaryOpen} className="flex min-h-14 w-full items-center justify-between px-4 py-3 text-[14px] font-normal text-brand" data-testid="summary-toggle">
          <span>{summaryOpen ? 'Ocultar' : 'Mostrar'} resumo do pedido ({count})</span>
          <AnimatedNumber value={totals.total} className="text-[18px]" />
        </button>
        <AnimatePresence initial={false}>{summaryOpen && <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden"><div className="px-4 pb-5"><SummaryBody {...summaryProps} idPrefix="m" /></div></motion.div>}</AnimatePresence>
      </div>

      <form onSubmit={submit} noValidate aria-label="Finalizar compra" className="pb-32 lg:pb-10" data-testid="checkout-form">
        <Section n={1} title="Contato">
          <div className="space-y-3">
            <Field label="E-mail" type="email" autoComplete="email" inputMode="email" valid={ok('email')} error={errors.email?.message} {...register('email')} />
            <Field label="Celular com DDD" type="tel" autoComplete="tel" inputMode="tel" valid={ok('phone')} error={errors.phone?.message} {...mask('phone', maskPhone)} />
            <Checkbox label="Quero receber ofertas e novidades da KORRES" {...register('marketing')} />
          </div>
        </Section>

        <Section n={2} title="Entrega">
          <div className="space-y-3">
            <Field label="CEP" autoComplete="postal-code" inputMode="numeric" maxLength={9} valid={ok('cep') && cepState === 'idle'} error={errors.cep?.message ?? (cepState === 'error' ? 'Não encontramos esse CEP. Preencha o endereço manualmente.' : undefined)} hint={revealed ? undefined : 'Digite seu CEP e preenchemos o endereço para você.'} suffix={cepState === 'loading' ? <span className="anim-pulse t-mono">buscando…</span> : undefined} {...(() => { const r = mask('cep', maskCEP); return { ...r, onChange: (e: React.ChangeEvent<HTMLInputElement>) => { typedCep.current = true; return r.onChange(e) } } })()} />
            {!revealed && (
              <div className="flex flex-wrap gap-x-5">
                <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener noreferrer" className="link-static-underline inline-flex min-h-11 items-center text-[14px] font-normal text-brand">Não sei meu CEP</a>
                <button type="button" onClick={() => { setRevealed(true); setTimeout(() => setFocus('street'), 400) }} className="link-static-underline inline-flex min-h-11 items-center text-[14px] font-normal text-brand">Preencher endereço manualmente</button>
              </div>
            )}
            <AnimatePresence initial={false}>
              {revealed && (
                <motion.div key="addr" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }} className="-mx-1 overflow-hidden px-1">
                  <div className="space-y-3 pb-1 pt-3">
                    <Field label="Rua" autoComplete="address-line1" flash={flash.street} valid={ok('street')} error={errors.street?.message} {...register('street')} />
                    <div className="grid grid-cols-[1fr_2fr] gap-3">
                      <Field label="Número" autoComplete="off" inputMode="numeric" valid={ok('number')} error={errors.number?.message} {...register('number')} />
                      <Field label="Complemento (opcional)" autoComplete="address-line2" {...register('complement')} />
                    </div>
                    <Field label="Bairro" autoComplete="address-level3" flash={flash.neighborhood} valid={ok('neighborhood')} error={errors.neighborhood?.message} {...register('neighborhood')} />
                    <div className="grid grid-cols-[2fr_1fr] gap-3">
                      <Field label="Cidade" autoComplete="address-level2" flash={flash.city} valid={ok('city')} error={errors.city?.message} {...register('city')} />
                      <SelectField label="UF" autoComplete="address-level1" error={errors.uf?.message} {...register('uf')}><option value="" />{UFS.map((u) => <option key={u.uf} value={u.uf}>{u.uf}</option>)}</SelectField>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Nome" autoComplete="given-name" valid={ok('firstName')} error={errors.firstName?.message} {...register('firstName')} />
                      <Field label="Sobrenome" autoComplete="family-name" valid={ok('lastName')} error={errors.lastName?.message} {...register('lastName')} />
                    </div>
                    <Field label="CPF" inputMode="numeric" autoComplete="off" maxLength={14} valid={ok('cpf')} error={errors.cpf?.message} hint="Necessário para a nota fiscal" {...(() => { const r = register('cpf'); return { ...r, onChange: (e: React.ChangeEvent<HTMLInputElement>) => { e.target.value = maskCPF(e.target.value); return r.onChange(e) } } })()} />
                    <Field label="Ponto de referência (opcional)" autoComplete="off" {...register('reference')} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Section>

        <Section n={3} title="Método de envio">
          <div className="relative" aria-live="polite" data-testid="shipping-options">
            {!shipping.options.length ? (
              <div className="space-y-2" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-[68px]" />)}</div>
            ) : (
              <div className={cn('space-y-2 transition-opacity duration-300', shipping.status === 'loading' && 'opacity-50')}>
                {shipping.options.map((o) => (
                  <RadioCard
                    key={o.id}
                    name="shippingMethod"
                    value={o.id}
                    checked={v.shippingMethod === o.id}
                    onChange={() => setValue('shippingMethod', o.id)}
                    title={o.label}
                    meta={<AnimatePresence mode="wait" initial={false}><motion.span key={`${o.earliest}-${o.latest}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="inline-block">{o.id === 'retirada' ? `Pronto para retirada ${formatShortDate(o.earliest)} · ${o.description}` : arrivalText(o, formatShortDate)}</motion.span></AnimatePresence>}
                    right={o.free ? <span className="text-success">Grátis</span> : <AnimatedNumber value={o.price} />}
                  />
                ))}
              </div>
            )}
          </div>
        </Section>

        <Section n={4} title="Pagamento">
          <div className="space-y-2" role="radiogroup" aria-label="Forma de pagamento">
            <RadioCard name="payment" value="pix" checked={v.payment === 'pix'} onChange={() => setValue('payment', 'pix')} highlight title={<span className="flex items-center gap-2"><PixIcon size={18} /> Pix</span>} meta="Aprovação imediata" right={<span className="bg-badge px-1.5 py-0.5 font-mono text-[11px] uppercase text-white">{PIX_DISCOUNT * 100}% de desconto</span>}>
              <AnimatePresence initial={false}>{v.payment === 'pix' && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="border-t border-hairline px-4 py-3 text-[13px] font-normal text-body">Ao finalizar, mostramos o QR Code e o código copia e cola. Total no Pix: <b className="font-medium text-brand">{formatBRL(pixTotal(cardBase))}</b></p></motion.div>}</AnimatePresence>
            </RadioCard>

            <RadioCard name="payment" value="card" checked={card} onChange={() => setValue('payment', 'card')} title="Cartão de crédito" meta="Até 6x sem juros (parcela mínima de R$ 35)">
              <AnimatePresence initial={false}>
                {card && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                    <div className="space-y-3 border-t border-hairline p-4">
                      <CardPreview number={v.cardNumber ?? ''} name={v.cardName ?? ''} expiry={v.cardExpiry ?? ''} cvv={v.cardCvv ?? ''} brand={brand} flipped={flip} />
                      <Field label="Número do cartão" autoComplete="cc-number" inputMode="numeric" error={errors.cardNumber?.message} suffix={brand !== 'unknown' ? <span className="font-mono text-[11px] uppercase">{brandLabel[brand]}</span> : undefined} {...mask('cardNumber', maskCardNumber)} />
                      <Field label="Nome impresso no cartão" autoComplete="cc-name" error={errors.cardName?.message} {...register('cardName')} />
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Validade (MM/AA)" autoComplete="cc-exp" inputMode="numeric" maxLength={5} error={errors.cardExpiry?.message} {...mask('cardExpiry', maskExpiry)} />
                        <Field label="CVV" autoComplete="cc-csc" inputMode="numeric" maxLength={cvvLength(brand)} error={errors.cardCvv?.message} {...(() => { const r = register('cardCvv'); return { ...r, onFocus: () => setFlip(true), onBlur: (e: React.FocusEvent<HTMLInputElement>) => { setFlip(false); return r.onBlur(e) } } })()} />
                      </div>
                      <SelectField label="Parcelas" {...register('installments', { valueAsNumber: true })}>
                        {installmentOptions(cardBase).map((o) => <option key={o.count} value={o.count}>{o.count}x de {formatBRL(o.value)} sem juros</option>)}
                      </SelectField>
                      {demo && <button type="button" className="t-mono underline" onClick={() => { setValue('cardNumber', '4242 4242 4242 4242'); setValue('cardName', 'MARIA TESTE'); setValue('cardExpiry', '12/30'); setValue('cardCvv', '123'); void trigger(['cardNumber', 'cardName', 'cardExpiry', 'cardCvv']) }}>Preencher cartão de teste</button>}
                      <p className="t-mono">Demonstração: os dados do cartão não saem deste formulário.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </RadioCard>

            {features.boleto && <RadioCard name="payment" value="boleto" checked={v.payment === 'boleto'} onChange={() => setValue('payment', 'boleto')} title="Boleto bancário" meta="Vence em 3 dias · aprovação em até 2 dias úteis" />}
          </div>

          <div className="mt-8 hidden lg:block">
            <SubmitButton submitting={submitting} disabled={!selected} total={totals.total} />
          </div>
        </Section>
      </form>

      {/* Resumo sticky (desktop) */}
      <aside aria-label="Resumo do pedido" className="hidden border-l border-hairline bg-tint lg:block">
        <div className="sticky top-0 max-h-dvh overflow-auto px-8 py-8 xl:px-10"><SummaryBody {...summaryProps} idPrefix="d" /></div>
      </aside>

      {/* Botão fixo no rodapé (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-white px-3 pt-3 pb-safe lg:hidden">
        <SubmitButton submitting={submitting} disabled={!selected} total={totals.total} onClick={() => void submit()} mobile />
      </div>
    </div>
  )
}

function SubmitButton({ submitting, disabled, total, onClick, mobile }: { submitting: boolean; disabled: boolean; total: number; onClick?: () => void; mobile?: boolean }) {
  return (
    <button type={mobile ? 'button' : 'submit'} onClick={onClick} disabled={submitting || disabled} data-testid="place-order" className="relative flex min-h-[54px] w-full items-center justify-center gap-3 overflow-hidden bg-brand px-6 text-[15px] uppercase tracking-[0.5px] text-white transition-colors hover:bg-[#0a14b8] disabled:cursor-wait disabled:opacity-90">
      {submitting ? (
        <>
          <span className="flex gap-1" aria-hidden>{[0, 1, 2].map((i) => <motion.span key={i} className="size-1.5 rounded-full bg-white" animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />)}</span>
          Processando pedido…
        </>
      ) : (
        <>Finalizar pedido <span className="font-mono text-[13px] normal-case opacity-80">· {formatBRL(total)}</span></>
      )}
    </button>
  )
}

export function CheckoutHeader() {
  const router = useRouter()
  return (
    <header className="flex h-14 items-center justify-between border-b border-hairline bg-white px-4 lg:px-10">
      <Link href="/" aria-label="KORRES Brasil, página inicial" className="text-brand"><Logo height={19} /></Link>
      <button type="button" onClick={() => { useCart.getState().setOpen(true); router.push('/') }} className="link-underline text-[14px] font-normal text-brand">← Voltar à sacola</button>
    </header>
  )
}
