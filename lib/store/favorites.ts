'use client'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface FavState {
  ids: string[]
  toggle: (id: string) => void
}

export const useFavorites = create<FavState>()(
  persist(
    (set) => ({ ids: [], toggle: (id) => set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id] })) }),
    { name: 'kr_favs', storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
)
