'use client'

import { motion } from 'framer-motion'
import { cn, formatTime, formatDateFull } from '@/lib/utils'
import type { RankedTimeBlock } from '@/lib/algorithm'

interface BestTimesProps { bestTimes: RankedTimeBlock[]; totalParticipants: number; slotMinutes: number }

export function BestTimes({ bestTimes, totalParticipants, slotMinutes }: BestTimesProps) {
  if (bestTimes.length === 0) {
    return (
      <div className="glass p-8 text-center">
        <p className="text-slate-500">No availability data yet</p>
        <p className="text-slate-400 text-sm mt-1">Best times appear once participants respond</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {bestTimes.map((block, i) => {
        const [h, m] = block.endSlot.split(':').map(Number)
        const endMin = h * 60 + m + slotMinutes
        const endTime = `${Math.floor(endMin / 60).toString().padStart(2, '0')}:${(endMin % 60).toString().padStart(2, '0')}`
        const pct = Math.round((block.minParticipants / totalParticipants) * 100)

        const rankStyle = i === 0
          ? 'bg-amber-50 border-amber-200 text-amber-500'
          : i === 1 ? 'bg-slate-50 border-slate-200 text-slate-500'
          : i === 2 ? 'bg-orange-50 border-orange-200 text-orange-500'
          : 'bg-white border-slate-100 text-slate-300'

        return (
          <motion.div key={`${block.date}-${block.startSlot}`}
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
            className={cn('glass-sm p-4 flex items-start gap-3', block.isPerfectMatch && 'glow-cyan')}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black border shrink-0 ${rankStyle}`}>
              {block.rank}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <p className="font-bold text-slate-800 text-sm">{formatDateFull(block.date)}</p>
                {block.isPerfectMatch && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#EEF0FD] text-[#6374D8] border border-[#D6DAFF]">
                    PERFECT ✨
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs">
                {formatTime(block.startSlot)} – {formatTime(endTime)}
                <span className="text-slate-400 ml-1.5">({block.slotCount * slotMinutes} min)</span>
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    className={cn('h-full rounded-full', block.isPerfectMatch ? 'bg-gradient-to-r from-[#6374D8] to-[#9B8FF0]' : 'bg-[#6374D8]')}
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, delay: i * 0.08 + 0.25 }}
                  />
                </div>
                <span className="text-xs text-slate-400 shrink-0">{block.minParticipants}/{totalParticipants}</span>
              </div>
              {block.missing.length > 0 && (
                <p className="text-[11px] text-slate-400 mt-1.5">Missing: {block.missing.join(', ')}</p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
