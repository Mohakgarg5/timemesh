import { customAlphabet } from 'nanoid'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parse } from 'date-fns'

const nanoid = customAlphabet('abcdefghkmnpqrstuvwxyz23456789', 8)

export function generateSlug(): string {
  return nanoid()
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function generateTimeSlots(
  start: string,
  end: string,
  intervalMinutes: number
): string[] {
  const slots: string[] = []
  const [startH, startM] = start.split(':').map(Number)
  const [endH, endM] = end.split(':').map(Number)
  const startMin = startH * 60 + startM
  const endMin = endH * 60 + endM

  for (let m = startMin; m < endMin; m += intervalMinutes) {
    const h = Math.floor(m / 60)
    const min = m % 60
    slots.push(`${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`)
  }

  return slots
}

export function formatTime(time: string): string {
  const date = parse(time, 'HH:mm', new Date())
  return format(date, 'h:mm a')
}

export function formatSlotRange(startSlot: string, endSlot: string): string {
  return `${formatTime(startSlot)} - ${formatTime(endSlot)}`
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return format(date, 'EEE, MMM d')
}

export function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return format(date, 'EEEE, MMMM d, yyyy')
}
