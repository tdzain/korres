'use client'
import { create } from 'zustand'

export type LiveMode = 'mini' | 'full' | 'closed'
export type SheetStep = 'bag' | 'pay' | 'done'

interface LiveState {
  streamId: string | null
  mode: LiveMode
  muted: boolean
  sheet: SheetStep | null
  setStream: (id: string | null) => void
  setMode: (m: LiveMode) => void
  setMuted: (v: boolean) => void
  setSheet: (s: SheetStep | null) => void
}

/** Estado de UI da live (o carrinho continua no store do site). Não persiste: a live é sorteada a cada carregamento. */
export const useLive = create<LiveState>()((set) => ({
  streamId: null,
  mode: 'mini',
  muted: true,
  sheet: null,
  setStream: (streamId) => set({ streamId }),
  setMode: (mode) => set(mode === 'full' ? { mode } : { mode, sheet: null }),
  setMuted: (muted) => set({ muted }),
  setSheet: (sheet) => set({ sheet }),
}))
