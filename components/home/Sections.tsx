import Link from 'next/link'
import { ProductCard } from '@/components/product/ProductCard'
import { Carousel, SectionTitle } from '@/components/ui/misc'
import { Reveal } from '@/components/ui/Reveal'
import type { ProductSummary } from '@/lib/commerce/types'

/** Grid de largura total, 4 colunas, células separadas por hairline. */
export function ProductGrid({ products, cols = 4, priority = false }: { products: ProductSummary[]; cols?: 2 | 3 | 4; priority?: boolean }) {
  return (
    <div className="hairline-clip border-t border-hairline">
      <div className="hairline-grid" style={{ ['--cols-lg' as string]: cols }}>
        {products.map((p, i) => <ProductCard key={p.id} product={p} priority={priority && i < 4} />)}
      </div>
    </div>
  )
}

export function SuggestedSection({ products }: { products: ProductSummary[] }) {
  return (
    <section aria-labelledby="sug-title">
      <Reveal><SectionTitle title="Sugeridos para você" subtitle="Os queridinhos da Grécia para o seu ritual." /></Reveal>
      <Reveal><ProductGrid products={products} /></Reveal>
    </section>
  )
}

/** Bloco de coleção: título + "Ver tudo", imagem editorial à esquerda e 2×2 de produtos à direita (carrossel no mobile). */
export function CollectionBlock({ title, href, image, imageAlt, products, position = 'center' }: { title: string; href: string; image: string; imageAlt: string; products: ProductSummary[]; position?: string }) {
  return (
    <section className="mt-16 border-y border-hairline lg:mt-20" aria-label={title}>
      <div className="grid lg:grid-cols-2">
        <div className="relative aspect-[4/4.3] overflow-hidden border-hairline bg-surface lg:aspect-auto lg:min-h-[640px] lg:border-r">
          <Reveal className="absolute inset-0"><img src={image} alt={imageAlt} loading="lazy" decoding="async" width={1100} height={1100} className="h-full w-full object-cover" style={{ objectPosition: position }} /></Reveal>
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3 text-brand">
            <h2 className="text-[16px] font-normal text-brand mix-blend-normal md:text-[18px]"><span className="bg-white/80 px-1.5 py-0.5 backdrop-blur-sm">{title}</span></h2>
            <Link href={href} className="link-underline bg-white/80 px-1.5 py-0.5 text-[15px] backdrop-blur-sm">Ver tudo</Link>
          </div>
        </div>
        <div className="hidden lg:block hairline-clip">
          <div className="hairline-grid h-full" style={{ ['--cols-lg' as string]: 2, gridAutoRows: '1fr' }}>
            {products.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} sizes="(min-width:1024px) 25vw, 50vw" />)}
          </div>
        </div>
        <div className="lg:hidden">
          <Carousel itemClass="w-[62%] sm:w-[40%]">{products.slice(0, 6).map((p) => <ProductCard key={p.id} product={p} />)}</Carousel>
        </div>
      </div>
    </section>
  )
}

export function TrendingSection({ products }: { products: ProductSummary[] }) {
  return (
    <section aria-label="Em alta agora">
      <Reveal><SectionTitle title="Em alta agora" subtitle="Estes favoritos estão esperando por você." /></Reveal>
      <Carousel>{products.map((p) => <ProductCard key={p.id} product={p} />)}</Carousel>
    </section>
  )
}

/** Banners editoriais em duas metades. */
export function StoryBanners() {
  return (
    <section className="mt-16 grid border-y border-hairline lg:mt-20 lg:grid-cols-2" aria-label="Nossa história">
      <div className="border-hairline lg:border-r">
        <div className="flex items-center justify-between px-4 py-3 text-[15px] text-brand"><h2 className="text-[16px] font-normal md:text-[18px]">Histórias reais da Grécia</h2><Link href="/p/sobre/" className="link-underline">Leia a história completa</Link></div>
        <Reveal>
          <Link href="/p/sobre/" className="block overflow-hidden"><img src="/editorial/story-statue.webp" alt="Busto de mármore da Grécia antiga" loading="lazy" decoding="async" width={1100} height={1100} className="aspect-square w-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-out)] hover:scale-[1.03]" /></Link>
        </Reveal>
      </div>
      <div className="flex flex-col border-t border-hairline lg:border-t-0">
        <div className="flex items-center justify-between px-4 py-3 text-[15px] text-brand"><h2 className="text-[16px] font-normal md:text-[18px]">Nascemos e somos feitos na Grécia</h2><Link href="/p/sobre/" className="link-underline">Leia mais</Link></div>
        <div className="flex flex-1 items-center justify-center px-6 py-16 lg:px-14">
          <Reveal>
            <p className="font-hand text-[40px] leading-[1.05] text-brand md:text-[56px] lg:text-[64px]">Da mais antiga farmácia homeopática de Atenas ao Nolita, em Nova York, e dos campos de açafrão de Kozani ao Le Marais, em Paris.</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

const TILES = [
  { label: 'Comprar para o rosto', href: '/colecao/rosto/', img: '/editorial/cat-rosto.webp' },
  { label: 'Comprar óleos corporais', href: '/colecao/oleo-corporal/', img: '/editorial/cat-oleo.webp' },
  { label: 'Comprar sabonetes', href: '/colecao/sabonete-em-barra/', img: '/editorial/cat-sabonete.webp' },
  { label: 'Comprar hidratantes corporais', href: '/colecao/hidratante-corporal/', img: '/editorial/cat-locao.webp' },
  { label: 'Comprar cuidados para as mãos', href: '/colecao/maos/', img: '/editorial/cat-maos.webp' },
  { label: 'Comprar fragrâncias', href: '/colecao/fragrancias/', img: '/editorial/cat-fragrancias.webp' },
]

export function CategoryTiles() {
  return (
    <section aria-label="Compre por categoria" className="mt-16 lg:mt-20">
      <Reveal><div className="gutter pb-3"><h2 className="text-[16px] font-normal text-brand">Compre por categoria</h2></div></Reveal>
      <Carousel itemClass="w-[62%] sm:w-[40%] lg:w-1/4 xl:w-1/6">
        {TILES.map((t) => (
          <Link key={t.href} href={t.href} className="group block">
            <div className="aspect-[4/5] overflow-hidden bg-surface"><img src={t.img} alt="" loading="lazy" decoding="async" width={600} height={750} className="h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out)] group-hover:scale-[1.05]" /></div>
            <p className="link-underline border-t border-hairline px-4 py-3 text-[15px] font-normal text-brand">{t.label}</p>
          </Link>
        ))}
      </Carousel>
    </section>
  )
}
