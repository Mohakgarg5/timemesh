import { z } from 'zod'

export const createEventSchema = z.object({
  name: z.string().min(1, 'Event name is required').max(100),
  description: z.string().max(500).optional(),
  dates: z
    .array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .min(1, 'Select at least one date')
    .max(31),
  timeStart: z.string().regex(/^\d{2}:\d{2}$/),
  timeEnd: z.string().regex(/^\d{2}:\d{2}$/),
  slotMinutes: z.number().refine((v) => [15, 30, 60].includes(v)),
  timezone: z.string(),
  expiresAt: z.string().datetime().optional().nullable(),
})

export const submitAvailabilitySchema = z.object({
  participantName: z.string().min(1).max(50),
  timezone: z.string(),
  slots: z.array(
    z.object({
      date: z.string(),
      timeSlot: z.string(),
      priority: z.enum(['available', 'preferred', 'if_needed']),
    })
  ),
})

export type CreateEventInput = z.infer<typeof createEventSchema>
export type SubmitAvailabilityInput = z.infer<typeof submitAvailabilitySchema>
