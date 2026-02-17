'use client'

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string }

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-semibold text-stone-500">{label}</label>}
    <input ref={ref} className={cn(
      'w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 placeholder-stone-400',
      'focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:bg-white transition-all duration-200',
      error && 'border-red-400 focus:border-red-400 focus:ring-red-100', className
    )} {...props} />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
))
Input.displayName = 'Input'

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { label?: string; error?: string }

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({ label, error, className, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-semibold text-stone-500">{label}</label>}
    <textarea ref={ref} className={cn(
      'w-full px-4 py-3 rounded-xl resize-none bg-stone-50 border border-stone-200 text-stone-800 placeholder-stone-400',
      'focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:bg-white transition-all duration-200',
      error && 'border-red-400 focus:border-red-400 focus:ring-red-100', className
    )} {...props} />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
))
TextArea.displayName = 'TextArea'
