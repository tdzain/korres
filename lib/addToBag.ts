'use client'
import { prefersReducedMotion } from '@/lib/hooks'
import { useCart } from '@/lib/store/cart'
import { useToast } from '@/lib/store/toast'

/** Miniatura "voa" até o ícone da sacola (WAAPI, 60fps, só transform/opacity). */
export function flyToCart(source: Element | null, src: string, targetSelector = '[data-bag-icon]') {
  const target = document.querySelector<HTMLElement>(targetSelector)
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

/**
 * Adicionar à sacola, em sequência coreografada:
 *   0 ms     a miniatura começa a voar até o ícone da sacola
 *   ~260 ms  o drawer começa a abrir (a miniatura continua visível por cima)
 *   ~720 ms  a miniatura chega: o item entra na lista (linha expande) e o contador faz bump
 * Sem origem (ex.: dentro do drawer) ou com movimento reduzido, tudo acontece sem voo.
 */
export async function addToBag(t: BagTarget, qty = 1, source?: Element | null, { openDrawer = true, silent = false, flyTarget }: { openDrawer?: boolean; silent?: boolean; flyTarget?: string } = {}) {
  const cart = useCart.getState()
  const animate = !!source && !prefersReducedMotion()
  if (!animate) {
    cart.add({ variantId: t.variantId, slug: t.slug }, qty)
    if (openDrawer) cart.setOpen(true)
    else if (!silent) useToast.getState().push(`${t.name} adicionado à sacola`)
    return
  }
  const fly = flyToCart(source ?? null, t.image, flyTarget)
  if (openDrawer) setTimeout(() => useCart.getState().setOpen(true), 260)
  await fly
  useCart.getState().add({ variantId: t.variantId, slug: t.slug }, qty)
}
