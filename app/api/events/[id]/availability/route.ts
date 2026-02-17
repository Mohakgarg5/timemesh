import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { submitAvailabilitySchema } from '@/lib/validators'
import { broadcast } from '@/lib/sse'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const validated = submitAvailabilitySchema.parse(body)

    // Find event by slug
    const event = await prisma.event.findUnique({
      where: { slug: id },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Upsert participant
    const participant = await prisma.participant.upsert({
      where: {
        eventId_name: {
          eventId: event.id,
          name: validated.participantName,
        },
      },
      update: { timezone: validated.timezone },
      create: {
        eventId: event.id,
        name: validated.participantName,
        timezone: validated.timezone,
      },
    })

    // Replace all availability for this participant in this event
    await prisma.$transaction([
      prisma.availability.deleteMany({
        where: {
          participantId: participant.id,
          eventId: event.id,
        },
      }),
      ...(validated.slots.length > 0
        ? [
            prisma.availability.createMany({
              data: validated.slots.map((slot) => ({
                participantId: participant.id,
                eventId: event.id,
                date: slot.date,
                timeSlot: slot.timeSlot,
                priority: slot.priority,
              })),
            }),
          ]
        : []),
    ])

    // Broadcast update to SSE subscribers
    broadcast(id, {
      type: 'availability_updated',
      participantId: participant.id,
      participantName: participant.name,
      slotCount: validated.slots.length,
    })

    return NextResponse.json({
      participant: {
        id: participant.id,
        name: participant.name,
      },
      slotsCount: validated.slots.length,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input', details: error }, { status: 400 })
    }
    console.error('Failed to submit availability:', error)
    return NextResponse.json({ error: 'Failed to submit availability' }, { status: 500 })
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const event = await prisma.event.findUnique({
      where: { slug: id },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const availabilities = await prisma.availability.findMany({
      where: { eventId: event.id },
      include: { participant: true },
    })

    return NextResponse.json({
      availabilities: availabilities.map((a) => ({
        participantName: a.participant.name,
        date: a.date,
        timeSlot: a.timeSlot,
        priority: a.priority,
      })),
    })
  } catch (error) {
    console.error('Failed to get availability:', error)
    return NextResponse.json({ error: 'Failed to get availability' }, { status: 500 })
  }
}
