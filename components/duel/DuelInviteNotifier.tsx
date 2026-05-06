import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { UserGroupIcon, XIcon } from '@heroicons/react/outline'
import { Button } from '@components/system'
import { mailman } from '@utils/helpers'
import { userPrivateChannel } from '@utils/pusherChannels'
import { usePusherRealtimeHealthy } from '@utils/usePusherRealtimeHealthy'
import { usePusherSubscription } from '@utils/usePusherSubscription'
import styled from 'styled-components'

type DuelInviteRow = {
  id: string
  hostName: string
  inviteSegment: string
  createdAt: string
}

const POLL_MS_FAST = 12_000
const POLL_MS_SLOW = 120_000

const Anchor = styled.div`
  position: fixed;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10001;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: min(360px, calc(100vw - 32px));
  pointer-events: none;

  @media (max-width: 640px) {
    top: 12px;
    max-width: calc(100vw - 24px);
  }
`

const Card = styled.div`
  pointer-events: auto;
  padding: var(--pad-card-sm) var(--pad-card-sm) 12px;
  border-radius: var(--radius-lg);
  background-color: var(--bg-elevated);
  border: var(--border-default);
  box-shadow: var(--shadow-card);
  color: var(--text-primary);
`

const CardHead = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
`

const Tile = styled.div`
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(97, 63, 231, 0.2);
  border: 1px solid rgba(167, 139, 250, 0.35);
  color: #d8b4fe;

  svg {
    width: 20px;
    height: 20px;
  }
`

const Title = styled.div`
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.25;
`

const Sub = styled.div`
  font-size: 12px;
  margin-top: 2px;
  color: #a1a1aa;
  line-height: 1.35;
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

  const userChannel =
    status === 'authenticated' && session?.user?.id ? userPrivateChannel(session.user.id) : null

  const fetchInvites = useCallback(async () => {
    if (status !== 'authenticated') {
      setInvites([])
      return
    }
    const res = await mailman('users/duel-invites')
    if (!res || typeof res !== 'object' || Array.isArray(res)) return
    if ('error' in res && (res as { error?: unknown }).error) return
    if (!('invites' in res)) return
    const list = (res as { invites?: unknown }).invites
    if (!Array.isArray(list)) return
    setInvites(list as DuelInviteRow[])
  }, [status])

  useEffect(() => {
    void fetchInvites()
  }, [fetchInvites])

  usePusherSubscription(
    userChannel,
    'duel_invite.created',
    (data) => {
      const row = data as DuelInviteRow
      if (!row?.id || !row.inviteSegment) return
      setInvites((prev) => (prev.some((i) => i.id === row.id) ? prev : [row, ...prev]))
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

  useEffect(() => {
    if (status !== 'authenticated') return
    const pollMs =
      pushConfigured && pushHealthy ? POLL_MS_SLOW : POLL_MS_FAST
    const id = window.setInterval(() => void fetchInvites(), pollMs)
    return () => window.clearInterval(id)
  }, [status, fetchInvites, pushConfigured, pushHealthy])

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
    <Anchor aria-live="polite">
      {invites.map((invite) => (
        <Card key={invite.id}>
          <CardHead>
            <Tile>
              <UserGroupIcon />
            </Tile>
            <div style={{ flex: 1, minWidth: 0, paddingRight: 4 }}>
              <Title>Duel invite</Title>
              <Sub>
                <strong style={{ color: '#e4e4e7' }}>{invite.hostName}</strong> invited you to a duel.
              </Sub>
            </div>
            <IconBtn type="button" aria-label="Dismiss invite" onClick={() => void onDismiss(invite)}>
              <XIcon />
            </IconBtn>
          </CardHead>
          <BtnRow>
            <Button variant="primary" size="sm" onClick={() => onJoin(invite)}>
              Join
            </Button>
            <Button variant="solidGray" size="sm" onClick={() => void onDismiss(invite)}>
              Dismiss
            </Button>
          </BtnRow>
        </Card>
      ))}
    </Anchor>
  )
}

export default DuelInviteNotifier
