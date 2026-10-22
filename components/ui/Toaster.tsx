'use client'
import { AnimatePresence, m as motion } from 'motion/react'
import { useToast } from '@/lib/store/toast'
import { CheckIcon } from './Icons'

export function Toaster() {
  const items = useToast((s) => s.items)
  return (
    <div className="pointer-events-none fixed bottom-20 left-1/2 z-[95] flex -translate-x-1/2 flex-col items-center gap-2 md:bottom-6" role="status" aria-live="polite">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="pointer-events-auto flex items-center gap-2 bg-brand px-4 py-3 text-[14px] font-normal text-white">
            <CheckIcon size={16} />
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
