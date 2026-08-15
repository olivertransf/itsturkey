import { useCallback, useEffect, useRef } from 'react'
import { mailman } from '@utils/helpers'
import type { FriendPresenceActivity, PresenceSession } from '@utils/friends/friendPresence'

const SESSION_INTERVAL_MS = 15_000
const BROWSING_INTERVAL_MS = 20_000

function sessionPayload(session?: PresenceSession | null): PresenceSession | undefined {
  if (!session?.kind || !session.id) return undefined
  const next: PresenceSession = { kind: session.kind, id: session.id }
  if (session.mode) next.mode = session.mode
  if (session.duelStatus) next.duelStatus = session.duelStatus
  return next
}

export function usePresenceHeartbeat(
  activity: FriendPresenceActivity,
  enabled = true,
  session?: PresenceSession | null
) {
  const sessionRef = useRef(session)
  sessionRef.current = session
  const activityRef = useRef(activity)
  activityRef.current = activity

  const post = useCallback((act: FriendPresenceActivity, sess?: PresenceSession | null, beacon = false) => {
    const payload: { activity: FriendPresenceActivity; presenceSession?: PresenceSession } = {
      activity: act,
    }
    const keep = sessionPayload(sess)
    if (keep && (act === 'in_game' || act === 'in_duel' || act === 'spectating')) {
      payload.presenceSession = keep
    }
    const body = JSON.stringify(payload)
    if (beacon && typeof window !== 'undefined') {
      try {
        const blob = new Blob([body], { type: 'application/json' })
        if (navigator.sendBeacon('/api/users/presence', blob)) return
      } catch {
        /* fall through */
      }
      void fetch('/api/users/presence', {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        credentials: 'include',
      })
      return
    }
    void mailman('users/presence', 'POST', body)
  }, [])

  useEffect(() => {
    if (!enabled) return

    const inSession = activity === 'in_game' || activity === 'in_duel' || activity === 'spectating'
    const intervalMs = inSession ? SESSION_INTERVAL_MS : BROWSING_INTERVAL_MS

    const tick = () => {
      const hidden = typeof document !== 'undefined' && document.visibilityState === 'hidden'
      const current = activityRef.current
      const act =
        hidden && (current === 'browsing' || current === 'idle') ? 'idle' : current
      post(act, sessionRef.current)
    }

    tick()
    const id = window.setInterval(tick, intervalMs)
    document.addEventListener('visibilitychange', tick)

    const onLeave = () => post('browsing', null, true)
    window.addEventListener('pagehide', onLeave)
    window.addEventListener('beforeunload', onLeave)

    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
      window.removeEventListener('pagehide', onLeave)
      window.removeEventListener('beforeunload', onLeave)
    }
  }, [enabled, activity, session?.kind, session?.id, session?.mode, session?.duelStatus, post])
}
