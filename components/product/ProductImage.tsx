import { cn } from '@/lib/cn'

/** Imagem de produto com srcset 500w/1000w (arquivos gerados por scripts/build-catalog.mjs). */
export function ProductImage({ src, alt, className, sizes = '(min-width:1024px) 25vw, 50vw', priority, blend }: { src: string; alt: string; className?: string; sizes?: string; priority?: boolean; blend?: boolean }) {
  const small = src.replace(/\.webp$/, '-500.webp')
  return (
    <img
      src={src}
      srcSet={`${small} 500w, ${src} 1000w`}
      sizes={sizes}
      alt={alt}
      width={1000}
      height={1000}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
      className={cn('h-full w-full object-contain', blend && 'mix-blend-multiply', className)}
    />
  )
}
