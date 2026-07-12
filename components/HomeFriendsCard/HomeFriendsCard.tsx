import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@components/system'
import { PaperAirplaneIcon } from '@heroicons/react/outline'
import { defaultQuickDuelBody } from '@utils/defaultQuickDuelBody'
import { mailman, showToast } from '@utils/helpers'
import { friendIsInGame, friendPresenceLabel, sortFriendsByPresence } from '@utils/friends/friendPresence'
import type { FriendRow } from '@utils/friends/friendPresence'
import { usePresenceHeartbeat } from '@utils/hooks/usePresenceHeartbeat'
import { useVisibleInterval } from '@utils/useVisibleInterval'
import StyledHomeFriendsCard from './HomeFriendsCard.Styled'

const HomeFriendsCard: FC = () => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [friends, setFriends] = useState<FriendRow[] | null>(null)
  const [invitingFriendId, setInvitingFriendId] = useState<string | null>(null)
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

  const inviteFriend = useCallback(
    async (friend: FriendRow) => {
      if (!session?.user?.id) {
        showToast('error', 'Sign in to invite friends')
        return
      }

      setInvitingFriendId(friend.id)
      try {
        const created = await mailman('duels', 'POST', JSON.stringify(defaultQuickDuelBody()))
        if (created?.error) {
          showToast('error', created.error.message)
          return
        }

        const shortCode = typeof created.shortCode === 'string' ? created.shortCode.trim() : ''
        const fallbackId = created._id != null ? String(created._id) : ''
        const inviteSegment = shortCode || fallbackId
        if (!inviteSegment) {
          showToast('error', 'Could not create duel — try again')
          return
        }

        const inviteRes = await mailman(
          `duels/${encodeURIComponent(inviteSegment)}/invite-friend`,
          'POST',
          JSON.stringify({ peerId: friend.id })
        )
        if (inviteRes?.error) {
          showToast('error', inviteRes.error.message)
          await router.push(`/duel/${encodeURIComponent(inviteSegment)}`)
          return
        }

        showToast('success', `Invited ${friend.name}`)
        await router.push(`/duel/${encodeURIComponent(inviteSegment)}`)
      } finally {
        setInvitingFriendId(null)
      }
    },
    [router, session?.user?.id]
  )

  if (!isAuthed) return null

  const preview = friends?.slice(0, 12) ?? null
  const activeCount = friends?.filter((f) => f.online).length ?? 0
  const inGameCount = friends?.filter((f) => friendIsInGame(f)).length ?? 0

  return (
    <StyledHomeFriendsCard>
      <div className="friends-card-head">
        <div className="friends-card-title-wrap">
          <h3 className="friends-card-title">Friends</h3>
          <div className="friends-card-summary">
            {friends === null ? (
              <span>Loading…</span>
            ) : friends.length === 0 ? (
              <span>No friends yet</span>
            ) : (
              <span>
                {activeCount} active
                {inGameCount > 0 ? ` · ${inGameCount} in a game` : ''}
              </span>
            )}
          </div>
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
          <div className="friends-skel" />
        </div>
      ) : friends.length === 0 ? (
        <p className="friends-card-empty">
          Add players from{' '}
          <Link href="/friends">
            <a>Friends</a>
          </Link>{' '}
          to see who is active and invite them to a duel.
        </p>
      ) : (
        <ul className="friends-card-list">
          {preview?.map((friend) => {
            const inGame = friendIsInGame(friend)
            return (
              <li key={friend.id} className="friends-card-row">
                <div className="friends-card-main">
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
                </div>
                <Button
                  variant="solidGray"
                  size="sm"
                  disabled={invitingFriendId === friend.id}
                  isLoading={invitingFriendId === friend.id}
                  spinnerSize={16}
                  onClick={() => void inviteFriend(friend)}
                >
                  <span className="friends-invite-label">
                    <PaperAirplaneIcon />
                    Invite
                  </span>
                </Button>
              </li>
            )
          })}
        </ul>
      )}

      {friends && friends.length > 12 ? (
        <Link href="/friends">
          <a className="friends-card-more">View all {friends.length} friends</a>
        </Link>
      ) : null}
    </StyledHomeFriendsCard>
  )
}

export default HomeFriendsCard
