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

  // Find contiguous blocks at each participation level so that a perfect-match
  // slot nested inside a longer lower-quality run is surfaced as its own block.
  const blocks: RankedTimeBlock[] = []
  const seenBlockKeys = new Set<string>()

  for (const date of dates) {
    // All slots in timeSlot order (including zero-count slots — gaps break runs)
    const allSlots = timeSlots.map((slot) => slotScores.get(`${date}|${slot}`)!)

    // Unique non-zero participant counts, highest first
    const uniqueCounts = [
      ...new Set(allSlots.map((s) => s.totalCount).filter((c) => c > 0)),
    ].sort((a, b) => b - a)

    for (const minCount of uniqueCounts) {
      let i = 0
      while (i < allSlots.length) {
        if (allSlots[i].totalCount < minCount) {
          i++
          continue
        }

        // Extend as long as slots are contiguous AND meet the minCount threshold
        let j = i + 1
        while (j < allSlots.length && allSlots[j].totalCount >= minCount) {
          j++
        }

        const blockSlots = allSlots.slice(i, j)
        const blockKey = `${date}|${blockSlots[0].timeSlot}|${blockSlots[blockSlots.length - 1].timeSlot}`

        if (!seenBlockKeys.has(blockKey) && blockSlots.length >= minDurationSlots) {
          seenBlockKeys.add(blockKey)

          const totalScore = blockSlots.reduce((sum, s) => sum + s.score, 0)
          const allParticipantsInBlock = [
            ...new Set(blockSlots.flatMap((s) => s.participants)),
          ]
          const allMissing = allParticipantNames.filter(
            (n) => !blockSlots.every((s) => s.participants.includes(n))
          )

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

        i = j
      }
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
