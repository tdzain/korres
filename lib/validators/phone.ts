import { onlyDigits } from './cpf'

/** Celular brasileiro: DDD + 9 + 8 dígitos. */
export const isValidPhone = (s: string) => /^[1-9]{2}9\d{8}$/.test(onlyDigits(s))

export function maskPhone(s: string): string {
  const d = onlyDigits(s).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
