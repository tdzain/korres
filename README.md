# KORRES Brasil — protótipo de e-commerce

Protótipo navegável da loja KORRES Brasil com o **design system do korres.com** aplicado ao catálogo, idioma e realidade do Brasil (conteúdo extraído de shopkorres.com.br). Tudo é simulado: nenhuma cobrança, nenhum backend de terceiros.

**Ao vivo:** https://korres-brasil.pages.dev (Cloudflare Pages) · modo demonstração: https://korres-brasil.pages.dev/?demo=1

## O que tem

- **Home, PLP, PDP, drawer da sacola, checkout em uma página e confirmação** (Pix com QR/copia e cola, cartão com parcelas, boleto).
- **PDP com entrega inteligente** (estilo Mercado Livre): prazo e frete da cidade detectada, sem pedir CEP, com contagem regressiva até o corte das 14h.
- **Geolocalização em cascata:** escolha salva → borda do Cloudflare (`request.cf`) → ipwho.is → São Paulo; opcionalmente GPS (com consentimento, nunca persiste coordenadas) e CEP (ViaCEP/BrasilAPI).
- **Busca, favoritos, conta simulada, institucionais e 404 de marca.** Programa de pontos atrás de flag desligada.
- **Microanimações e transições de tela** (Motion + View Transitions API + CSS, curva estilo iOS) que respeitam `prefers-reduced-motion`.
- **Mobile alinhado às diretrizes da Apple (HIG):** alvos de toque ≥ 44 pt, campos de 16 px (sem zoom do iOS), áreas seguras do iPhone, folhas inferiores com arraste para fechar e swipe nos drawers.
- **Quantidade junto ao "Adicionar"** nos cards, no drawer da sacola e na barra fixa da PDP.

## Como rodar

```bash
npm install
npm run dev            # desenvolvimento (APIs caem para chamadas diretas aos serviços públicos)
npm run build          # export estático em ./out
npm start              # serve ./out COM as Pages Functions (http://localhost:3000)
npm test               # testes unitários (frete, parcelas, CPF, Luhn...)
npm run e2e            # Playwright (precisa de `npm run build` antes); desktop e mobile + axe
npm run deploy         # build + publicação no Cloudflare Pages (wrangler logado)
```

Requisitos: Node 22+. Em `?demo=1` aparece o painel de demonstração (cidade, horário simulado, Pix aprovado, resetar).

## Arquitetura

```
app/                 Next.js 15 (App Router, export estático): (store)/ com a casca da loja, checkout/, pedido/
components/{ui,layout,product,cart,checkout,home}
lib/commerce/        CommerceProvider (interface) + MockProvider + catálogo
lib/{shipping,geo,orders,store,format,validators}
lib/server/          lógica das rotas /api (roda em Workers)
functions/api/       Cloudflare Pages Functions: geo, cep/[cep], shipping/quote, reverse-geocode, orders
config/              brand, shipping (CD, matriz de frete, limite de frete grátis, corte), features
data/                catalog.json (62 produtos reais), catalog-lite.json, coleções, menu, feriados 2026/2027
scripts/             extração do catálogo, imagens, capturas de referência
docs/                decisões, roteiro de demo, ativos, fontes, tokens, relatório de fidelidade
e2e/ tests/          Playwright e Vitest
```

**Por que export estático + Pages Functions?** O alvo é Cloudflare Pages. Assim o site é 100% estático na borda (rápido, barato) e as rotas `/api/*` são Functions que leem a geolocalização nativa da Cloudflare. As mesmas funções puras (`lib/shipping`, `lib/orders`) rodam no navegador como fallback.

## Variáveis de ambiente (todas opcionais)

| Variável | Padrão | Efeito |
|---|---|---|
| `NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD` | `299` | Limite de frete grátis (Econômica); a barra do carrinho usa o mesmo valor |
| `NEXT_PUBLIC_FEATURE_POINTS` | `false` | Programa de pontos "Círculo Korres" |
| `NEXT_PUBLIC_FEATURE_BOLETO` | `true` | Boleto no checkout |
| `NEXT_PUBLIC_SITE_URL` | `https://korres-brasil.pages.dev` | URL base de metadados |

Origem do frete, matriz por UF, corte (14h) e CD ficam em `config/shipping.ts`.

## Trocar as fontes

Veja [docs/FONTS.md](docs/FONTS.md): hoje Hanken Grotesk / Roboto Mono / Reenie Beanie (livres); a Favorit licenciada entra trocando variáveis CSS, sem refatorar.

## Plugar um backend real

Toda a UI conversa com `lib/commerce/CommerceProvider.ts` (`getProducts`, `getProduct`, `getCollection`, `search`, `quoteShipping`, `createOrder`). Crie `VtexProvider`/`ShopifyProvider`/`NuvemshopProvider` implementando a interface e troque a instância em `lib/commerce/provider.ts`. A cotação de frete tem a assinatura de um provedor real (`QuoteRequest → ShippingOption[]`), então Melhor Envio/Correios entram em `quoteShipping`.

## Atualizar o catálogo

`npm run catalog` reextrai shopkorres.com.br (Playwright) e regenera `data/catalog*.json` e `public/products`.

## Para virar produção

Backend de pedidos/pagamento reais (PSP com Pix e cartão tokenizado), estoque e preços do servidor (hoje o preço vem do cliente), cotação de frete real, autenticação de verdade, avaliações reais (Stamped.io), e-mails transacionais, analytics com consentimento, fontes licenciadas, domínio próprio e remoção do `noindex`.
