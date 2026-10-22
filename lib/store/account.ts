'use client'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface Account {
  name: string
  email: string
  phone?: string
}

interface AccountState {
  user: Account | null
  login: (user: Account) => void
  logout: () => void
}

/** Conta simulada: nenhuma senha é armazenada nem verificada. */
export const useAccount = create<AccountState>()(
  persist(
    (set) => ({ user: null, login: (user) => set({ user }), logout: () => set({ user: null }) }),
    { name: 'kr_account', storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
)
