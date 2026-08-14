import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DuelPlaySurface from '@components/duel/DuelPlaySurface'
import DuelSpectateSurface from '@components/duel/DuelSpectateSurface'
import DuelRoundOverview from '@components/duel/DuelRoundOverview'
import DuelMatchRecap from '@components/duel/DuelMatchRecap'
import type { DuelMatchRecapView } from '@components/duel/DuelMatchRecap'
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
import type { WatcherChip } from '@components/WatchersIndicator'
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
import { duelPrivateChannel, userPrivateChannel } from '@utils/pusherChannels'
import { usePusherRealtimeHealthy } from '@utils/usePusherRealtimeHealthy'
import { usePusherSubscription } from '@utils/usePusherSubscription'
import { useVisibleInterval } from '@utils/useVisibleInterval'

/** Dedupes concurrent auto-join attempts (e.g. React Strict Mode double mount). */
const duelInviteAutojoinTasks = new Map<string, Promise<void>>()

type FriendRow = { id: string; name: string; friendCode?: string }

const DuelRoomPage: PageType = () => {
  const router = useRouter()
  const { status, data: session } = useSession()
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
  const [recapView, setRecapView] = useState<DuelMatchRecapView>('all')
  const [endPhase, setEndPhase] = useState<'final_damage' | 'summary'>('final_damage')
  const [watchers, setWatchers] = useState<WatcherChip[]>([])
  const prevGuestJoined = useRef<boolean | null>(null)

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

  const fetchWatchers = useCallback(async () => {
    if (!duelId || !isValidDuelUrlSegment(duelId) || spectateMode) return
    if (payload?.viewerRole !== 'host' && payload?.viewerRole !== 'guest') return
    const res = await mailman(`duels/${duelId}/watchers`)
    if (res?.error || !Array.isArray(res?.watchers)) return
    setWatchers(
      res.watchers
        .filter(
          (w: unknown): w is WatcherChip =>
            !!w &&
            typeof w === 'object' &&
            typeof (w as WatcherChip).id === 'string' &&
            typeof (w as WatcherChip).name === 'string'
        )
        .map((w: WatcherChip) => ({ id: w.id, name: w.name }))
    )
  }, [duelId, spectateMode, payload?.viewerRole])

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

  /** Also listen on short-code channel when the URL used the ObjectId (or vice versa). */
  const duelAltPushChannel = useMemo(() => {
    if (!duelPushChannel || !payload?.shortCode) return null
    const code = payload.shortCode.trim()
    if (!code || code === duelId) return null
    return duelPrivateChannel(code)
  }, [duelPushChannel, payload?.shortCode, duelId])

  const hostUserChannel = useMemo(() => {
    if (!isAuthenticated || payload?.viewerRole !== 'host') return null
    const uid = typeof session?.user?.id === 'string' ? session.user.id : ''
    return uid ? userPrivateChannel(uid) : null
  }, [isAuthenticated, payload?.viewerRole, session?.user?.id])

  const pushHealthy = usePusherRealtimeHealthy()
  const pushConfigured = !!process.env.NEXT_PUBLIC_PUSHER_KEY

  const pollTier = duelPollTier(payload ?? undefined)
  const pollMs = useMemo(() => {
    if (payload?.viewerRole === 'spectator' && payload.status === 'in_progress') {
      return 500
    }
    if (pushConfigured && pushHealthy && pollTier === 'finished') return null
    // Host waiting for join: poll aggressively so accept never depends on a single push.
    if (
      pollTier === 'lobby' &&
      payload?.viewerRole === 'host' &&
      payload.status === 'waiting' &&
      !payload.guestJoined
    ) {
      return 1500
    }
    if (pollTier === 'lobby' && payload?.viewerRole === 'host' && payload.status === 'waiting') {
      return 2500
    }
    if (!pushConfigured || !pushHealthy) return DUEL_POLL_MS[pollTier]
    return DUEL_POLL_PUSH_CONNECTED_MS[pollTier]
  }, [
    pollTier,
    pushHealthy,
    pushConfigured,
    payload?.viewerRole,
    payload?.status,
    payload?.guestJoined,
  ])

  const roomPushEnabled = Boolean(duelPushChannel)
  const altRoomPushEnabled = Boolean(duelAltPushChannel)
  const hostJoinPushEnabled = useMemo(() => {
    if (!hostUserChannel) return false
    if (!payload) return false
    if (payload.status !== 'waiting') return false
    if (payload.guestJoined) return false
    return true
  }, [hostUserChannel, payload])

  usePusherSubscription(duelPushChannel, 'duel.updated', () => void refresh(), roomPushEnabled)
  usePusherSubscription(duelAltPushChannel, 'duel.updated', () => void refresh(), altRoomPushEnabled)

  usePusherSubscription(
    hostUserChannel,
    'duel.opponent_joined',
    (data) => {
      const row = data as { inviteSegment?: string; duelObjectId?: string; guestName?: string }
      const seg = typeof row?.inviteSegment === 'string' ? row.inviteSegment.trim() : ''
      const oid = typeof row?.duelObjectId === 'string' ? row.duelObjectId.trim() : ''
      const matchesThisDuel =
        seg === duelId ||
        seg === payload?.shortCode ||
        oid === duelId ||
        oid === payload?.shortCode
      if (!matchesThisDuel) return
      void refresh()
    },
    hostJoinPushEnabled
  )

  useEffect(() => {
    if (payload?.viewerRole !== 'host' || payload.status !== 'waiting') {
      prevGuestJoined.current = payload?.guestJoined ?? null
      return
    }
    const joined = Boolean(payload.guestJoined)
    if (prevGuestJoined.current === false && joined) {
      const name =
        payload.playerNames?.guest && payload.playerNames.guest !== 'Waiting'
          ? payload.playerNames.guest
          : 'Opponent'
      showToast('success', `${name} joined — start the duel`)
    }
    prevGuestJoined.current = joined
  }, [
    payload?.viewerRole,
    payload?.status,
    payload?.guestJoined,
    payload?.playerNames?.guest,
  ])

  useVisibleInterval(
    refresh,
    pollMs,
    !!duelId && isValidDuelUrlSegment(duelId)
  )

  useVisibleInterval(
    () => void fetchWatchers(),
    4000,
    Boolean(
      !!duelId &&
        isValidDuelUrlSegment(duelId) &&
        !spectateMode &&
        payload?.status === 'in_progress' &&
        (payload.viewerRole === 'host' || payload.viewerRole === 'guest')
    )
  )

  useEffect(() => {
    if (!isAuthenticated) return
    const inLiveDuel =
      payload != null &&
      (payload.status === 'waiting' || payload.status === 'in_progress') &&
      (payload.viewerRole === 'host' || payload.viewerRole === 'guest')
    const isSpectating =
      payload != null &&
      payload.viewerRole === 'spectator' &&
      (payload.status === 'in_progress' || payload.status === 'waiting')

    const activity = inLiveDuel ? 'in_duel' : isSpectating ? 'spectating' : 'browsing'
    const presenceBody =
      inLiveDuel || isSpectating
        ? { activity, presenceSession: { kind: 'duel' as const, id: duelId } }
        : { activity }

    void mailman('users/presence', 'POST', JSON.stringify(presenceBody))
    const id = window.setInterval(() => {
      void mailman('users/presence', 'POST', JSON.stringify(presenceBody))
    }, 45000)
    return () => {
      window.clearInterval(id)
      void mailman('users/presence', 'POST', JSON.stringify({ activity: 'browsing' }))
    }
  }, [isAuthenticated, payload, duelId])

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
    if (payload?.id) setRecapView('all')
  }, [payload?.id])

  useEffect(() => {
    if (!payload?.id || payload.status !== 'finished') {
      setEndPhase('final_damage')
      return
    }
    try {
      const stored = sessionStorage.getItem(`duel-end-phase-${payload.id}`)
      setEndPhase(stored === 'summary' ? 'summary' : 'final_damage')
    } catch {
      setEndPhase('final_damage')
    }
  }, [payload?.id, payload?.status])

  const advanceToMatchSummary = useCallback(() => {
    if (payload?.id) {
      try {
        sessionStorage.setItem(`duel-end-phase-${payload.id}`, 'summary')
      } catch {
        /* ignore */
      }
    }
    setEndPhase('summary')
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
    (payload.status === 'finished' && endPhase === 'summary') ||
    waitingLobby ||
    lobbyGuestReady

  const showFinalDamage =
    payload.status === 'finished' &&
    endPhase === 'final_damage' &&
    payload.lastRoundResult != null &&
    payload.lastRoundActualLocation != null

  const canShowPlaySurface =
    (payload.status === 'in_progress' && !!payload.currentLocation && !!payload.mapDetails) ||
    (showFinalDamage && !!payload.mapDetails)

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

      {showFinalDamage && payload.lastRoundResult && payload.lastRoundActualLocation && !canShowPlaySurface ? (
        <DuelRoundOverview
          variant="fullscreen"
          roundOneBased={payload.lastRoundResult.roundIndex + 1}
          totalRounds={payload.totalRounds}
          multiplierMode={payload.multiplierMode}
          mode={payload.mode}
          actual={payload.lastRoundActualLocation}
          result={payload.lastRoundResult}
          hostMaxHp={payload.startingHpHost}
          guestMaxHp={payload.startingHpGuest}
          viewerRole={you === 'spectator' ? null : you}
          sessionMapId={payload.mapId}
          plonkMapLabel={payload.mapDetails?.name}
          hostPlayerName={payload.playerNames.host}
          guestPlayerName={payload.playerNames.guest}
          playerAvatars={payload.playerAvatars}
          continueLabel="See match summary"
          onContinue={advanceToMatchSummary}
        />
      ) : null}

      {lobbyOrFinish && (
        <GamifiedCenterStage>
          <div style={{ width: '100%', maxWidth: 'min(1100px, 100%)', marginBottom: 14 }}>
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

          {payload.status === 'finished' &&
            (payload.roundResults.length > 0 ? (
              <DuelMatchRecap
                payload={payload}
                viewerRole={you}
                selectedView={recapView}
                onSelectView={setRecapView}
                headline={headline}
                tone={finishTone}
                onHome={() => router.push('/')}
                onPlayAgain={isPlayer ? () => void handleRematchReady() : undefined}
                playAgainLoading={rematchLoading}
              />
            ) : (
              <DuelFinishBanner
                headline={headline}
                tone={finishTone}
                payload={payload}
                onHome={() => router.push('/')}
                onPlayAgain={isPlayer ? () => void handleRematchReady() : undefined}
                playAgainLoading={rematchLoading}
              >
                {payload.lastRoundResult && payload.lastRoundActualLocation ? (
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
            ))}

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

      {canShowPlaySurface && (
        <>
          {you === 'spectator' || spectateMode ? (
            <DuelSpectateSurface
              duelId={duelId}
              payload={payload}
              onRefresh={refresh}
              finalDamageMode={showFinalDamage}
              onSeeMatchSummary={advanceToMatchSummary}
            />
          ) : isPlayer ? (
            <DuelPlaySurface
              duelId={duelId}
              payload={payload}
              role={you}
              onRefresh={refresh}
              finalDamageMode={showFinalDamage}
              onSeeMatchSummary={advanceToMatchSummary}
              watchers={watchers}
            />
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
