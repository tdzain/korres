'use client'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface UIState {
  searchOpen: boolean
  menuOpen: boolean
  setSearchOpen: (v: boolean) => void
  setMenuOpen: (v: boolean) => void
}

export const useUI = create<UIState>()((set) => ({
  searchOpen: false,
  menuOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
}))

interface DemoState {
  enabled: boolean
  /** Hora simulada (0–23) ou null para o relógio real. */
  simulatedHour: number | null
  enable: () => void
  setHour: (h: number | null) => void
}

export const useDemo = create<DemoState>()(
  persist(
    (set) => ({ enabled: false, simulatedHour: null, enable: () => set({ enabled: true }), setHour: (simulatedHour) => set({ simulatedHour }) }),
    { name: 'kr_demo', storage: createJSONStorage(() => sessionStorage), skipHydration: true },
  ),
)
