'use client'
import { create } from 'zustand'

export interface ToastItem { id: number; message: string }
interface ToastState {
  items: ToastItem[]
  push: (message: string) => void
  dismiss: (id: number) => void
}
let n = 0
export const useToast = create<ToastState>()((set) => ({
  items: [],
  push: (message) => {
    const id = ++n
    set((s) => ({ items: [...s.items, { id, message }].slice(-3) }))
    setTimeout(() => set((s) => ({ items: s.items.filter((t) => t.id !== id) })), 3600)
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}))
