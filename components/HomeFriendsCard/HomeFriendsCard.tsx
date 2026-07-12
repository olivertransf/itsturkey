import Link from 'next/link'
import { FC, useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { mailman } from '@utils/helpers'
import { friendIsInGame, friendPresenceLabel, sortFriendsByPresence } from '@utils/friends/friendPresence'
import type { FriendRow } from '@utils/friends/friendPresence'
import { usePresenceHeartbeat } from '@utils/hooks/usePresenceHeartbeat'
import { useVisibleInterval } from '@utils/useVisibleInterval'
import StyledHomeFriendsCard from './HomeFriendsCard.Styled'

const HomeFriendsCard: FC = () => {
  const { data: session, status } = useSession()
  const [friends, setFriends] = useState<FriendRow[] | null>(null)
  const isAuthed = status === 'authenticated' && Boolean(session?.user?.id)

  usePresenceHeartbeat('browsing', isAuthed)

  const fetchFriends = useCallback(async () => {
    if (!isAuthed) return
    const res = await mailman('users/friends')
    if (!Array.isArray(res)) return
    setFriends(sortFriendsByPresence(res as FriendRow[]))
  }, [isAuthed])

  useEffect(() => {
    if (!isAuthed) {
      setFriends(null)
      return
    }
    void fetchFriends()
  }, [isAuthed, fetchFriends])

  useVisibleInterval(() => void fetchFriends(), 45000, isAuthed)

  if (!isAuthed) return null

  const preview = friends?.slice(0, 6) ?? null
  const onlineCount = friends?.filter((f) => f.online).length ?? 0
  const inGameCount = friends?.filter((f) => friendIsInGame(f)).length ?? 0

  return (
    <StyledHomeFriendsCard>
      <div className="friends-card-head">
        <div className="friends-card-summary">
          {friends === null ? (
            <span>Loading friends…</span>
          ) : friends.length === 0 ? (
            <span>No friends yet</span>
          ) : (
            <span>
              {onlineCount} online
              {inGameCount > 0 ? ` · ${inGameCount} in a game` : ''}
            </span>
          )}
        </div>
        <Link href="/friends">
          <a className="friends-card-link">Manage</a>
        </Link>
      </div>

      {friends === null ? (
        <div className="friends-card-loading" aria-hidden>
          <div className="friends-skel" />
          <div className="friends-skel" />
          <div className="friends-skel" />
        </div>
      ) : friends.length === 0 ? (
        <p className="friends-card-empty">
          Add players from{' '}
          <Link href="/friends">
            <a>Friends</a>
          </Link>{' '}
          to see who is active.
        </p>
      ) : (
        <ul className="friends-card-list">
          {preview?.map((friend) => {
            const inGame = friendIsInGame(friend)
            return (
              <li key={friend.id} className="friends-card-row">
                <Link href={`/user/${encodeURIComponent(friend.id)}`}>
                  <a className="friends-card-name">{friend.name}</a>
                </Link>
                <div className="friends-card-status">
                  <span
                    className={`status-dot ${
                      inGame
                        ? 'status-dot--active'
                        : friend.online
                          ? 'status-dot--online'
                          : 'status-dot--offline'
                    }`}
                    aria-hidden
                  />
                  <span className={inGame ? 'status-text--active' : undefined}>
                    {friendPresenceLabel(friend)}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {friends && friends.length > 6 ? (
        <Link href="/friends">
          <a className="friends-card-more">View all {friends.length} friends</a>
        </Link>
      ) : null}
    </StyledHomeFriendsCard>
  )
}

export default HomeFriendsCard
