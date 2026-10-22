'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Tabs } from '@/components/ui/misc'
import { formatDateTimeBR } from '@/lib/format/date'
import { formatBRL } from '@/lib/format/money'
import { useAccount } from '@/lib/store/account'
import { useOrders } from '@/lib/store/orders'
import { useToast } from '@/lib/store/toast'
import Link from 'next/link'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function AuthForms() {
  const login = useAccount((s) => s.login)
  const [tab, setTab] = useState('entrar')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState<Record<string, string>>({})
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (tab === 'criar' && name.trim().length < 2) next.name = 'Informe seu nome'
    if (!EMAIL.test(email)) next.email = 'Informe um e-mail válido'
    if (pass.length < 4) next.pass = 'Use ao menos 4 caracteres'
    setErr(next)
    if (Object.keys(next).length) return
    login({ name: name.trim() || email.split('@')[0]!.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), email })
    useToast.getState().push('Bem-vinda(o) de volta!')
  }
  return (
    <div className="mx-auto max-w-[460px] px-4 py-12">
      <Tabs label="Entrar ou criar conta" value={tab} onChange={setTab} tabs={[{ id: 'entrar', label: 'Entrar' }, { id: 'criar', label: 'Criar conta' }]} />
      <form onSubmit={submit} noValidate className="mt-6 space-y-3">
        {tab === 'criar' && <Field label="Nome completo" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={err.name} />}
        <Field label="E-mail" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={err.email} />
        <Field label="Senha" name="password" type="password" autoComplete={tab === 'criar' ? 'new-password' : 'current-password'} value={pass} onChange={(e) => setPass(e.target.value)} error={err.pass} />
        <Button type="submit" full size="lg">{tab === 'criar' ? 'Criar conta' : 'Entrar'}</Button>
        <p className="t-mono">Conta simulada: qualquer e-mail e senha funcionam. Nada é enviado a servidores.</p>
      </form>
    </div>
  )
}

export function AccountView() {
  const user = useAccount((s) => s.user)
  const logout = useAccount((s) => s.logout)
  const orders = useOrders((s) => s.orders)
  if (!user) return <AuthForms />
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[1fr_2fr]">
      <div className="border-hairline px-4 py-10 lg:border-r lg:py-14">
        <p className="font-hand text-[48px] leading-none text-brand">Olá, {user.name.split(' ')[0]}</p>
        <p className="t-mono mt-3">{user.email}</p>
        <div className="mt-6"><Button variant="outline" onClick={logout}>Sair</Button></div>
      </div>
      <div className="px-4 py-10 lg:py-14">
        <h1 className="t-section">Meus pedidos</h1>
        {orders.length === 0 ? <p className="t-mono mt-4">Você ainda não fez pedidos neste navegador.</p> : (
          <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
            {orders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div><Link href={process.env.NODE_ENV === 'production' ? `/pedido/${o.id}/` : `/pedido/?id=${o.id}`} className="link-underline font-mono text-[14px] text-brand">{o.id}</Link><p className="t-mono">{formatDateTimeBR(new Date(o.createdAt))} · {o.items.reduce((s, i) => s + i.qty, 0)} itens</p></div>
                <p className="text-[14px] text-brand">{formatBRL(o.totals.total)} <span className={o.status === 'paid' ? 'ml-2 text-success' : 'ml-2 text-muted'}>{o.status === 'paid' ? 'Pago' : 'Aguardando pagamento'}</span></p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
