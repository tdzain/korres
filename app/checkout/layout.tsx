import type { Metadata } from 'next'
import { CheckoutHeader } from '@/components/checkout/CheckoutPage'

export const metadata: Metadata = { title: 'Finalizar compra' }

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-brand px-4 py-1.5 text-center font-mono text-[12px] uppercase tracking-wider text-white" role="note">Ambiente de demonstração</div>
      <CheckoutHeader />
      <main id="main">{children}</main>
    </>
  )
}
