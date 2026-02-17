'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { TimeGrid } from '@/components/TimeGrid'
import { BestTimes } from '@/components/BestTimes'
import { ParticipantList } from '@/components/ParticipantList'
import { Celebration } from '@/components/Celebration'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'
import { useEventStream } from '@/hooks/useEventStream'
import type { RankedTimeBlock, Priority } from '@/lib/algorithm'

interface EventData { id:string; slug:string; name:string; description:string|null; dates:string[]; timeStart:string; timeEnd:string; slotMinutes:number; timezone:string }
interface ParticipantData { id:string; name:string; timezone:string; slotCount:number }
interface HeatmapCell { count:number; participants:{name:string;priority:string}[] }

export default function ResultsPage() {
  const { id: slug } = useParams() as { id: string }
  const router = useRouter()
  const [event, setEvent] = useState<EventData|null>(null)
  const [parts, setParts] = useState<ParticipantData[]>([])
  const [heatmap, setHM] = useState<Record<string,HeatmapCell>>({})
  const [slots, setSlots] = useState<string[]>([])
  const [best, setBest] = useState<RankedTimeBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [confetti, setConfetti] = useState(false)

  const load = useCallback(async () => {
    try {
      const [eRes, bRes] = await Promise.all([fetch(`/api/events/${slug}`), fetch(`/api/events/${slug}/best-times`)])
      if (!eRes.ok) { router.push('/'); return }
      const eData = await eRes.json()
      setEvent(eData.event); setParts(eData.participants); setHM(eData.heatmap); setSlots(eData.timeSlots)
      if (bRes.ok) { const bData=await bRes.json(); setBest(bData.bestTimes); if(bData.bestTimes[0]?.isPerfectMatch) setConfetti(true) }
    } catch {} finally { setLoading(false) }
  }, [slug, router])

  useEffect(()=>{ load() },[load])
  useEventStream(slug, { onAvailabilityUpdate: load, onParticipantJoined: load })

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-stone-500 text-sm">Loading results…</p>
      </div>
    </div>
  )
  if (!event) return <div className="min-h-screen flex items-center justify-center"><GlassCard><p className="text-stone-500">Event not found</p></GlassCard></div>

  const total = parts.length
  const hmGrid = new Map<string,{count:number;total:number;participants:{name:string;priority:string}[]}>()
  Object.entries(heatmap).forEach(([k,c])=>hmGrid.set(k,{...c,total}))
  const overlapSlots = Object.values(heatmap).filter(c=>c.count>0).length
  const perfectSlots = Object.values(heatmap).filter(c=>c.count===total&&total>0).length

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div className="mb-8" initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}}>
          <button onClick={()=>router.push(`/event/${slug}`)}
            className="text-stone-400 hover:text-violet-600 text-sm mb-4 inline-block cursor-pointer transition-colors">
            ← Back to Event
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-stone-900">
            🏆 Results for <span className="gradient-text">{event.name}</span>
          </h1>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { emoji:'👥', label:'Participants',      val:total,        bg:'bg-violet-50',  col:'text-violet-600' },
            { emoji:'🎯', label:'Best Options',      val:best.length,  bg:'bg-pink-50',    col:'text-pink-600' },
            { emoji:'🔥', label:'Overlapping Slots', val:overlapSlots, bg:'bg-orange-50',  col:'text-orange-600' },
            { emoji:'✨', label:'Perfect Slots',     val:perfectSlots, bg:'bg-emerald-50', col:'text-emerald-600' },
          ].map((s,i) => (
            <motion.div key={s.label} initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}>
              <GlassCard animate={false} className={`text-center py-4 ${s.bg}`}>
                <div className="text-xl mb-1">{s.emoji}</div>
                <p className={`text-2xl font-black ${s.col}`}>{s.val}</p>
                <p className="text-[11px] text-stone-400 font-semibold mt-0.5">{s.label}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
          <div className="space-y-3">
            <h2 className="text-xs font-black text-stone-400 uppercase tracking-widest">🔥 Group Heatmap</h2>
            <GlassCard animate={false} className="!p-4 overflow-hidden">
              <TimeGrid dates={event.dates} timeSlots={slots} selections={new Map()} onSelectionChange={()=>{}}
                currentPriority={'available' as Priority} heatmapData={hmGrid} mode="view" />
            </GlassCard>
          </div>
          <div className="space-y-5">
            <div>
              <h2 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3">🏆 Best Times</h2>
              <BestTimes bestTimes={best} totalParticipants={total} slotMinutes={event.slotMinutes} />
            </div>
            <GlassCard animate={false}>
              <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3">👥 Participants ({total})</h3>
              <ParticipantList participants={parts} />
            </GlassCard>
            <div className="text-center">
              <NeonButton variant="cyan" size="sm" onClick={()=>router.push(`/event/${slug}`)}>
                Mark Your Availability
              </NeonButton>
            </div>
          </div>
        </div>
      </div>
      <Celebration trigger={confetti} />
    </div>
  )
}
