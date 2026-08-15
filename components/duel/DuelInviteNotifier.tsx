import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { UserGroupIcon, XIcon } from '@heroicons/react/outline'
import { Button } from '@components/system'
import { mailman, showToast } from '@utils/helpers'
import { userPrivateChannel } from '@utils/pusherChannels'
import { usePusherRealtimeHealthy } from '@utils/usePusherRealtimeHealthy'
import { usePusherSubscription } from '@utils/usePusherSubscription'
import { useVisibleInterval } from '@utils/useVisibleInterval'
import styled, { keyframes } from 'styled-components'

type DuelInviteRow = {
  id: string
  hostName: string
  inviteSegment: string
  createdAt: string
  expiresAt?: string
}

/** Safety poll even when Pusher looks healthy — invite banners must not depend on a single push. */
const POLL_MS_BACKUP = 3_000
const POLL_MS_FAST = 2_000

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(47, 127, 255, 0.35); }
  50% { box-shadow: 0 0 0 8px rgba(47, 127, 255, 0); }
`

const Anchor = styled.div`
  position: fixed;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: min(400px, calc(100vw - 32px));
  width: min(400px, calc(100vw - 32px));
  pointer-events: none;

  @media (max-width: 640px) {
    top: 12px;
    max-width: calc(100vw - 24px);
    width: calc(100vw - 24px);
  }
`

const Card = styled.div`
  pointer-events: auto;
  padding: 14px 14px 12px;
  border-radius: var(--radius-lg);
  background: linear-gradient(165deg, rgba(20, 32, 56, 0.98), var(--bg-elevated));
  border: 1px solid rgba(47, 127, 255, 0.55);
  box-shadow: var(--shadow-card), 0 12px 40px rgba(0, 0, 0, 0.45);
  color: var(--text-primary);
  animation: ${pulse} 2s ease-in-out 3;
`

const CardHead = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
`

const Tile = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(47, 127, 255, 0.22);
  border: 1px solid rgba(47, 127, 255, 0.5);
  color: #bfdbfe;

  svg {
    width: 22px;
    height: 22px;
  }
`

const Title = styled.div`
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.25;
`

const Sub = styled.div`
  font-size: 13px;
  margin-top: 3px;
  color: #c4c4cc;
  line-height: 1.4;
`

const BtnRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`

const IconBtn = styled.button`
  margin-left: auto;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.35);
  color: #a1a1aa;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    color: #f4f4f5;
    border-color: rgba(255, 255, 255, 0.2);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`

const DuelInviteNotifier = () => {
  const { status, data: session } = useSession()
  const router = useRouter()
  const [invites, setInvites] = useState<DuelInviteRow[]>([])
  const pushHealthy = usePusherRealtimeHealthy()
  const pushConfigured = !!process.env.NEXT_PUBLIC_PUSHER_KEY
  const toastedIds = useRef<Set<string>>(new Set())
  const invitesHydrated = useRef(false)

  const userChannel =
    status === 'authenticated' && session?.user?.id ? userPrivateChannel(session.user.id) : null

  const fetchInvites = useCallback(async () => {
    if (status !== 'authenticated') {
      setInvites([])
      invitesHydrated.current = false
      return
    }
    const res = await mailman('users/duel-invites')
    if (!res || typeof res !== 'object' || Array.isArray(res)) return
    if ('error' in res && (res as { error?: unknown }).error) return
    if (!('invites' in res)) return
    const list = (res as { invites?: unknown }).invites
    if (!Array.isArray(list)) return
    const next = list as DuelInviteRow[]
    setInvites((prev) => {
      const announce = invitesHydrated.current
      for (const row of next) {
        if (!row?.id) continue
        const wasKnown = prev.some((i) => i.id === row.id) || toastedIds.current.has(row.id)
        if (!wasKnown) {
          toastedIds.current.add(row.id)
          if (announce) {
            showToast('success', `${row.hostName || 'Friend'} invited you to a duel`)
          }
        }
      }
      return next
    })
    invitesHydrated.current = true
  }, [status])

  const addInvite = useCallback((row: DuelInviteRow, announce: boolean) => {
    if (!row?.id || !row.inviteSegment) return
    setInvites((prev) => {
      if (prev.some((i) => i.id === row.id)) return prev
      return [row, ...prev]
    })
    if (announce && !toastedIds.current.has(row.id)) {
      toastedIds.current.add(row.id)
      showToast('success', `${row.hostName || 'Friend'} invited you to a duel`)
    }
  }, [])

  usePusherSubscription(
    userChannel,
    'duel_invite.created',
    (data) => {
      addInvite(data as DuelInviteRow, true)
    },
    !!userChannel
  )

  usePusherSubscription(
    userChannel,
    'duel_invite.removed',
    (data) => {
      const id = (data as { id?: string })?.id
      if (!id) return
      setInvites((prev) => prev.filter((i) => i.id !== id))
    },
    !!userChannel
  )

  const invitePollMs = useMemo(() => {
    if (status !== 'authenticated') return null
    if (pushConfigured && pushHealthy) return POLL_MS_BACKUP
    return POLL_MS_FAST
  }, [status, pushConfigured, pushHealthy])

  useVisibleInterval(fetchInvites, invitePollMs, status === 'authenticated')

  useEffect(() => {
    const timers: number[] = []
    for (const invite of invites) {
      const expiresMs = invite.expiresAt
        ? new Date(invite.expiresAt).getTime()
        : Date.now() + 60_000
      const delay = Math.max(0, expiresMs - Date.now())
      timers.push(
        window.setTimeout(() => {
          setInvites((prev) => prev.filter((i) => i.id !== invite.id))
        }, delay)
      )
    }
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [invites])

  const onDismiss = async (invite: DuelInviteRow) => {
    setInvites((prev) => prev.filter((i) => i.id !== invite.id))
    const res = await mailman(`users/duel-invites/${invite.id}`, 'DELETE')
    if (res?.error) void fetchInvites()
  }

  const onJoin = async (invite: DuelInviteRow) => {
    setInvites((prev) => prev.filter((i) => i.id !== invite.id))
    void mailman(`users/duel-invites/${invite.id}`, 'DELETE')
    const seg = encodeURIComponent(invite.inviteSegment)
    await router.push(`/duel/${seg}?invite=1`)
  }

  if (status !== 'authenticated' || invites.length === 0) return null

  return (
    <Anchor aria-live="assertive" role="status">
      {invites.map((invite) => (
        <Card key={invite.id}>
          <CardHead>
            <Tile>
              <UserGroupIcon />
            </Tile>
            <div style={{ flex: 1, minWidth: 0, paddingRight: 4 }}>
              <Title>Duel invite</Title>
              <Sub>
                <strong style={{ color: '#f4f4f5' }}>{invite.hostName}</strong> challenged you. Join to enter the
                room.
              </Sub>
            </div>
            <IconBtn type="button" aria-label="Dismiss invite" onClick={() => void onDismiss(invite)}>
              <XIcon />
            </IconBtn>
          </CardHead>
          <BtnRow>
            <Button variant="primary" size="md" onClick={() => onJoin(invite)} style={{ flex: 1, minWidth: 120 }}>
              Join duel
            </Button>
            <Button variant="solidGray" size="md" onClick={() => void onDismiss(invite)}>
              Not now
            </Button>
          </BtnRow>
        </Card>
      ))}
    </Anchor>
  )
}

export default DuelInviteNotifier
