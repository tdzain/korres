'use client'
import { motion } from 'motion/react'

/** Transição de página sutil (fade 200ms). */
export default function Template({ children }: { children: React.ReactNode }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, ease: 'easeOut' }}>{children}</motion.div>
}
