# Prompt: Live Commerce na PDP (protótipo Black Friday)

> Prompt autocontido para colar numa sessão do Claude Code. Foi escrito a partir do protótipo KORRES Brasil (Next 15 + React 19 + Tailwind 4 + Zustand + motion), mas a seção 2 mostra como adaptar a outro projeto do grupo (ex.: Keune) sem depender dele.
>
> **Antes de colar:** copie os 3 vídeos para o novo projeto (hoje em `~/Downloads/korres/korres-comousar.mp4`, `korres-comousar2.mp4`, `korres-comousar3.mp4`; ~16 MB, ~9 MB e ~15 MB; duração ~88 s, ~59 s e ~59 s) e troque os marcadores `{{...}}` da seção 2.

---

## PROMPT (copiar daqui)

### 0. Papel e objetivo

Você é um engenheiro front-end sênior com olho de produto e de motion design, trabalhando num **protótipo de e-commerce** que será mostrado à diretoria. O protótipo não cobra nada e não tem backend real. O que importa é **a diretoria sentir, em 30 segundos, como seria vender com live commerce** na Black Friday (faltam cerca de 3 semanas).

**Contexto de negócio.** Grupo de beleza premium, ticket médio alto. O gargalo é que a consumidora não sabe montar o próprio ritual de skincare e não quer ler a descrição. O TikTok Shop resolve isso com vídeos curtos de "como usar" ligados ao produto. Queremos o mesmo dentro do nosso e-commerce, em formato **live commerce**: uma transmissão ao vivo que sai ao mesmo tempo em YouTube, Instagram, Facebook etc. **e também no site**, com o catálogo conectado, para a pessoa comprar sem sair da transmissão.

**Referência de mercado:** https://widde.io/live-commerce. O que ela faz, e que vamos **simular** (não integrar):
- a live roda no domínio da loja, sem tirar a cliente do site (dados e tráfego ficam com a marca);
- produtos em destaque aparecem durante a live e entram na sacola com um toque, sem interromper o vídeo;
- chat em tempo real, com as dúvidas chegando ao apresentador;
- multistreaming: uma transmissão espelhada em Instagram, TikTok, YouTube e site;
- replay com o mesmo catálogo clicável;
- integra com Shopify, VTEX, Nuvemshop, Tray etc. sem trabalho de desenvolvimento.

**Entrega.** Um recurso "Live" na página de produto (PDP) com dois estados:
1. **Janela pequena (mini player)** flutuante, simulando uma live acontecendo agora.
2. **Modo ampliado**, em formato vertical tipo Reels/Stories, com o catálogo conectado, adição à sacola e fechamento do pedido **sem encerrar nem pausar a transmissão**.

Como não há live de verdade, cada visita à PDP sorteia **um de 3 vídeos** (MP4 locais) e o toca como se fosse ao vivo.

### 1. Princípios (valem para todas as decisões)

1. **Parecer ao vivo, ser honesto.** A diretoria precisa acreditar na simulação, mas o código deve deixar claro que é mock: arquivo `config`/flag explícito, comentários curtos, nada de dependência de rede.
2. **Nunca quebrar a transmissão.** Abrir/fechar sacola, trocar de produto, ir ao checkout: o vídeo continua tocando, no mesmo ponto, sem remontar o `<video>`. Esse é o requisito central ("sem quebra de expectativa").
3. **Mobile primeiro**, desktop como adaptação. É onde TikTok/Reels vivem.
4. **Reaproveitar o que já existe**: store do carrinho, `addToBag`/animação de voo, componente de quantidade, drawer da sacola, tokens de design, Overlay/sheets, formatação de moeda. Não criar um segundo carrinho nem um segundo sistema de design.
5. **Leve e seguro para a performance.** Vídeo com `preload="none"`/`metadata`, só carrega ao entrar em cena; nada de bundle novo grande; `prefers-reduced-motion` respeitado.
6. **Acessível.** Foco gerenciado, `Esc` fecha, botões com `aria-label`, legendas/controles de som, contraste AA sobre vídeo (use gradiente, nunca texto cru em cima da imagem).

### 2. Adaptação ao projeto de destino (preencher e/ou descobrir)

