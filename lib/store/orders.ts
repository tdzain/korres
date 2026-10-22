'use client'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Order } from '@/lib/commerce/types'

interface OrdersState {
  orders: Order[]
  add: (order: Order) => void
  markPaid: (id: string) => void
}

export const useOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      add: (order) => set((s) => ({ orders: [order, ...s.orders.filter((o) => o.id !== order.id)] })),
      markPaid: (id) => set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status: 'paid' } : o)) })),
    }),
    { name: 'kr_orders', storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
)
