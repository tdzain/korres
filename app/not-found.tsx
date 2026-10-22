import { StoreShell } from '@/components/layout/StoreShell'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <StoreShell>
      <section className="gutter grid min-h-[60vh] place-items-center py-20 text-center">
        <div>
          <p className="t-mono">404</p>
          <h1 className="mt-4 text-[40px] font-normal leading-tight md:text-[64px]">Página não encontrada</h1>
          <p className="font-hand mt-4 text-[34px] leading-none text-brand">Parece que esse caminho não leva à Grécia.</p>
          <div className="mt-8 flex justify-center"><Button href="/colecao/todos/" size="lg">Continuar comprando</Button></div>
        </div>
      </section>
    </StoreShell>
  )
}
