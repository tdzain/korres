import type { Metadata, Viewport } from 'next'
import { Hanken_Grotesk, Reenie_Beanie, Roboto_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/layout/Providers'
import { DemoPanel } from '@/components/layout/DemoPanel'
import { Toaster } from '@/components/ui/Toaster'
import { brand } from '@/config/brand'

// Fallbacks livres. Para trocar pela Favorit licenciada, veja docs/FONTS.md.
const sans = Hanken_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-hanken', display: 'swap' })
const mono = Roboto_Mono({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-roboto-mono', display: 'swap' })
const hand = Reenie_Beanie({ subsets: ['latin'], weight: '400', variable: '--font-reenie', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://korres-brasil.pages.dev'),
  title: { default: `${brand.name} | Cosméticos naturais da Grécia`, template: `%s | ${brand.name}` },
  description: 'Skincare, corpo e banho e fragrâncias KORRES. Nascida e feita na Grécia. Frete e prazo calculados para a sua cidade, Pix com 5% off e até 6x sem juros.',
  icons: { icon: '/favicon.svg' },
  robots: { index: false, follow: false }, // protótipo de demonstração
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#ffffff' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${mono.variable} ${hand.variable}`}>
      <body>
        <Providers>
          {children}
          <Toaster />
          <DemoPanel />
        </Providers>
      </body>
    </html>
  )
}
