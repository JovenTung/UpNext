'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { PropsWithChildren, useEffect, useMemo, useRef } from 'react'

// Define page order to determine slide direction
const ORDER = [
  '/',
  '/benefits',
  '/how-it-works',
  '/assignments',
  '/exams',
  '/profile',
]

export default function RouteTransition({ children }: PropsWithChildren) {
  const pathname = usePathname() || '/'
  const prevPathRef = useRef(pathname)

  const [fromIdx, toIdx] = useMemo(() => {
    const from = ORDER.indexOf(prevPathRef.current)
    const to = ORDER.indexOf(pathname)
    return [from < 0 ? 0 : from, to < 0 ? 0 : to]
  }, [pathname])

  useEffect(() => {
    prevPathRef.current = pathname
  }, [pathname])

  const direction = toIdx >= fromIdx ? 1 : -1

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={pathname}
          transition={{ type: 'tween', ease: 'easeInOut', duration: 0.32 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
