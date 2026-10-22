import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Reveal } from '@/components/ui/Reveal'
import { PAGES } from '@/data/content'

export const dynamicParams = false
export const generateStaticParams = () => PAGES.map((p) => ({ slug: p.slug }))

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = PAGES.find((x) => x.slug === slug)
  return p ? { title: p.title, description: p.lead } : {}
}

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = PAGES.find((p) => p.slug === slug)
  if (!page) notFound()
  return (
    <div className="grid lg:min-h-[70vh] lg:grid-cols-2">
      <div className="border-b border-hairline px-4 py-12 lg:border-b-0 lg:border-r lg:py-20">
        <div className="lg:sticky lg:top-[calc(var(--sticky-top)+32px)]">
          <h1 className="t-section">{page.title}</h1>
          <p className="font-hand mt-6 text-[44px] leading-[0.95] text-brand md:text-[60px]">{page.lead}</p>
        </div>
      </div>
      <div className="space-y-10 px-4 py-12 lg:px-14 lg:py-20">
        {page.sections.map((s, i) => (
          <Reveal key={i}>
            {s.heading && <h2 className="mb-3 text-[18px] font-medium text-brand">{s.heading}</h2>}
            <div className="space-y-3 text-[15px] font-normal leading-relaxed text-body">{s.body.map((t, j) => <p key={j}>{t}</p>)}</div>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