**Passo 1 (obrigatório, antes de codar): explore o repositório** e registre em 10 linhas, para si mesmo:
- framework e roteamento (Next App Router? Vite? outro) e onde fica a PDP;
- gerenciamento de estado e **onde vive o carrinho** (store, actions de add/setQty/remove, abertura do drawer);
- tokens de design (cores, tipografia, raios, sombras, easing) e componentes base (Button, Overlay/Sheet, ícones, toaster);
- modelo de produto (campos de preço, preço "de/por", imagens, variantes, estoque) e como a PDP resolve o produto atual;
- como se formata moeda (BRL) e como o frete grátis / Pix / parcelas são exibidos;
- lib de animação já instalada (preferir a existente; só usar WAAPI/CSS se não houver);
- convenção de testes (unit e e2e) e de commits.

Preencha estas variáveis a partir do que encontrar (e pergunte só o que não for dedutível):

| Variável | Valor |
|---|---|
| `{{MARCA}}` | nome da marca/loja (ex.: Keune) |
| `{{VIDEOS}}` | 3 MP4 em `public/video/live/` (renomear para `live-1.mp4`, `live-2.mp4`, `live-3.mp4`) |
| `{{PDP}}` | rota/arquivo da página de produto |
| `{{CART_STORE}}` | store/hook do carrinho existente |
| `{{TOKENS}}` | arquivo de tokens de design |
| `{{DATA_BF}}` | data da Black Friday de 2026 (27/11/2026) |

> No protótipo KORRES de origem, os equivalentes são: PDP em `app/(store)/produto/[slug]/page.tsx` (renderiza `ProductInfo`, `ProductVideo`, `Reviews`, `Related`); carrinho em `lib/store/cart.ts` (Zustand, `add`, `setQty`, `remove`, `setOpen`, persistência `kr_cart`, `MAX_QTY = 10`); adicionar com voo da miniatura em `lib/addToBag.ts`; controle `− N +` em `components/product/QuickAdd.tsx`; drawer em `components/cart/CartDrawer.tsx`; sheets em `components/ui/Overlay.tsx`; casca global (flutuantes, overlays) em `components/layout/StoreShell.tsx`; botão flutuante do WhatsApp em `components/layout/WhatsAppConcierge.tsx` (canto inferior, **disputa espaço com o mini player**); camadas de z-index já usadas: 70, 72, 75, 80, 85, 95, 100; easing padrão `cubic-bezier(.32,.72,0,1)`; flags em `config/features.ts`.

### 3. Experiência desejada

#### 3.1 Mini player (estado "janela pequena")

- **Onde:** flutuante, **fixo no canto inferior da tela**, só na PDP (e opcionalmente em coleção/home se a flag permitir). Mobile: lado esquerdo ou direito inferior, acima da bottom bar/CTA fixo da PDP e sem cobrir o botão de adicionar; desktop: canto inferior direito. Resolva a colisão com o botão flutuante do WhatsApp (por exemplo, subir o mini player ou o WhatsApp via variável CSS, ou posicionar um em cada lado). **Não pode haver sobreposição em nenhuma largura.**
- **Tamanho:** proporção 9:16, ~110×196 px no mobile e ~160×284 px no desktop. Cantos arredondados conforme os tokens, sombra suave, borda fina.
- **Conteúdo:** vídeo em loop, **mudo e `playsInline`** (autoplay só funciona mudo), selo **"AO VIVO"** com ponto pulsante (vermelho/cor de alerta do design system), contador de espectadores simulado (ex.: "1,2 mil assistindo", oscilando de leve a cada poucos segundos), título curto ("Rotina de skincare com especialista"), botão fechar (X) e botão de som.
- **Comportamento:**
  - Entra com animação discreta (fade + deslize de 12 px) **~2 s após a PDP estar interativa**, para não competir com o LCP. Nada de montar o vídeo antes disso.
  - Tocar/clicar no mini player **expande** para o modo ampliado.
  - Arrastável é bem-vindo no desktop (limitado à viewport); no mobile, fixo.
  - O X fecha o mini player e guarda a escolha em `sessionStorage` (com try/catch) para não reaparecer na sessão; um chip discreto "Voltar para a live" reabre.
  - Pausa se a aba ficar oculta (`visibilitychange`), retoma ao voltar.
  - Se `prefers-reduced-motion`, sem animação de entrada e sem pulso.

#### 3.2 Modo ampliado (formato Reels/Stories)

