import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DuelPlaySurface from '@components/duel/DuelPlaySurface'
import DuelRoundOverview from '@components/duel/DuelRoundOverview'
import {
  DuelFinishBanner,
  DuelLobbyGuestJoinPanel,
  DuelLobbyGuestWaitingPanel,
  DuelLobbyHostStartPanel,
  DuelLobbyHostWaitingPanel,
  DuelOpponentRematchModal,
} from '@components/duel/DuelRoomPanels'
import type { DuelClientPayload } from '@components/duel/duelApiTypes'
import { NotFound } from '@components/errorViews'
import { LoadingPage } from '@components/layout'
import { Meta } from '@components/Meta'
import StyledMultiGamePage from '@styles/MultiGamePage.Styled'
import { GamifiedCenterStage } from '@styles/GamifiedHubShell.Styled'
import type { PageType } from '@types'
import { mailman, showToast } from '@utils/helpers'
import { isValidDuelUrlSegment } from '@utils/helpers/duelInvite'
import {
  DUEL_POLL_MS,
  DUEL_POLL_PUSH_CONNECTED_MS,
  duelPollTier,
} from '@utils/duelPollTier'
import { duelPrivateChannel } from '@utils/pusherChannels'
import { usePusherRealtimeHealthy } from '@utils/usePusherRealtimeHealthy'
import { usePusherSubscription } from '@utils/usePusherSubscription'

/** Dedupes concurrent auto-join attempts (e.g. React Strict Mode double mount). */
const duelInviteAutojoinTasks = new Map<string, Promise<void>>()

type FriendRow = { id: string; name: string; friendCode?: string }

