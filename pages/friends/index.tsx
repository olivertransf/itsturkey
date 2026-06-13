import type { NextPage } from 'next'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { PageBackLink } from '@components/PageBackLink'
import { PageHeader, WidthController } from '@components/layout'
import { Meta } from '@components/Meta'
import { Button, Input } from '@components/system'
import { SkeletonCards } from '@components/skeletons'
import { UserAddIcon } from '@heroicons/react/outline'
import { mailman, showToast } from '@utils/helpers'
import { useVisibleInterval } from '@utils/useVisibleInterval'
import styled from 'styled-components'

type FriendRow = {
  id: string
  name: string
  friendCode?: string
  lastSeenAt?: string | null
  presenceActivity?: string
  online?: boolean
}

const StyledFriendsPage = styled.div`
  padding-bottom: 48px;

  .friends-body {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .friend-add-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: flex-end;
  }

  .friends-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .friend-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 12px;
    background-color: var(--bg-elevated, #2a2a2a);
    border: var(--border-default, 1px solid #333);
  }

  .friend-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .friend-name {
    color: var(--text-primary, #fff);
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .friend-meta {
    font-size: 12px;
    color: var(--text-muted, #9e9e9e);
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    flex-shrink: 0;
  }

  .status-dot--online {
    background: #4ade80;
    box-shadow: 0 0 8px rgba(74, 222, 128, 0.45);
  }

  .status-dot--offline {
    background: #52525b;
  }

  .empty-hint {
    margin: 0;
    font-size: 14px;
    color: var(--text-muted, #9e9e9e);
    line-height: 1.45;
  }
`

function presenceLabel(friend: FriendRow): string {
  if (friend.online) {
    if (friend.presenceActivity === 'in_duel') return 'In a duel'
    if (friend.presenceActivity === 'in_game') return 'In a game'
    return 'Online'
  }
  return 'Offline'
}

const FriendsPage: NextPage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [friends, setFriends] = useState<FriendRow[] | null>(null)
  const [identifier, setIdentifier] = useState('')
  const [busy, setBusy] = useState(false)

  const heartbeat = useCallback(() => {
    if (status !== 'authenticated') return
    void mailman('users/presence', 'POST', JSON.stringify({ activity: 'browsing' }))
  }, [status])

  const fetchFriends = useCallback(async () => {
    const res = await mailman('users/friends')
    if (res?.error) {
      showToast('error', res.error.message)
      return
    }
    if (Array.isArray(res)) setFriends(res as FriendRow[])
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      void router.replace(`/login?callbackUrl=${encodeURIComponent('/friends')}`)
      return
    }
    if (status !== 'authenticated') return
    void heartbeat()
    void fetchFriends()
  }, [status, router, heartbeat, fetchFriends])

  useVisibleInterval(
    () => {
      void heartbeat()
      void fetchFriends()
    },
    45000,
    status === 'authenticated'
  )

  const handleAdd = async () => {
    const id = identifier.trim()
    if (!id) {
      showToast('error', 'Enter a friend code, email, or display name')
      return
    }
    setBusy(true)
    const res = await mailman('users/friends', 'POST', JSON.stringify({ identifier: id }))
    setBusy(false)
    if (res?.error) {
      showToast('error', res.error.message)
      return
    }
    setIdentifier('')
    showToast('success', `Added ${typeof res.name === 'string' ? res.name : 'friend'}`)
    void fetchFriends()
  }

  const handleRemove = async (peerId: string) => {
    setBusy(true)
    const res = await mailman(`users/friends/${peerId}`, 'DELETE')
    setBusy(false)
    if (res?.error) {
      showToast('error', res.error.message)
      return
    }
    showToast('success', 'Removed friend')
    void fetchFriends()
  }

  return (
    <StyledFriendsPage>
      <Meta title="Friends" />
      <WidthController>
        <PageBackLink href="/" label="Back to home" compact />
        <PageHeader>Friends</PageHeader>
        <p className="empty-hint" style={{ marginTop: 8 }}>
          Add players and see who is online.
        </p>

        <div className="friends-body">
          <div className="friend-add-row">
            <div style={{ flex: '1 1 220px' }}>
              <Input
                id="friends-add"
                label="Add by code, email, or name"
                type="text"
                placeholder="Friend code, email, or display name"
                value={identifier}
                callback={setIdentifier}
              />
            </div>
            <Button variant="primary" disabled={busy} onClick={() => void handleAdd()}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <UserAddIcon style={{ width: 16, height: 16 }} />
                Add friend
              </span>
            </Button>
          </div>

          {friends === null ? (
            <SkeletonCards numCards={4} />
          ) : friends.length === 0 ? (
            <p className="empty-hint">No friends yet. Add someone with their friend code or exact display name.</p>
          ) : (
            <ul className="friends-list">
              {friends.map((friend) => (
                <li key={friend.id} className="friend-row">
                  <div className="friend-info">
                    <Link href={`/user/${encodeURIComponent(friend.id)}`}>
                      <a className="friend-name">{friend.name}</a>
                    </Link>
                    <div className="friend-meta">
                      <span
                        className={`status-dot ${friend.online ? 'status-dot--online' : 'status-dot--offline'}`}
                        aria-hidden
                      />
                      <span>{presenceLabel(friend)}</span>
                      {friend.friendCode ? <span>· {friend.friendCode}</span> : null}
                    </div>
                  </div>
                  <Button
                    variant="destroy"
                    style={{ padding: '0 10px', fontSize: 12 }}
                    disabled={busy}
                    onClick={() => void handleRemove(friend.id)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </WidthController>
    </StyledFriendsPage>
  )
}

export default FriendsPage
