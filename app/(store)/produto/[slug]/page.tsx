import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductInfo } from '@/components/product/ProductInfo'
import { EthicsBanner, ProductVideo, Related } from '@/components/product/ProductExtras'
import { Reviews } from '@/components/product/Reviews'
import { allProducts, categoryFor } from '@/lib/commerce/catalog'
import { getCommerce } from '@/lib/commerce/provider'

export const dynamicParams = false

export function generateStaticParams() {
  return allProducts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = await getCommerce().getProduct(slug)
  return p ? { title: p.name, description: p.description[0]?.slice(0, 155), openGraph: { images: [p.images[0]!] } } : {}
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getCommerce().getProduct(slug)
  if (!product) notFound()
  return (
    <>
      <ProductInfo product={product} categoryLabel={categoryFor(product)} />
      <ProductVideo product={product} />
      <Reviews product={product} />
      <EthicsBanner />
      <Related product={product} />
      <div className="h-16 lg:hidden" aria-hidden />
    </>
  )
}
