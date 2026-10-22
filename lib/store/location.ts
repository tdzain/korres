'use client'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { detectLocation, FALLBACK, type Location } from '@/lib/geo/client'

interface LocationState {
  location: Location | null
  status: 'idle' | 'loading' | 'ready'
  modalOpen: boolean
  /** Evita animar a chip na primeira pintura. */
  detect: () => Promise<void>
  set: (loc: Omit<Location, 'confirmed'> & { confirmed?: boolean }) => void
  confirm: () => void
  setModalOpen: (open: boolean) => void
}

export const useLocation = create<LocationState>()(
  persist(
    (set, get) => ({
      location: null,
      status: 'idle',
      modalOpen: false,
      async detect() {
        const { location, status } = get()
        if (status === 'loading' || (location?.confirmed)) {
          set({ status: 'ready' })
          return
        }
        set({ status: 'loading' })
        const loc = await detectLocation()
        // Se o usuário escolheu algo enquanto detectávamos, a escolha vence.
        if (get().location?.confirmed) set({ status: 'ready' })
        else set({ location: loc ?? FALLBACK, status: 'ready' })
      },
      set(loc) {
        set({ location: { confirmed: true, ...loc }, status: 'ready' })
      },
      confirm() {
        const l = get().location
        if (l) set({ location: { ...l, confirmed: true } })
      },
      setModalOpen: (modalOpen) => set({ modalOpen }),
    }),
    {
      name: 'kr_loc',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      // Só persistimos escolhas confirmadas pelo usuário. Coordenadas nunca entram no estado.
      partialize: (s) => ({ location: s.location?.confirmed ? s.location : null }),
    },
  ),
)
