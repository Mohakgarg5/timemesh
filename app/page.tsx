'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { NeonButton } from '@/components/ui/NeonButton'
import { GlassCard } from '@/components/ui/GlassCard'

const features = [
  {
    emoji: '🎨',
    title: 'Paint Your Availability',
    description: 'Drag to mark times as Preferred, Available, or If Needed. Fast, visual, and intuitive.',
    iconBg: 'bg-violet-100',
    glow: 'cyan' as const,
  },
  {
    emoji: '👥',
    title: 'Group Scheduling',
    description: 'Share one link. No accounts needed. Everyone paints their availability in seconds.',
    iconBg: 'bg-emerald-100',
    glow: 'none' as const,
  },
  {
    emoji: '⚡',
    title: 'Instant Best Times',
    description: 'Our algorithm scores every slot by priority and ranks the top meeting windows for you.',
    iconBg: 'bg-orange-100',
    glow: 'pink' as const,
  },
]

export default function HomePage() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 md:py-16">

      {/* Hero */}
      <motion.div className="text-center max-w-2xl mx-auto mb-8 md:mb-14"
        initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>

        {/* Brand */}
        <div className="flex flex-col items-center gap-4 mb-7">
          <motion.div className="inline-flex items-center gap-2.5"
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg">
              <span className="text-xl">📅</span>
            </div>
            <span className="text-2xl font-black text-stone-800 tracking-tight">TimeMesh</span>
          </motion.div>

          <motion.span className="inline-block px-4 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-sm text-violet-700 font-semibold"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}>
            Free &amp; No Sign-up Required ✨
          </motion.span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-[3.75rem] font-black mb-5 leading-[1.1] text-stone-900">
          Stop the endless{' '}
          <span className="gradient-text">"when are you free?"</span>
        </h1>

        <p className="text-base md:text-lg text-stone-500 mb-6 md:mb-10 max-w-lg mx-auto leading-relaxed">
          Create an event, share the link, and let everyone paint their availability.
          TimeMesh finds the perfect meeting time automatically.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <NeonButton variant="cyan" size="lg" onClick={() => router.push('/create')}>
            Create Event — it&apos;s free
          </NeonButton>
          <NeonButton variant="ghost" size="lg"
            onClick={() => { const c = prompt('Enter event code:'); if (c) router.push(`/event/${c.trim()}`) }}>
            Join with Code
          </NeonButton>
        </div>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto w-full">
        {features.map((f, i) => (
          <GlassCard key={f.title} glow={f.glow} hover>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${f.iconBg} mb-4 text-2xl`}>
                {f.emoji}
              </div>
              <h3 className="font-bold text-stone-800 mb-2">{f.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{f.description}</p>
            </motion.div>
          </GlassCard>
        ))}
      </div>

      {/* Steps */}
      <motion.div className="mt-10 md:mt-20 max-w-3xl mx-auto w-full text-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        <h2 className="text-2xl font-black text-stone-800 mb-10">
          Ready in <span className="gradient-text">4 steps</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { n: '1', icon: '🗓️', t: 'Create',  d: 'Pick dates & time range' },
            { n: '2', icon: '🔗', t: 'Share',   d: 'Send link to everyone' },
            { n: '3', icon: '🎨', t: 'Paint',   d: 'Mark your free times' },
            { n: '4', icon: '🏆', t: 'Match',   d: 'See the best slots' },
          ].map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 + i * 0.08 }}>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100 border border-violet-200 flex items-center justify-center mx-auto mb-3 text-xl shadow-sm">
                {s.icon}
              </div>
              <p className="text-xs font-black text-violet-500 uppercase tracking-widest mb-0.5">Step {s.n}</p>
              <h3 className="text-sm font-bold text-stone-700 mb-1">{s.t}</h3>
              <p className="text-xs text-stone-400">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <footer className="mt-16 text-stone-400 text-sm">
        No sign-up · No tracking · Just scheduling 🚀
      </footer>
    </div>
  )
}
