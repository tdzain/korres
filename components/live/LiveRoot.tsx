'use client'
import { AnimatePresence, m as motion } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { features } from '@/config/features'
import { getLive, pickLive } from '@/data/live'
import { CloseIcon, MuteIcon, PlayIcon, VolumeIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/cn'
import { useFocusTrap } from '@/lib/useFocusTrap'
import { usePrefs } from '@/lib/store/prefs'
import { useReady } from '@/lib/store/ready'
import { useDemo } from '@/lib/store/ui'
import { useLive } from '@/lib/store/live'
import { prefersReducedMotion } from '@/lib/hooks'
import { LiveOverlay } from './LiveOverlay'
import { LiveBadge, formatViewers } from './parts'

const EASE = [0.32, 0.72, 0, 1] as const
const CLOSED_KEY = 'kr_live_closed'
const LAST_KEY = 'kr_live_last'

const read = (k: string) => { try { return sessionStorage.getItem(k) } catch { return null } }
const write = (k: string, v: string | null) => { try { if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v) } catch { /* storage bloqueado */ } }

/**
 * Live commerce simulada. Um ÚNICO <video> vive aqui (montado na casca da loja): mini e ampliado são o mesmo nó,
 * só muda o retângulo. Assim abrir a sacola, o sheet de compra ou navegar entre PDPs nunca reinicia a transmissão.
 */
