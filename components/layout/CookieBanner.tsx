'use client'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { useState } from 'react'
import { usePrefs } from '@/lib/store/prefs'
import { useReady } from '@/lib/store/ready'
import { Checkbox } from '@/components/ui/Field'

const btn = 'min-h-[42px] flex-1 border-t border-hairline text-[14px] font-normal uppercase tracking-[0.3px] text-brand transition-colors hover:bg-tint'

/** Cookie banner inferior à direita com ACEITAR / RECUSAR / PREFERÊNCIAS. */
export function CookieBanner() {
  const ready = useReady((s) => s.ready)
  const cookies = usePrefs((s) => s.cookies)
  const set = usePrefs((s) => s.setCookies)
  const [prefs, setPrefs] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const show = ready && cookies === null
  return (
    <AnimatePresence>
      {show && (
        <motion.div role="dialog" aria-label="Preferências de cookies" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ duration: 0.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }} className="fixed bottom-0 right-0 z-[70] w-full border-l border-t border-hairline bg-white md:w-1/2" data-testid="cookie-banner">
          <div className="p-4 text-[14px] font-normal leading-relaxed text-brand md:px-4">
            {!prefs ? (
              <>
                <p>Usamos cookies para melhorar sua experiência, personalizar conteúdo e analisar o tráfego do site. Você pode aceitar todos, recusar os não essenciais ou gerenciar suas preferências.</p>
                <p className="mt-3"><Link href="/p/politica-de-privacidade/" className="link-static-underline">Leia nossa política de privacidade</Link> para saber mais.</p>
              </>
            ) : (
              <div className="space-y-3">
                <Checkbox label="Essenciais (sempre ativos): sacola, sessão e segurança" checked disabled readOnly />
                <Checkbox label="Análise e desempenho: nos ajudam a melhorar a loja" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row">
            {!prefs ? (
              <>
                <button type="button" className={btn} onClick={() => set('all')}>Aceitar</button>
                <button type="button" className={`${btn} sm:border-l`} onClick={() => set('essential')}>Recusar</button>
                <button type="button" className={`${btn} sm:border-l`} onClick={() => setPrefs(true)}>Preferências</button>
              </>
            ) : (
              <button type="button" className={btn} onClick={() => set(analytics ? 'all' : 'essential')}>Salvar preferências</button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
