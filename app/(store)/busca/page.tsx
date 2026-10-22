import { Suspense } from 'react'
import { SearchResults } from '@/components/product/SearchResults'

export const metadata = { title: 'Busca' }

export default function Page() {
  return <Suspense fallback={<div className="gutter py-20"><div className="skeleton h-10 w-64" /></div>}><SearchResults /></Suspense>
}
