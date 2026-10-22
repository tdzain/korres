'use client'
import { create } from 'zustand'

/** Vira true quando todos os stores persistidos terminaram de reidratar (evita flashes de cookie banner, etc.). */
export const useReady = create<{ ready: boolean }>()(() => ({ ready: false }))
