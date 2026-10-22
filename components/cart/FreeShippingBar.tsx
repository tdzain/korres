'use client'
import { m as motion } from 'motion/react'
import { FREE_SHIPPING_THRESHOLD } from '@/config/shipping'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { TruckIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/cn'
import { hasFreeShipping } from '@/lib/shipping/quote'

/** Barra de frete grátis: preenche com easing e muda de cor/mensagem ao atingir a meta (brilho sutil, sem confete). */
export function FreeShippingBar({ subtotal, className }: { subtotal: number; className?: string }) {
  const done = hasFreeShipping(subtotal)
  const pct = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD)
  const missing = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  return (
    <div className={cn('px-4 py-4', className)} data-testid="free-shipping-bar">
      <p className={cn('flex items-center gap-2 text-[13.5px] font-normal transition-colors duration-500', done ? 'text-success' : 'text-brand')} aria-live="polite">
        <TruckIcon size={17} />
        {done ? (
          <span>Você ganhou <b className="font-medium">frete grátis</b> na entrega econômica!</span>
        ) : (
          <span>Faltam <b className="font-medium"><AnimatedNumber value={missing} /></b> para o frete grátis</span>
        )}
      </p>
      <div className={cn('mt-3 h-[5px] w-full overflow-hidden bg-[#e4e6f4]', done && 'anim-glow')} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct * 100)} aria-label="Progresso para o frete grátis">
        <motion.div className={cn('h-full origin-left', done ? 'bg-success' : 'bg-brand')} initial={false} animate={{ scaleX: pct }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
      </div>
    </div>
  )
}
