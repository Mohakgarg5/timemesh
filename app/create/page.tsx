'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input, TextArea } from '@/components/ui/Input'
import { NeonButton } from '@/components/ui/NeonButton'
import { CalendarPicker } from '@/components/CalendarPicker'
import { cn } from '@/lib/utils'

const timeOptions: string[] = []
for (let h = 0; h < 24; h++)
  for (const m of [0, 30])
    timeOptions.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)

function fmt(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`
}

export default function CreateEventPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [dates, setDates] = useState<string[]>([])
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('17:00')
  const [slot, setSlot] = useState(30)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

  const submit = async () => {
    setErr('')
    if (!name.trim()) return setErr('Please enter an event name')
    if (!dates.length)  return setErr('Please select at least one date')
    if (start >= end)   return setErr('End time must be after start time')
    setBusy(true)
    try {
      const res = await fetch('/api/events', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: desc.trim() || undefined, dates, timeStart: start, timeEnd: end, slotMinutes: slot, timezone: tz }),
      })
      if (!res.ok) throw new Error()
      router.push(`/event/${(await res.json()).event.slug}`)
    } catch { setErr('Something went wrong. Please try again.') }
    finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-xl mx-auto">

        <motion.div className="mb-8" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => router.push('/')}
            className="text-stone-400 hover:text-violet-600 transition-colors text-sm mb-5 inline-flex items-center gap-1 cursor-pointer">
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xl shadow-md">
              🗓️
            </div>
            <div>
              <h1 className="text-2xl font-black text-stone-800">Create Event</h1>
              <p className="text-stone-400 text-sm">Set up and share with participants</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-4">
          <GlassCard>
            <Input label="Event Name" placeholder="Team Sync, Coffee Chat, Project Kickoff…" value={name} onChange={e => setName(e.target.value)} maxLength={100} />
            <div className="mt-4">
              <TextArea label="Description (optional)" placeholder="Any details about the meeting…" value={desc} onChange={e => setDesc(e.target.value)} rows={2} maxLength={500} />
            </div>
          </GlassCard>

          <GlassCard>
            <p className="text-sm font-bold text-stone-500 mb-4">📅 Select Dates</p>
            <CalendarPicker selectedDates={dates} onDatesChange={setDates} />
          </GlassCard>

          <GlassCard>
            <p className="text-sm font-bold text-stone-500 mb-4">🕐 Time Range</p>
            <div className="grid grid-cols-2 gap-3">
              {(['From', 'To'] as const).map((label, idx) => (
                <div key={label}>
                  <label className="block text-xs text-stone-400 mb-1">{label}</label>
                  <select
                    value={idx === 0 ? start : end}
                    onChange={e => idx === 0 ? setStart(e.target.value) : setEnd(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all cursor-pointer"
                  >
                    {timeOptions.map(t => <option key={t} value={t}>{fmt(t)}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <p className="text-xs text-stone-400 mb-2">Slot Duration</p>
              <div className="flex gap-2">
                {[15, 30, 60].map(m => (
                  <button key={m} onClick={() => setSlot(m)}
                    className={cn('flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all cursor-pointer',
                      slot === m ? 'bg-violet-600 text-white border-violet-700 shadow-md' : 'border-stone-200 text-stone-500 bg-white hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200'
                    )}>
                    {m} min
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>

          <GlassCard animate={false}>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-base">🌍</span>
              <span className="text-stone-400">Timezone:</span>
              <span className="text-violet-600 font-semibold">{tz}</span>
            </div>
          </GlassCard>

          {err && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-xl px-4 py-3 text-center">
              {err}
            </motion.div>
          )}

          <NeonButton variant="cyan" size="lg" fullWidth onClick={submit} disabled={busy}>
            {busy ? 'Creating…' : 'Create Event →'}
          </NeonButton>
        </div>
      </div>
    </div>
  )
}
