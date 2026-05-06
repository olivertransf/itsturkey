import type Pusher from 'pusher-js'
import { useEffect, useState } from 'react'
import { getPusherBrowserClient } from './pusherClient'

const subscribers = new Set<(ok: boolean) => void>()
let hooksInstalled = false
let cachedOk = false

function emit(ok: boolean) {
  cachedOk = ok
  subscribers.forEach((fn) => fn(ok))
}

function sync(client: Pusher) {
  const ok = client.connection.state === 'connected'
  if (ok !== cachedOk) emit(ok)
}

function attachHooks(client: Pusher) {
  if (hooksInstalled) return
  hooksInstalled = true
  const onAny = () => sync(client)
  client.connection.bind('connected', onAny)
  client.connection.bind('disconnected', onAny)
  client.connection.bind('unavailable', onAny)
  client.connection.bind('failed', onAny)
}

/**
 * True when the shared Pusher client reports connected state (listeners deduped).
 */
export function usePusherRealtimeHealthy(): boolean {
  const [ok, setOk] = useState(() => cachedOk)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const client = getPusherBrowserClient()
    if (!client) {
      setOk(false)
      return
    }

    attachHooks(client)
    subscribers.add(setOk)
    sync(client)

    return () => {
      subscribers.delete(setOk)
    }
  }, [])

  return ok
}