Abre ao tocar no mini player. **O mesmo elemento `<video>` continua tocando** (não recriar, não reiniciar). Para isso, mantenha **um único `<video>` montado num componente-raiz** e mude apenas o container/estilo/posição entre mini e ampliado (ver 5.2).

- **Mobile:** tela cheia (`100dvh`, respeitando safe-area/notch), vídeo `object-fit: cover` em 9:16. **Desktop:** painel central vertical 9:16 (altura ~90vh, máx. ~860 px) sobre um fundo escurecido com blur; ao lado direito (opcional, se houver espaço ≥ 1100 px), chat/produtos em coluna. Em desktop estreito, cai para o layout mobile.
- **Transição mini → ampliado:** animar o mesmo retângulo (FLIP: posição/tamanho/raio) com a curva padrão do projeto, ~350–450 ms. Sem salto, sem piscar, sem som estourando.
- **Camada superior (header do player):** avatar + nome da apresentadora/marca, selo AO VIVO, espectadores, botão de som, botão minimizar (volta ao mini, **sem pausar**), botão fechar.
- **Camada de baixo (a parte que vende), sempre acima do gradiente:**
  1. **Carrossel de produtos em destaque** (cards horizontais com *scroll snap*): imagem, nome, preço "de/por" com selo de economia, e o controle de adicionar. O produto **em foco no momento** (sincronizado com o vídeo, ver 3.3) vem destacado, com um rótulo "Em destaque agora". A PDP atual aparece sempre como primeiro card.
  2. **Adicionar = reaproveitar o `QuickAdd`** (botão "Adicionar" que vira `− N +` no lugar). Ao adicionar, mostrar feedback leve **dentro do player**: miniatura voando até um ícone de sacola do próprio player e contador com *bump*. **Não abrir o drawer da sacola do site por cima do vídeo** nem navegar.
  3. **Barra de sacola do player:** ícone + total de itens + subtotal + barra de **frete grátis** (reaproveitar o componente existente) + botão primário **"Finalizar compra"** (use o texto do CTA do projeto, no KORRES é "Prosseguir com sua compra").
- **Fechar a compra sem perder a live.** Ao tocar em "Finalizar compra", abrir um **bottom sheet sobre o vídeo** (ocupando ~75–85% da altura, com o vídeo ainda visível e tocando em cima, reduzido/escurecido). O sheet contém a sacola e o resumo (itens, quantidade editável, cupom, subtotal, frete grátis, total) e o caminho de checkout. Duas opções, em ordem de preferência:
  - **(A, recomendada para a demo)** *Checkout expresso dentro do sheet*: endereço/CEP, forma de pagamento (Pix com desconto, cartão), confirmação, usando os componentes e a lógica do checkout existentes **em modo compacto**, e tela de sucesso dentro do player ("Pedido confirmado", com o vídeo ainda rolando atrás).
  - **(B, fallback se o checkout atual não for reaproveitável em tempo hábil)** o sheet mostra a sacola e um botão que **abre o checkout existente em nova aba** (`target="_blank"`), mantendo a live aberta na aba atual. Deixe claro no código e no resumo final qual opção foi implementada.
  - Em ambos os casos, **fechar o sheet volta exatamente ao mesmo ponto do vídeo**, e o estado do carrinho (store único) fica consistente com o resto do site.
- **Chat simulado** (camada lateral/inferior, opcional mas de alto impacto): mensagens roteirizadas em loop (nomes e falas em PT-BR, ex.: "Serve para pele sensível?", "Qual a ordem de uso?", respostas da marca marcadas com selo), entrando a cada 3–7 s com fade; campo "Diga algo…" que, ao enviar, adiciona a mensagem da pessoa no chat (apenas local). Corações/reações flutuantes ao tocar duas vezes no vídeo ou no botão de coração (estilo Instagram Live), puramente visuais.
- **Gestos (mobile):** deslizar para baixo sobre o vídeo = minimizar; deslizar o carrossel = rolar produtos; toque duplo = coração. Evitar conflito com o scroll do sheet.
- **Som:** o vídeo começa mudo. O primeiro toque no botão de som (ou a abertura do modo ampliado, que é um gesto do usuário) liga o áudio. Memorize a preferência na sessão.

#### 3.3 Produtos sincronizados com o vídeo

