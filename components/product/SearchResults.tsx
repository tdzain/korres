'use client'
import { useSearchParams } from 'next/navigation'
import { ProductGrid } from '@/components/home/Sections'
import { Button } from '@/components/ui/Button'
import { SectionTitle } from '@/components/ui/misc'
import { bestSellers, searchProducts } from '@/lib/commerce/catalog'

export function SearchResults() {
  const q = useSearchParams().get('q') ?? ''
  const results = searchProducts(q, 60)
  return (
    <div>
      <SectionTitle as="h1" title={q ? `Resultados para “${q}”` : 'Busca'} subtitle={q ? `${results.length} ${results.length === 1 ? 'produto encontrado' : 'produtos encontrados'}` : 'Digite o que você procura.'} className="pt-10 md:pt-14" />
      {results.length > 0 ? <ProductGrid products={results} /> : (
        <>
          <div className="gutter border-t border-hairline py-12 text-center"><p className="font-hand text-[40px] leading-none text-brand">Nada encontrado</p><p className="t-mono mt-3">Tente outro termo, como “sérum”, “Black Pine” ou “hidratação”.</p><div className="mt-6 flex justify-center"><Button href="/colecao/todos/" variant="outline">Ver todos os produtos</Button></div></div>
          <SectionTitle title="Mais vendidos" />
          <ProductGrid products={bestSellers().slice(0, 4)} />
        </>
      )}
    </div>
  )
}
