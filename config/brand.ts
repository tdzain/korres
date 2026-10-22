export const brand = {
  name: 'KORRES Brasil',
  shortName: 'KORRES',
  tagline: 'Grécia. Natureza. Ciência.',
  legalLine: 'KORRES Brasil · Ambiente de demonstração · nenhuma cobrança será feita',
  supportEmail: 'atendimento@shopkorres.com.br',
  currency: 'BRL',
  locale: 'pt-BR',
  instagram: 'https://www.instagram.com/korresbrasil/',
  /** Assinatura do projeto. */
  maker: { name: 'tdzain', tagline: 'Crafting. Building. Tailor-made.', url: 'https://tdzain.com' },
  /**
   * Concierge no WhatsApp. Defina NEXT_PUBLIC_WHATSAPP_NUMBER (DDI+DDD+número, só dígitos, ex.: 5541999990000).
   * Sem número, o botão abre o WhatsApp com a mensagem pronta para a pessoa escolher o contato (wa.me/?text=...).
   */
  whatsapp: { number: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '') },
} as const
