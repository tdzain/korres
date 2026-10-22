'use client'
import { m as motion } from 'motion/react'
import { useFavorites } from '@/lib/store/favorites'
import { useToast } from '@/lib/store/toast'
import { cn } from '@/lib/cn'
import { BookmarkFilledIcon, BookmarkIcon } from '@/components/ui/Icons'

export function FavoriteButton({ id, name, className }: { id: string; name: string; className?: string }) {
  const active = useFavorites((s) => s.ids.includes(id))
  const toggle = useFavorites((s) => s.toggle)
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remover ${name} dos favoritos` : `Salvar ${name} nos favoritos`}
      onClick={(e) => { e.preventDefault(); toggle(id); useToast.getState().push(active ? 'Removido dos favoritos' : 'Salvo nos favoritos') }}
      className={cn('grid size-11 place-items-center text-brand', className)}
    >
      <motion.span key={String(active)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
        {active ? <BookmarkFilledIcon size={18} /> : <BookmarkIcon size={18} />}
      </motion.span>
    </button>
  )
}
