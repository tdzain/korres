'use client'
import { AnimatePresence, m as motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { DEMO_CITIES } from '@/data/brazil'
import { cn } from '@/lib/cn'
import { useLocation } from '@/lib/store/location'
import { useOrders } from '@/lib/store/orders'
import { useToast } from '@/lib/store/toast'
import { useDemo } from '@/lib/store/ui'

/** Painel flutuante do modo demonstração (?demo=1). */
export function DemoPanel() {
  const enabled = useDemo((s) => s.enabled)
  const hour = useDemo((s) => s.simulatedHour)
  const setHour = useDemo((s) => s.setHour)
  const location = useLocation((s) => s.location)
  const setLocation = useLocation((s) => s.set)
  const [open, setOpen] = useState(false)
  // Aberto por padrão só em telas largas: no mobile ele cobriria os CTAs.
  useEffect(() => { setOpen(window.matchMedia('(min-width: 1024px)').matches) }, [])
  if (!enabled) return null

  // Vai para uma PDP com ?live=N (força a live) ou sem o parâmetro (sorteio).
  const setLive = (v: string) => {
    const url = new URL(window.location.href)
    if (!url.pathname.startsWith('/produto/')) url.pathname = '/produto/greek-yoghurt-serum-gel-anti-fadiga-para-olhos/'
    if (v) url.searchParams.set('live', v); else url.searchParams.delete('live')
    window.location.assign(url.toString())
  }
  const approve = () => {
    const pending = useOrders.getState().orders.find((o) => o.status === 'awaiting_payment')
    if (!pending) { useToast.getState().push('Nenhum pedido aguardando pagamento'); return }
    useOrders.getState().markPaid(pending.id)
    useToast.getState().push(`Pix aprovado: pedido ${pending.id}`)
  }
  const reset = () => {
    try {
      Object.keys(localStorage).filter((k) => k.startsWith('kr_')).forEach((k) => localStorage.removeItem(k))
      sessionStorage.removeItem('kr_demo')
    } catch { /* storage bloqueado */ }
    window.location.href = '/?demo=1'
  }

  return (
    <div className="fixed bottom-[78px] left-3 z-[75] lg:bottom-3 max-w-[calc(100vw-24px)] text-[12px] lg:bottom-3" data-testid="demo-panel">
      <AnimatePresence initial={false} mode="wait">
        {open ? (
          <motion.div key="open" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="w-[250px] border border-brand bg-white p-3 shadow-[0_8px_30px_rgb(6_16_150/0.2)]">
            <div className="mb-2 flex items-center justify-between"><span className="t-caps text-brand">Modo demonstração</span><button type="button" onClick={() => setOpen(false)} className="t-mono underline" aria-label="Minimizar painel">minimizar</button></div>
            <p className="t-mono mb-1">Cidade de entrega</p>
            <div className="grid grid-cols-2 gap-1">
              {DEMO_CITIES.map((c) => {
                const active = location?.city === c.city && location.uf === c.uf
                return <button key={c.city} type="button" onClick={() => setLocation({ city: c.city, uf: c.uf, cep: c.cep, source: 'demo' })} className={cn('border px-2 py-1.5 text-left font-normal', active ? 'border-brand bg-brand text-white' : 'border-hairline text-brand hover:bg-tint')}>{c.city}–{c.uf}</button>
              })}
            </div>
            <label className="t-mono mb-1 mt-3 block" htmlFor="demo-hour">Horário simulado (BRT)</label>
            <select id="demo-hour" value={hour ?? ''} onChange={(e) => setHour(e.target.value === '' ? null : Number(e.target.value))} className="w-full border border-hairline bg-white px-2 py-1.5 font-normal text-brand">
              <option value="">Agora (real)</option>
              <option value="9">09h (antes do corte)</option>
              <option value="12">12h (antes do corte)</option>
              <option value="15">15h (depois do corte)</option>
            </select>
            <p className="t-mono mb-1 mt-3">Live commerce (recarrega a PDP)</p>
            <div className="grid grid-cols-5 gap-1">
              {([['', 'Sorteio'], ['1', '1'], ['2', '2'], ['3', '3'], ['off', 'Off']] as const).map(([v, l]) => (
                <button key={l} type="button" onClick={() => setLive(v)} className="border border-hairline px-1 py-1.5 text-brand hover:bg-tint">{l}</button>
              ))}
            </div>
            <div className="mt-3 grid gap-1">
              <button type="button" onClick={approve} className="bg-brand px-2 py-2 uppercase tracking-wide text-white">Simular Pix aprovado</button>
              <button type="button" onClick={reset} className="border border-hairline px-2 py-2 uppercase tracking-wide text-brand hover:bg-tint">Resetar sessão</button>
            </div>
          </motion.div>
        ) : (
          <motion.button key="closed" type="button" onClick={() => setOpen(true)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-brand bg-white px-3 py-2 uppercase tracking-wide text-brand">Demo</motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