Para dar sensação de live real, cada vídeo tem uma **linha do tempo de produtos em foco**, definida em dados (não em código):

```ts
// data/live.ts  (nomes ilustrativos; adapte ao projeto)
export interface LiveScene { at: number; productSlugs: string[]; caption?: string } // at = segundos
export interface LiveStream {
  id: 'live-1' | 'live-2' | 'live-3'
  src: string            // /video/live/live-1.mp4
  poster: string         // quadro estático do vídeo (gerar, ver 6)
  title: string          // "Rotina de skincare: do básico ao completo"
  host: { name: string; role: string; avatar: string }
  baseViewers: number    // ex.: 1200
  scenes: LiveScene[]    // em ordem; a cena vale até a próxima
  chat: { at: number; user: string; text: string; fromBrand?: boolean }[]
}
```

- A cada `timeupdate`, determine a cena corrente e **destaque/ordene** os produtos dela no carrossel (com animação suave de reordenação). Troca de cena = pequeno aviso "Agora: {produto}".
- **Os 3 vídeos são de "como usar" (arquivos `*-comousar*.mp4`).** Assista aos quadros (extraia 1 quadro a cada ~5 s com ffmpeg, ver 6) para descobrir **qual produto aparece em cada trecho** e preencher `scenes` com slugs reais do catálogo. Se não for possível identificar com segurança, use um mapeamento conservador (produto-hero da linha) e registre a incerteza no resumo final em vez de inventar.
- Quando o vídeo terminar, **reinicie em loop sem corte visível** (usar `loop`; se houver "pulo" perceptível, crossfade entre dois elementos de vídeo ou, no mínimo, reiniciar com um fade curto). O contador de espectadores e o chat também reiniciam o ciclo.

#### 3.4 Sorteio dos vídeos

- A cada **carregamento da PDP** sorteia-se uma das 3 lives. Regras:
  - Escolher no **cliente, após a hidratação** (evita mismatch de SSR/estático), nunca no render do servidor.
  - Evitar repetir a mesma live duas vezes seguidas: guardar o último id em `sessionStorage` e sortear entre as 2 restantes.
  - **Modo demo:** parâmetro `?live=1|2|3` força um vídeo (para a apresentação) e `?live=off` desliga. Se o projeto tiver painel de demonstração, adicione ali um seletor "Live: aleatória / 1 / 2 / 3 / desligada".
  - Estratégia determinística em testes (injetar `Math.random`).
- Ao navegar entre PDPs **sem recarregar** (SPA), manter a mesma live em andamento e apenas atualizar o primeiro card do carrossel para a nova PDP; não reiniciar o vídeo.

#### 3.5 Contexto "Black Friday" e narrativa para a diretoria

- Selo "AO VIVO · BLACK FRIDAY" e faixa de contagem regressiva até `{{DATA_BF}}` (ou "Condições exclusivas da live") dentro do modo ampliado. Opcional: **preço exclusivo da live** (ex.: 10% a mais de desconto nos produtos em foco, aplicado só dentro do player) para a diretoria ver o potencial de conversão. Se implementar, mostre o preço riscado e rotule "exclusivo da live", e mantenha as regras de cupom/Pix existentes sem quebrá-las.
- **Aviso de multistreaming** no header do player ou num painel "Como funciona": ícones de Instagram, TikTok, YouTube, Facebook e Site com "transmitindo agora". É só ilustrativo (SVG simples, sem marcas copiadas de forma enganosa; use ícones genéricos se o projeto não tiver os das redes).
- Um **painel "Sobre esta demo"** (acessível por um "i" discreto no player ou pelo painel de demonstração) com 3 linhas: o que é simulado, que a solução real seria um fornecedor de live commerce integrado ao catálogo, e a Black Friday como alvo. Isso ajuda quem apresenta.

### 4. Requisitos funcionais (checklist verificável)

