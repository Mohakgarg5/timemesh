'use client'

import Link from 'next/link'
import { NeonButton } from '@/components/ui/NeonButton'

export default function EventNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center glass p-12 max-w-sm">
        <p className="text-6xl font-black gradient-text mb-3">404</p>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Event Not Found</h1>
        <p className="text-slate-500 text-sm mb-6">This event doesn&apos;t exist or may have expired.</p>
        <Link href="/"><NeonButton variant="cyan">Go Home</NeonButton></Link>
      </div>
    </div>
  )
}
