// Feature flags (NEXT_PUBLIC_* são inlinadas no build).
const flag = (value: string | undefined, fallback: boolean) => (value === undefined ? fallback : value === 'true')

export const features = {
  /** Programa de pontos "Círculo Korres": desligado, a loja BR atual não tem o programa. */
  points: flag(process.env.NEXT_PUBLIC_FEATURE_POINTS, false),
  boleto: flag(process.env.NEXT_PUBLIC_FEATURE_BOLETO, true),
  /** Live commerce na PDP (simulação para a Black Friday): mini player + modo ampliado com catálogo conectado. */
  live: flag(process.env.NEXT_PUBLIC_FEATURE_LIVE, true),
  smoothScroll: flag(process.env.NEXT_PUBLIC_FEATURE_SMOOTH_SCROLL, false),
} as const

export const PIX_DISCOUNT = 0.05
export const COUPONS = {
  BEMVINDO15: { label: '15% na primeira compra', percent: 0.15 },
  KORRES10: { label: '10% de desconto', percent: 0.1 },
} as const
