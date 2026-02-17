'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  glow?: 'cyan' | 'purple' | 'pink' | 'none'
  hover?: boolean
  animate?: boolean
}

const glowClasses = { cyan: 'glow-cyan', purple: 'glow-purple', pink: 'glow-pink', none: '' }

export function GlassCard({ children, className, glow = 'none', hover = false, animate = true }: GlassCardProps) {
  const C = animate ? motion.div : 'div'
  return (
    <C
      className={cn('glass p-6', glowClasses[glow], hover && 'transition-shadow duration-300 hover:shadow-[0_8px_40px_rgba(124,58,237,0.18)]', className)}
      {...(animate ? { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45 } } : {})}
    >
      {children}
    </C>
  )
}
