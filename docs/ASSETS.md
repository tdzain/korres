# Ativos e origens

Todos os ativos são do próprio cliente (KORRES), usados em protótipo interno.

| Ativo | Origem | Onde |
|---|---|---|
| Catálogo (nomes, preços, descrições, seções, SKU/GTIN) | https://www.shopkorres.com.br (extração com `scripts/scrape-shopkorres.mjs`) | `data/catalog.json`, `data/catalog-lite.json` |
| Fotos de produto (328 arquivos; galeria de 5–8 por produto) | `cdn.vnda.com.br` da loja atual, convertidas para WebP 1000/500 px | `public/products/<slug>/` |
| Logo KORRES (SVG) | `cdn.vnda.com.br/shopkorres/2023/03/14/…logo.svg` | `components/ui/Logo.tsx`, `public/brand/` |
| Banners de categoria (óleo, sabonete, loção, mãos) | Banners da home da loja atual | `public/editorial/cat-*.webp` |
| Hero (3), blocos de coleção, história, ética, tiles | Recortes de fotos das galerias de produto e do banner Smart Yoghurt da loja atual | `public/editorial/` (`scripts/build-editorial.mjs`) |
| Vídeo Pure Greek Olive | `korres.com` (CDN Shopify), 15 MB | `public/video/pure-greek-olive.mp4` |
| Referências visuais (screenshots 1440/390 do korres.com) | Capturas próprias (`scripts/capture-reference.mjs`) | `docs/reference/` |

Dados ilustrativos (mock): avaliações de clientes, notas e contagens, selos "Novo", ranking de "mais vendidos". CEP via ViaCEP/BrasilAPI; localização via Cloudflare/ipwho.is/Nominatim.
