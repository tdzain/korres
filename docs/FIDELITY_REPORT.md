# Relatório de fidelidade (korres.com × KORRES Brasil)

Comparação lado a lado em 1440 px e 390 px (screenshots em `docs/reference/`: `ref-*` = korres.com, `local-*` = protótipo). Valores de cor/tipografia medidos por `getComputedStyle` e por amostragem de pixels (`scripts/measure-ref.mjs`).

## Igual à referência

- Barra de anúncio de 34 px (`#F8F8F8`, indicador de slides à esquerda, "Fechar ×" à direita).
- **Header dividido em duas metades** com hairline vertical: navegação à esquerda; busca inline, logo, conta, favoritos e sacola (com contadores) à direita; sombra após 8 px; some ao rolar para baixo.
- **Hero 50/50**: acento manuscrito + frase mono + botão outline com chevron; imagem full-bleed à direita; zoom-out 1,08 → 1.
- **Grid hairline de 4 colunas** sem gaps, badge de desconto, nota ★ no canto, 2ª imagem no hover, nome 14/500, linha de preço.
- Blocos de coleção (imagem editorial à esquerda + 2×2), "Em alta agora" com setas, banners editoriais em duas metades, "Compre por categoria", newsletter em duas metades, rodapé em 4 colunas, cookie banner de 3 ações no canto inferior direito.
- **PDP dividida 50/50** (galeria à esquerda; coluna sticky à direita), chips de tamanho, acordeões "+ / −" em mono, avaliações, banner de origem ética, relacionados.
- Barra "FILTROS | ORDENAR POR" em duas metades na PLP.
- Tipografia, cores, raio 0, easings e durações do design system.

## Divergências conhecidas (aceitáveis ou intencionais)

| Item | Referência | Protótipo | Motivo |
|---|---|---|---|
| Fonte | Favorit | Hanken Grotesk (corpo), Roboto Mono, Reenie Beanie | Licença; troca documentada em FONTS.md |
| Cor de texto secundário | `#8589BB` | `#5F65A6` (hairlines continuam `#8589BB`) | Contraste AA |
| Hero mobile | imagem de fundo com texto sobreposto | texto empilhado acima da imagem | Legibilidade do texto manuscrito em 3 slides; ajustável |
| Chip de entrega | não existe | no header (≥1280 px) ou faixa abaixo do header | Requisito de entrega por cidade |
| Balão "Detectamos sua cidade" | não existe | sobre o hero na 1ª visita | Requisito de geolocalização; some ao confirmar |
| Barra de anúncio mobile | marquee horizontal | mensagens rotativas verticais | Preferência de motion |
| Textos e imagens | EUA | pt-BR, catálogo real da loja BR | Localização |
| "Pontos de fidelidade" | em cada card | substituídos por parcelamento | Programa desligado no BR |
| Selo "Novo" | verde "New arrival" | verde "Novo" | Tradução |
| Mega menu | 4 colunas + "Our picks" | 4 colunas + "Nossas escolhas"; "por ingrediente" mapeado às linhas (Smart Yoghurt, Black Pine...) | Taxonomia real da loja BR |
| Zoom da galeria | modal | zoom que segue o cursor + modal | Requisito do briefing |
| Home em Lighthouse mobile | n/a | ~75 de performance (PDP 93, PLP 88) | Custo de hidratação sob CPU 4x; ver README |

## Corrigido durante a revisão

Grid em 2 colunas no desktop (variável CSS sobrescrita por estilo inline), borda do botão "Adicionar" vazando, faixa de ícones do infográfico na imagem do Smart Yoghurt, imagem com texto sobreposto no banner "Nascemos na Grécia", selo de 1% off, header quebrando em 3 linhas, contraste do texto secundário, ícone do checkbox interceptando cliques, `label` do rádio de pagamento envolvendo os campos do cartão, foco pulando para "Número" quando o CEP vinha pré-preenchido.
