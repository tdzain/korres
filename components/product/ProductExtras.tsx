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
