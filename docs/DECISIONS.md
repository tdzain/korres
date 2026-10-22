# Decisões

| Tema | Decisão | Por quê |
|---|---|---|
| Hospedagem | **Cloudflare Pages**: Next.js com `output: 'export'` + Pages Functions em `functions/api` | Pedido do cliente. Next em runtime Node não roda no Pages; export estático é o caminho mais robusto e rápido |
| Geolocalização de borda | `request.cf` (Cloudflare) em vez de headers `x-vercel-ip-*` (que continuam aceitos como fallback em `lib/server/geo.ts`) | O prompt previa Vercel; o deploy é Cloudflare |
| `/pedido/[id]` | Uma página estática `/pedido/` + regra `_redirects` (`/pedido/:id → /pedido/ 200`); o id é lido da URL no navegador | Export estático não gera ids dinâmicos |
| Pedidos | Montados pela Function `/api/orders` (valida com Zod) e guardados em `localStorage` | Functions não têm persistência; protótipo |
| Segurança do mock | O servidor não recebe número/validade/CVV, só método, parcelas e bandeira. O preço unitário vem do cliente (mock) | "Nenhum dado real de pagamento é coletado ou enviado" |
| Marca | "KORRES Brasil" (`config/brand.ts`) | Premissa do briefing |
| Catálogo | **62 produtos reais** extraídos de shopkorres.com.br (preços De/Por, descrições, galerias de 5–8 imagens, seções). Gêmeos de 10 ml viram variante "Viagem 10 ml" | Mais fiel que mockar; `source: "shopkorres.com.br"` |
| Dados mock | Avaliações/notas (derivadas do id), selo "Novo" em 4 itens e "mais vendidos" são ilustrativos | Loja atual não expõe isso em HTML |
| Descontos | Selo "% off" só a partir de 3% (R$ 200 → R$ 198,80 é 0,6%) | Evita selo sem sentido |
| Parcelamento | Máx. 6x, parcela mínima R$ 35 (inferida do site atual), conferido em testes (198,80→5x 39,76 etc.) | Briefing |
| Cupom e Pix | Cupom sobre produtos → Pix 5% sobre o restante → frete. Frete grátis avaliado no subtotal antes do cupom | Regra simples e previsível |
| Fontes | Hanken Grotesk 300–600, **Roboto Mono** (a mesma mono do korres.com, em vez de DM Mono), Reenie Beanie | Favorit é licenciada |
| Cor `muted` | `#5F65A6` para texto; `#8589BB` (medida no korres.com) só para hairlines | A medida original não passa AA como texto (3,3:1) |
| Badge de desconto | `#0917DA` (medido), "novo" `#008000`, link sazonal `#578B4B` | Medidos por pixel no korres.com |
| Logo | SVG oficial da loja atual (ativo do cliente) | Marca do próprio cliente |
| Imagens | Baixadas do CDN da loja atual e convertidas para WebP (1000/500 px) | Ativos do cliente; ver ASSETS.md |
| Hero | 3 slides, o 1º visível no HTML (CSS) para não atrasar o LCP | Performance |
| Motion | `LazyMotion` com `domMax` carregado de forma assíncrona; WAAPI para o "voo" à sacola | JS inicial menor |
| Lenis | Não usado | Opcional no briefing; scroll nativo é mais acessível |
| Vídeo | Filme oficial do Pure Greek Olive nas PDPs dessa linha (`preload="none"`) | Único vídeo disponível do cliente |
| Entrega "Retirada" | Sempre listada, "pronta em 1 dia útil" no CD de São Paulo | O briefing pede Econômica, Expressa e Retirada |
| SEO | `noindex` | Protótipo de demonstração |
| Conta Cloudflare | Publicado na conta `datacenter@tdzain.com.br` (a do domínio tdzain), projeto `korres-brasil` | Havia duas contas no login; escolhida a do usuário |
| Lighthouse | Perf PDP 93, PLP 88, home ~75 (mobile, 4x CPU); A11y 99–100; Boas práticas 100 | Home limitada pelo custo de hidratação; ver FIDELITY_REPORT |
| Transições de tela | View Transitions API via `<ViewTransition>` (React experimental do Next, `experimental.viewTransition`) com crossfade + deslize de 10 px | Suavidade nativa sem biblioteca; desativada com `prefers-reduced-motion` |
| Curva de movimento | `cubic-bezier(.32,.72,0,1)` (iOS) em drawers, folhas, acordeões e quantidade; sem springs com overshoot | Movimento previsível e suave |
| Sacola: coreografia | voo da miniatura (0–720 ms) → drawer abre aos 260 ms → item entra na lista quando a miniatura chega; filhos do drawer entram em cascata | Evita saltos de layout |
| Quantidade nos cards | "Adicionar" vira `− N +` no lugar, sem abrir o drawer | Varejo brasileiro: ajustar quantidade rápido |
| Coluna de informações da PDP | Só fica `sticky` quando cabe na janela; senão rola com a página. Acordeões de abertura múltipla | Nada de texto cortado/escondido |
| Checkout: entrega | Só o CEP aparece primeiro; ao consultar (ou falhar), os demais campos entram já preenchidos | Menos campos assustadores, principalmente no mobile |
| CTA do drawer | "Prosseguir com sua compra" | Pedido do cliente |
