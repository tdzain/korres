'use client'
import { useState } from 'react'
import { Modal, CloseButton } from '@/components/ui/Overlay'
import { Field } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { PinIcon } from '@/components/ui/Icons'
import { getBrowserPosition, lookupCep, reverseGeocode } from '@/lib/geo/client'
import { useLocation } from '@/lib/store/location'
import { useToast } from '@/lib/store/toast'
import { isValidCEP, maskCEP } from '@/lib/validators/cep'

/** Alterar localização: CEP com autopreenchimento (ViaCEP) ou "usar minha localização exata" com consentimento explícito. */
export function LocationModal() {
  const open = useLocation((s) => s.modalOpen)
  const setOpen = useLocation((s) => s.setModalOpen)
  const location = useLocation((s) => s.location)
  const set = useLocation((s) => s.set)
  const [cep, setCep] = useState('')
  const [busy, setBusy] = useState<'cep' | 'gps' | null>(null)
  const [error, setError] = useState('')
  const [consent, setConsent] = useState(false)
  const close = () => { setOpen(false); setError(''); setConsent(false) }

  const submitCep = async (value: string) => {
    if (!isValidCEP(value)) { setError('Informe um CEP com 8 dígitos.'); return }
    setBusy('cep'); setError('')
    const res = await lookupCep(value)
    setBusy(null)
    if (!res) { setError('Não encontramos esse CEP. Confira os números e tente de novo.'); return }
    set({ city: res.city, uf: res.uf, cep: res.cep, source: 'cep' })
    useToast.getState().push(`Entrega para ${res.city} – ${res.uf}`)
    close()
  }

  const useGps = async () => {
    setBusy('gps'); setError('')
    try {
      const pos = await getBrowserPosition()
      const rev = await reverseGeocode(pos.lat, pos.lon) // coordenadas só trafegam aqui; nunca são guardadas
      if (!rev) throw new Error('nogeo')
      set({ city: rev.city, uf: rev.uf, cep: rev.cep, source: 'gps' })
      useToast.getState().push(`Entrega para ${rev.city} – ${rev.uf}`)
      close()
    } catch {
      setError('Não foi possível obter sua localização. Informe o CEP abaixo.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <Modal open={open} onClose={close} label="Alterar localização de entrega">
      <div className="flex items-start justify-between p-5 pb-0">
        <div>
          <h2 className="text-[22px] font-normal leading-tight text-brand">Para onde vamos entregar?</h2>
          <p className="t-mono mt-2">Usamos sua localização só para estimar prazo e frete.</p>
        </div>
        <CloseButton onClick={close} />
      </div>
      <div className="space-y-5 p-5">
        {location && <p className="text-[14px] font-normal text-brand"><PinIcon size={14} className="mr-1 inline" />Atual: {location.city} – {location.uf}{location.cep ? ` · ${location.cep}` : ''}</p>}
        <form onSubmit={(e) => { e.preventDefault(); void submitCep(cep) }}>
          <Field
            label="CEP"
            name="cep"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={9}
            value={cep}
            data-autofocus
            onChange={(e) => { const m = maskCEP(e.target.value); setCep(m); setError(''); if (m.length === 9) void submitCep(m) }}
            error={error && busy === null ? error : undefined}
            hint="Ex.: 80010-000"
            suffix={busy === 'cep' ? <span className="anim-pulse t-mono">buscando…</span> : undefined}
          />
          <Button type="submit" className="mt-3" full disabled={busy !== null}>Confirmar CEP</Button>
        </form>
        <div className="flex items-center gap-3"><span className="h-px flex-1 bg-hairline" /><span className="t-mono">ou</span><span className="h-px flex-1 bg-hairline" /></div>
        {!consent ? (
          <Button variant="outline" full onClick={() => setConsent(true)}>Usar minha localização exata</Button>
        ) : (
          <div className="border border-hairline bg-tint p-4">
            <p className="text-[13px] font-normal leading-snug text-brand">Vamos pedir permissão ao seu navegador. Guardamos apenas cidade, UF e CEP, nunca suas coordenadas (LGPD).</p>
            <div className="mt-3 flex gap-2">
              <Button onClick={useGps} disabled={busy !== null}>{busy === 'gps' ? 'Localizando…' : 'Concordo e usar'}</Button>
              <Button variant="outline" onClick={() => setConsent(false)}>Cancelar</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