1. [ ] Na PDP, depois de ~2 s de página interativa, aparece o mini player com um dos 3 vídeos, mudo, em loop, com selo AO VIVO e espectadores oscilando.
2. [ ] Dois carregamentos seguidos da PDP não repetem a mesma live (a menos que `?live=N`).
3. [ ] Tocar no mini player expande para o modo ampliado, **sem reiniciar o vídeo** (o `currentTime` é contínuo).
4. [ ] No modo ampliado: carrossel de produtos, adicionar com `− N +`, voo da miniatura até a sacola do player, contador, frete grátis, subtotal.
5. [ ] "Finalizar compra" abre um sheet sobre o vídeo; o vídeo segue tocando; fechar o sheet não perde o ponto.
6. [ ] O carrinho é **o mesmo** do site: itens adicionados na live aparecem no drawer da sacola e no checkout, e vice-versa.
7. [ ] Minimizar volta ao mini player sem pausar; X fecha e não reaparece na sessão; o chip "Voltar para a live" reabre.
8. [ ] Pausa em aba oculta, retoma ao voltar.
9. [ ] Produtos em destaque mudam conforme a linha do tempo do vídeo.
10. [ ] Chat simulado e corações funcionam (sem rede).
11. [ ] Sem colisão com WhatsApp, banner de cookies, bottom bar/CTA fixo da PDP, drawer da sacola ou toasts, em 360, 390, 768, 1024 e 1440 px.
12. [ ] `?live=1|2|3|off` funciona.
13. [ ] Tudo sob uma **flag** (`NEXT_PUBLIC_FEATURE_LIVE`, ou equivalente; padrão **ligado** no protótipo) para desligar sem remover código.

### 5. Requisitos técnicos

#### 5.1 Estrutura sugerida

```
config/features.ts            + flag live
data/live.ts                  + LiveStream[] com scenes/chat (conteúdo, fora do componente)
lib/store/live.ts             + estado: mode ('mini'|'full'|'closed'), muted, streamId, sheetOpen, viewers
components/live/
  LiveRoot.tsx                componente-raiz montado UMA vez na casca da loja; dono do <video>
  LiveMiniPlayer.tsx          visual do estado mini (apenas apresentação)
  LiveFullscreen.tsx          overlay do modo ampliado (header, produtos, chat, sacola do player)
  LiveProducts.tsx            carrossel + QuickAdd reaproveitado
  LiveChat.tsx                chat simulado + corações
  LiveCheckoutSheet.tsx       sheet de sacola/checkout (opção A ou B do 3.2)
  useLiveScene.ts             cena corrente a partir de timeupdate
public/video/live/            live-1.mp4, live-2.mp4, live-3.mp4, + posters .webp
```

(Adapte nomes às convenções do projeto. Não crie camadas de abstração além do necessário.)

#### 5.2 O ponto crítico: um único `<video>` que nunca remonta

- Monte `LiveRoot` **na casca global** (o equivalente a `StoreShell`), **fora** das árvores que mudam por rota, para o vídeo sobreviver à navegação e à abertura de sheets. Ele decide a visibilidade por pathname (só PDP, ou onde a flag permitir).
- Mini e ampliado são **o mesmo nó `<video>`** reposicionado por CSS (`position: fixed` + `transform`/`inset`/`border-radius` animados, FLIP via WAAPI ou a lib de animação existente). **Proibido** renderizar dois `<video>` e trocar entre eles (gera reinício e flash).
- Nunca usar `key` mudando no elemento de vídeo. Trocar de live = trocar `src` de propósito e só então reiniciar.
- Portais (`createPortal`) só para camadas de UI **por cima** do vídeo; o vídeo fica no root.
- Em iOS Safari: `playsInline`, `muted` no atributo antes de `play()`, `webkit-playsinline`, e tratar a promise rejeitada de `play()` (mostrar um botão "Tocar" discreto se o autoplay for bloqueado). Não depender de fullscreen nativo do vídeo; o "tela cheia" é o nosso overlay.
- Respeitar `100dvh` e `env(safe-area-inset-*)`. Travar o scroll do `body` no modo ampliado e restaurar ao sair; gerenciar foco (armadilha de foco no ampliado, devolver ao mini ao fechar), `Esc` minimiza.

#### 5.3 Performance e peso

