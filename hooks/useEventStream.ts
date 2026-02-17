'use client'

import { useEffect, useRef } from 'react'

interface EventStreamHandlers {
  onAvailabilityUpdate?: (data: {
    participantId: string
    participantName: string
    slotCount: number
  }) => void
  onParticipantJoined?: (data: { participant: { id: string; name: string } }) => void
  onConnected?: () => void
}

export function useEventStream(eventSlug: string, handlers: EventStreamHandlers) {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    const source = new EventSource(`/api/events/${eventSlug}/stream`)

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        switch (data.type) {
          case 'connected':
            handlersRef.current.onConnected?.()
            break
          case 'availability_updated':
            handlersRef.current.onAvailabilityUpdate?.(data)
            break
          case 'participant_joined':
            handlersRef.current.onParticipantJoined?.(data)
            break
        }
      } catch {
        // Ignore parse errors
      }
    }

    source.onerror = () => {
      // EventSource will auto-reconnect
    }

    return () => {
      source.close()
    }
  }, [eventSlug])
}
