export type Region = 'sudeste-sul' | 'centro-oeste-nordeste' | 'norte'

export interface UF {
  uf: string
  name: string
  capital: string
  region: Region
}

export const UFS: readonly UF[] = [
  { uf: 'AC', name: 'Acre', capital: 'Rio Branco', region: 'norte' },
  { uf: 'AL', name: 'Alagoas', capital: 'Maceió', region: 'centro-oeste-nordeste' },
  { uf: 'AP', name: 'Amapá', capital: 'Macapá', region: 'norte' },
  { uf: 'AM', name: 'Amazonas', capital: 'Manaus', region: 'norte' },
  { uf: 'BA', name: 'Bahia', capital: 'Salvador', region: 'centro-oeste-nordeste' },
  { uf: 'CE', name: 'Ceará', capital: 'Fortaleza', region: 'centro-oeste-nordeste' },
  { uf: 'DF', name: 'Distrito Federal', capital: 'Brasília', region: 'centro-oeste-nordeste' },
  { uf: 'ES', name: 'Espírito Santo', capital: 'Vitória', region: 'sudeste-sul' },
  { uf: 'GO', name: 'Goiás', capital: 'Goiânia', region: 'centro-oeste-nordeste' },
  { uf: 'MA', name: 'Maranhão', capital: 'São Luís', region: 'centro-oeste-nordeste' },
  { uf: 'MT', name: 'Mato Grosso', capital: 'Cuiabá', region: 'centro-oeste-nordeste' },
  { uf: 'MS', name: 'Mato Grosso do Sul', capital: 'Campo Grande', region: 'centro-oeste-nordeste' },
  { uf: 'MG', name: 'Minas Gerais', capital: 'Belo Horizonte', region: 'sudeste-sul' },
  { uf: 'PA', name: 'Pará', capital: 'Belém', region: 'norte' },
  { uf: 'PB', name: 'Paraíba', capital: 'João Pessoa', region: 'centro-oeste-nordeste' },
  { uf: 'PR', name: 'Paraná', capital: 'Curitiba', region: 'sudeste-sul' },
  { uf: 'PE', name: 'Pernambuco', capital: 'Recife', region: 'centro-oeste-nordeste' },
  { uf: 'PI', name: 'Piauí', capital: 'Teresina', region: 'centro-oeste-nordeste' },
  { uf: 'RJ', name: 'Rio de Janeiro', capital: 'Rio de Janeiro', region: 'sudeste-sul' },
  { uf: 'RN', name: 'Rio Grande do Norte', capital: 'Natal', region: 'centro-oeste-nordeste' },
  { uf: 'RS', name: 'Rio Grande do Sul', capital: 'Porto Alegre', region: 'sudeste-sul' },
  { uf: 'RO', name: 'Rondônia', capital: 'Porto Velho', region: 'norte' },
  { uf: 'RR', name: 'Roraima', capital: 'Boa Vista', region: 'norte' },
  { uf: 'SC', name: 'Santa Catarina', capital: 'Florianópolis', region: 'sudeste-sul' },
  { uf: 'SP', name: 'São Paulo', capital: 'São Paulo', region: 'sudeste-sul' },
  { uf: 'SE', name: 'Sergipe', capital: 'Aracaju', region: 'centro-oeste-nordeste' },
  { uf: 'TO', name: 'Tocantins', capital: 'Palmas', region: 'norte' },
]

export const normalizeName = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()

export const findUF = (uf: string) => UFS.find((u) => u.uf === uf.toUpperCase())

export const ufFromName = (name: string) => {
  const n = normalizeName(name)
  return UFS.find((u) => normalizeName(u.name) === n || u.uf.toLowerCase() === n)?.uf
}

export const isCapital = (city: string, uf: string) => {
  const u = findUF(uf)
  return !!u && normalizeName(u.capital) === normalizeName(city)
}

/** Cidades oferecidas no modo demonstração. */
export const DEMO_CITIES = [
  { city: 'Curitiba', uf: 'PR', cep: '80010-000' },
  { city: 'São Paulo', uf: 'SP', cep: '01310-100' },
  { city: 'Recife', uf: 'PE', cep: '50010-000' },
  { city: 'Manaus', uf: 'AM', cep: '69005-010' },
] as const
