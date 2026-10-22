/** Transição de página sutil (fade 200ms) em CSS puro: não depende de hidratação, então não atrasa o LCP. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-fade">{children}</div>
}
