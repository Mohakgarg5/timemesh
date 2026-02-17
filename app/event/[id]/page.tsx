import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { generateTimeSlots } from '@/lib/utils'
import { EventClientView } from '@/components/EventClientView'

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const event = await prisma.event.findUnique({
    where: { slug: id },
    include: {
      participants: {
        orderBy: { createdAt: 'asc' },
      },
      availabilities: true,
    },
  })

  if (!event) {
    notFound()
  }

  const dates = JSON.parse(event.dates) as string[]
  const timeSlots = generateTimeSlots(event.timeStart, event.timeEnd, event.slotMinutes)

  // Build heatmap
  const heatmap: Record<string, { count: number; participants: { name: string; priority: string }[] }> = {}
  for (const date of dates) {
    for (const slot of timeSlots) {
      heatmap[`${date}|${slot}`] = { count: 0, participants: [] }
    }
  }

  for (const avail of event.availabilities) {
    const key = `${avail.date}|${avail.timeSlot}`
    const participant = event.participants.find((p) => p.id === avail.participantId)
    if (heatmap[key] && participant) {
      heatmap[key].count++
      heatmap[key].participants.push({
        name: participant.name,
        priority: avail.priority,
      })
    }
  }

  const participantsData = event.participants.map((p) => ({
    id: p.id,
    name: p.name,
    timezone: p.timezone,
    slotCount: event.availabilities.filter((a) => a.participantId === p.id).length,
  }))

  return (
    <EventClientView
      event={{
        id: event.id,
        slug: event.slug,
        name: event.name,
        description: event.description,
        dates,
        timeStart: event.timeStart,
        timeEnd: event.timeEnd,
        slotMinutes: event.slotMinutes,
        timezone: event.timezone,
        expiresAt: event.expiresAt?.toISOString() || null,
      }}
      participants={participantsData}
      heatmap={heatmap}
      timeSlots={timeSlots}
    />
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const event = await prisma.event.findUnique({ where: { slug: id } })

  if (!event) {
    return { title: 'Event Not Found' }
  }

  return {
    title: `${event.name} - TimeMesh`,
    description: event.description || `Mark your availability for ${event.name}`,
  }
}
