export interface NavLink { label: string; href: string }

const c = (slug: string) => `/colecao/${slug}/`

export const NAV: (NavLink & { mega?: boolean; seasonal?: boolean })[] = [
  { label: 'Comprar', href: c('todos'), mega: true },
  { label: 'Skincare', href: c('rosto') },
  { label: 'Corpo e banho', href: c('corpo') },
  { label: 'Fragrâncias', href: c('fragrancias') },
  { label: 'Gifts', href: c('gifts') },
  { label: 'Korres for Men', href: c('korres-for-men') },
]

export const SEASONAL: NavLink = { label: 'Ofertas especiais', href: c('ofertas') }

export const MEGA: { title: string; links: NavLink[] }[] = [
  {
    title: 'Destaques',
    links: [
      { label: 'Mais vendidos', href: c('mais-vendidos') },
      { label: 'Lançamentos', href: c('lancamentos') },
      { label: 'Minis de viagem', href: c('minis-de-viagem') },
      { label: 'Ofertas especiais', href: c('ofertas') },
      { label: 'Gifts e presentes', href: c('gifts') },
      { label: 'Ver tudo', href: c('todos') },
    ],
  },
  {
    title: 'Por categoria',
    links: [
      { label: 'Skincare', href: c('rosto') },
      { label: 'Corpo e banho', href: c('corpo') },
      { label: 'Fragrâncias', href: c('fragrancias') },
      { label: 'Korres for Men', href: c('korres-for-men') },
      { label: 'Séruns faciais', href: c('serum-facial') },
      { label: 'Hidratantes faciais', href: c('hidratante-facial') },
      { label: 'Limpadores', href: c('limpador') },
      { label: 'Sabonetes em barra', href: c('sabonete-em-barra') },
    ],
  },
  {
    title: 'Por ingrediente',
    links: [
      { label: 'Iogurte grego · Smart Yoghurt', href: c('smart-yoghurt') },
      { label: 'Pinho negro · Black Pine', href: c('black-pine') },
      { label: 'Ácido hialurônico · Black Pine Primus', href: c('black-pine-primus') },
      { label: 'Azeite grego · Pure Greek Olive', href: c('pure-greek-olive') },
      { label: 'Rosa selvagem · Wild Rose', href: c('wild-rose') },
      { label: 'Uva vulcânica · Santorini Grape', href: c('santorini-grape') },
      { label: 'Chá do Olimpo · Olympus Tea', href: c('olympus-tea') },
    ],
  },
  {
    title: 'Por necessidade da pele',
    links: [
      { label: 'Rugas e elasticidade', href: c('rugas-elasticidade') },
      { label: 'Antimanchas', href: c('antimanchas') },
      { label: 'Antioleosidade', href: c('antioleosidade') },
      { label: 'Hidratação', href: c('hidratacao') },
      { label: 'Sensibilidade', href: c('sensibilidade') },
    ],
  },
]

export const FOOTER: { title: string; links: NavLink[] }[] = [
  {
    title: 'Ajuda e informações',
    links: [
      { label: 'Perguntas frequentes', href: '/p/faq/' },
      { label: 'Envio e entregas', href: '/p/envio-e-entregas/' },
      { label: 'Trocas e devoluções', href: '/p/trocas-e-devolucoes/' },
      { label: 'Formas de pagamento', href: '/p/pagamentos/' },
      { label: 'Fale conosco', href: '/p/contato/' },
    ],
  },
  {
    title: 'Termos e condições',
    links: [
      { label: 'Política de privacidade', href: '/p/politica-de-privacidade/' },
      { label: 'Termos de uso', href: '/p/termos-de-uso/' },
      { label: 'Política de cookies', href: '/p/politica-de-privacidade/' },
    ],
  },
  {
    title: 'Navegue',
    links: [
      { label: 'Ver tudo', href: c('todos') },
      { label: 'Mais vendidos', href: c('mais-vendidos') },
      { label: 'Skincare', href: c('rosto') },
      { label: 'Corpo e banho', href: c('corpo') },
      { label: 'Fragrâncias', href: c('fragrancias') },
      { label: 'Sobre a KORRES', href: '/p/sobre/' },
    ],
  },
  {
    title: 'Conecte-se',
    links: [
      { label: 'Instagram', href: 'https://www.instagram.com/korresbrasil/' },
      { label: 'Minha conta', href: '/conta/' },
      { label: 'Favoritos', href: '/favoritos/' },
    ],
  },
]

export const POPULAR_SEARCHES = ['Smart Yoghurt', 'Black Pine', 'Sérum', 'Deo colônia', 'Sabonete em barra', 'Pure Greek Olive', 'Antirrugas']
