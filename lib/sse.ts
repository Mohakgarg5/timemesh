type SendFn = (data: object) => void

const subscribers = new Map<string, Set<SendFn>>()

export function addSubscriber(eventId: string, send: SendFn) {
  if (!subscribers.has(eventId)) {
    subscribers.set(eventId, new Set())
  }
  subscribers.get(eventId)!.add(send)
}

export function removeSubscriber(eventId: string, send: SendFn) {
  subscribers.get(eventId)?.delete(send)
  if (subscribers.get(eventId)?.size === 0) {
    subscribers.delete(eventId)
  }
}

export function broadcast(eventId: string, data: object) {
  subscribers.get(eventId)?.forEach((send) => {
    try {
      send(data)
    } catch {
      // Connection closed, will be cleaned up
    }
  })
}
