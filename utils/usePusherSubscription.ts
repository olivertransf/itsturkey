import { useEffect, useRef } from 'react'
import { getPusherBrowserClient } from './pusherClient'

/** Subscribe to a channel event; cleans up on unmount or when deps change. */
export function usePusherSubscription(
  channelName: string | null | undefined,
  eventName: string,
  onEvent: (data: unknown) => void,
  enabled = true
): void {
  const handlerRef = useRef(onEvent)
  handlerRef.current = onEvent

  useEffect(() => {
    if (!enabled || !channelName || typeof window === 'undefined') return

    const client = getPusherBrowserClient()
    if (!client) return

    const channel = client.subscribe(channelName)
    const listener = (payload: unknown) => handlerRef.current(payload)
    channel.bind(eventName, listener)

    return () => {
      channel.unbind(eventName, listener)
      try {
        client.unsubscribe(channelName)
      } catch {
        /* duplicate unsubscribe safe */
      }
    }
  }, [channelName, eventName, enabled])
}
