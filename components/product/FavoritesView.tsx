'use client'
import { ProductGrid } from '@/components/home/Sections'
import { Button } from '@/components/ui/Button'
import { SectionTitle } from '@/components/ui/misc'
import { allProducts } from '@/lib/commerce/catalog'
import { useFavorites } from '@/lib/store/favorites'

export function FavoritesView() {
  const ids = useFavorites((s) => s.ids)
  const items = ids.map((id) => allProducts.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p)
  return (
    <div>
      <SectionTitle as="h1" title="Favoritos" subtitle={items.length ? `${items.length} ${items.length === 1 ? 'produto salvo' : 'produtos salvos'}` : 'Salve produtos com o marcador para encontrá-los aqui.'} className="pt-10 md:pt-14" />
      {items.length ? <ProductGrid products={items} /> : (
        <div className="gutter border-t border-hairline py-16 text-center"><p className="font-hand text-[44px] leading-none text-brand">Nenhum favorito ainda</p><div className="mt-6 flex justify-center"><Button href="/colecao/mais-vendidos/">Explorar mais vendidos</Button></div></div>
      )}
    </div>
  )
}
