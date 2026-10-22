import type { NextConfig } from 'next'

// Export estático: o site é publicado no Cloudflare Pages e as rotas /api/* vivem em `functions/` (Pages Functions).
const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
}

export default config
