export type Priority = 'preferred' | 'available' | 'if_needed'

export interface AvailabilityRecord {
  participantId: string
  participantName: string
  date: string
  timeSlot: string
  priority: Priority
}

export interface SlotScore {
  date: string
  timeSlot: string
  totalCount: number
  preferredCount: number
  availableCount: number
  ifNeededCount: number
  score: number
  participants: string[]
  missing: string[]
  isPerfectMatch: boolean
}

export interface RankedTimeBlock {
  rank: number
  date: string
  startSlot: string
  endSlot: string
  slotCount: number
  avgScore: number
  totalScore: number
  minParticipants: number
  maxParticipants: number
  participants: string[]
  missing: string[]
  isPerfectMatch: boolean
}

const WEIGHTS: Record<Priority, number> = {
  preferred: 3,
  available: 2,
  if_needed: 1,
}

function scoreSingleSlot(
  date: string,
  timeSlot: string,
  records: AvailabilityRecord[],
  allParticipantNames: string[]
): SlotScore {
  const slotRecords = records.filter(
    (r) => r.date === date && r.timeSlot === timeSlot
  )

  const preferredCount = slotRecords.filter((r) => r.priority === 'preferred').length
  const availableCount = slotRecords.filter((r) => r.priority === 'available').length
  const ifNeededCount = slotRecords.filter((r) => r.priority === 'if_needed').length

  const score =
    preferredCount * WEIGHTS.preferred +
    availableCount * WEIGHTS.available +
    ifNeededCount * WEIGHTS.if_needed

  const participants = [...new Set(slotRecords.map((r) => r.participantName))]
  const missing = allParticipantNames.filter((n) => !participants.includes(n))

  return {
    date,
    timeSlot,
    totalCount: participants.length,
    preferredCount,
    availableCount,
    ifNeededCount,
    score,
    participants,
    missing,
    isPerfectMatch: missing.length === 0 && allParticipantNames.length > 0,
  }
}

export function findBestTimes(
  records: AvailabilityRecord[],
  allParticipantNames: string[],
  timeSlots: string[],
  options: { minDurationSlots?: number; topN?: number } = {}
): RankedTimeBlock[] {
  const { minDurationSlots = 1, topN = 10 } = options

  const dates = [...new Set(records.map((r) => r.date))].sort()

  // Score every slot
  const slotScores: Map<string, SlotScore> = new Map()
  for (const date of dates) {
    for (const slot of timeSlots) {
      const key = `${date}|${slot}`
      slotScores.set(key, scoreSingleSlot(date, slot, records, allParticipantNames))
    }
  }

  // Find contiguous blocks on each date
  const blocks: RankedTimeBlock[] = []

  for (const date of dates) {
    const dateSlots = timeSlots
      .map((slot) => slotScores.get(`${date}|${slot}`))
      .filter((s): s is SlotScore => s !== undefined && s.totalCount > 0)

    if (dateSlots.length === 0) continue

    // Find contiguous runs
    let blockStart = 0
    while (blockStart < dateSlots.length) {
      let blockEnd = blockStart + 1

      // Extend the block while slots are contiguous in the timeSlots array
      while (blockEnd < dateSlots.length) {
        const prevIdx = timeSlots.indexOf(dateSlots[blockEnd - 1].timeSlot)
        const currIdx = timeSlots.indexOf(dateSlots[blockEnd].timeSlot)
        if (currIdx !== prevIdx + 1) break
        blockEnd++
      }

      const blockSlots = dateSlots.slice(blockStart, blockEnd)

      if (blockSlots.length >= minDurationSlots) {
        const totalScore = blockSlots.reduce((sum, s) => sum + s.score, 0)
        const allParticipantsInBlock = [
          ...new Set(blockSlots.flatMap((s) => s.participants)),
        ]
        const allMissing = [
          ...new Set(
            allParticipantNames.filter(
              (n) => !blockSlots.every((s) => s.participants.includes(n))
            )
          ),
        ]

        blocks.push({
          rank: 0,
          date,
          startSlot: blockSlots[0].timeSlot,
          endSlot: blockSlots[blockSlots.length - 1].timeSlot,
          slotCount: blockSlots.length,
          avgScore: totalScore / blockSlots.length,
          totalScore,
          minParticipants: Math.min(...blockSlots.map((s) => s.totalCount)),
          maxParticipants: Math.max(...blockSlots.map((s) => s.totalCount)),
          participants: allParticipantsInBlock,
          missing: allMissing,
          isPerfectMatch:
            allMissing.length === 0 && allParticipantNames.length > 0,
        })
      }

      blockStart = blockEnd
    }
  }

  // Sort: most participants -> highest score -> fewest if_needed
  blocks.sort((a, b) => {
    if (b.minParticipants !== a.minParticipants)
      return b.minParticipants - a.minParticipants
    if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore
    return b.slotCount - a.slotCount
  })

  // Assign ranks and return top N
  return blocks.slice(0, topN).map((block, i) => ({ ...block, rank: i + 1 }))
}

export function getHeatmapData(
  records: AvailabilityRecord[],
  dates: string[],
  timeSlots: string[],
  allParticipantNames: string[]
): Map<string, SlotScore> {
  const heatmap = new Map<string, SlotScore>()
  for (const date of dates) {
    for (const slot of timeSlots) {
      const key = `${date}|${slot}`
      heatmap.set(key, scoreSingleSlot(date, slot, records, allParticipantNames))
    }
  }
  return heatmap
}
