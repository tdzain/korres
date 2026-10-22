'use client'
import { AnimatePresence, m as motion } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { useFocusTrap } from '@/lib/useFocusTrap'
import { useHydrated, useMediaQuery } from '@/lib/hooks'
import { CloseIcon } from './Icons'

/** Curva estilo iOS para sheets/drawers: entrada firme e pouso suave, sem overshoot. */
export const EASE_IOS = [0.32, 0.72, 0, 1] as const

interface BaseProps {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
  className?: string
}

const backdrop = { hidden: { opacity: 0, transition: { duration: 0.28, ease: EASE_IOS } }, shown: { opacity: 1, transition: { duration: 0.35, ease: EASE_IOS } } }

function Layer({ open, onClose, label, children, className, variant, side }: BaseProps & { variant: 'drawer' | 'modal'; side?: 'left' | 'right' }) {
  const ref = useRef<HTMLDivElement>(null)
  const sheet = useMediaQuery('(max-width: 639px)') // modais viram folha inferior no celular
  useFocusTrap(ref, open, onClose)
  const fromX = side === 'left' ? '-100%' : '100%'

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80]" initial="hidden" animate="shown" exit="hidden">
          <motion.div className="absolute inset-0 bg-[rgb(6_16_150/0.3)]" variants={backdrop} onClick={onClose} aria-hidden />

          {variant === 'drawer' ? (
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-label={label}
              className={cn('absolute top-0 flex h-full w-full max-w-[480px] flex-col bg-white shadow-[0_0_40px_rgb(6_16_150/0.12)]', side === 'left' ? 'left-0 border-r' : 'right-0 border-l', 'border-hairline', className)}
              variants={{
                hidden: { x: fromX, transition: { duration: 0.32, ease: EASE_IOS } },
                // O painel entra e, logo depois, os filhos com variants "shown" entram em cascata.
                shown: { x: 0, transition: { duration: 0.5, ease: EASE_IOS, when: 'beforeChildren', staggerChildren: 0.045, delayChildren: 0.05 } },
              }}
              // Swipe para fechar (HIG): arrasta o painel para o lado de saída.
              drag="x"
              dragDirectionLock
              dragConstraints={side === 'left' ? { left: 0, right: 0 } : { left: 0, right: 0 }}
              dragElastic={side === 'left' ? { left: 0.5, right: 0 } : { left: 0, right: 0.5 }}
              dragMomentum={false}
              onDragEnd={(_, info) => { if ((side === 'left' ? -info.offset.x : info.offset.x) > 110 || Math.abs(info.velocity.x) > 600) onClose() }}
            >
              {children}
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-end justify-center sm:items-center sm:p-4" onClick={onClose}>
              <motion.div
                ref={ref}
                role="dialog"
                aria-modal="true"
                aria-label={label}
                onClick={(e) => e.stopPropagation()}
                className={cn('relative max-h-[92dvh] w-full overflow-auto border-hairline bg-white pb-safe sm:max-w-[520px] sm:border sm:pb-0', 'border-t', className)}
                variants={
                  sheet
                    ? { hidden: { y: '100%', transition: { duration: 0.3, ease: EASE_IOS } }, shown: { y: 0, transition: { duration: 0.48, ease: EASE_IOS } } }
                    : { hidden: { opacity: 0, y: 14, scale: 0.985, transition: { duration: 0.2 } }, shown: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE_IOS } } }
                }
                // Arrastar para baixo fecha a folha (somente no celular).
                drag={sheet ? 'y' : false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.6 }}
                dragMomentum={false}
                onDragEnd={(_, info) => { if (info.offset.y > 110 || info.velocity.y > 600) onClose() }}
              >
                <div className="mx-auto mt-2 h-1 w-9 bg-[#cfd1e6] sm:hidden" aria-hidden />
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

/** Variants para filhos que entram em cascata dentro de um Drawer. */
export const cascade = {
  hidden: { opacity: 0, y: 12, transition: { duration: 0.15 } },
  shown: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_IOS } },
}

export function CloseButton({ onClick, label = 'Fechar', className }: { onClick: () => void; label?: string; className?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className={cn('grid size-11 place-items-center text-brand transition-transform duration-300 ease-[var(--ease-ios)] active:scale-90', className)}>
      <CloseIcon size={20} />
    </button>
  )
}
