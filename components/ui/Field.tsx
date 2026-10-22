'use client'
import { forwardRef, useEffect, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { CheckIcon } from './Icons'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  valid?: boolean
  /** Dispara o flash de preenchimento (autopreenchimento por CEP). */
  flash?: number
  suffix?: ReactNode
  hint?: string
}

/** Input com label flutuante, check que "desenha" ao validar e shake discreto no erro. */
export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field({ label, error, valid, flash, suffix, hint, className, id, onFocus, onBlur, ...rest }, ref) {
  const [shake, setShake] = useState(false)
  const [flashing, setFlashing] = useState(false)
  const inputId = id ?? `f-${rest.name}`
  useEffect(() => { if (error) { setShake(true); const t = setTimeout(() => setShake(false), 450); return () => clearTimeout(t) } }, [error])
  useEffect(() => { if (flash) { setFlashing(true); const t = setTimeout(() => setFlashing(false), 1100); return () => clearTimeout(t) } }, [flash])
  const errId = `${inputId}-err`
  return (
    <div className={cn('relative', className)}>
      <div className={cn('relative border bg-white transition-colors duration-300', error ? 'border-danger' : 'border-hairline focus-within:border-brand', shake && 'anim-shake', flashing && 'anim-flash')}>
        <input
          ref={ref}
          id={inputId}
          placeholder=" "
          aria-invalid={!!error}
          aria-describedby={error ? errId : hint ? `${inputId}-hint` : undefined}
          onFocus={onFocus}
          onBlur={onBlur}
          className="peer block h-[52px] w-full bg-transparent px-3 pb-1 pt-5 text-[15px] font-normal text-brand outline-none placeholder-transparent"
          {...rest}
        />
        <label htmlFor={inputId} className="pointer-events-none absolute left-3 top-1/2 origin-left -translate-y-1/2 text-[14px] text-muted transition-all duration-200 ease-[var(--ease-out)] peer-focus:top-[14px] peer-focus:scale-[0.78] peer-[:not(:placeholder-shown)]:top-[14px] peer-[:not(:placeholder-shown)]:scale-[0.78]">
          {label}
        </label>
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2 text-brand">
          {suffix}
          {valid && !error && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2f7d3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path className="anim-draw" d="m5 12.500 4.500 4.500L19 7.500" /></svg>
          )}
        </div>
      </div>
      {error && <p id={errId} role="alert" className="mt-1 text-[12.5px] font-normal text-danger">{error}</p>}
      {!error && hint && <p id={`${inputId}-hint`} className="t-mono mt-1">{hint}</p>}
    </div>
  )
})

export const SelectField = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }>(function SelectField({ label, error, className, children, id, ...rest }, ref) {
  const inputId = id ?? `s-${rest.name}`
  return (
    <div className={className}>
      <div className={cn('relative border bg-white', error ? 'border-danger' : 'border-hairline focus-within:border-brand')}>
        <label htmlFor={inputId} className="absolute left-3 top-[9px] text-[11px] text-muted">{label}</label>
        <select ref={ref} id={inputId} aria-invalid={!!error} className="block h-[52px] w-full appearance-none bg-transparent px-3 pb-1 pt-5 text-[15px] font-normal text-brand outline-none" {...rest}>{children}</select>
        <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><path d="m5 9 7 7 7-7" /></svg>
      </div>
      {error && <p role="alert" className="mt-1 text-[12.5px] font-normal text-danger">{error}</p>}
    </div>
  )
})

export function Checkbox({ label, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[14px] font-normal text-brand">
      <span className="relative mt-[3px] grid size-4 shrink-0 place-items-center border border-hairline has-[:checked]:border-brand has-[:checked]:bg-brand has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand">
        <input type="checkbox" className="peer absolute inset-0 z-10 cursor-pointer opacity-0" {...rest} />
        <CheckIcon size={12} className="pointer-events-none text-white opacity-0 peer-checked:opacity-100" />
      </span>
      <span className="leading-snug">{label}</span>
    </label>
  )
}

/** Opção em cartão (rádio). O <label> cobre só o cabeçalho; o conteúdo expandido (formulários) fica fora dele. */
export function RadioCard({ checked, onChange, name, value, title, meta, right, children, highlight }: { checked: boolean; onChange: () => void; name: string; value: string; title: ReactNode; meta?: ReactNode; right?: ReactNode; children?: ReactNode; highlight?: boolean }) {
  return (
    <div className={cn('border transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand', checked ? 'border-brand bg-white' : 'border-hairline bg-white hover:border-brand', highlight && !checked && 'bg-tint')}>
      <label className="flex cursor-pointer items-start gap-3 p-4">
        <input type="radio" className="sr-only" name={name} value={value} checked={checked} onChange={onChange} />
        <span className={cn('mt-[3px] grid size-4 shrink-0 place-items-center rounded-full border', checked ? 'border-brand' : 'border-hairline')} aria-hidden>
          <span className={cn('size-2 rounded-full bg-brand transition-transform duration-300', checked ? 'scale-100' : 'scale-0')} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="text-[14.5px] font-medium leading-snug text-brand">{title}</div>
            {right && <div className="shrink-0 text-[14px] font-normal text-brand">{right}</div>}
          </div>
          {meta && <div className="mt-0.5 text-[13px] font-light leading-snug text-body">{meta}</div>}
        </div>
      </label>
      {children}
    </div>
  )
}
