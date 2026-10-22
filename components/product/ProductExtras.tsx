import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import { SectionTitle } from '@/components/ui/misc'
import { LeafIcon } from '@/components/ui/Icons'
import { allProducts } from '@/lib/commerce/catalog'
import type { Product } from '@/lib/commerce/types'
import { ProductGrid } from '@/components/home/Sections'

export function EthicsBanner() {
  return (
    <section className="grid border-b border-hairline lg:grid-cols-2" aria-label="Origem ética">
      <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:min-h-[420px] lg:border-r lg:border-hairline"><img src="/editorial/ethics.webp" alt="Uvas de Santorini" loading="lazy" decoding="async" width={1100} height={1100} className="absolute inset-0 h-full w-full object-cover" /></div>
      <div className="flex flex-col justify-center px-4 py-12 lg:px-14">
        <Reveal>
          <LeafIcon size={28} className="text-brand" />
          <h2 className="t-section mt-5">Todos os produtos KORRES são de origem ética</h2>
          <p className="mt-5 max-w-[520px] text-[15px] font-normal leading-relaxed text-body">Não testamos em animais, trabalhamos com fornecedores gregos e priorizamos fórmulas com alto conteúdo de origem natural, desenvolvidas com ciência e respeito à pele e ao planeta.</p>
          <Link href="/p/sobre/" className="link-underline mt-6 inline-block text-[14px] uppercase text-brand">Conheça nossa história ›</Link>
        </Reveal>
      </div>
    </section>
  )
}

export function Related({ product: p }: { product: Product }) {
  const pool = allProducts.filter((x) => x.id !== p.id)
  const rank = (x: (typeof pool)[number]) => (x.lineSlug && x.lineSlug === p.lineSlug ? 4 : 0) + (x.group === p.group ? 2 : 0) + (x.bestSellerRank ? 1 : 0)
  const related = [...pool].sort((a, b) => rank(b) - rank(a)).slice(0, 4)
  return (
    <section aria-label="Produtos relacionados">
      <Reveal><SectionTitle title="Combina com" subtitle="Complete o seu ritual." /></Reveal>
      <ProductGrid products={related} />
    </section>
  )
}

/** Bloco de vídeo (somente produtos da linha Pure Greek Olive, que têm filme próprio). Carrega sob demanda. */
export function ProductVideo({ product: p }: { product: Product }) {
  if (p.lineSlug !== 'pure-greek-olive' && !p.slug.includes('pure-greek-olive')) return null
  return (
    <section aria-label="Vídeo" className="grid border-b border-hairline lg:grid-cols-2">
      <div className="flex flex-col justify-center border-hairline px-4 py-12 lg:border-r lg:px-14">
        <p className="t-mono">Pure Greek Olive</p>
        <h2 className="t-section mt-3">Veja em movimento</h2>
        <p className="mt-5 max-w-[480px] text-[15px] font-normal leading-relaxed text-body">O azeite extravirgem grego, colhido e prensado com cuidado, em um ritual de hidratação para rosto, corpo e cabelo.</p>
      </div>
      <div className="relative aspect-video bg-surface lg:aspect-auto lg:min-h-[420px]">
        <video className="absolute inset-0 h-full w-full object-cover" controls playsInline preload="none" poster="/editorial/col-olive.webp" aria-label="Vídeo do ritual Pure Greek Olive">
          <source src="/video/pure-greek-olive.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  )
}
