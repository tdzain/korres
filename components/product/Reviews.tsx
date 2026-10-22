import { Rating } from '@/components/ui/misc'
import { CheckIcon, StarIcon } from '@/components/ui/Icons'
import type { Product } from '@/lib/commerce/types'

// Avaliações ilustrativas (mock): o protótipo não consome o Stamped.io da loja atual.
const REVIEWS = [
  { n: 'Mariana S.', t: 'Textura incrível', b: 'Absorve rápido e deixa a pele macia e com viço. Já virou item fixo da minha rotina.', r: 5 },
  { n: 'Camila R.', t: 'Vale cada centavo', b: 'Notei diferença em poucas semanas. A embalagem é linda e o cheirinho é delicado.', r: 5 },
  { n: 'Beatriz L.', t: 'Muito bom', b: 'Gostei bastante do resultado. Só acho que poderia vir em tamanho maior.', r: 4 },
  { n: 'Rafael M.', t: 'Presente perfeito', b: 'Dei de presente e a pessoa amou. Chegou antes do prazo e bem embalado.', r: 5 },
  { n: 'Júlia P.', t: 'Pele equilibrada', b: 'Tenho pele sensível e não irritou. Recomendo para quem quer algo simples e eficiente.', r: 5 },
  { n: 'Ana C.', t: 'Cumpre o que promete', b: 'Hidratação na medida e nada pesado. Compro de novo com certeza.', r: 4 },
]
const DATES = ['há 3 dias', 'há 1 semana', 'há 2 semanas', 'há 1 mês', 'há 1 mês', 'há 2 meses']

export function Reviews({ product: p }: { product: Product }) {
  const start = Number(p.id) % REVIEWS.length
  const list = Array.from({ length: 4 }, (_, i) => ({ ...REVIEWS[(start + i) % REVIEWS.length]!, d: DATES[i]! }))
  const five = Math.round(70 + (p.rating - 4.6) * 40)
  const dist = [5, 4, 3, 2, 1].map((s) => (s === 5 ? five : s === 4 ? 100 - five - 3 : s === 3 ? 2 : s === 2 ? 1 : 0))
  return (
    <section id="avaliacoes" aria-labelledby="rev-title" className="grid border-b border-hairline lg:grid-cols-2">
      <div className="border-hairline px-4 py-10 lg:border-r lg:py-14">
        <h2 id="rev-title" className="t-section">Avaliações de clientes</h2>
        <p className="t-mono mt-3">Avaliações verificadas · exemplos ilustrativos da demonstração</p>
        <div className="mt-6 flex items-center gap-5">
          <p className="text-[56px] font-light leading-none text-brand">{p.rating.toFixed(1).replace('.', ',')}</p>
          <div><div className="flex text-brand">{Array.from({ length: 5 }, (_, i) => <StarIcon key={i} size={16} />)}</div><p className="t-mono mt-1">{p.reviewCount} avaliações</p></div>
        </div>
        <ul className="mt-6 space-y-2" aria-label="Distribuição das notas">
          {[5, 4, 3, 2, 1].map((s, i) => (
            <li key={s} className="flex items-center gap-3 font-mono text-[12.5px] text-brand"><span className="w-6">{s} ★</span><span className="h-[5px] flex-1 bg-[#e4e6f4]"><span className="block h-full bg-brand" style={{ width: `${dist[i]}%` }} /></span><span className="w-9 text-right text-muted">{dist[i]}%</span></li>
          ))}
        </ul>
      </div>
      <ul className="divide-y divide-hairline">
        {list.map((r) => (
          <li key={r.n} className="px-4 py-6">
            <div className="flex items-center justify-between"><Rating value={r.r} /><span className="t-mono">{r.d}</span></div>
            <p className="mt-2 text-[15px] font-medium text-brand">{r.t}</p>
            <p className="mt-1 text-[14px] font-normal leading-relaxed text-body">{r.b}</p>
            <p className="mt-3 flex items-center gap-2 font-mono text-[12px] text-muted">{r.n}<span className="inline-flex items-center gap-1 text-success"><CheckIcon size={12} /> Compra verificada</span></p>
          </li>
        ))}
      </ul>
    </section>
  )
}
