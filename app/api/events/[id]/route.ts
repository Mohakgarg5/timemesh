import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTimeSlots } from '@/lib/utils'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const dates = JSON.parse(event.dates) as string[]
    const timeSlots = generateTimeSlots(event.timeStart, event.timeEnd, event.slotMinutes)

    // Build heatmap data
    const heatmap: Record<string, { count: number; participants: { name: string; priority: string }[] }> = {}

    for (const date of dates) {
      for (const slot of timeSlots) {
        const key = `${date}|${slot}`
        heatmap[key] = { count: 0, participants: [] }
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

    return NextResponse.json({
      event: {
        id: event.id,
        slug: event.slug,
        name: event.name,
        description: event.description,
        dates,
        timeStart: event.timeStart,
        timeEnd: event.timeEnd,
        slotMinutes: event.slotMinutes,
        timezone: event.timezone,
        expiresAt: event.expiresAt,
        createdAt: event.createdAt,
      },
      participants: event.participants.map((p) => ({
        id: p.id,
        name: p.name,
        timezone: p.timezone,
        slotCount: event.availabilities.filter((a) => a.participantId === p.id).length,
      })),
      heatmap,
      timeSlots,
    })
  } catch (error) {
    console.error('Failed to get event:', error)
    return NextResponse.json({ error: 'Failed to get event' }, { status: 500 })
  }
}