- Vídeos: `preload="metadata"` no mini, poster `.webp` obrigatório (evita quadro preto). Só definir `src` depois do atraso de ~2 s.
- Os MP4 originais têm 9–16 MB. Para a demo, **recodifique se tiver ffmpeg** (H.264, 720×1280, ~1,2–1,8 Mbps, `-movflags +faststart`, áudio AAC 96 kbps) para ~4–7 MB cada; se não houver ffmpeg, sirva os originais e registre a recomendação. Confirme dimensões reais antes (os arquivos aparentam ser verticais).
- Hospedagem estática (Cloudflare Pages tem limite de 25 MB por arquivo): confirme que cada arquivo cabe. Não commitar binários grandes sem checar o `.gitignore`/LFS do projeto; se o projeto não versiona vídeo, documente o caminho de cópia.
- Lazy-load do módulo da live (`dynamic import`) depois da hidratação; zero impacto no JS inicial da PDP. Rodar a medição de performance já usada no projeto antes/depois e reportar a diferença (LCP/TBT da PDP não pode piorar de forma relevante).
- Animar apenas `transform` e `opacity`.

#### 5.4 Estado e dados

- Store próprio e pequeno para a UI da live (`mode`, `muted`, `streamId`, `sheetOpen`); **o carrinho continua no store existente**. Persistir só o que for preferência de sessão (`sessionStorage`, sempre em try/catch).
- Conteúdo da live (roteiro de produtos, chat, títulos) em `data/live.ts`, tipado, para o time de marketing editar sem mexer em componentes.
- Preços e produtos sempre pelo provider/catálogo existente; nunca duplicar dados de produto na live.

#### 5.5 Qualidade

- Respeitar tipagem estrita, lint e as convenções de comentário do projeto (comentários curtos, em PT-BR, explicando o porquê).
- Testes:
  - **unit:** escolha da cena por tempo; sorteio sem repetição e com `?live=`; reducer/store da live.
  - **e2e (Playwright ou equivalente):** (1) mini player aparece na PDP; (2) expande sem reiniciar o `currentTime` (assert: tempo após expandir ≥ tempo antes); (3) adicionar item na live aparece na sacola do site; (4) abrir/fechar sheet não pausa o vídeo (`!video.paused`); (5) `?live=off` não renderiza; (6) sem overflow horizontal nem colisão em 390 e 1440 px; (7) axe sem violações novas.
  - Em testes use vídeos curtos/mocks e `Math.random` injetado.
- Rodar `typecheck`, `lint`, `test`, `build` e o e2e. Tirar screenshots (mini e ampliado em 390 e 1440) como evidência.

### 6. Passo a passo sugerido de execução

1. Explorar o repositório (seção 2) e escrever o plano curto antes de codar.
2. Copiar os vídeos para `public/video/live/` (renomear), checar tamanho/dimensões; se houver `ffmpeg`, extrair **posters** (`-ss 1 -vframes 1`) e **quadros a cada ~5 s** para mapear produtos por cena; recodificar se necessário.
3. Criar flag, `data/live.ts` (roteiro real com os quadros vistos) e store.
4. Implementar `LiveRoot` com o `<video>` único + mini player + sorteio.
5. Implementar o modo ampliado (FLIP, header, gestos, som).
6. Produtos em destaque + `QuickAdd` + sacola do player + frete grátis.
7. Sheet de compra (opção A ou B) sem pausar o vídeo.
8. Chat/corações, selo Black Friday, painel "Sobre esta demo", seletor no painel de demonstração.
9. Colisões e responsivo (360–1440), acessibilidade, performance.
10. Testes, screenshots, resumo.

### 7. O que NÃO fazer

- Não integrar nenhum SDK/serviço de live real, não abrir WebSocket, não chamar APIs externas.
- Não criar um segundo carrinho, nem duplicar lógica de preço/cupom/Pix/frete.
- Não renderizar dois `<video>` para mini e ampliado.
- Não tocar com áudio automaticamente sem gesto do usuário.
- Não usar textos/avatares de pessoas reais; apresentadora e participantes do chat são fictícios (nomes comuns, avatares genéricos ou iniciais).
- Não cobrir CTA de compra, cookies ou WhatsApp.
- Não afirmar no resumo final que algo foi testado se não foi.

### 8. Entrega final (formato do relatório)

Ao terminar, responda com: (1) o que foi feito e onde (arquivos); (2) qual opção do sheet foi usada (A ou B) e por quê; (3) como demonstrar (`?live=1|2|3`, painel demo); (4) mapeamento cena→produto usado e **o que foi inferido vs. confirmado**; (5) resultados de typecheck/lint/test/build/e2e e medições de performance antes/depois; (6) limitações e sugestões de próximo passo para um piloto real (fornecedor de live commerce, SDK do carrinho, moderação de chat, analytics de conversão por live).

## FIM DO PROMPT
