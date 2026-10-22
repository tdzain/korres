import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CollectionView } from '@/components/product/CollectionView'
import { collectionProducts, collections, getCollectionBySlug } from '@/lib/commerce/catalog'

export const dynamicParams = false

export function generateStaticParams() {
  return collections().map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const c = getCollectionBySlug(slug)
  return c ? { title: c.title, description: c.subtitle } : {}
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const collection = getCollectionBySlug(slug)
  if (!collection) notFound()
  return <CollectionView collection={collection} products={collectionProducts(slug)} />
}
