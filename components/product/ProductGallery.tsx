'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Modal } from '@/components/ui/Overlay'
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, ExpandIcon } from '@/components/ui/Icons'
import { ProductImage } from './ProductImage'
import { cn } from '@/lib/cn'

/** Célula com zoom que segue o cursor (desktop, ponteiro fino). */
function ZoomCell({ src, alt, onOpen, priority, className }: { src: string; alt: string; onOpen: () => void; priority?: boolean; className?: string }) {
  const ref = useRef<HTMLButtonElement>(null)
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null)
  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      aria-label={`Ampliar imagem: ${alt}`}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse' || !ref.current) return
        const r = ref.current.getBoundingClientRect()
        setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
      }}
      onPointerLeave={() => setZoom(null)}
      className={cn('group relative block aspect-square w-full cursor-zoom-in overflow-hidden bg-white', className)}
    >
      <div className="h-full w-full transition-transform duration-200 ease-out will-change-transform" style={zoom ? { transform: 'scale(2)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}>
        <ProductImage src={src} alt={alt} priority={priority} sizes="(min-width:1024px) 50vw, 100vw" />
      </div>
      <span className="absolute bottom-3 right-3 hidden size-8 place-items-center bg-white/90 text-brand opacity-0 transition-opacity group-hover:opacity-100 lg:grid"><ExpandIcon size={16} /></span>
    </button>
  )
}

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [active, setActive] = useState(0)
  const rail = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setLightbox(null), [])

  // Swipe no mobile: scroll-snap nativo + indicador.
  const onScroll = () => {
    const el = rail.current
    if (el) setActive(Math.round(el.scrollLeft / el.clientWidth))
  }
  const firstImage = images[0]
  useEffect(() => { rail.current?.scrollTo({ left: 0 }) }, [firstImage])

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setLightbox((i) => (i === null ? i : (i + 1) % images.length))
      if (e.key === 'ArrowLeft') setLightbox((i) => (i === null ? i : (i - 1 + images.length) % images.length))
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightbox, images.length])

  return (
    <div data-testid="gallery" data-gallery-main>
      {/* Mobile: carrossel com swipe */}
      <div className="lg:hidden">
        <div ref={rail} onScroll={onScroll} className="scroll-x flex border-b border-hairline">
          {images.map((src, i) => (
            <div key={src} className="w-full shrink-0"><ZoomCell src={src} alt={`${name} ${i + 1}`} onOpen={() => setLightbox(i)} priority={i === 0} /></div>
          ))}
        </div>
        <div className="flex justify-center gap-1.5 border-b border-hairline py-3" aria-hidden>
          {images.map((_, i) => <span key={i} className={cn('h-[5px] transition-all duration-300', i === active ? 'w-6 bg-brand' : 'w-[5px] bg-[#cfd1e6]')} />)}
        </div>
      </div>

      {/* Desktop: 1ª imagem inteira + grade 2 colunas com hairlines */}
      <div className="hidden lg:block">
        <ZoomCell src={images[0]!} alt={`${name} 1`} onOpen={() => setLightbox(0)} priority className="border-b border-hairline" />
        <div className="hairline-clip">
          <div className="hairline-grid" style={{ ['--cols-lg' as string]: 2 }}>
            {images.slice(1).map((src, i) => <ZoomCell key={src} src={src} alt={`${name} ${i + 2}`} onOpen={() => setLightbox(i + 1)} />)}
          </div>
        </div>
      </div>

      <Modal open={lightbox !== null} onClose={close} label="Galeria de imagens" className="h-full max-h-[96dvh] max-w-[min(96vw,1100px)] border-0">
        {lightbox !== null && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-1">
              <p className="t-mono">{lightbox + 1} / {images.length}</p>
              <button type="button" onClick={close} aria-label="Fechar galeria" className="grid size-10 place-items-center text-brand"><CloseIcon size={20} /></button>
            </div>
            <div className="relative min-h-0 flex-1 bg-white">
              <img key={images[lightbox]} src={images[lightbox]} alt={`${name} ${lightbox + 1}`} className="absolute inset-0 h-full w-full object-contain" />
              <button type="button" aria-label="Imagem anterior" onClick={() => setLightbox((lightbox - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center bg-white/90 text-brand"><ChevronLeftIcon size={22} /></button>
              <button type="button" aria-label="Próxima imagem" onClick={() => setLightbox((lightbox + 1) % images.length)} className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center bg-white/90 text-brand"><ChevronRightIcon size={22} /></button>
            </div>
            <div className="scroll-x flex gap-2 border-t border-hairline p-2">
              {images.map((src, i) => <button key={src} type="button" onClick={() => setLightbox(i)} aria-label={`Ver imagem ${i + 1}`} aria-current={i === lightbox} className={cn('size-16 shrink-0 border p-1', i === lightbox ? 'border-brand' : 'border-hairline')}><ProductImage src={src} alt="" sizes="64px" /></button>)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
