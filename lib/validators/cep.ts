import { onlyDigits } from './cpf'

export const isValidCEP = (s: string) => /^\d{8}$/.test(onlyDigits(s))

export function maskCEP(s: string): string {
  const d = onlyDigits(s).slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}
