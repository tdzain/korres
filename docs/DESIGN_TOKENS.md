# Design tokens (medidos no korres.com)

| Token | Valor | Uso |
|---|---|---|
| `--color-brand` | `#061096` | texto de destaque, ícones, logo, botão primário |
| `--color-body` | `rgb(6 16 150 / .75)` | texto corrido |
| `--color-hairline` | `#8589BB` | linhas do grid, divisores, bordas |
| `--color-muted` | `#5F65A6` | texto secundário/mono (AA; a medida original `#8589BB` dá 3,3:1) |
| `--color-surface` | `#F8F8F8` | barra de anúncio, barra de filtros |
| `--color-tint` | `#F4F5FB` | resumo do checkout |
| `--color-badge` | `#0917DA` | selo "% off" |
| `--color-new` | `#008000` | selo "Novo" |
| `--color-seasonal` | `#578B4B` | link sazonal |
| `--color-success` | `#2F7D3A` | frete grátis, aprovado |

Tipografia: corpo 16/300/1.8; rótulo de UI 14/500/16; título de seção 28→40 px, caixa alta; subtítulo mono 12,5 px; selo 11 px/500, 0,5 px de espaçamento. Escala 12/14/16/20/28/42/64; base 4 px; gutters 14 px (desktop) e 16 px (mobile); hairline 1 px; **raio 0** (só o anel do contador, o rádio e o contador de itens são circulares).

Movimento: `--ease-out: cubic-bezier(.22,1,.36,1)`, `--ease-in-out: cubic-bezier(.65,0,.35,1)`; 150 ms / 300 ms / 700 ms. Breakpoints: 390 (base), 768, 1024, 1440 (`2xl`).
