'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface P { id:string; name:string; timezone:string; slotCount:number }

const avatars = ['from-violet-500 to-pink-500','from-emerald-400 to-teal-500','from-orange-400 to-rose-500',
  'from-sky-400 to-blue-500','from-amber-400 to-orange-500','from-fuchsia-400 to-violet-500',
  'from-teal-400 to-cyan-500','from-rose-400 to-pink-500']

export function ParticipantList({ participants }: { participants: P[] }) {
  if (!participants.length) return (
    <div className="text-center py-5">
      <span className="text-2xl">🕵️</span>
      <p className="text-stone-400 text-sm mt-2">No participants yet</p>
      <p className="text-stone-300 text-xs">Be the first to join!</p>
    </div>
  )
  return (
    <div className="space-y-2">
      <AnimatePresence>
        {participants.map((p,i) => (
          <motion.div key={p.id} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} exit={{opacity:0}}
            transition={{delay:i*0.04}}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50 hover:bg-violet-50 transition-colors">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatars[i%avatars.length]} flex items-center justify-center text-sm font-black text-white shrink-0`}>
              {p.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-stone-700 truncate">{p.name}</p>
              <p className="text-[11px] text-stone-400">{p.slotCount} slot{p.slotCount!==1?'s':''} marked</p>
            </div>
            {p.slotCount > 0 && <span className="text-xs">✓</span>}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
