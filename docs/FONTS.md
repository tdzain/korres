# Fontes

Variáveis CSS (em `app/globals.css`, `@theme`): `--font-sans`, `--font-mono`, `--font-hand`. Hoje alimentadas por `next/font/google` em `app/layout.tsx`:

- corpo/UI: **Hanken Grotesk** 300–600 (fallback livre da Favorit)
- mono: **Roboto Mono** (é a mono usada no korres.com)
- manuscrita: **Reenie Beanie**

## Trocar pela Favorit / Favorit Mono (licenciadas)

1. Coloque os `.woff2` em `public/fonts/` (ex.: `Favorit-Light.woff2`, `Favorit-Regular.woff2`, `Favorit-Medium.woff2`, `FavoritMono-Light.woff2`).
2. Em `app/layout.tsx` troque `Hanken_Grotesk`/`Roboto_Mono` por `next/font/local`:

```ts
import localFont from 'next/font/local'
const sans = localFont({ variable: '--font-hanken', display: 'swap', src: [
  { path: '../public/fonts/Favorit-Light.woff2', weight: '300' },
  { path: '../public/fonts/Favorit-Regular.woff2', weight: '400' },
  { path: '../public/fonts/Favorit-Medium.woff2', weight: '500' },
] })
const mono = localFont({ variable: '--font-roboto-mono', src: '../public/fonts/FavoritMono-Light.woff2', weight: '300' })
```
3. Nada mais muda: os nomes das variáveis são mantidos e todo o CSS usa `font-sans`/`font-mono`.
