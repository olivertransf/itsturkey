import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import DuelPlaySurface from '@components/duel/DuelPlaySurface'
import DuelRoundOverview from '@components/duel/DuelRoundOverview'
import type { DuelClientPayload } from '@components/duel/duelApiTypes'
import { NotFound } from '@components/errorViews'
import { LoadingPage } from '@components/layout'
import { Meta } from '@components/Meta'
import { Button } from '@components/system'
import StyledMultiGamePage from '@styles/MultiGamePage.Styled'
import type { PageType } from '@types'
import { mailman, showToast } from '@utils/helpers'
import { DUEL_POLL_MS, duelPollTier } from '@utils/duelPollTier'

const DuelRoomPage: PageType = () => {
  const router = useRouter()
  const duelId = router.query.id as string

  const [payload, setPayload] = useState<DuelClientPayload | null>()
  const [fatal, setFatal] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!duelId || duelId.length !== 24) return

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
    if (!duelId || duelId.length !== 24) return

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
    const url = `${window.location.origin}/duel/${duelId}`
    try {
      await navigator.clipboard.writeText(url)
      showToast('success', 'Invite link copied')
    } catch {
      showToast('error', 'Could not copy link')
    }
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

  const outcomeLabel =
    payload.outcome === 'tie'
      ? 'Tie game'
      : payload.outcome === 'host_win'
      ? 'Host wins'
      : payload.outcome === 'guest_win'
      ? 'Guest wins'
      : ''

  const youWon =
    !!payload.outcome &&
    payload.outcome !== 'tie' &&
    ((payload.outcome === 'host_win' && you === 'host') ||
      (payload.outcome === 'guest_win' && you === 'guest'))

  const headline =
    payload.outcome === 'tie' ? 'Tie game' : youWon ? 'You won' : you ? 'You lost' : outcomeLabel

  return (
    <StyledMultiGamePage>
      <Meta title="Duel" />

      {payload.status === 'finished' && (
        <div style={{ padding: 16, color: '#eee', background: '#111', borderBottom: '1px solid #333' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 22 }}>{headline}</h1>
          <p style={{ margin: 0, opacity: 0.85 }}>
            {payload.mode === 'hp'
              ? `Final HP — host ${payload.host.hp}, guest ${payload.guest.hp}`
              : `Final points — host ${payload.host.totalPoints}, guest ${payload.guest.totalPoints}`}
          </p>
          {payload.lastRoundResult && payload.lastRoundActualLocation && (
            <div style={{ marginTop: 16 }}>
              <DuelRoundOverview
                variant="compact"
                roundOneBased={payload.lastRoundResult.roundIndex + 1}
                mode={payload.mode}
                actual={payload.lastRoundActualLocation}
                result={payload.lastRoundResult}
              />
            </div>
          )}
          <Button variant="solidGray" size="sm" style={{ marginTop: 12 }} onClick={() => router.push('/')}>
            Home
          </Button>
        </div>
      )}

      {waitingLobby && you === 'host' && (
        <div style={{ padding: 16, color: '#eee', background: '#111', borderBottom: '1px solid #333' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 20 }}>Waiting for opponent</h1>
          <p style={{ margin: '0 0 8px', opacity: 0.85 }}>
            Share this link or code <strong>{payload.shortCode}</strong>
          </p>
          <p style={{ margin: '0 0 12px', opacity: 0.65, fontSize: 13, maxWidth: 520 }}>
            Two Incognito windows in the same browser share one anonymous session. Open the invite link in a normal
            window, another browser, or another profile so the guest gets their own identity.
          </p>
          <Button variant="solidGray" size="sm" onClick={() => void copyInvite()}>
            Copy invite link
          </Button>
        </div>
      )}

      {waitingLobby && you !== 'host' && (
        <div style={{ padding: 16, color: '#eee', background: '#111', borderBottom: '1px solid #333' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 20 }}>Join duel</h1>
          <p style={{ margin: '0 0 12px', opacity: 0.85 }}>
            Code <strong>{payload.shortCode}</strong> ·{' '}
            {payload.mode === 'hp' ? 'HP duel' : `Points duel (${payload.totalRounds} rounds)`}
          </p>
          <Button variant="solidGray" size="sm" onClick={() => void handleJoin()}>
            Join as guest
          </Button>
        </div>
      )}

      {lobbyGuestReady && you === 'host' && (
        <div style={{ padding: 16, color: '#eee', background: '#111', borderBottom: '1px solid #333' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 20 }}>Opponent joined</h1>
          <p style={{ margin: '0 0 12px', opacity: 0.85 }}>
            Start the duel when you are both ready. Street View loads after you start.
          </p>
          <Button variant="solidGray" size="sm" onClick={() => void handleStartGame()}>
            Start game
          </Button>
        </div>
      )}

      {lobbyGuestReady && you === 'guest' && (
        <div style={{ padding: 16, color: '#eee', background: '#111', borderBottom: '1px solid #333' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 20 }}>Waiting for host</h1>
          <p style={{ margin: 0, opacity: 0.85 }}>The host will start the duel shortly.</p>
        </div>
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
