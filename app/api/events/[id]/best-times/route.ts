import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { findBestTimes, type AvailabilityRecord, type Priority } from '@/lib/algorithm'
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
        participants: true,
        availabilities: {
          include: { participant: true },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const timeSlots = generateTimeSlots(event.timeStart, event.timeEnd, event.slotMinutes)

    const records: AvailabilityRecord[] = event.availabilities.map((a) => ({
      participantId: a.participantId,
      participantName: a.participant.name,
      date: a.date,
      timeSlot: a.timeSlot,
      priority: a.priority as Priority,
    }))

    const allNames = event.participants.map((p) => p.name)

    const bestTimes = findBestTimes(records, allNames, timeSlots, {
      minDurationSlots: 1,
      topN: 10,
    })

    return NextResponse.json({ bestTimes })
  } catch (error) {
    console.error('Failed to get best times:', error)
    return NextResponse.json({ error: 'Failed to get best times' }, { status: 500 })
  }
}
