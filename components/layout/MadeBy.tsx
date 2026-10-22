import { brand } from '@/config/brand'
import { cn } from '@/lib/cn'

/** Assinatura do projeto: "tdzain · Crafting. Building. Tailor-made." com link para tdzain.com. */
export function MadeBy({ className }: { className?: string }) {
  return (
    <p className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[12.5px] font-normal text-muted', className)} data-testid="made-by">
      <a href={brand.maker.url} target="_blank" rel="noopener noreferrer" aria-label={`${brand.maker.name}, ${brand.maker.tagline} (abre em nova aba)`} className="link-underline inline-flex min-h-9 items-center gap-2 text-brand">
        <span className="text-[15px] font-medium lowercase tracking-tight">{brand.maker.name}</span>
        <span aria-hidden className="h-3 w-px bg-hairline" />
        <span>{brand.maker.tagline}</span>
      </a>
    </p>
  )
}
