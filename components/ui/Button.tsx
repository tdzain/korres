'use client'
import Link from 'next/link'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { ChevronRightIcon } from './Icons'

type Variant = 'primary' | 'outline' | 'link' | 'ghost'

interface Common {
  variant?: Variant
  size?: 'md' | 'lg'
  arrow?: boolean
  magnetic?: boolean
  full?: boolean
  className?: string
  children: ReactNode
}
type Props = Common & (({ href: string } & { onClick?: () => void }) | (ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }))

const styles: Record<Variant, string> = {
  primary: 'bg-brand text-white border border-brand hover:bg-[#0a14b8] disabled:bg-muted disabled:border-muted',
  outline: 'border border-hairline text-brand bg-white hover:border-brand hover:bg-tint',
  link: 'text-brand link-underline px-0 py-0 min-h-0 justify-start',
  ghost: 'text-brand hover:bg-tint',
}

/** Botão do design system: retângulo reto, caixa alta, sublinhado deslizante no link e "magnetismo" no primário (só ponteiro fino). */
export function Button({ variant = 'primary', size = 'md', arrow, magnetic, full, className, children, ...rest }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 })
  const mag = magnetic ?? variant === 'primary'

  const cls = cn(
    'relative inline-flex items-center justify-center gap-3 font-normal uppercase tracking-[0.5px] transition-colors duration-300 select-none',
    variant !== 'link' && (size === 'lg' ? 'min-h-[48px] px-6 text-[15px]' : 'min-h-[42px] px-5 text-[14px]'),
    variant === 'link' && 'text-[14px]',
    arrow && variant !== 'link' && 'justify-between',
    full && 'w-full',
    'disabled:cursor-not-allowed',
    styles[variant],
    className,
  )
  const inner = (
    <>
      <span>{children}</span>
      {arrow && <ChevronRightIcon size={16} />}
    </>
  )

  const onMove = (e: React.PointerEvent) => {
    if (!mag || e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * 0.12)
    y.set((e.clientY - (r.top + r.height / 2)) * 0.2)
  }
  const onLeave = () => { x.set(0); y.set(0) }

  const wrap = (el: ReactNode) => (
    <motion.span ref={ref} style={{ x, y }} onPointerMove={onMove} onPointerLeave={onLeave} className={cn('inline-flex', full && 'w-full')}>
      {el}
    </motion.span>
  )

  if ('href' in rest && rest.href !== undefined) {
    const { href, onClick } = rest
    return wrap(<Link href={href} onClick={onClick} className={cls}>{inner}</Link>)
  }
  const { type = 'button', ...btn } = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return wrap(<button type={type} className={cls} {...btn}>{inner}</button>)
}