const DuelRoomPage: PageType = () => {
  const router = useRouter()
  const { status } = useSession()
  const duelId =
    router.isReady && typeof router.query.id === 'string' ? router.query.id.trim() : ''

  const [payload, setPayload] = useState<DuelClientPayload | null>()
  const [fatal, setFatal] = useState<string | null>(null)
  const [rematchLoading, setRematchLoading] = useState(false)
  const [friends, setFriends] = useState<FriendRow[]>([])
  const [invitingFriendId, setInvitingFriendId] = useState<string | null>(null)
  const [rematchNudgeDismissed, setRematchNudgeDismissed] = useState(false)

  const isAuthenticated = status === 'authenticated'
  const loginHref =
    router.isReady && duelId
      ? `/login?callbackUrl=${encodeURIComponent(`/duel/${duelId}`)}`
      : '/login'

  const refresh = useCallback(async () => {
    if (!duelId || !isValidDuelUrlSegment(duelId)) return

    const res = await mailman(`duels/${duelId}`)

    if (res?.error) {
      if (res.error.code === 404) setPayload(null)
      else if (res.error.code === 401) setFatal(res.error.message)
      return
    }

    setPayload(res as DuelClientPayload)
    setFatal(null)
  }, [duelId])

  const duelPushChannel = useMemo(() => {
    if (!duelId || !isValidDuelUrlSegment(duelId)) return null
    const role = payload?.viewerRole
    if (role !== 'host' && role !== 'guest') return null
    return duelPrivateChannel(duelId)
  }, [duelId, payload?.viewerRole])

  const pushHealthy = usePusherRealtimeHealthy()
  const pushConfigured = !!process.env.NEXT_PUBLIC_PUSHER_KEY

  const pollTier = duelPollTier(payload ?? undefined)
  const pollMs = useMemo(() => {
    if (!pushConfigured || !pushHealthy) return DUEL_POLL_MS[pollTier]
    return DUEL_POLL_PUSH_CONNECTED_MS[pollTier]
  }, [pollTier, pushHealthy, pushConfigured])

  usePusherSubscription(duelPushChannel, 'duel.updated', () => void refresh(), !!duelPushChannel)

  useEffect(() => {
    if (!duelId || !isValidDuelUrlSegment(duelId)) return

    void refresh()

    const id = window.setInterval(() => void refresh(), pollMs)
    return () => window.clearInterval(id)
  }, [duelId, refresh, pollMs])

  useEffect(() => {
    if (!isAuthenticated || !payload) return
    if (payload.status !== 'waiting' || payload.guestJoined || payload.viewerRole !== 'host') return

    void mailman('users/friends').then((res) => {
      if (!res || typeof res !== 'object') return
      if ('error' in res && res.error) return
      if (!Array.isArray(res)) return
      setFriends(res as FriendRow[])
    })
  }, [isAuthenticated, payload?.status, payload?.guestJoined, payload?.viewerRole, payload])

  useEffect(() => {
    if (payload?.status !== 'finished') setRematchNudgeDismissed(false)
  }, [payload?.status])

  const handleJoin = useCallback(
    async (opts?: { displayName?: string }) => {
      const res = await mailman(
        `duels/${duelId}/join`,
        'POST',
        JSON.stringify(opts?.displayName ? { displayName: opts.displayName } : {})
      )

      if (res?.error) {
        showToast('error', res.error.message)
        return
      }

      setPayload(res as DuelClientPayload)
    },
    [duelId]
  )

  const inviteFriend = async (friend: { id: string; name: string }) => {
    setInvitingFriendId(friend.id)
    try {
      const res = await mailman(
        `duels/${duelId}/invite-friend`,
        'POST',
        JSON.stringify({ peerId: friend.id })
      )
      if (res?.error) {
        showToast('error', res.error.message)
        return
      }
      showToast('success', `Invited ${friend.name}`)
    } finally {
      setInvitingFriendId(null)
    }
  }

  useEffect(() => {
    if (!router.isReady) return
    if (!duelId || !isValidDuelUrlSegment(duelId)) return
    if (router.query.invite !== '1') return
    if (!isAuthenticated) return
    if (!payload) return

    if (payload.viewerRole === 'host') {
      void router.replace(`/duel/${encodeURIComponent(duelId)}`)
      return
    }
    if (payload.status !== 'waiting') {
      void router.replace(`/duel/${encodeURIComponent(duelId)}`)
      return
    }
    if (payload.guestJoined) {
      void router.replace(`/duel/${encodeURIComponent(duelId)}`)
      return
    }

    let existing = duelInviteAutojoinTasks.get(duelId)
    if (!existing) {
      existing = (async () => {
        await handleJoin()
      })().finally(() => {
        duelInviteAutojoinTasks.delete(duelId)
        void router.replace(`/duel/${encodeURIComponent(duelId)}`)
      })
      duelInviteAutojoinTasks.set(duelId, existing)
    }
    void existing
  }, [router.isReady, router.query.invite, duelId, isAuthenticated, payload, router, handleJoin])

  const handleStartGame = async () => {
    const res = await mailman(`duels/${duelId}/start`, 'POST', JSON.stringify({}))

    if (res?.error) {
      showToast('error', res.error.message)
      return
    }

    setPayload(res as DuelClientPayload)
  }

  const handleRematchReady = useCallback(async () => {
    if (!duelId) return
    setRematchLoading(true)
    try {
      const res = await mailman(`duels/${duelId}/rematch-ready`, 'POST', JSON.stringify({}))
      if (res?.error) {
        showToast('error', res.error.message)
        return
      }
      setPayload(res as DuelClientPayload)
    } finally {
      setRematchLoading(false)
    }
  }, [duelId])

  if (!router.isReady) {
    return (
      <StyledMultiGamePage>
        <Meta title="Duel" />
        <LoadingPage />
      </StyledMultiGamePage>
    )
  }

  if (!isValidDuelUrlSegment(duelId)) {
    return (
      <StyledMultiGamePage>
        <Meta title="Duel" />
        <NotFound
          title="Invalid duel link"
          message="Use your host's invite link or a valid duel code (for example four letters like X7K2)."
        />
      </StyledMultiGamePage>
    )
  }

  if (fatal) {
    return (
      <StyledMultiGamePage>
        <Meta title="Duel" />
        <p style={{ color: '#eee', padding: 24 }}>{fatal}</p>
      </StyledMultiGamePage>
    )
  }

  if (payload === null) {
    return <NotFound title="Duel Not Found" message="This duel does not exist or has expired." />
  }

  if (!payload) {
    return <LoadingPage />
  }

  const you = payload.viewerRole
  const waitingLobby = payload.status === 'waiting' && !payload.guestJoined
  const lobbyGuestReady = payload.status === 'waiting' && payload.guestJoined

  const youWon =
    !!payload.outcome &&
    payload.outcome !== 'tie' &&
    ((payload.outcome === 'host_win' && you === 'host') ||
      (payload.outcome === 'guest_win' && you === 'guest'))

  const headline =
    payload.outcome === 'tie'
      ? 'Tie game'
      : youWon
      ? 'You won'
      : you
      ? 'You lost'
      : payload.outcome === 'host_win'
      ? `${payload.playerNames.host} wins`
      : payload.outcome === 'guest_win'
      ? `${payload.playerNames.guest} wins`
      : 'Match finished'

  const finishTone =
    payload.outcome === 'tie'
      ? ('tie' as const)
      : !you
      ? ('neutral' as const)
      : youWon
      ? ('win' as const)
      : ('loss' as const)

  const lobbyOrFinish =
    payload.status === 'finished' ||
    waitingLobby ||
    lobbyGuestReady

  const opponentRematchLabel =
    you === 'host' ? payload.playerNames.guest : you === 'guest' ? payload.playerNames.host : 'Opponent'
  const opponentWantsRematch =
    !!you &&
    payload.status === 'finished' &&
    (you === 'host' ? payload.rematchReady.guest : payload.rematchReady.host) &&
    !(you === 'host' ? payload.rematchReady.host : payload.rematchReady.guest)

  return (
    <StyledMultiGamePage>
      <Meta title="Duel" />

      {lobbyOrFinish && (
        <GamifiedCenterStage>
          {payload.status === 'finished' && you && (
            <DuelOpponentRematchModal
              open={opponentWantsRematch && !rematchNudgeDismissed}
              opponentLabel={opponentRematchLabel}
              onPlayAgain={() => {
                setRematchNudgeDismissed(false)
                void handleRematchReady()
              }}
              onDismiss={() => setRematchNudgeDismissed(true)}
              loading={rematchLoading}
            />
          )}

          {payload.status === 'finished' && (
            <DuelFinishBanner
              headline={headline}
              tone={finishTone}
              payload={payload}
              onHome={() => router.push('/')}
              onPlayAgain={you ? () => void handleRematchReady() : undefined}
              playAgainLoading={rematchLoading}
            >
              {payload.lastRoundResult && payload.lastRoundActualLocation && (
                <DuelRoundOverview
                  variant="compact"
                  roundOneBased={payload.lastRoundResult.roundIndex + 1}
                  mode={payload.mode}
                  actual={payload.lastRoundActualLocation}
                  result={payload.lastRoundResult}
                  hostMaxHp={payload.startingHpHost}
                  guestMaxHp={payload.startingHpGuest}
                  viewerRole={you}
                  sessionMapId={payload.mapId}
                  plonkMapLabel={payload.mapDetails?.name}
                  hostPlayerName={payload.playerNames.host}
                  guestPlayerName={payload.playerNames.guest}
                  playerAvatars={payload.playerAvatars}
                  omitScoreRow
                />
              )}
            </DuelFinishBanner>
          )}

          {waitingLobby && you === 'host' && (
            <DuelLobbyHostWaitingPanel
              shortCode={payload.shortCode}
              friends={friends}
              invitingFriendId={invitingFriendId}
              onInviteFriend={isAuthenticated ? (f) => void inviteFriend(f) : undefined}
            />
          )}

          {waitingLobby && you !== 'host' && (
            <DuelLobbyGuestJoinPanel
              shortCode={payload.shortCode}
              mode={payload.mode}
              totalRounds={payload.totalRounds}
              onJoin={(o) => void handleJoin(o)}
              isAuthenticated={isAuthenticated}
              loginHref={loginHref}
            />
          )}

          {lobbyGuestReady && you === 'host' && (
            <DuelLobbyHostStartPanel
              onStart={() => void handleStartGame()}
              opponentName={payload.playerNames.guest !== 'Waiting' ? payload.playerNames.guest : undefined}
            />
          )}

          {lobbyGuestReady && you === 'guest' && (
            <DuelLobbyGuestWaitingPanel hostPlayerName={payload.playerNames.host} />
          )}
        </GamifiedCenterStage>
      )}

      {payload.status === 'in_progress' &&
        payload.currentLocation &&
        you &&
        payload.mapDetails && (
          <DuelPlaySurface duelId={duelId} payload={payload} role={you} onRefresh={refresh} />
        )}

      {payload.status === 'in_progress' && (!payload.currentLocation || !payload.mapDetails) && (
        <LoadingPage />
      )}
    </StyledMultiGamePage>
  )
}

DuelRoomPage.noLayout = true

export default DuelRoomPage
