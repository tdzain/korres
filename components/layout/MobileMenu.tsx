'use client'
import Link from 'next/link'
import { MEGA, NAV, SEASONAL } from '@/data/menu'
import { useUI } from '@/lib/store/ui'
import { Drawer, CloseButton } from '@/components/ui/Overlay'
import { Accordion } from '@/components/ui/Accordion'
import { Logo } from '@/components/ui/Logo'

export function MobileMenu() {
  const open = useUI((s) => s.menuOpen)
  const setOpen = useUI((s) => s.setMenuOpen)
  const close = () => setOpen(false)
  return (
    <Drawer open={open} onClose={close} label="Menu" side="left" className="max-w-[420px]">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2">
        <Logo height={18} className="text-brand" />
        <CloseButton onClick={close} label="Fechar menu" />
      </div>
      <nav className="flex-1 overflow-auto" aria-label="Menu móvel">
        <ul className="border-b border-hairline">
          {NAV.filter((n) => !n.mega).map((n) => (
            <li key={n.label} className="border-b border-hairline last:border-b-0"><Link href={n.href} onClick={close} className="block px-4 py-3 text-[16px] font-normal text-brand">{n.label}</Link></li>
          ))}
          <li><Link href={SEASONAL.href} onClick={close} className="block border-t border-hairline px-4 py-3 text-[16px] font-normal text-seasonal">{SEASONAL.label}</Link></li>
        </ul>
        <div className="p-4">
          <p className="t-caps mb-3 text-brand">Comprar por</p>
          <Accordion
            items={MEGA.map((c) => ({
              id: c.title,
              title: c.title,
              content: <ul className="flex flex-col">{c.links.map((l) => <li key={l.label}><Link href={l.href} onClick={close} className="block py-1.5 text-[14px] text-brand">{l.label}</Link></li>)}</ul>,
            }))}
          />
        </div>
      </nav>
    </Drawer>
  )
}
