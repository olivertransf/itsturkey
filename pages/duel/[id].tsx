import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DuelPlaySurface from '@components/duel/DuelPlaySurface'
import DuelSpectateSurface from '@components/duel/DuelSpectateSurface'
import DuelRoundOverview from '@components/duel/DuelRoundOverview'
import DuelMatchRecap from '@components/duel/DuelMatchRecap'
import {
  DuelFinishBanner,
  DuelLobbyGuestJoinPanel,
  DuelLobbyGuestWaitingPanel,
  DuelLobbyHostStartPanel,
  DuelLobbyHostWaitingPanel,
  DuelOpponentRematchModal,
} from '@components/duel/DuelRoomPanels'
import type { DuelLobbyMatchInfo } from '@components/duel/DuelRoomPanels'
import type { DuelClientPayload } from '@components/duel/duelApiTypes'
import { NotFound } from '@components/errorViews'
import { PageBackLink } from '@components/PageBackLink'
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
import { useVisibleInterval } from '@utils/useVisibleInterval'

/** Dedupes concurrent auto-join attempts (e.g. React Strict Mode double mount). */
const duelInviteAutojoinTasks = new Map<string, Promise<void>>()

type FriendRow = { id: string; name: string; friendCode?: string }

const DuelRoomPage: PageType = () => {
  const router = useRouter()
  const { status } = useSession()
  const duelId =
    router.isReady && typeof router.query.id === 'string' ? router.query.id.trim() : ''
  const spectateMode = router.isReady && router.query.spectate === '1'

  const [payload, setPayload] = useState<DuelClientPayload | null>()
  const [fatal, setFatal] = useState<string | null>(null)
  const [rematchLoading, setRematchLoading] = useState(false)
  const [startLoading, setStartLoading] = useState(false)
  const [joinLoading, setJoinLoading] = useState(false)
  const [friends, setFriends] = useState<FriendRow[]>([])
  const [invitingFriendId, setInvitingFriendId] = useState<string | null>(null)
  const [rematchNudgeDismissed, setRematchNudgeDismissed] = useState(false)
  const [recapRoundIdx, setRecapRoundIdx] = useState(0)

  const isAuthenticated = status === 'authenticated'
  const loginHref =
    router.isReady && duelId
      ? `/login?callbackUrl=${encodeURIComponent(`/duel/${duelId}`)}`
      : '/login'

  const refresh = useCallback(async () => {
    if (!duelId || !isValidDuelUrlSegment(duelId)) return

    const qs = spectateMode ? '?spectate=1' : ''
    const res = await mailman(`duels/${duelId}${qs}`)

    if (res?.error) {
      if (res.error.code === 404) setPayload(null)
      else if (res.error.code === 401) setFatal(res.error.message)
      return
    }

    setPayload(res as DuelClientPayload)
    setFatal(null)
  }, [duelId, spectateMode])

  useEffect(() => {
    if (!duelId || !isValidDuelUrlSegment(duelId) || !spectateMode) return
    void mailman(`duels/${duelId}/spectate`, 'POST', JSON.stringify({})).then((res) => {
      if (res?.error) {
        if (res.error.code === 401) setFatal(res.error.message)
        return
      }
      setPayload(res as DuelClientPayload)
      setFatal(null)
    })
  }, [duelId, spectateMode])

  const duelPushChannel = useMemo(() => {
    if (!duelId || !isValidDuelUrlSegment(duelId)) return null
    const role = payload?.viewerRole
    if (role !== 'host' && role !== 'guest' && role !== 'spectator') return null
    return duelPrivateChannel(duelId)
  }, [duelId, payload?.viewerRole])

  const pushHealthy = usePusherRealtimeHealthy()
  const pushConfigured = !!process.env.NEXT_PUBLIC_PUSHER_KEY

  const pollTier = duelPollTier(payload ?? undefined)
  const pollMs = useMemo(() => {
    if (pushConfigured && pushHealthy && pollTier === 'finished') return null
    if (pollTier === 'lobby' && payload?.viewerRole === 'host' && payload.status === 'waiting') {
      return 2500
    }
    if (!pushConfigured || !pushHealthy) return DUEL_POLL_MS[pollTier]
    return DUEL_POLL_PUSH_CONNECTED_MS[pollTier]
  }, [pollTier, pushHealthy, pushConfigured, payload?.viewerRole, payload?.status])

  usePusherSubscription(duelPushChannel, 'duel.updated', () => void refresh(), !!duelPushChannel)

  useVisibleInterval(
    refresh,
    pollMs,
    !!duelId && isValidDuelUrlSegment(duelId)
  )

  useEffect(() => {
    if (!isAuthenticated) return
    void mailman('users/presence', 'POST', JSON.stringify({ activity: 'in_duel' }))
    const id = window.setInterval(() => {
      void mailman('users/presence', 'POST', JSON.stringify({ activity: 'in_duel' }))
    }, 45000)
    return () => window.clearInterval(id)
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated || !payload) return
    if (payload.status !== 'waiting' || payload.viewerRole !== 'host') return

    void mailman('users/friends').then((res) => {
      if (!res || typeof res !== 'object') return
      if ('error' in res && res.error) return
      if (!Array.isArray(res)) return
      setFriends(res as FriendRow[])
    })
  }, [isAuthenticated, payload?.status, payload?.viewerRole, payload?.guestJoined, payload])

  useEffect(() => {
    if (payload?.status !== 'finished') setRematchNudgeDismissed(false)
  }, [payload?.status])

  useEffect(() => {
    const n = payload?.roundResults.length ?? 0
    if (n > 0) setRecapRoundIdx(n - 1)
  }, [payload?.id])

  const handleJoin = useCallback(
    async (opts?: { displayName?: string }) => {
      setJoinLoading(true)
      try {
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
      } finally {
        setJoinLoading(false)
      }
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
    if (startLoading) return
    setStartLoading(true)
    try {
      const res = await mailman(`duels/${duelId}/start`, 'POST', JSON.stringify({}))

      if (res?.error) {
        showToast('error', res.error.message)
        return
      }

      setPayload(res as DuelClientPayload)
    } finally {
      setStartLoading(false)
    }
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
  const isPlayer = you === 'host' || you === 'guest'
  const waitingLobby = payload.status === 'waiting' && !payload.guestJoined
  const lobbyGuestReady = payload.status === 'waiting' && payload.guestJoined

  const lobbyChat =
    isPlayer
      ? {
          duelId,
          chatMessages: payload.chatMessages,
          playerNames: payload.playerNames,
          playerAvatars: payload.playerAvatars,
          viewerRole: you,
          onRefresh: refresh,
        }
      : undefined

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
      : isPlayer
      ? 'You lost'
      : you === 'spectator'
      ? 'Match finished'
      : payload.outcome === 'host_win'
      ? `${payload.playerNames.host} wins`
      : payload.outcome === 'guest_win'
      ? `${payload.playerNames.guest} wins`
      : 'Match finished'

  const finishTone =
    payload.outcome === 'tie'
      ? ('tie' as const)
      : !isPlayer
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

  const lobbyMatch: DuelLobbyMatchInfo = {
    mapDetails: payload.mapDetails,
    mode: payload.mode,
    totalRounds: payload.totalRounds,
    startingHpHost: payload.startingHpHost,
    startingHpGuest: payload.startingHpGuest,
    multiplierMode: payload.multiplierMode,
  }

  return (
    <StyledMultiGamePage>
      <Meta title="Duel" />

      {lobbyOrFinish && (
        <GamifiedCenterStage>
          <div style={{ width: '100%', maxWidth: 'min(960px, 100%)', marginBottom: 14 }}>
            <PageBackLink href="/" label="Back to home" compact />
          </div>

          {payload.status === 'finished' && isPlayer && (
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
              recapRoundIdx={recapRoundIdx}
              onHome={() => router.push('/')}
              onPlayAgain={isPlayer ? () => void handleRematchReady() : undefined}
              playAgainLoading={rematchLoading}
            >
              {payload.roundResults.length > 0 ? (
                <DuelMatchRecap
                  payload={payload}
                  viewerRole={you}
                  selectedIdx={recapRoundIdx}
                  onSelectRound={setRecapRoundIdx}
                />
              ) : payload.lastRoundResult && payload.lastRoundActualLocation ? (
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
              ) : null}
            </DuelFinishBanner>
          )}

          {spectateMode && (waitingLobby || lobbyGuestReady) && (
            <p style={{ color: '#e4e4e7', textAlign: 'center', maxWidth: 420, lineHeight: 1.5 }}>
              This duel has not started yet. Check back once the host begins the match.
            </p>
          )}

          {waitingLobby && you === 'host' && (
            <DuelLobbyHostWaitingPanel
              shortCode={payload.shortCode}
              match={lobbyMatch}
              friends={friends}
              invitingFriendId={invitingFriendId}
              onInviteFriend={isAuthenticated ? (f) => void inviteFriend(f) : undefined}
              chat={lobbyChat}
            />
          )}

          {waitingLobby && you !== 'host' && !spectateMode && (
            <DuelLobbyGuestJoinPanel
              shortCode={payload.shortCode}
              match={lobbyMatch}
              onJoin={(o) => void handleJoin(o)}
              isAuthenticated={isAuthenticated}
              loginHref={loginHref}
              joinLoading={joinLoading}
            />
          )}

          {lobbyGuestReady && you === 'host' && (
            <DuelLobbyHostStartPanel
              shortCode={payload.shortCode}
              match={lobbyMatch}
              onStart={() => void handleStartGame()}
              opponentName={payload.playerNames.guest !== 'Waiting' ? payload.playerNames.guest : undefined}
              chat={lobbyChat}
              startLoading={startLoading}
            />
          )}

          {lobbyGuestReady && you === 'guest' && (
            <DuelLobbyGuestWaitingPanel
              match={lobbyMatch}
              hostPlayerName={payload.playerNames.host}
              chat={lobbyChat}
            />
          )}
        </GamifiedCenterStage>
      )}

      {payload.status === 'in_progress' && payload.currentLocation && payload.mapDetails && (
        <>
          {you === 'spectator' ? (
            <DuelSpectateSurface duelId={duelId} payload={payload} onRefresh={refresh} />
          ) : isPlayer ? (
            <DuelPlaySurface duelId={duelId} payload={payload} role={you} onRefresh={refresh} />
          ) : null}
        </>
      )}

      {payload.status === 'in_progress' && (!payload.currentLocation || !payload.mapDetails) && (
        <LoadingPage />
      )}
    </StyledMultiGamePage>
  )
}

DuelRoomPage.noLayout = true

export default DuelRoomPage
