const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatBRL = (value: number) => brl.format(value)

/** Arredonda para centavos evitando erros de ponto flutuante. */
export const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

export const discountPercent = (listPrice: number, price: number) =>
  listPrice > price ? Math.round(((listPrice - price) / listPrice) * 100) : 0