export function LiveRoot() {
  const pathname = usePathname()
  const ready = useReady((s) => s.ready)
  const cookies = usePrefs((s) => s.cookies)
  const demo = useDemo((s) => s.enabled)
  const { streamId, mode, muted, sheet } = useLive()
  const { setStream, setMode, setMuted, setSheet } = useLive.getState()
  const [started, setStarted] = useState(false)
  const [sec, setSec] = useState(0)
  const [blocked, setBlocked] = useState(false)
  const [vp, setVp] = useState({ w: 0, h: 0 })
  const [viewers, setViewers] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const secRef = useRef(-1)

  const onPdp = features.live && pathname.startsWith('/produto/')
  const live = getLive(streamId)

  // Sorteio no cliente, uma vez por carregamento. ?live=1|2|3 força e ?live=off desliga (demo).
  useEffect(() => {
    if (!features.live || !ready || streamId !== null) return
    const forced = new URLSearchParams(window.location.search).get('live')
    const pick = pickLive(read(LAST_KEY), forced)
    if (pick) write(LAST_KEY, pick.id)
    if (read(CLOSED_KEY) === '1') setMode('closed')
    setStream(pick ? pick.id : 'off')
  }, [ready, streamId, setStream, setMode])

  // Entra ~1,5 s depois da PDP estar pronta e da decisão de cookies, para não competir com o LCP nem cobrir o banner.
  useEffect(() => {
    if (!onPdp || !live || cookies === null || started) return
    const t = setTimeout(() => setStarted(true), 1500)
    return () => clearTimeout(t)
  }, [onPdp, live, cookies, started])

  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    on()
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])

  const visible = onPdp && started && !!live && vp.w > 0
  const playing = visible && mode !== 'closed'

  // Reprodução: pausa fechado ou com a aba oculta; o autoplay só funciona mudo.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = muted
    const sync = () => {
      if (!playing || document.hidden) { v.pause(); return }
      v.play().then(() => setBlocked(false), () => { v.muted = true; v.play().then(() => setBlocked(false), () => setBlocked(true)) })
    }
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [playing, muted, live?.id, visible])

  // Espectadores simulados: passeio aleatório curto em torno da base.
  useEffect(() => {
    if (!live) return
    setViewers(live.baseViewers)
    const id = setInterval(() => setViewers((n) => Math.max(live.baseViewers - 80, Math.min(live.baseViewers + 160, n + Math.round((Math.random() - 0.35) * 14)))), 3500)
    return () => clearInterval(id)
  }, [live])

  const minimize = useCallback(() => setMode('mini'), [setMode])
  const closeAll = useCallback(() => { setMode('closed'); write(CLOSED_KEY, '1') }, [setMode])
  const escape = useCallback(() => { if (useLive.getState().sheet) setSheet(null); else minimize() }, [setSheet, minimize])
  const expand = useCallback(() => { setMuted(false); setMode('full') }, [setMode, setMuted])
  const reopen = useCallback(() => { write(CLOSED_KEY, null); setMode('mini') }, [setMode])
  useFocusTrap(boxRef, visible && mode === 'full', escape)

  const rect = useMemo(() => {
    const { w, h } = vp
    if (mode === 'full') {
      if (w < 768) return { left: 0, top: 0, width: w, height: h }
      const height = Math.min(h * 0.92, 860)
      const width = Math.round((height * 9) / 16)
      return { left: Math.round((w - width) / 2), top: Math.round((h - height) / 2), width, height: Math.round(height) }
    }
    const width = w < 640 ? 108 : 152
    const height = Math.round((width * 16) / 9)
    // Acima da barra fixa da PDP no mobile; no modo demo, desvia do painel de demonstração.
    const bottom = (w < 1024 ? 92 : 24) + (demo && w < 1024 ? 44 : 0)
    const left = (w < 640 ? 12 : 20) + (demo && w >= 1024 ? 280 : 0)
    return { left, top: h - height - bottom, width, height }
  }, [vp, mode, demo])

  if (!visible || !live) return null
  const full = mode === 'full'
  const dur = prefersReducedMotion() ? 0 : 0.42
  const desktopBackdrop = full && vp.w >= 768

  return (
    <>
      <AnimatePresence>
        {desktopBackdrop && (
          <motion.div key="bd" className="fixed inset-0 z-[89] bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} onClick={minimize} aria-hidden />
        )}
      </AnimatePresence>

      {mode === 'closed' && (
        <motion.button type="button" onClick={reopen} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="fixed z-[74] flex min-h-11 items-center gap-2 border border-brand bg-white px-3 text-[12px] uppercase tracking-wide text-brand shadow-[0_6px_24px_rgb(6_16_150/0.2)]" style={{ left: rect.left, top: rect.top + rect.height - 44 }} data-testid="live-reopen">
          <span className="size-2 rounded-full bg-danger" aria-hidden /> Voltar para a live
        </motion.button>
      )}

      <motion.div
        ref={boxRef}
        role={full ? 'dialog' : 'region'}
        aria-modal={full || undefined}
        aria-label={`Live: ${live.title}`}
        className={cn('fixed overflow-hidden bg-black shadow-[0_10px_40px_rgb(6_16_150/0.35)]', full ? 'z-[90]' : 'z-[74]', mode === 'closed' && 'pointer-events-none')}
        initial={{ ...rect, opacity: 0, y: 12 }}
        animate={{ ...rect, opacity: mode === 'closed' ? 0 : 1, y: 0 }}
        transition={{ duration: dur, ease: EASE }}
        data-testid="live-player"
        data-mode={mode}
        data-stream={live.id}
      >
        <video
          ref={videoRef}
          src={live.src}
          poster={live.poster}
          className="absolute inset-0 h-full w-full object-cover"
          loop
          muted
          playsInline
          preload="metadata"
          aria-label={live.title}
          onTimeUpdate={(e) => {
            const s = Math.floor(e.currentTarget.currentTime)
            if (s !== secRef.current) { secRef.current = s; setSec(s) }
          }}
          data-testid="live-video"
        />

        {mode === 'mini' && (
          <>
            <button type="button" onClick={expand} aria-label={`Ampliar a live: ${live.title}`} className="absolute inset-0 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.35),transparent_35%,transparent_60%,rgb(0_0_0/0.55))]" data-testid="live-expand" />
            <div className="pointer-events-none absolute left-2 top-2"><LiveBadge /></div>
            <button type="button" onClick={closeAll} aria-label="Fechar a live" className="absolute right-0.5 top-0.5 grid size-9 place-items-center text-white" data-testid="live-close"><CloseIcon size={16} /></button>
            <span className="pointer-events-none absolute bottom-2 left-2 text-[11px] text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.6)]">{formatViewers(viewers)} assistindo</span>
            <button type="button" onClick={() => setMuted(!muted)} aria-label={muted ? 'Ativar o som' : 'Desativar o som'} className="absolute bottom-0.5 right-0.5 grid size-9 place-items-center text-white">{muted ? <MuteIcon size={17} /> : <VolumeIcon size={17} />}</button>
            {blocked && (
              <button type="button" onClick={() => videoRef.current?.play().then(() => setBlocked(false), () => {})} aria-label="Tocar a live" className="absolute inset-0 m-auto grid size-11 place-items-center rounded-full bg-white/90 text-brand"><PlayIcon size={18} /></button>
            )}
          </>
        )}

        <AnimatePresence>
          {full && (
            <motion.div key="ov" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.25, delay: dur * 0.6 } }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
              <LiveOverlay live={live} sec={sec} viewers={viewers} muted={muted} sheet={sheet} onMute={() => setMuted(!muted)} onMinimize={minimize} onClose={closeAll} onSheet={setSheet} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}

