import { useCallback } from 'react'
import { mailman } from '@utils/helpers'
import type { FriendPresenceActivity, PresenceSession } from '@utils/friends/friendPresence'
import { useVisibleInterval } from '@utils/useVisibleInterval'

const PRESENCE_INTERVAL_MS = 45000

export function usePresenceHeartbeat(
  activity: FriendPresenceActivity,
  enabled = true,
  session?: PresenceSession | null
) {
  const sessionKind = session?.kind
  const sessionId = session?.id

  const tick = useCallback(() => {
    const payload: { activity: FriendPresenceActivity; presenceSession?: PresenceSession } = {
      activity,
    }
    if (sessionKind && sessionId && (activity === 'in_game' || activity === 'in_duel')) {
      payload.presenceSession = { kind: sessionKind, id: sessionId }
    }
    void mailman('users/presence', 'POST', JSON.stringify(payload))
  }, [activity, sessionKind, sessionId])

  useVisibleInterval(tick, PRESENCE_INTERVAL_MS, enabled)
}
