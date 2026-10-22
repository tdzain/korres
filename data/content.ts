export interface Page { slug: string; title: string; lead: string; sections: { heading?: string; body: string[] }[] }

export const PAGES: Page[] = [
  {
    slug: 'sobre', title: 'Sobre a KORRES', lead: 'Nascemos e somos feitos na Grécia.',
    sections: [
      { heading: 'Uma farmácia homeopática em Atenas', body: ['A KORRES nasceu em 1996, quando George Korres, farmacêutico, transformou a mais antiga farmácia homeopática de Atenas em um laboratório de cosméticos inspirados na natureza grega.', 'Até hoje, cada fórmula une o conhecimento ancestral de ingredientes como o iogurte grego, o azeite extravirgem, o pinho negro e a uva de Santorini com pesquisa científica rigorosa.'] },
      { heading: 'Natureza e ciência', body: ['Priorizamos ingredientes de origem natural, fórmulas limpas e testes dermatológicos. Não testamos em animais e trabalhamos com fornecedores locais sempre que possível.'] },
      { heading: 'KORRES no Brasil', body: ['A KORRES Brasil leva a linha completa de skincare, corpo e banho, fragrâncias e Korres for Men para todo o país, com entrega calculada para a sua cidade.'] },
    ],
  },
  {
    slug: 'envio-e-entregas', title: 'Envio e entregas', lead: 'Prazo e frete calculados para a sua cidade.',
    sections: [
      { heading: 'Como calculamos', body: ['Detectamos sua cidade para estimar prazo e frete já na página do produto. Para confirmar, informe seu CEP no checkout: o valor e as datas são recalculados na hora.', 'Os prazos contam em dias úteis a partir da expedição. Pedidos aprovados até as 14h (horário de Brasília) em dia útil saem no mesmo dia.'] },
      { heading: 'Modalidades', body: ['Econômica: entrega padrão. Frete grátis em compras acima de R$ 299.', 'Expressa: prioridade na expedição e no transporte.', 'Retirada: retire no nosso centro de distribuição em São Paulo – SP.'] },
      { heading: 'Prazos de referência (a partir de São Paulo)', body: ['Mesmo estado: Econômica 2 a 3 dias úteis, Expressa 1 dia útil.', 'Sudeste e Sul: Econômica 3 a 5 dias úteis, Expressa 2 dias úteis.', 'Centro-Oeste e Nordeste: Econômica 5 a 8 dias úteis, Expressa 3 a 4 dias úteis.', 'Norte: Econômica 7 a 12 dias úteis, Expressa 5 a 6 dias úteis.', 'Cidades do interior podem somar de 1 a 2 dias úteis.'] },
    ],
  },
  {
    slug: 'trocas-e-devolucoes', title: 'Trocas e devoluções', lead: 'Você tem 30 dias para mudar de ideia.',
    sections: [
      { body: ['Se o produto não for o que você esperava, solicite a troca ou a devolução em até 30 dias corridos após o recebimento, com o produto lacrado e na embalagem original.', 'Em caso de defeito ou avaria no transporte, entre em contato em até 7 dias e enviamos um novo produto sem custo.', 'O reembolso é feito na mesma forma de pagamento: Pix em até 2 dias úteis; cartão conforme a fatura da operadora.'] },
    ],
  },
  {
    slug: 'pagamentos', title: 'Formas de pagamento', lead: 'Pix, cartão e boleto.',
    sections: [
      { body: ['Pix: 5% de desconto e aprovação imediata.', 'Cartão de crédito: até 6x sem juros, com parcela mínima de R$ 35.', 'Boleto bancário: vence em 3 dias e é aprovado em até 2 dias úteis.', 'Este protótipo é um ambiente de demonstração: nenhuma cobrança real é feita.'] },
    ],
  },
  {
    slug: 'faq', title: 'Perguntas frequentes', lead: 'Respostas rápidas para as dúvidas mais comuns.',
    sections: [
      { heading: 'Como sei se o frete é grátis?', body: ['Compras acima de R$ 299 têm frete grátis na modalidade Econômica. A barra da sacola mostra quanto falta.'] },
      { heading: 'Os produtos são veganos?', body: ['Muitas fórmulas são veganas; a indicação está na descrição de cada produto. Nenhum produto KORRES é testado em animais.'] },
      { heading: 'Como uso o cupom de primeira compra?', body: ['Cadastre-se na newsletter, receba o cupom BEMVINDO15 e aplique no resumo do pedido, no checkout.'] },
      { heading: 'Posso alterar o endereço depois de comprar?', body: ['Sim, desde que o pedido ainda não tenha sido expedido. Fale com o atendimento o quanto antes.'] },
    ],
  },
  {
    slug: 'contato', title: 'Fale conosco', lead: 'Estamos aqui para ajudar.',
    sections: [
      { body: ['Atendimento: atendimento@shopkorres.com.br', 'Horário: segunda a sexta, das 9h às 18h (horário de Brasília).'] },
    ],
  },
  {
    slug: 'politica-de-privacidade', title: 'Política de privacidade', lead: 'Como tratamos seus dados, em conformidade com a LGPD.',
    sections: [
      { heading: 'Dados que coletamos', body: ['Nome, contato, endereço de entrega e dados de pedido, apenas para processar compras e prestar atendimento.', 'Localização: usamos a cidade aproximada pelo seu IP para estimar prazo e frete. Se você optar por usar a localização exata do navegador, guardamos somente cidade, UF e CEP, nunca as coordenadas.'] },
      { heading: 'Cookies', body: ['Usamos cookies essenciais (sacola e sessão) e, mediante consentimento, cookies de análise. Você pode alterar sua escolha a qualquer momento.'] },
      { heading: 'Seus direitos', body: ['Você pode solicitar acesso, correção ou exclusão dos seus dados pelo e-mail do atendimento.'] },
    ],
  },
  {
    slug: 'termos-de-uso', title: 'Termos de uso', lead: 'Regras gerais de uso da loja.',
    sections: [{ body: ['Ao navegar e comprar na KORRES Brasil, você concorda com estes termos. Preços e disponibilidade podem mudar sem aviso prévio. Este é um protótipo de demonstração e não representa uma oferta comercial.'] }],
  },
]
