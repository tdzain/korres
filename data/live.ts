// Roteiro das lives simuladas (Black Friday). Edite aqui sem mexer em componentes.
// Os 3 vídeos são de "como usar". O mapeamento cena → produto foi INFERIDO assistindo aos quadros
// (rolo de olhos, creme de limpeza, sérum conta-gotas, pote de gel creme) e deve ser validado pelo time de marca.
export interface LiveScene { at: number; slugs: string[]; caption: string }
export interface LiveChatMessage { at: number; user: string; text: string; fromBrand?: boolean }
export interface LiveStream {
  id: 'live-1' | 'live-2' | 'live-3'
  src: string
  poster: string
  title: string
  host: { name: string; role: string; initials: string }
  baseViewers: number
  duration: number
  scenes: LiveScene[]
  chat: LiveChatMessage[]
}

export const LIVE_IDS = ['live-1', 'live-2', 'live-3'] as const

const EYES = 'greek-yoghurt-serum-gel-anti-fadiga-para-olhos'
const CLEANSER = 'greek-yoghurt-foaming-cream-cleanser'
const GEL_CREAM = 'smart-yoghurt-probiotic-gel-cream'
const SUPER_SERUM = 'smart-yoghurt-probiotic-super-serum'

export const LIVES: LiveStream[] = [
  {
    id: 'live-1',
    src: '/video/live/live-1.mp4',
    poster: '/video/live/poster-1.jpg',
    title: 'Olhar descansado em 1 minuto',
    host: { name: 'Marina', role: 'Especialista KORRES', initials: 'MA' },
    baseViewers: 1240,
    duration: 88,
    scenes: [
      { at: 0, slugs: [EYES], caption: 'Sérum Gel Anti-fadiga para Olhos' },
      { at: 56, slugs: [EYES, GEL_CREAM], caption: 'Finalize com o Gel Creme' },
    ],
    chat: [
      { at: 3, user: 'carol.s', text: 'Boa noite! Já tô aqui 💙' },
      { at: 11, user: 'bia_m', text: 'Serve pra olheira?' },
      { at: 15, user: 'KORRES Brasil', text: 'Serve! Ele refresca e descansa o contorno dos olhos.', fromBrand: true },
      { at: 27, user: 'lu.araujo', text: 'O rolinho gela? Amei' },
      { at: 38, user: 'tati_r', text: 'Posso usar de manhã e à noite?' },
      { at: 42, user: 'KORRES Brasil', text: 'Pode sim, 2x ao dia, em batidinhas leves.', fromBrand: true },
      { at: 60, user: 'fer.lima', text: 'Quero! Tem condição de Black Friday?' },
      { at: 64, user: 'KORRES Brasil', text: 'Tem! Quem compra na live leva frete grátis a partir de R$ 299.', fromBrand: true },
      { at: 78, user: 'dani.costa', text: 'Acabei de adicionar na sacola 🛍️' },
    ],
  },
  {
    id: 'live-2',
    src: '/video/live/live-2.mp4',
    poster: '/video/live/poster-2.jpg',
    title: 'Skincare com KORRES: do básico ao completo',
    host: { name: 'Ana Clara', role: 'Embaixadora', initials: 'AC' },
    baseViewers: 2180,
    duration: 59,
    scenes: [
      { at: 0, slugs: [CLEANSER], caption: 'Limpeza: Foaming Cream Cleanser' },
      { at: 30, slugs: [GEL_CREAM], caption: 'Hidratação: Gel Creme Probiótico' },
      { at: 46, slugs: [SUPER_SERUM, CLEANSER], caption: 'Sérum para finalizar' },
    ],
    chat: [
      { at: 2, user: 'jess.nunes', text: 'Oi gente! Começou agora?' },
      { at: 9, user: 'paula_v', text: 'Qual a ordem certa? Sempre me confundo' },
      { at: 13, user: 'KORRES Brasil', text: 'Limpeza, sérum e hidratante, nessa ordem 💙', fromBrand: true },
      { at: 22, user: 'rafa.b', text: 'Serve pra pele sensível?' },
      { at: 25, user: 'KORRES Brasil', text: 'Sim! A linha com iogurte grego é suave para peles sensíveis.', fromBrand: true },
      { at: 34, user: 'mel.oliveira', text: 'Esse potinho é lindo demais' },
      { at: 41, user: 'clau_s', text: 'Cupom da live? 👀' },
      { at: 48, user: 'KORRES Brasil', text: 'Use KORRES10 no checkout!', fromBrand: true },
    ],
  },
  {
    id: 'live-3',
    src: '/video/live/live-3.mp4',
    poster: '/video/live/poster-3.jpg',
    title: 'Ritual de rosto com iogurte grego',
    host: { name: 'Helena', role: 'Consultora de beleza', initials: 'HE' },
    baseViewers: 960,
    duration: 59,
    scenes: [
      { at: 0, slugs: [CLEANSER, SUPER_SERUM, GEL_CREAM], caption: 'O trio do ritual' },
      { at: 14, slugs: [SUPER_SERUM], caption: 'Sérum Probiótico' },
      { at: 24, slugs: [EYES], caption: 'Contorno dos olhos' },
      { at: 38, slugs: [GEL_CREAM], caption: 'Gel Creme Probiótico' },
    ],
    chat: [
      { at: 4, user: 'nat.freitas', text: 'Que luz linda nesse vídeo ✨' },
      { at: 12, user: 'gabi_c', text: 'Quantas gotinhas do sérum?' },
      { at: 17, user: 'KORRES Brasil', text: '2 a 3 gotas, é o suficiente.', fromBrand: true },
      { at: 27, user: 'isa.p', text: 'Esse rolinho é o mesmo do cartaz?' },
      { at: 36, user: 'vivi_s', text: 'Meu carrinho já tá cheio kkk' },
      { at: 44, user: 'KORRES Brasil', text: 'Aproveita: frete grátis a partir de R$ 299 💙', fromBrand: true },
      { at: 52, user: 'lari.m', text: 'Amei, comprando agora!' },
    ],
  },
]

export const getLive = (id: string | null | undefined) => LIVES.find((l) => l.id === id) ?? null
export const sceneAt = (live: LiveStream, sec: number) => {
  let idx = 0
  live.scenes.forEach((s, i) => { if (s.at <= sec) idx = i })
  return { index: idx, scene: live.scenes[idx]! }
}

/** Sorteia uma live diferente da anterior; `rnd` injetável para testes. */
export function pickLive(previous: string | null, forced: string | null, rnd: () => number = Math.random): LiveStream | null {
  if (forced === 'off') return null
  const f = getLive(forced ? `live-${forced}` : null) ?? getLive(forced)
  if (f) return f
  const pool = LIVES.filter((l) => l.id !== previous)
  return pool[Math.floor(rnd() * pool.length)]!
}

/** Black Friday 2026: 27/11 às 00h (BRT). */
export const BLACK_FRIDAY = Date.UTC(2026, 10, 27, 3, 0, 0)
