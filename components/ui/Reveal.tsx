'use client'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'

/** Reveal on scroll: opacity + translateY(16px), uma vez só. */
export function Reveal({ children, delay = 0, className, as = 'div' }: { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'section' | 'li' }) {
  const Comp = motion[as]
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  )
}

/** Texto em máscara por linha (hero). Cada filho é uma linha. */
export function MaskLines({ lines, className, delay = 0, lineClassName }: { lines: ReactNode[]; className?: string; delay?: number; lineClassName?: string }) {
  return (
    <div className={className}>
      {lines.map((l, i) => (
        <div key={i} className="overflow-hidden">
          <motion.div
            className={lineClassName}
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: delay + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            {l}
          </motion.div>
        </div>
      ))}
    </div>
  )
}
