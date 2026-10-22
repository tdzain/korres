'use client'
import { AnimatePresence, m as motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { MaskLines } from '@/components/ui/Reveal'
import { cn } from '@/lib/cn'

const SLIDES = [
  { id: 'black-pine', lines: ['Black Pine', 'Primus'], text: 'Rugas suavizadas. Firmeza que se vê.', fine: 'Ácido hialurônico 6xHA e extrato de pinho negro.', href: '/colecao/black-pine-primus/', img: '/editorial/hero-black-pine.webp', pos: 'center', alt: 'Creme Black Pine Primus Youth Renewal Sleeping Facial aberto' },
  { id: 'yoghurt', lines: ['Smart', 'Yoghurt'], text: 'Combate os 9 sinais da sensibilidade.', fine: 'Iogurte grego real e tecnologia probiótica inteligente.', href: '/colecao/smart-yoghurt/', img: '/editorial/hero-smart-yoghurt.webp', pos: 'top', alt: 'Campanha Smart Yoghurt' },
  { id: 'frag', lines: ['Fragrâncias', 'de botica'], text: 'Deo colônias com até 88% de origem natural.', fine: 'Veganas, livres de ftalatos e almíscares nitrados.', href: '/colecao/fragrancias/', img: '/editorial/hero-fragrancias.webp', pos: 'center', alt: 'Deo colônia Kyma' },
] as const

/** Hero dividido 50/50: texto à esquerda (acento manuscrito + mono + botão outline) e imagem full-bleed à direita. */
export function Hero() {
  const [i, setI] = useState(0)
  const changed = useRef(false)
  const [paused, setPaused] = useState(false)
  const first = i === 0 && !changed.current
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => { changed.current = true; setI((n) => (n + 1) % SLIDES.length) }, 7000)
    return () => clearInterval(id)
  }, [paused])
  const s = SLIDES[i]!
  return (
    <section aria-roledescription="carrossel" aria-label="Destaques" className="grid border-b border-hairline lg:min-h-[calc(100dvh-70px)] lg:grid-cols-2" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} data-testid="hero">
      <div className="relative flex flex-col items-center justify-center px-6 py-12 text-center lg:border-r lg:border-hairline lg:py-0">
        <AnimatePresence mode="wait">
          <motion.div key={s.id} exit={{ opacity: 0, transition: { duration: 0.25 } }} className="flex flex-col items-center" aria-live="polite">
            <MaskLines lineClassName="font-hand text-[84px] leading-[0.82] text-brand sm:text-[110px] lg:text-[132px]" lines={[...s.lines]} />
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="mt-6 max-w-[460px] font-mono text-[18px] font-normal leading-snug tracking-wide text-brand md:text-[22px]">{s.text}</motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.7 }} className="mt-5 max-w-[400px] text-[12px] font-light leading-snug text-muted">{s.fine}</motion.p>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="mt-8 w-[267px] max-w-full">
              <Button href={s.href} variant="outline" size="lg" arrow full>Comprar agora</Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-6 left-4 flex gap-2" role="tablist" aria-label="Selecionar destaque">
          {SLIDES.map((d, n) => (
            <button key={d.id} type="button" role="tab" aria-selected={n === i} aria-label={`Destaque ${n + 1}`} onClick={() => { changed.current = true; setI(n) }} className="grid size-6 place-items-center">
              <span className={cn('block h-[5px] transition-all duration-500 ease-[var(--ease-out)]', n === i ? 'w-8 bg-brand' : 'w-[5px] bg-[#cfd1e6]')} />
            </button>
          ))}
        </div>
      </div>
      <div className="relative aspect-[4/5] overflow-hidden bg-surface lg:aspect-auto">
        {/* 1º slide: visível já no HTML (zoom-out em CSS); demais: crossfade com Motion. Assim o LCP não espera o JS. */}
        <AnimatePresence mode="sync" initial={false}>
          <motion.img
            key={s.id}
            src={s.img}
            srcSet={`${s.img.replace('.webp', '-640.webp')} 640w, ${s.img} 1100w`}
            sizes="(min-width:1024px) 50vw, 100vw"
            alt={s.alt}
            width={1100}
            height={1100}
            fetchPriority={first ? 'high' : undefined}
            initial={first ? false : { opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute inset-0 h-full w-full object-cover ${first ? 'hero-zoom' : ''}`}
            style={{ objectPosition: s.pos }}
          />
        </AnimatePresence>
      </div>
    </section>
  )
}
