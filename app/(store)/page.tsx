import { preload } from 'react-dom'
import { Hero } from '@/components/home/Hero'
import { CategoryTiles, CollectionBlock, StoryBanners, SuggestedSection, TrendingSection } from '@/components/home/Sections'
import { bestSellers, collectionProducts } from '@/lib/commerce/catalog'

export default function HomePage() {
  preload('/editorial/hero-black-pine-640.webp', { as: 'image', fetchPriority: 'high', imageSrcSet: '/editorial/hero-black-pine-640.webp 640w, /editorial/hero-black-pine.webp 1100w', imageSizes: '(min-width:1024px) 50vw, 100vw' })
  const best = bestSellers()
  const trending = [...best.slice(8), ...best.slice(0, 8)].slice(0, 8)
  return (
    <>
      <Hero />
      <SuggestedSection products={best.slice(0, 8)} />
      <CollectionBlock title="Smart Yoghurt" href="/colecao/smart-yoghurt/" image="/editorial/col-smart-yoghurt.webp" imageAlt="Sérum Smart Yoghurt Probiotic Super Serum" products={collectionProducts('smart-yoghurt')} />
      <CollectionBlock title="Pure Greek Olive" href="/colecao/pure-greek-olive/" image="/editorial/col-olive.webp" imageAlt="Mãos segurando o óleo nutritivo Pure Greek Olive" products={collectionProducts('pure-greek-olive')} />
      <CollectionBlock title="Fragrâncias conscientes" href="/colecao/fragrancias/" image="/editorial/col-fragrancias.webp" imageAlt="Deo colônia Blue Sage" products={collectionProducts('fragrancias')} />
      <TrendingSection products={trending} />
      <StoryBanners />
      <CategoryTiles />
    </>
  )
}
