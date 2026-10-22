import type { ReactNode } from 'react'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { AnnouncementBar } from './AnnouncementBar'
import { CookieBanner } from './CookieBanner'
import { Footer } from './Footer'
import { Header } from './Header'
import { LiveRoot } from '@/components/live/LiveRoot'
import { LocationModal } from './LocationModal'
import { MobileMenu } from './MobileMenu'
import { NewsletterPopup } from './Newsletter'
import { SearchOverlay } from './SearchOverlay'

/** Casca da loja: barra de anúncio, header dividido, conteúdo, rodapé e overlays. */
export function StoreShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:bg-brand focus:px-3 focus:py-2 focus:text-white">Pular para o conteúdo</a>
      <AnnouncementBar />
      <Header />
      <main id="main" className="min-h-[60vh]">{children}</main>
      <Footer />
      <CookieBanner />
      <NewsletterPopup />
      <CartDrawer />
      <SearchOverlay />
      <MobileMenu />
      <LocationModal />
      <LiveRoot />
    </>
  )
}
