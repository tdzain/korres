'use client'
import { AnimatePresence, motion } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { useFocusTrap } from '@/lib/useFocusTrap'
import { useHydrated } from '@/lib/hooks'
import { CloseIcon } from './Icons'

interface BaseProps {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
  className?: string
}

function Layer({ open, onClose, label, children, className, variant, side }: BaseProps & { variant: 'drawer' | 'modal'; side?: 'left' | 'right' }) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, open, onClose)
  const fromX = side === 'left' ? '-100%' : '100%'
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80]" initial="hidden" animate="shown" exit="hidden">
          <motion.div
            className="absolute inset-0 bg-[rgb(6_16_150/0.28)]"
            variants={{ hidden: { opacity: 0 }, shown: { opacity: 1 } }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            aria-hidden
          />
          {variant === 'drawer' ? (
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-label={label}
              className={cn('absolute top-0 flex h-full w-full max-w-[480px] flex-col bg-white shadow-[0_0_40px_rgb(6_16_150/0.12)]', side === 'left' ? 'left-0 border-r' : 'right-0 border-l', 'border-hairline', className)}
              variants={{ hidden: { x: fromX }, shown: { x: 0 } }}
              transition={{ type: 'spring', stiffness: 320, damping: 36, mass: 0.9 }}
            >
              {children}
            </motion.div>
          ) : (
            <div className="absolute inset-0 grid place-items-center p-4" onClick={onClose}>
              <motion.div
                ref={ref}
                role="dialog"
                aria-modal="true"
                aria-label={label}
                onClick={(e) => e.stopPropagation()}
                className={cn('relative max-h-full w-full max-w-[520px] overflow-auto border border-hairline bg-white', className)}
                variants={{ hidden: { opacity: 0, y: 14, scale: 0.985 }, shown: { opacity: 1, y: 0, scale: 1 } }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {children}
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function usePortal(node: ReactNode) {
  const hydrated = useHydrated()
  return hydrated ? createPortal(node, document.body) : null
}

export function Drawer(props: BaseProps & { side?: 'left' | 'right' }) {
  return usePortal(<Layer {...props} variant="drawer" />)
}

export function Modal(props: BaseProps) {
  return usePortal(<Layer {...props} variant="modal" />)
}

export function CloseButton({ onClick, label = 'Fechar', className }: { onClick: () => void; label?: string; className?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className={cn('grid size-10 place-items-center text-brand transition-transform duration-300 hover:rotate-90', className)}>
      <CloseIcon size={20} />
    </button>
  )
}
