import type { Collection, ProductSummary } from '@/lib/commerce/types'

type Def = Collection & { match: (p: ProductSummary) => boolean }

const has = (arr: string[], v: string) => arr.includes(v)

export const COLLECTIONS: Def[] = [
  { slug: 'todos', title: 'Todos os produtos', subtitle: 'Nascida e feita na Grécia.', kind: 'especial', match: () => true },
  { slug: 'mais-vendidos', title: 'Mais vendidos', subtitle: 'Os queridinhos da Grécia.', kind: 'especial', match: (p) => p.bestSellerRank !== null },
  { slug: 'lancamentos', title: 'Lançamentos', subtitle: 'Novidades fresquinhas do laboratório.', kind: 'especial', match: (p) => has(p.badges, 'novo') },
  { slug: 'ofertas', title: 'Ofertas especiais', subtitle: 'Preços especiais por tempo limitado.', kind: 'especial', match: (p) => p.listPrice > p.price },
  { slug: 'minis-de-viagem', title: 'Minis de viagem', subtitle: 'Seus favoritos em tamanho para levar.', kind: 'especial', match: (p) => p.hasMini },

  { slug: 'rosto', title: 'Skincare', subtitle: 'Cuidados com o rosto, com ciência e natureza.', kind: 'categoria', match: (p) => p.group === 'rosto' },
  { slug: 'corpo', title: 'Corpo e banho', subtitle: 'Rituais de banho e hidratação.', kind: 'categoria', match: (p) => p.group === 'corpo' },
  { slug: 'fragrancias', title: 'Fragrâncias', subtitle: 'Deo colônias e perfumes de botica.', kind: 'categoria', match: (p) => p.group === 'fragrancias' },
  { slug: 'gifts', title: 'Gifts', subtitle: 'Presentes para quem você ama.', kind: 'categoria', match: (p) => p.group === 'gifts' },
  { slug: 'korres-for-men', title: 'Korres for Men', subtitle: 'O cuidado de Atenas para a pele masculina.', kind: 'categoria', match: (p) => p.group === 'men' },

  { slug: 'smart-yoghurt', title: 'Smart Yoghurt', subtitle: 'Iogurte grego e probióticos para uma pele equilibrada.', kind: 'linha', match: (p) => p.lineSlug === 'smart-yoghurt' },
  { slug: 'black-pine', title: 'Black Pine', subtitle: 'Efeito lifting com extrato de pinho negro.', kind: 'linha', match: (p) => p.lineSlug === 'black-pine' },
  { slug: 'black-pine-primus', title: 'Black Pine Primus', subtitle: 'Antirrugas com ácido hialurônico 6xHA.', kind: 'linha', match: (p) => p.lineSlug === 'black-pine-primus' },
  { slug: 'wild-rose', title: 'Wild Rose', subtitle: 'Vitamina C e iluminação para a pele.', kind: 'linha', match: (p) => p.lineSlug === 'wild-rose' },
  { slug: 'pure-greek-olive', title: 'Pure Greek Olive', subtitle: 'Azeite grego extravirgem para rosto, corpo e cabelo.', kind: 'linha', match: (p) => p.lineSlug === 'pure-greek-olive' || has(p.bodyLines, 'puregreekolive') },
  { slug: 'santorini-grape', title: 'Santorini Grape', subtitle: 'Uvas vulcânicas para renovar a pele.', kind: 'linha', match: (p) => p.lineSlug === 'santorini-grape' },
  { slug: 'olympus-tea', title: 'Olympus Tea', subtitle: 'Chá da montanha grega para uma pele detox.', kind: 'linha', match: (p) => p.lineSlug === 'olympus-tea' },

  { slug: 'rugas-elasticidade', title: 'Rugas e elasticidade', subtitle: 'Firmeza, viço e suavização de linhas.', kind: 'necessidade', match: (p) => has(p.needs, 'rugas-elasticidade') },
  { slug: 'antimanchas', title: 'Antimanchas', subtitle: 'Uniformidade e luminosidade.', kind: 'necessidade', match: (p) => has(p.needs, 'antimanchas') },
  { slug: 'antioleosidade', title: 'Antioleosidade', subtitle: 'Controle de brilho e poros.', kind: 'necessidade', match: (p) => has(p.needs, 'antioleosidade') },
  { slug: 'hidratacao', title: 'Hidratação', subtitle: 'Água, conforto e barreira protegida.', kind: 'necessidade', match: (p) => has(p.needs, 'hidratacao') },
  { slug: 'sensibilidade', title: 'Sensibilidade', subtitle: 'Alívio para peles sensíveis.', kind: 'necessidade', match: (p) => has(p.needs, 'sensibilidade') },

  { slug: 'limpador', title: 'Limpadores', subtitle: 'O primeiro passo da rotina.', kind: 'tipo', match: (p) => has(p.types, 'limpador') },
  { slug: 'serum-facial', title: 'Séruns faciais', subtitle: 'Concentrados de alta performance.', kind: 'tipo', match: (p) => has(p.types, 'serum-facial') },
  { slug: 'hidratante-facial', title: 'Hidratantes faciais', subtitle: 'Cremes e géis para o dia e a noite.', kind: 'tipo', match: (p) => has(p.types, 'hidratante-facial') },
  { slug: 'mascara-facial', title: 'Máscaras faciais', subtitle: 'Tratamento intensivo em minutos.', kind: 'tipo', match: (p) => has(p.types, 'mascara-facial') },
  { slug: 'mascara-esfoliante', title: 'Máscaras esfoliantes', subtitle: 'Renovação suave da pele.', kind: 'tipo', match: (p) => has(p.types, 'mascara-esfoliante') },
  { slug: 'face-oil', title: 'Face oil', subtitle: 'Óleos nutritivos para o rosto.', kind: 'tipo', match: (p) => has(p.types, 'face-oil') },
  { slug: 'hidratante-corporal', title: 'Hidratantes corporais', subtitle: 'Hidratação com perfume de botica.', kind: 'corpo', match: (p) => has(p.types, 'hidratante-corporal') },
  { slug: 'maos', title: 'Mãos', subtitle: 'Cremes para as mãos.', kind: 'corpo', match: (p) => has(p.types, 'maos') },
  { slug: 'oleo-corporal', title: 'Óleos corporais', subtitle: 'Óleos de banho e massagem.', kind: 'corpo', match: (p) => has(p.types, 'oleo-corporal') },
  { slug: 'sabonete-liquido', title: 'Sabonetes líquidos', subtitle: 'Banho perfumado.', kind: 'corpo', match: (p) => has(p.types, 'sabonete-liquido') },
  { slug: 'sabonete-em-barra', title: 'Sabonetes em barra', subtitle: 'Receitas tradicionais gregas.', kind: 'corpo', match: (p) => has(p.types, 'sabonete-em-barra') },

  { slug: 'frag-feminina', title: 'Fragrâncias femininas', subtitle: 'Deo colônias e perfumes.', kind: 'fragrancia', match: (p) => p.gender === 'feminina' },
  { slug: 'frag-masculina', title: 'Fragrâncias masculinas', subtitle: 'Deo colônias e perfumes.', kind: 'fragrancia', match: (p) => p.gender === 'masculina' },
  { slug: 'frag-unissex', title: 'Fragrâncias unissex', subtitle: 'Para todos os gêneros.', kind: 'fragrancia', match: (p) => p.gender === 'unissex' },
]

export const collectionMeta = ({ match: _m, ...c }: Def): Collection => c
