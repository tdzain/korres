'use client'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface CartItem {
  variantId: string
  slug: string
  qty: number
}

interface CartState {
  items: CartItem[]
  open: boolean
  /** Incrementa a cada adição: dispara o "bump" do contador da sacola. */
  bump: number
  add: (item: { variantId: string; slug: string }, qty?: number) => void
  setQty: (variantId: string, qty: number) => void
  remove: (variantId: string) => void
  clear: () => void
  setOpen: (open: boolean) => void
}

export const MAX_QTY = 10

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      open: false,
      bump: 0,
      add: ({ variantId, slug }, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.variantId === variantId)
          const items = existing
            ? s.items.map((i) => (i.variantId === variantId ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i))
            : [...s.items, { variantId, slug, qty: Math.min(MAX_QTY, qty) }]
          return { items, bump: s.bump + 1 }
        }),
      setQty: (variantId, qty) =>
        set((s) => ({ items: qty <= 0 ? s.items.filter((i) => i.variantId !== variantId) : s.items.map((i) => (i.variantId === variantId ? { ...i, qty: Math.min(MAX_QTY, qty) } : i)) })),
      remove: (variantId) => set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId) })),
      clear: () => set({ items: [] }),
      setOpen: (open) => set({ open }),
    }),
    { name: 'kr_cart', storage: createJSONStorage(() => localStorage), skipHydration: true, partialize: (s) => ({ items: s.items }) },
  ),
)
