import Link from 'next/link'
import { brand } from '@/config/brand'
import { FOOTER } from '@/data/menu'
import { NewsletterBlock } from './Newsletter'

export function Footer() {
  return (
    <footer className="mt-20 border-t border-hairline bg-white">
      <NewsletterBlock />
      <div className="hairline-clip border-t border-hairline">
        <div className="hairline-grid" style={{ ['--cols-lg' as string]: 4 }}>
          {FOOTER.map((col) => (
            <nav key={col.title} aria-label={col.title} className="gutter py-5 pb-8">
              <h2 className="t-caps text-brand">{col.title}</h2>
              <ul className="mt-5 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}><Link href={l.href} className="link-underline text-[14px] font-normal leading-5 text-brand" {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{l.label}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="gutter border-t border-hairline py-10">
        <p className="font-hand text-[40px] leading-none text-brand md:text-[56px]">{brand.tagline}</p>
        <p className="t-mono mt-6">{brand.legalLine}</p>
        <p className="t-mono mt-1">© {new Date().getFullYear()} {brand.name}. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
