'use client'

import { useState, useCallback, useRef, Fragment } from 'react'
import { motion } from 'framer-motion'
import { cn, formatTime, formatDateShort } from '@/lib/utils'
import type { Priority } from '@/lib/algorithm'

interface TimeGridProps {
  dates: string[]
  timeSlots: string[]
  selections: Map<string, Priority>
  onSelectionChange: (s: Map<string, Priority>) => void
  currentPriority: Priority
  heatmapData?: Map<string, { count: number; total: number; participants: { name: string; priority: string }[] }>
  mode: 'edit' | 'view'
}

const priorityColors: Record<Priority, string> = {
  preferred: 'bg-emerald-200 border-emerald-400',
  available: 'bg-violet-200 border-violet-400',
  if_needed: 'bg-amber-200 border-amber-400',
}

function getHeatmapColor(count: number, total: number): string {
  if (!count || !total) return 'bg-stone-100'
  const r = count / total
  if (r === 1)   return 'bg-gradient-to-br from-violet-500 to-pink-500 animate-glow-pulse'
  if (r >= 0.75) return 'bg-violet-500'
  if (r >= 0.5)  return 'bg-violet-400'
  if (r >= 0.25) return 'bg-violet-300'
  return 'bg-violet-200'
}

export function TimeGrid({ dates, timeSlots, selections, onSelectionChange, currentPriority, heatmapData, mode }: TimeGridProps) {
  const [paintState, setPaintState] = useState<'idle' | 'painting' | 'erasing'>('idle')
  const selRef = useRef(selections)
  selRef.current = selections
  const [hovered, setHovered] = useState<string | null>(null)

  const down = useCallback((key: string) => {
    if (mode !== 'edit') return
    const cur = selRef.current.get(key)
    const next = new Map(selRef.current)
    if (cur === currentPriority) { next.delete(key); setPaintState('erasing') }
    else { next.set(key, currentPriority); setPaintState('painting') }
    onSelectionChange(next)
  }, [mode, currentPriority, onSelectionChange])

  const enter = useCallback((key: string) => {
    if (mode !== 'edit' || paintState === 'idle') return
    const next = new Map(selRef.current)
    if (paintState === 'erasing') next.delete(key)
    else next.set(key, currentPriority)
    onSelectionChange(next)
  }, [mode, paintState, currentPriority, onSelectionChange])

  const totalP = heatmapData ? Math.max(...Array.from(heatmapData.values()).map(d => d.total), 1) : 1

  return (
    <div className="select-none" onPointerUp={() => setPaintState('idle')} onPointerLeave={() => setPaintState('idle')}>
      <div className="overflow-x-auto">
      <div className="grid gap-[2px] min-w-fit" style={{ gridTemplateColumns: `48px repeat(${dates.length}, minmax(40px, 1fr))`, touchAction: 'none' }}>

        {/* Header */}
        <div className="h-12" />
        {dates.map(d => (
          <div key={d} className="h-12 flex items-center justify-center px-1 text-center">
            <span className="text-[11px] font-bold text-stone-500 leading-tight">{formatDateShort(d)}</span>
          </div>
        ))}

        {/* Rows — Fragment key fixes React missing-key warning */}
        {timeSlots.map(slot => (
          <Fragment key={slot}>
            <div className="h-8 flex items-center justify-end pr-2">
              <span className="text-[10px] font-medium text-stone-400">{formatTime(slot)}</span>
            </div>
            {dates.map(date => {
              const key = `${date}|${slot}`
              const sel = selections.get(key)
              const heat = heatmapData?.get(key)
              return (
                <div
                  key={key}
                  onPointerDown={e => { e.preventDefault(); down(key) }}
                  onPointerEnter={() => { enter(key); setHovered(key) }}
                  onPointerLeave={() => setHovered(null)}
                  className={cn(
                    'h-8 rounded border cursor-pointer relative transition-all duration-100',
                    mode === 'edit' && !sel  && 'bg-stone-100 border-transparent hover:bg-violet-100 hover:border-violet-200',
                    mode === 'edit' && sel   && priorityColors[sel],
                    mode === 'view' && 'border-transparent',
                    mode === 'view' && heat  && getHeatmapColor(heat.count, totalP),
                    mode === 'view' && !heat && 'bg-stone-100'
                  )}
                >
                  {mode === 'view' && heat && heat.count > 0 && (
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-sm">
                      {heat.count}
                    </span>
                  )}

                  {/* Tooltip — fixed: opens upward with z-index, no overflow */}
                  {hovered === key && mode === 'view' && heat && heat.count > 0 && (
                    <div className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 z-50 pointer-events-none w-max max-w-[180px]">
                      <div className="bg-white border border-stone-200 rounded-xl shadow-xl px-3 py-2 text-xs">
                        <p className="font-bold text-stone-700 mb-1">{heat.count}/{totalP} available</p>
                        {heat.participants.map(p => (
                          <p key={p.name} className="text-stone-500 truncate">
                            {p.name}{' '}
                            <span className={cn('font-semibold',
                              p.priority === 'preferred' && 'text-emerald-600',
                              p.priority === 'available'  && 'text-violet-600',
                              p.priority === 'if_needed'  && 'text-amber-600'
                            )}>({p.priority.replace('_', ' ')})</span>
                          </p>
                        ))}
                      </div>
                      {/* Arrow */}
                      <div className="w-2 h-2 bg-white border-b border-r border-stone-200 rotate-45 mx-auto -mt-1" />
                    </div>
                  )}
                </div>
              )
            })}
          </Fragment>
        ))}
      </div>
      </div>
    </div>
  )
}

export function PriorityToolbar({ currentPriority, onPriorityChange }: { currentPriority: Priority; onPriorityChange: (p: Priority) => void }) {
  const opts: { value: Priority; label: string; emoji: string; active: string }[] = [
    { value: 'preferred', label: 'Preferred', emoji: '⭐', active: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    { value: 'available', label: 'Available',  emoji: '✓',  active: 'bg-violet-100 text-violet-700 border-violet-300' },
    { value: 'if_needed', label: 'If Needed',  emoji: '⚡', active: 'bg-amber-100 text-amber-700 border-amber-300' },
  ]
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map(o => (
        <button key={o.value} onClick={() => onPriorityChange(o.value)}
          className={cn(
            'px-4 py-2 rounded-xl border text-sm font-semibold transition-all duration-150 cursor-pointer',
            currentPriority === o.value ? o.active : 'border-stone-200 text-stone-500 bg-white hover:bg-stone-50'
          )}
        >
          {o.emoji} {o.label}
        </button>
      ))}
    </div>
  )
}
