'use client'
import { LazyMotion, MotionConfig } from 'motion/react'
import { useEffect, type ReactNode } from 'react'
import { useAccount } from '@/lib/store/account'
import { useCart } from '@/lib/store/cart'
import { useFavorites } from '@/lib/store/favorites'
import { useLocation } from '@/lib/store/location'
import { useOrders } from '@/lib/store/orders'
import { usePrefs } from '@/lib/store/prefs'
import { useReady } from '@/lib/store/ready'
import { useDemo } from '@/lib/store/ui'

const loadFeatures = () => import('@/lib/motionFeatures').then((r) => r.default)

/** Reidrata os stores (skipHydration evita mismatch de SSR), ativa ?demo=1 e dispara a detecção de cidade. */
function StoreHydrator() {
  useEffect(() => {
    const stores = [useCart, useFavorites, useAccount, useOrders, usePrefs, useLocation, useDemo]
    void Promise.all(stores.map((s) => Promise.resolve(s.persist.rehydrate()))).then(() => {
      if (new URLSearchParams(window.location.search).get('demo') === '1') useDemo.getState().enable()
      useReady.setState({ ready: true })
      void useLocation.getState().detect()
    })
    // Sincroniza entre abas.
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'kr_cart') void useCart.persist.rehydrate()
      if (e.key === 'kr_favs') void useFavorites.persist.rehydrate()
      if (e.key === 'kr_orders') void useOrders.persist.rehydrate()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
  return null
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {/* Recursos de animação (incluindo layout) carregados fora do caminho crítico. */}
      <LazyMotion features={loadFeatures}>
        <StoreHydrator />
        {children}
      </LazyMotion>
    </MotionConfig>
  )
}
