import { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Game from '@backend/models/game'
import StreetView from '@components/StreetView/StreetView'
import type { DuelGuessSubmitPayload } from '@components/StreetView/StreetView'
import { LockClosedIcon } from '@heroicons/react/outline'
import { Button } from '@components/system'
import { useAppDispatch } from '@redux/hook'
import { updateStartTime } from '@redux/slices'
import type { GameViewType, LocationType } from '@types'
import { mailman, showToast } from '@utils/helpers'
import styled from 'styled-components'
import DuelRoundOverview from './DuelRoundOverview'
import type { DuelClientPayload, DuelViewerRole } from './duelApiTypes'

const Hud = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(20, 20, 20, 0.92);
  color: #eee;
  font-size: 13px;
  border-bottom: 1px solid #333;
  z-index: 20;
  position: relative;

  .hud-main {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .hp-bar {
    display: flex;
    gap: 8px;
    align-items: baseline;
  }

  .mono {
    font-variant-numeric: tabular-nums;
  }

  .deadline {
    color: #fbbf24;
  }

  .lock-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .lock-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 999px;
    font-size: 12px;
    border: 1px solid #444;
    color: #9ca3af;
  }

  .lock-pill.on {
    border-color: #22c55e;
    color: #d1fae5;
    background: rgba(34, 197, 94, 0.12);
  }

  .lock-pill svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`

const PlayStage = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`

const PlayColumn = styled.div`
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`

const PanoStretch = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`

const PIN_PATCH_MS = 2000
const PIN_EPS = 1e-7

const buildSyntheticGame = (payload: DuelClientPayload, role: DuelViewerRole): Game => {
  const loc = payload.currentLocation
  const mapDetails = payload.mapDetails ?? undefined

  return {
    _id: payload.id as unknown as Game['_id'],
    mapId: mapDetails?._id ? String(mapDetails._id) : payload.id,
    mapName: mapDetails?.name,
    mapDetails,
    mode: 'standard',
    unlimited: payload.mode === 'hp',
    totalRounds: payload.mode === 'points' ? payload.totalRounds : undefined,
    round: 1,
    rounds: loc ? [loc] : [],
    totalPoints:
      role === 'host' ? payload.host.totalPoints : role === 'guest' ? payload.guest.totalPoints : 0,
    gameSettings: {
      ...payload.gameSettings,
      timeLimit: 0,
    },
    guesses: [],
    totalDistance: { metric: 0, imperial: 0 },
    totalTime: 0,
    streak: 0,
    state: 'started',
    notForLeaderboard: true,
  } as Game
}

type HudBarProps = {
  mode: DuelClientPayload['mode']
  hostHp: number
  guestHp: number
  hostPts: number
  guestPts: number
  completedRounds: number
  totalRounds?: number
  roundDeadlineAt: string | null | undefined
  youLocked: boolean
  opponentLocked: boolean
  onForfeit: () => void
}

/** Own `now` ticker only while a reactive deadline exists — avoids re-rendering Street View every 500ms. */
const DuelHudBar = memo(function DuelHudBar({
  mode,
  hostHp,
  guestHp,
  hostPts,
  guestPts,
  completedRounds,
  totalRounds,
  roundDeadlineAt,
  youLocked,
  opponentLocked,
  onForfeit,
}: HudBarProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (roundDeadlineAt == null || roundDeadlineAt === '') return
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [roundDeadlineAt])

  const deadlineMs =
    roundDeadlineAt != null && roundDeadlineAt !== ''
      ? Math.max(0, new Date(roundDeadlineAt).getTime() - now)
      : null

  const roundLabel =
    mode === 'points' && totalRounds != null
      ? `${completedRounds + 1} / ${totalRounds}`
      : `${completedRounds + 1}`

  return (
    <Hud>
      <div className="hud-main">
        <span className="mono">{mode === 'hp' ? 'HP duel' : 'Points duel'}</span>
        <span className="hp-bar">
          <span>Host {mode === 'hp' ? `${hostHp} HP` : `${hostPts} pts`}</span>
          <span>|</span>
          <span>Guest {mode === 'hp' ? `${guestHp} HP` : `${guestPts} pts`}</span>
        </span>
        <span className="mono">Round {roundLabel}</span>
        {deadlineMs !== null && (
          <span className="deadline mono">
            Clock {(deadlineMs / 1000).toFixed(1)}s · opponent {opponentLocked ? 'locked' : 'thinking'}
          </span>
        )}
        {!deadlineMs && opponentLocked && <span className="mono">Opponent locked — submit your guess</span>}
        {!youLocked && <span className="mono">{opponentLocked ? 'Submit soon' : 'Place pin & Guess'}</span>}
        {youLocked && !deadlineMs && <span className="mono">Waiting for opponent…</span>}
        <Button variant="solidGray" size="sm" onClick={() => void onForfeit()}>
          Forfeit
        </Button>
      </div>
      <div className="lock-strip">
        <span className={`lock-pill ${youLocked ? 'on' : ''}`}>
          <LockClosedIcon />
          You · {youLocked ? 'Locked in' : 'Not locked'}
        </span>
        <span className={`lock-pill ${opponentLocked ? 'on' : ''}`}>
          <LockClosedIcon />
          Opponent · {opponentLocked ? 'Locked in' : 'Not locked'}
        </span>
      </div>
    </Hud>
  )
})

type StreetSectionProps = {
  duelId: string
  completedRounds: number
  gameData: Game
  duelGuessSubmit: (body: DuelGuessSubmitPayload) => Promise<void>
}

const DuelStreetSection = memo(
  function DuelStreetSection({ duelId, completedRounds, gameData, duelGuessSubmit }: StreetSectionProps) {
    const [view, setView] = useState<GameViewType>('Game')
    const pinRef = useRef<{ lat: number; lng: number } | null>(null)
    const lastSentPinRef = useRef<{ lat: number; lng: number } | null>(null)

    useEffect(() => {
      const t = window.setInterval(() => {
        const p = pinRef.current
        if (!p) return
        const prev = lastSentPinRef.current
        if (
          prev &&
          Math.abs(prev.lat - p.lat) < PIN_EPS &&
          Math.abs(prev.lng - p.lng) < PIN_EPS
        ) {
          return
        }
        lastSentPinRef.current = { lat: p.lat, lng: p.lng }
        void mailman(`duels/${duelId}/pin`, 'PATCH', JSON.stringify(p))
      }, PIN_PATCH_MS)
      return () => window.clearInterval(t)
    }, [duelId])

    const onGuessCoordinateChange = useCallback((loc: LocationType | null) => {
      pinRef.current = loc ? { lat: loc.lat, lng: loc.lng } : null
    }, [])

    return (
      <PanoStretch>
        <StreetView
          key={completedRounds}
          gameData={gameData}
          setGameData={() => {
            /* duel state is server-owned */
          }}
          view={view}
          setView={setView}
          compactGuessMapIdle
          duelGuessSubmit={duelGuessSubmit}
          onGuessCoordinateChange={onGuessCoordinateChange}
        />
      </PanoStretch>
    )
  },
  (prev, next) =>
    prev.duelId === next.duelId &&
    prev.completedRounds === next.completedRounds &&
    prev.gameData === next.gameData &&
    prev.duelGuessSubmit === next.duelGuessSubmit
)

type Props = {
  duelId: string
  payload: DuelClientPayload
  role: DuelViewerRole
  onRefresh: () => Promise<void>
}

const DuelPlaySurface: FC<Props> = ({ duelId, payload, role, onRefresh }) => {
  const dispatch = useAppDispatch()

  const loc = payload.currentLocation
  const md = payload.mapDetails
  const gs = payload.gameSettings
  const mapBoundsKey = JSON.stringify(md?.bounds ?? null)
  const mapIdStr = md?._id != null ? String(md._id) : ''

  const gameData = useMemo(
    () => buildSyntheticGame(payload, role),
    [
      role,
      payload.id,
      payload.completedRounds,
      payload.host.hp,
      payload.host.totalPoints,
      payload.guest.hp,
      payload.guest.totalPoints,
      payload.mode,
      payload.totalRounds,
      loc?.lat,
      loc?.lng,
      loc?.panoId,
      loc?.heading,
      loc?.pitch,
      loc?.zoom,
      gs.canMove,
      gs.canPan,
      gs.canZoom,
      mapIdStr,
      mapBoundsKey,
      md?.scoreFactor,
      md?.name,
    ]
  )

  useEffect(() => {
    dispatch(updateStartTime({ startTime: new Date().getTime() }))
  }, [dispatch, payload.completedRounds])

  const duelGuessSubmit = useCallback(
    async (body: DuelGuessSubmitPayload) => {
      const lat = body.guess?.lat ?? 0
      const lng = body.guess?.lng ?? 0

      if (!body.timedOut && !body.guess) {
        showToast('error', 'Place a pin first')
        return
      }

      const res = await mailman(`duels/${duelId}/guess`, 'POST', JSON.stringify({ lat, lng }))

      if (res?.error) {
        showToast('error', res.error.message)
        return
      }

      showToast(
        'success',
        body.timedOut ? 'Submitted' : 'Locked in',
        'default',
        { duration: 4000 }
      )

      await onRefresh()
    },
    [duelId, onRefresh]
  )

  const handleForfeit = useCallback(async () => {
    const res = await mailman(`duels/${duelId}/forfeit`, 'POST', JSON.stringify({}))

    if (res?.error) {
      showToast('error', res.error.message)
    }

    await onRefresh()
  }, [duelId, onRefresh])

  const lr = payload.lastRoundResult
  const revealActual = payload.lastRoundActualLocation
  const recapAck = payload.recapAckRoundIndex ?? -1

  const showRoundReveal =
    payload.status === 'in_progress' &&
    lr != null &&
    revealActual != null &&
    lr.roundIndex > recapAck

  const dismissRecap = useCallback(async () => {
    if (!lr) return
    const res = await mailman(
      `duels/${duelId}/recap-dismiss`,
      'POST',
      JSON.stringify({ roundIndex: lr.roundIndex })
    )

    if (res?.error) {
      showToast('error', res.error.message)
      return
    }

    await onRefresh()
  }, [duelId, lr, onRefresh])

  return (
    <PlayColumn>
      <DuelHudBar
        mode={payload.mode}
        hostHp={payload.host.hp}
        guestHp={payload.guest.hp}
        hostPts={payload.host.totalPoints}
        guestPts={payload.guest.totalPoints}
        completedRounds={payload.completedRounds}
        totalRounds={payload.totalRounds}
        roundDeadlineAt={payload.roundDeadlineAt}
        youLocked={payload.flags.youLocked}
        opponentLocked={payload.flags.opponentLocked}
        onForfeit={handleForfeit}
      />

      <PlayStage>
        {showRoundReveal && lr && revealActual ? (
          <DuelRoundOverview
            variant="fullscreen"
            roundOneBased={lr.roundIndex + 1}
            mode={payload.mode}
            actual={revealActual}
            result={lr}
            onContinue={() => void dismissRecap()}
          />
        ) : (
          <DuelStreetSection
            duelId={duelId}
            completedRounds={payload.completedRounds}
            gameData={gameData}
            duelGuessSubmit={duelGuessSubmit}
          />
        )}
      </PlayStage>
    </PlayColumn>
  )
}

export default DuelPlaySurface
