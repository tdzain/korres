// Dados aleatórios (porém válidos) para preencher o checkout na demonstração. Nada aqui identifica pessoas reais.
const FIRST = ['Maria', 'João', 'Ana', 'Pedro', 'Camila', 'Rafael', 'Beatriz', 'Lucas', 'Juliana', 'Gabriel', 'Larissa', 'Felipe', 'Aline', 'Bruno']
const LAST = ['Silva', 'Souza', 'Oliveira', 'Santos', 'Lima', 'Pereira', 'Costa', 'Ribeiro', 'Almeida', 'Carvalho', 'Gomes', 'Martins']

/** CEPs reais de logradouros conhecidos (o ViaCEP responde com endereço completo). */
export const DEMO_ADDRESSES = [
  { cep: '80010-000', ddd: '41', street: 'Rua José Loureiro', neighborhood: 'Centro', city: 'Curitiba', uf: 'PR' },
  { cep: '01310-100', ddd: '11', street: 'Avenida Paulista', neighborhood: 'Bela Vista', city: 'São Paulo', uf: 'SP' },
  { cep: '20040-020', ddd: '21', street: 'Rua da Assembleia', neighborhood: 'Centro', city: 'Rio de Janeiro', uf: 'RJ' },
  { cep: '30130-010', ddd: '31', street: 'Avenida Afonso Pena', neighborhood: 'Centro', city: 'Belo Horizonte', uf: 'MG' },
  { cep: '90010-150', ddd: '51', street: 'Rua dos Andradas', neighborhood: 'Centro Histórico', city: 'Porto Alegre', uf: 'RS' },
  { cep: '50010-000', ddd: '81', street: 'Rua do Imperador Dom Pedro II', neighborhood: 'Santo Antônio', city: 'Recife', uf: 'PE' },
  { cep: '40020-000', ddd: '71', street: 'Rua Chile', neighborhood: 'Centro', city: 'Salvador', uf: 'BA' },
  { cep: '69005-010', ddd: '92', street: 'Rua Marcílio Dias', neighborhood: 'Centro', city: 'Manaus', uf: 'AM' },
] as const

const pick = <T,>(arr: readonly T[], rnd: () => number) => arr[Math.floor(rnd() * arr.length)]!
const digit = (rnd: () => number) => Math.floor(rnd() * 10)

/** Gera um CPF com dígitos verificadores corretos. */
export function randomCPF(rnd: () => number = Math.random): string {
  const d = Array.from({ length: 9 }, () => digit(rnd))
  if (d.every((x) => x === d[0])) d[8] = (d[8]! + 1) % 10
  const dv = (arr: number[]) => {
    const sum = arr.reduce((s, n, i) => s + n * (arr.length + 1 - i), 0)
    const r = (sum * 10) % 11
    return r === 10 ? 0 : r
  }
  const d1 = dv(d)
  const d2 = dv([...d, d1])
  return [...d, d1, d2].join('')
}

/** Cartões de teste públicos (Luhn válido). */
export const TEST_CARDS = [
  { number: '4242 4242 4242 4242', brand: 'Visa' },
  { number: '5555 5555 5555 4444', brand: 'Mastercard' },
  { number: '4000 0566 5566 5556', brand: 'Visa' },
  { number: '5200 8282 8282 8210', brand: 'Mastercard' },
]

export interface RandomCard { number: string; name: string; expiry: string; cvv: string }

export function randomCard(name: string, rnd: () => number = Math.random, not?: string): RandomCard {
  const c = pick(TEST_CARDS.filter((x) => x.number !== not), rnd)
  return { number: c.number, name: name.toUpperCase(), expiry: `${String(1 + Math.floor(rnd() * 12)).padStart(2, '0')}/${30 + Math.floor(rnd() * 4)}`, cvv: String(100 + Math.floor(rnd() * 900)) }
}

export interface RandomCustomer {
  firstName: string
  lastName: string
  email: string
  phone: string
  cpf: string
  cep: string
  address: (typeof DEMO_ADDRESSES)[number]
  number: string
  complement: string
  reference: string
  cardA: RandomCard
  cardB: RandomCard
}

export function randomCustomer(rnd: () => number = Math.random): RandomCustomer {
  const firstName = pick(FIRST, rnd)
  const lastName = pick(LAST, rnd)
  const addr = pick(DEMO_ADDRESSES, rnd)
  const clean = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const full = `${firstName} ${lastName}`
  const cardA = randomCard(full, rnd)
  const tail = `9${Array.from({ length: 8 }, () => digit(rnd)).join('')}`
  return {
    firstName,
    lastName,
    email: `${clean(firstName)}.${clean(lastName)}${Math.floor(rnd() * 90 + 10)}@example.com`,
    phone: `${addr.ddd}${tail}`,
    cpf: randomCPF(rnd),
    cep: addr.cep,
    address: addr,
    number: String(Math.floor(rnd() * 900) + 10),
    complement: rnd() > 0.5 ? `Apto ${Math.floor(rnd() * 200) + 1}` : '',
    reference: rnd() > 0.6 ? 'Portaria 24h' : '',
    cardA,
    cardB: randomCard(`${firstName} ${pick(LAST, rnd)}`, rnd, cardA.number), // o 2º cartão nunca repete o 1º
  }
}
