'use client'
import { prefersReducedMotion } from '@/lib/hooks'
import { useCart } from '@/lib/store/cart'
import { useToast } from '@/lib/store/toast'

/** Miniatura "voa" até o ícone da sacola (WAAPI, 60fps, só transform/opacity). */
export function flyToCart(source: Element | null, src: string) {
  const target = document.querySelector<HTMLElement>('[data-bag-icon]')
  if (!source || !target || prefersReducedMotion()) return Promise.resolve()
  const from = source.getBoundingClientRect()
  const to = target.getBoundingClientRect()
  const size = Math.min(from.width, from.height, 140)
  const img = document.createElement('img')
  img.src = src
  Object.assign(img.style, {
    position: 'fixed', zIndex: '120', left: `${from.left + from.width / 2 - size / 2}px`, top: `${from.top + from.height / 2 - size / 2}px`,
    width: `${size}px`, height: `${size}px`, objectFit: 'contain', background: '#fff', border: '1px solid #8589bb', pointerEvents: 'none', willChange: 'transform, opacity',
  })
  document.body.appendChild(img)
  const dx = to.left + to.width / 2 - (from.left + from.width / 2)
  const dy = to.top + to.height / 2 - (from.top + from.height / 2)
  const anim = img.animate(
    [
      { transform: 'translate(0,0) scale(1)', opacity: 1, offset: 0 },
      { transform: `translate(${dx * 0.55}px, ${dy * 0.35 - 40}px) scale(0.55)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.12)`, opacity: 0.35, offset: 1 },
    ],
    { duration: 720, easing: 'cubic-bezier(.65,0,.35,1)' },
  )
  return anim.finished.then(() => img.remove(), () => img.remove())
}

export interface BagTarget { slug: string; variantId: string; name: string; image: string }

/** Adiciona à sacola, anima a miniatura até o ícone e abre o drawer com spring. */
export async function addToBag(t: BagTarget, qty = 1, source?: Element | null, { openDrawer = true }: { openDrawer?: boolean } = {}) {
  const cart = useCart.getState()
  const fly = flyToCart(source ?? null, t.image)
  // Atualiza o contador quando a miniatura chega.
  const delay = prefersReducedMotion() || !source ? 0 : 560
  setTimeout(() => cart.add({ variantId: t.variantId, slug: t.slug }, qty), delay)
  await fly
  if (openDrawer) useCart.getState().setOpen(true)
  else useToast.getState().push(`${t.name} adicionado à sacola`)
}
