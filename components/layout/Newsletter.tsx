'use client'
import { AnimatePresence, m as motion } from 'motion/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Field } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { CheckIcon } from '@/components/ui/Icons'
import { Modal, CloseButton } from '@/components/ui/Overlay'
import { usePrefs } from '@/lib/store/prefs'
import { useReady } from '@/lib/store/ready'
import { useToast } from '@/lib/store/toast'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function useSubscribe() {
  const setNewsletter = usePrefs((s) => s.setNewsletter)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!EMAIL.test(email)) { setError('Informe um e-mail válido.'); return }
    setDone(true)
    setNewsletter('subscribed')
    useToast.getState().push('Cadastro feito! Use BEMVINDO15 na primeira compra.')
  }
  return { email, setEmail, error, setError, done, submit }
}

/** Bloco de newsletter do rodapé: "Cadastre-se e ganhe 15% off na primeira compra". */
export function NewsletterBlock() {
  const n = useSubscribe()
  return (
    <section aria-labelledby="nl-title" className="grid border-t border-hairline md:grid-cols-2">
      <div className="gutter py-10 md:py-16">
        <h2 id="nl-title" className="text-[22px] font-normal text-brand">Junte-se à nossa newsletter</h2>
        <p className="mt-4 text-[14px] font-normal text-brand">Cadastre-se e ganhe 15% off na primeira compra.</p>
      </div>
      <div className="px-4 pb-10 md:border-l md:border-hairline md:py-16 md:pl-4 md:pr-4">
        <AnimatePresence mode="wait" initial={false}>
          {n.done ? (
            <motion.div key="ok" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-surface p-4 text-[14px] font-normal text-brand" role="status">
              <span className="grid size-6 place-items-center bg-success text-white"><CheckIcon size={14} /></span>
              Pronto! Seu cupom é <b className="font-medium">BEMVINDO15</b>.
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={n.submit} noValidate exit={{ opacity: 0 }}>
              <div className="flex items-stretch bg-surface">
                <input type="email" name="newsletter" autoComplete="email" aria-label="Seu e-mail" placeholder="Seu e-mail" value={n.email} onChange={(e) => { n.setEmail(e.target.value); n.setError('') }} className="h-[42px] flex-1 bg-transparent px-4 text-[14px] font-normal text-brand outline-none placeholder:text-brand/70" />
                <button type="submit" className="px-5 text-[14px] font-normal uppercase tracking-wide text-brand hover:bg-tint">Entrar</button>
              </div>
              {n.error && <p role="alert" className="mt-2 text-[12.5px] font-normal text-danger">{n.error}</p>}
              <p className="mt-4 text-[14px] font-normal text-brand">Ao se cadastrar, você concorda com nossa <Link href="/p/politica-de-privacidade/" className="link-static-underline">política de privacidade</Link>.</p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

/** Pop-up de newsletter (uma vez, após alguns segundos). */
export function NewsletterPopup() {
  const ready = useReady((s) => s.ready)
  const state = usePrefs((s) => s.newsletter)
  const cookies = usePrefs((s) => s.cookies)
  const setNewsletter = usePrefs((s) => s.setNewsletter)
  const [open, setOpen] = useState(false)
  const n = useSubscribe()
  useEffect(() => {
    if (!ready || state !== null || cookies === null) return
    const t = setTimeout(() => setOpen(true), 9000)
    return () => clearTimeout(t)
  }, [ready, state, cookies])
  const close = () => { setOpen(false); if (usePrefs.getState().newsletter === null) setNewsletter('dismissed') }
  return (
    <Modal open={open} onClose={close} label="Ganhe 15% off na primeira compra" className="max-w-[460px]">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <p className="font-hand text-[44px] leading-none text-brand">15% off</p>
          <CloseButton onClick={close} />
        </div>
        <h2 className="mt-2 text-[22px] font-normal text-brand">Na sua primeira compra</h2>
        <p className="t-mono mt-2">Cadastre seu e-mail e receba o cupom, além de lançamentos e ofertas.</p>
        {n.done ? (
          <p className="mt-5 bg-surface p-4 text-[14px] font-normal text-brand" role="status">Cupom <b className="font-medium">BEMVINDO15</b> liberado. Aproveite!</p>
        ) : (
          <form onSubmit={n.submit} noValidate className="mt-5 space-y-3">
            <Field label="Seu e-mail" name="popup-email" type="email" autoComplete="email" value={n.email} data-autofocus onChange={(e) => { n.setEmail(e.target.value); n.setError('') }} error={n.error} />
            <Button type="submit" full>Quero meu desconto</Button>
          </form>
        )}
      </div>
    </Modal>
  )
}
