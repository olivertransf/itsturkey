import { useCallback } from 'react'
import { mailman } from '@utils/helpers'
import type { FriendPresenceActivity } from '@utils/friends/friendPresence'
import { useVisibleInterval } from '@utils/useVisibleInterval'

const PRESENCE_INTERVAL_MS = 45000

export function usePresenceHeartbeat(activity: FriendPresenceActivity, enabled = true) {
  const tick = useCallback(() => {
    void mailman('users/presence', 'POST', JSON.stringify({ activity }))
  }, [activity])

  useVisibleInterval(tick, PRESENCE_INTERVAL_MS, enabled)
}
