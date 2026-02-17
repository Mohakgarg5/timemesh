import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createEventSchema } from '@/lib/validators'
import { generateSlug } from '@/lib/utils'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validated = createEventSchema.parse(body)

    const slug = generateSlug()

    const event = await prisma.event.create({
      data: {
        slug,
        name: validated.name,
        description: validated.description || null,
        dates: JSON.stringify(validated.dates),
        timeStart: validated.timeStart,
        timeEnd: validated.timeEnd,
        slotMinutes: validated.slotMinutes,
        timezone: validated.timezone,
        expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
      },
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input', details: error }, { status: 400 })
    }
    console.error('Failed to create event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
