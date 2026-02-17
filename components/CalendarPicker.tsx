'use client'

import { useState, useCallback } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, isBefore } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function CalendarPicker({ selectedDates, onDatesChange }: { selectedDates: string[]; onDatesChange: (d: string[]) => void }) {
  const [month, setMonth] = useState(new Date())
  const [dragging, setDragging] = useState(false)
  const [dragMode, setDragMode] = useState<'add' | 'remove'>('add')
  const today = new Date(); today.setHours(0,0,0,0)

  const days: Date[] = []
  let d = startOfWeek(startOfMonth(month))
  while (d <= endOfWeek(endOfMonth(month))) { days.push(d); d = addDays(d,1) }

  const toggle = useCallback((date: Date, force?: 'add'|'remove') => {
    if (isBefore(date, today)) return
    const s = format(date, 'yyyy-MM-dd')
    const mode = force ?? (selectedDates.includes(s) ? 'remove' : 'add')
    if (mode === 'add' && !selectedDates.includes(s)) onDatesChange([...selectedDates, s].sort())
    else if (mode === 'remove') onDatesChange(selectedDates.filter(x => x !== s))
  }, [selectedDates, onDatesChange, today])

  return (
    <div className="select-none" onPointerUp={() => setDragging(false)} onPointerLeave={() => setDragging(false)}>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMonth(subMonths(month, 1))}
          className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-violet-50 text-stone-400 hover:text-violet-600 transition-colors cursor-pointer">
          ‹
        </button>
        <span className="text-sm font-black text-stone-700">{format(month, 'MMMM yyyy')}</span>
        <button onClick={() => setMonth(addMonths(month, 1))}
          className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-violet-50 text-stone-400 hover:text-violet-600 transition-colors cursor-pointer">
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="text-center text-[11px] font-bold text-stone-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        <AnimatePresence mode="popLayout">
          {days.map(date => {
            const past = isBefore(date, today)
            const sel  = selectedDates.includes(format(date, 'yyyy-MM-dd'))
            const inM  = isSameMonth(date, month)
            return (
              <motion.button key={date.toISOString()} type="button" layout
                onPointerDown={e => { e.preventDefault(); if (past) return; const s = format(date,'yyyy-MM-dd'); const m = selectedDates.includes(s)?'remove':'add'; setDragMode(m); setDragging(true); toggle(date,m) }}
                onPointerEnter={() => dragging && toggle(date, dragMode)}
                disabled={past}
                className={cn(
                  'aspect-square rounded-xl text-xs font-bold transition-all duration-100 cursor-pointer flex items-center justify-center',
                  !inM && 'opacity-20',
                  past && 'opacity-20 cursor-not-allowed',
                  sel  && 'bg-violet-600 text-white shadow-md',
                  !sel && !past && 'text-stone-600 hover:bg-violet-50 hover:text-violet-700',
                  isToday(date) && !sel && 'ring-2 ring-violet-300 font-black'
                )}
              >
                {format(date, 'd')}
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>

      {selectedDates.length > 0 && (
        <p className="mt-3 text-xs text-violet-600 font-bold text-center">
          {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected ✓
        </p>
      )}
    </div>
  )
}
