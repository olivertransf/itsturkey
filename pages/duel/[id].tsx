import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import DuelPlaySurface from '@components/duel/DuelPlaySurface'
import DuelRoundOverview from '@components/duel/DuelRoundOverview'
import {
  DuelFinishBanner,
  DuelLobbyGuestJoinPanel,
  DuelLobbyGuestWaitingPanel,
  DuelLobbyHostStartPanel,
  DuelLobbyHostWaitingPanel,
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
import { DUEL_POLL_MS, duelPollTier } from '@utils/duelPollTier'

const DuelRoomPage: PageType = () => {
  const router = useRouter()
  const duelId =
    router.isReady && typeof router.query.id === 'string' ? router.query.id.trim() : ''

  const [payload, setPayload] = useState<DuelClientPayload | null>()
  const [fatal, setFatal] = useState<string | null>(null)
  const [rematchLoading, setRematchLoading] = useState(false)

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

  const pollTier = duelPollTier(payload ?? undefined)
  const pollMs = DUEL_POLL_MS[pollTier]

  useEffect(() => {
    if (!duelId || !isValidDuelUrlSegment(duelId)) return

    void refresh()

    const id = window.setInterval(() => void refresh(), pollMs)
    return () => window.clearInterval(id)
  }, [duelId, refresh, pollMs])

  const handleJoin = async () => {
    const res = await mailman(`duels/${duelId}/join`, 'POST', JSON.stringify({}))

    if (res?.error) {
      showToast('error', res.error.message)
      return
    }

    setPayload(res as DuelClientPayload)
  }

  const handleStartGame = async () => {
    const res = await mailman(`duels/${duelId}/start`, 'POST', JSON.stringify({}))

    if (res?.error) {
      showToast('error', res.error.message)
      return
    }

    setPayload(res as DuelClientPayload)
  }

  const copyInvite = async () => {
    const url = `${window.location.origin}/duel/${encodeURIComponent(duelId)}`
    try {
      await navigator.clipboard.writeText(url)
      showToast('success', 'Invite link copied')
    } catch {
      showToast('error', 'Could not copy link')
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
      ? 'Host wins'
      : payload.outcome === 'guest_win'
      ? 'Guest wins'
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

  return (
    <StyledMultiGamePage>
      <Meta title="Duel" />

      {lobbyOrFinish && (
        <GamifiedCenterStage>
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
                <div style={{ marginBottom: 14 }}>
                  <DuelRoundOverview
                    variant="compact"
                    roundOneBased={payload.lastRoundResult.roundIndex + 1}
                    mode={payload.mode}
                    actual={payload.lastRoundActualLocation}
                    result={payload.lastRoundResult}
                    hostMaxHp={payload.startingHpHost}
                    guestMaxHp={payload.startingHpGuest}
                    viewerRole={you}
                  />
                </div>
              )}
            </DuelFinishBanner>
          )}

          {waitingLobby && you === 'host' && (
            <DuelLobbyHostWaitingPanel shortCode={payload.shortCode} onCopyInvite={() => void copyInvite()} />
          )}

          {waitingLobby && you !== 'host' && (
            <DuelLobbyGuestJoinPanel
              shortCode={payload.shortCode}
              mode={payload.mode}
              totalRounds={payload.totalRounds}
              onJoin={() => void handleJoin()}
            />
          )}

          {lobbyGuestReady && you === 'host' && (
            <DuelLobbyHostStartPanel onStart={() => void handleStartGame()} />
          )}

          {lobbyGuestReady && you === 'guest' && <DuelLobbyGuestWaitingPanel />}
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
