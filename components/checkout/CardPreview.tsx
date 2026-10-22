'use client'
import { motion } from 'motion/react'
import { brandLabel, type CardBrand } from '@/lib/validators/card'

/** Cartão ilustrado: vira para mostrar o verso ao focar no CVV. */
export function CardPreview({ number, name, expiry, cvv, brand, flipped }: { number: string; name: string; expiry: string; cvv: string; brand: CardBrand; flipped: boolean }) {
  const shown = (number || '•••• •••• •••• ••••').padEnd(19, ' ')
  return (
    <div className="mx-auto h-[170px] w-[280px] [perspective:900px]" aria-hidden>
      <motion.div className="relative size-full [transform-style:preserve-3d]" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: 'spring', stiffness: 170, damping: 22 }}>
        <div className="absolute inset-0 flex flex-col justify-between bg-brand p-4 text-white [backface-visibility:hidden]">
          <div className="flex items-start justify-between"><span className="font-mono text-[11px] uppercase tracking-widest opacity-80">KORRES</span><span className="text-[12px] font-medium uppercase">{brand === 'unknown' ? '' : brandLabel[brand]}</span></div>
          <p className="font-mono text-[18px] tracking-[0.12em]">{shown}</p>
          <div className="flex items-end justify-between font-mono text-[12px] uppercase"><span className="max-w-[170px] truncate">{name || 'Nome no cartão'}</span><span>{expiry || 'MM/AA'}</span></div>
        </div>
        <div className="absolute inset-0 bg-[#0b1aa8] text-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="mt-6 h-9 bg-[#02073d]" />
          <div className="mx-4 mt-4 flex h-9 items-center justify-end bg-white px-3 font-mono text-[14px] text-brand">{cvv || '•••'}</div>
          <p className="mx-4 mt-3 text-[10px] opacity-70">Código de segurança (CVV)</p>
        </div>
      </motion.div>
    </div>
  )
}
