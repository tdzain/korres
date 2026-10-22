import * as React from 'react'

// O React embutido no Next expõe o componente como `unstable_ViewTransition`; versões estáveis, como `ViewTransition`.
const ViewTransition = (React as unknown as Record<string, React.ComponentType<{ default?: string; children: React.ReactNode }>>).unstable_ViewTransition
  ?? (React as unknown as Record<string, React.ComponentType<{ default?: string; children: React.ReactNode }>>).ViewTransition

/** Transição entre telas: View Transitions API (crossfade + deslize sutil), configurada em globals.css. */
export default function Template({ children }: { children: React.ReactNode }) {
  return ViewTransition ? <ViewTransition default="page">{children}</ViewTransition> : <>{children}</>
}
