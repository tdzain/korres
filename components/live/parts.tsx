import { cn } from '@/lib/cn'

/** "1,2 mil" a partir de 1.000. */
export const formatViewers = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace('.', ',')} mil` : String(n))

/** Selo AO VIVO com ponto pulsante (sem pulso com movimento reduzido). */
export function LiveBadge({ className, label = 'Ao vivo' }: { className?: string; label?: string }) {
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap bg-danger px-1.5 py-[3px] text-[10px] font-medium uppercase leading-none tracking-wide text-white', className)}>
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full rounded-full bg-white opacity-70 motion-safe:animate-ping" />
        <span className="relative inline-flex size-1.5 rounded-full bg-white" />
      </span>
      {label}
    </span>
  )
}
