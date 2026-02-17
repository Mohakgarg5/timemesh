'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface NeonButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'cyan' | 'purple' | 'pink' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  fullWidth?: boolean
}

const variants = {
  // Deep violet — bold primary CTA
  cyan:   'bg-violet-600 text-white border-violet-700 hover:bg-violet-700 shadow-md hover:shadow-[0_6px_24px_rgba(124,58,237,0.45)]',
  // Soft violet outline — secondary
  purple: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 hover:shadow-[0_4px_16px_rgba(124,58,237,0.15)]',
  // Warm coral — accent
  pink:   'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 hover:shadow-[0_4px_16px_rgba(255,107,71,0.2)]',
  // Plain ghost
  ghost:  'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:text-stone-800',
}

const sizes = {
  sm: 'px-4 py-1.5 text-sm rounded-xl',
  md: 'px-6 py-2.5 text-base rounded-2xl',
  lg: 'px-8 py-3.5 text-lg rounded-2xl',
}

export function NeonButton({ children, onClick, type = 'button', variant = 'cyan', size = 'md', disabled = false, className, fullWidth = false }: NeonButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={cn(
        'border font-semibold transition-all duration-200 cursor-pointer',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant], sizes[size],
        fullWidth && 'w-full',
        className
      )}
    >
      {children}
    </motion.button>
  )
}
