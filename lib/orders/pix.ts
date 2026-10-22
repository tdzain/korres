/** BR Code (Pix copia e cola) estático. A chave é fictícia (domínio .invalid): nenhum pagamento real é possível. */
const tlv = (id: string, value: string) => `${id}${String(value.length).padStart(2, '0')}${value}`

export function crc16(payload: string): string {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let b = 0; b < 8; b++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

export interface PixPayloadInput {
  amount: number
  txid: string
  merchant?: string
  city?: string
  key?: string
}

export function buildPixPayload({ amount, txid, merchant = 'KORRES BRASIL DEMO', city = 'SAO PAULO', key = 'demo@korres.invalid' }: PixPayloadInput): string {
  const body =
    tlv('00', '01') +
    tlv('01', '11') +
    tlv('26', tlv('00', 'br.gov.bcb.pix') + tlv('01', key)) +
    tlv('52', '0000') +
    tlv('53', '986') +
    tlv('54', amount.toFixed(2)) +
    tlv('58', 'BR') +
    tlv('59', merchant.slice(0, 25)) +
    tlv('60', city.slice(0, 15)) +
    tlv('62', tlv('05', txid.replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***')) +
    '6304'
  return body + crc16(body)
}

/** Linha digitável fictícia (47 dígitos) formatada como boleto. */
export function mockBoletoLine(seed: string, amount: number): string {
  let h = 7
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const digits = (n: number) => Array.from({ length: n }, (_, i) => String(((h >>> (i % 24)) + i * 7) % 10)).join('').slice(0, n)
  const value = String(Math.round(amount * 100)).padStart(10, '0')
  const a = '23793' + digits(5), b = digits(5) + digits(6), c = digits(5) + digits(6)
  return `${a.slice(0, 5)}.${a.slice(5)} ${b.slice(0, 5)}.${b.slice(5)} ${c.slice(0, 5)}.${c.slice(5)} 1 ${'8434'}${value}`
}
