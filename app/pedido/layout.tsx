import type { Metadata } from 'next'
import { CheckoutHeader } from '@/components/checkout/CheckoutPage'
import { MadeBy } from '@/components/layout/MadeBy'

export const metadata: Metadata = { title: 'Pedido confirmado' }

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-brand px-4 py-1.5 text-center font-mono text-[12px] uppercase tracking-wider text-white" role="note">Ambiente de demonstração</div>
      <CheckoutHeader />
      <main id="main">{children}</main>
      <footer className="border-t border-hairline px-4 py-3 pb-28 lg:px-10 lg:pb-3"><MadeBy /></footer>
    </>
  )
}
