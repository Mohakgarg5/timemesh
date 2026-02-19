'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TimeGrid, PriorityToolbar } from '@/components/TimeGrid'
import { ParticipantList } from '@/components/ParticipantList'
import { ShareModal } from '@/components/ShareModal'
import { Celebration } from '@/components/Celebration'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import { Input } from '@/components/ui/Input'
import { useEventStream } from '@/hooks/useEventStream'
import type { Priority } from '@/lib/algorithm'

interface EventData { id:string; slug:string; name:string; description:string|null; dates:string[]; timeStart:string; timeEnd:string; slotMinutes:number; timezone:string; expiresAt:string|null }
interface ParticipantData { id:string; name:string; timezone:string; slotCount:number }
interface HeatmapCell { count:number; participants:{name:string;priority:string}[] }
interface Props { event:EventData; participants:ParticipantData[]; heatmap:Record<string,HeatmapCell>; timeSlots:string[] }

export function EventClientView({ event, participants:initP, heatmap:initH, timeSlots }:Props) {
  const [name, setName]           = useState('')
  const [joined, setJoined]       = useState(false)
  const [priority, setPriority]   = useState<Priority>('available')
  const [selections, setSels]     = useState<Map<string,Priority>>(new Map())
  const [participants, setP]      = useState(initP)
  const [heatmap, setHM]          = useState(initH)
  const [saving, setSaving]       = useState(false)
  const [saveMsg, setSaveMsg]     = useState('')
  const [share, setShare]         = useState(false)
  const [confetti, setConfetti]   = useState(false)
  const [tab, setTab]             = useState<'edit'|'view'>('edit')

  useEffect(() => {
    const s = localStorage.getItem(`timemesh_${event.slug}`)
    if (s) { try { const d=JSON.parse(s); setName(d.name); setJoined(true); if(d.selections) setSels(new Map(Object.entries(d.selections))) } catch{} }
  }, [event.slug])

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`/api/events/${event.slug}`)
      if (!r.ok) return
      const d = await r.json()
      setP(d.participants); setHM(d.heatmap)
      const tot = d.participants.length
      if (tot>1 && Object.values(d.heatmap as Record<string,HeatmapCell>).some(c=>c.count===tot)) setConfetti(true)
    } catch {}
  }, [event.slug])

  useEventStream(event.slug, { onAvailabilityUpdate: refresh, onParticipantJoined: refresh })

  const save = async () => {
    if (!name.trim()) return
    setSaving(true); setSaveMsg('')
    const slots = Array.from(selections.entries()).map(([k,priority])=>{ const [date,timeSlot]=k.split('|'); return {date,timeSlot,priority} })
    try {
      const r = await fetch(`/api/events/${event.slug}/availability`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ participantName:name.trim(), timezone:Intl.DateTimeFormat().resolvedOptions().timeZone, slots }),
      })
      if (!r.ok) throw new Error()
      const obj:Record<string,string>={}; selections.forEach((v,k)=>{obj[k]=v})
      localStorage.setItem(`timemesh_${event.slug}`, JSON.stringify({name:name.trim(),selections:obj}))
      setSaveMsg('✓ Saved!'); setTimeout(()=>setSaveMsg(''),3000); refresh()
    } catch { setSaveMsg('Failed to save. Try again.') }
    finally { setSaving(false) }
  }

  const totalP = participants.length
  const hmGrid = new Map<string,{count:number;total:number;participants:{name:string;priority:string}[]}>()
  Object.entries(heatmap).forEach(([k,c])=>hmGrid.set(k,{...c,total:totalP}))

  return (
    <div className="min-h-screen py-4 md:py-8 px-3 md:px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div className="mb-8" initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-stone-900">{event.name}</h1>
              {event.description && <p className="text-stone-500 text-sm mt-1 max-w-lg">{event.description}</p>}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-[11px] font-semibold bg-violet-50 text-violet-600 border border-violet-200 rounded-full px-2.5 py-0.5">
                  {event.dates.length} date{event.dates.length!==1?'s':''}
                </span>
                <span className="text-[11px] font-semibold bg-stone-100 text-stone-500 border border-stone-200 rounded-full px-2.5 py-0.5">
                  {event.timezone}
                </span>
              </div>
            </div>
            <NeonButton variant="purple" size="sm" onClick={()=>setShare(true)}>
              🔗 Share Event
            </NeonButton>
          </div>
        </motion.div>

        {/* Name entry */}
        <AnimatePresence>
          {!joined && (
            <motion.div initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.96}} className="max-w-md mx-auto mb-8">
              <GlassCard glow="cyan">
                <div className="text-center mb-4">
                  <span className="text-3xl">👋</span>
                  <h2 className="text-base font-black text-stone-800 mt-2">What&apos;s your name?</h2>
                  <p className="text-xs text-stone-400 mt-0.5">So others know who&apos;s available</p>
                </div>
                <div className="flex gap-3">
                  <Input placeholder="Your name…" value={name} onChange={e=>setName(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&name.trim()&&setJoined(true)} className="flex-1" />
                  <NeonButton variant="cyan" onClick={()=>name.trim()&&setJoined(true)} disabled={!name.trim()}>
                    Join →
                  </NeonButton>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main */}
        {joined && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">

            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex bg-stone-100 rounded-2xl p-1 gap-1 w-full sm:w-auto sm:inline-flex">
                {(['edit','view'] as const).map(t => (
                  <button key={t} onClick={()=>setTab(t)}
                    className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                      tab===t ? 'bg-violet-600 text-white shadow-sm' : 'text-stone-500 hover:text-violet-600'
                    }`}>
                    {t==='edit' ? '🎨 Mark Availability' : '🔥 Group Heatmap'}
                  </button>
                ))}
              </div>

              {tab==='edit' && <PriorityToolbar currentPriority={priority} onPriorityChange={setPriority} />}

              <GlassCard animate={false} className="!p-2 md:!p-4">
                <TimeGrid dates={event.dates} timeSlots={timeSlots} selections={selections}
                  onSelectionChange={setSels} currentPriority={priority}
                  heatmapData={tab==='view'?hmGrid:undefined} mode={tab} />
              </GlassCard>

              {tab==='edit' && (
                <NeonButton variant="cyan" size="lg" fullWidth onClick={save} disabled={saving}>
                  {saving ? 'Saving…' : `💾 Save Availability (${selections.size} slots)`}
                </NeonButton>
              )}

              {saveMsg && (
                <motion.p initial={{opacity:0}} animate={{opacity:1}}
                  className={`text-sm text-center font-bold ${saveMsg.startsWith('✓')?'text-emerald-600':'text-red-500'}`}>
                  {saveMsg}
                </motion.p>
              )}

              {totalP>0 && (
                <div className="text-center">
                  <NeonButton variant="pink" size="sm" onClick={()=>window.open(`/event/${event.slug}/results`,'_blank')}>
                    🏆 View Best Times &amp; Results ↗
                  </NeonButton>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <GlassCard animate={false}>
                <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3">
                  👥 Participants ({totalP})
                </h3>
                <ParticipantList participants={participants} />
              </GlassCard>

              {tab==='view' && totalP>0 && (
                <GlassCard animate={false}>
                  <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3">🗺️ Legend</h3>
                  <div className="space-y-2">
                    {[
                      {bg:'bg-violet-200', l:'1 person'},
                      {bg:'bg-violet-300', l:'Some overlap'},
                      {bg:'bg-violet-500', l:'Good overlap'},
                      {bg:'bg-gradient-to-r from-violet-500 to-pink-500', l:'Everyone! 🎉'},
                    ].map(x=>(
                      <div key={x.l} className="flex items-center gap-2">
                        <div className={`w-6 h-4 rounded ${x.bg} shrink-0`} />
                        <span className="text-xs text-stone-500">{x.l}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <ShareModal isOpen={share} onClose={()=>setShare(false)} eventSlug={event.slug} eventName={event.name} />
      <Celebration trigger={confetti} />
    </div>
  )
}
