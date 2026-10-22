'use client'
import { AnimatePresence, m as motion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { MinusIcon, PlusIcon } from './Icons'

export interface AccordionItem {
  id: string
  title: string
  content: ReactNode
}

/** Acordeão de altura animada, no estilo "+ / −" do korres.com. */
export function Accordion({ items, defaultOpen, className }: { items: AccordionItem[]; defaultOpen?: string; className?: string }) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null)
  return (
    <div className={cn('flex flex-col', className)}>
      {items.map((it) => {
        const isOpen = open === it.id
        return (
          <div key={it.id}>
            <button
              type="button"
              id={`acc-btn-${it.id}`}
              aria-expanded={isOpen}
              aria-controls={`acc-panel-${it.id}`}
              onClick={() => setOpen(isOpen ? null : it.id)}
              className="flex w-full items-center gap-3 py-2 text-left font-mono text-[14px] font-normal text-brand"
            >
              <span className="grid size-4 place-items-center">{isOpen ? <MinusIcon size={14} /> : <PlusIcon size={14} />}</span>
              {it.title}
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`acc-panel-${it.id}`}
                  role="region"
                  aria-labelledby={`acc-btn-${it.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 pl-7 pt-1 font-mono text-[13px] font-light leading-relaxed text-muted">{it.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
