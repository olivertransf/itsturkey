import { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Game from '@backend/models/game'
import StreetView from '@components/StreetView/StreetView'
import type { DuelGuessSubmitPayload } from '@components/StreetView/StreetView'
import {
  ChartBarIcon,
  CursorClickIcon,
  EyeIcon,
  FlagIcon,
  HeartIcon,
  LightningBoltIcon,
  LockClosedIcon,
  SparklesIcon,
} from '@heroicons/react/outline'
import { DuelHpMeter, DuelPointsMeter } from '@components/duel/DuelHpMeter'
import { useAppDispatch } from '@redux/hook'
import { updateStartTime } from '@redux/slices'
import type { GameViewType, LocationType } from '@types'
import { mailman, showToast } from '@utils/helpers'
import styled, { keyframes } from 'styled-components'
import DuelRoundOverview from './DuelRoundOverview'
import type { DuelClientPayload, DuelRoundResultClient, DuelViewerRole } from './duelApiTypes'

const HudRoot = styled.div`
  flex-shrink: 0;
  z-index: 20;
  position: relative;
  padding: 10px 14px 12px;
  background: linear-gradient(180deg, rgba(14, 14, 22, 0.98) 0%, rgba(10, 10, 16, 0.97) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
`

const HudTop = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px 14px;
`

const ModeBadge = styled.div<{ $hp: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  flex-shrink: 0;
  background: ${({ $hp }) =>
    $hp
      ? 'linear-gradient(145deg, rgba(239, 68, 68, 0.25), rgba(220, 38, 38, 0.12))'
      : 'linear-gradient(145deg, rgba(234, 179, 8, 0.22), rgba(202, 138, 4, 0.1))'};
  border: 1px solid ${({ $hp }) => ($hp ? 'rgba(248, 113, 113, 0.35)' : 'rgba(250, 204, 21, 0.35)')};
  color: ${({ $hp }) => ($hp ? '#fecaca' : '#fde047')};

  svg {
    width: 20px;
    height: 20px;
  }
`

const MetersGrid = styled.div`
  display: flex;
  align-items: stretch;
  gap: 14px;
  flex: 1;
  min-width: 200px;

  .meter-grow {
    flex: 1;
    min-width: 0;
  }
`

const VsGlyph = styled.span`
  align-self: center;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.28);
  flex-shrink: 0;
`

const RoundChip = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #e4e4e7;
  flex-shrink: 0;

  svg {
    width: 15px;
    height: 15px;
    opacity: 0.75;
    color: #a78bfa;
  }
`

const IconGhostBtn = styled.button`
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid rgba(248, 113, 113, 0.35);
  background: rgba(127, 29, 29, 0.25);
  color: #fca5a5;
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background 0.15s ease,
    transform 0.15s ease;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: rgba(153, 27, 27, 0.4);
    transform: translateY(-1px);
  }
`

const PlayStage = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
`

const PlayColumn = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const StreetOverlayWrap = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`

const FloatingDock = styled.div`
  position: absolute;
  bottom: max(14px, env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  z-index: 25;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(6, 6, 12, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  backdrop-filter: blur(14px);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`

const timerGlow = keyframes`
  0%,
  100% {
    box-shadow:
      0 0 0 0 rgba(250, 204, 21, 0.28),
      0 18px 50px rgba(0, 0, 0, 0.55);
  }
  50% {
    box-shadow:
      0 0 36px 10px rgba(250, 204, 21, 0.2),
      0 22px 60px rgba(0, 0, 0, 0.58);
  }
`

const lockPop = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.88);
  }
  72% {
    opacity: 1;
    transform: scale(1.04);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`

const ReactionTimerOverlay = styled.div`
  position: fixed;
  top: max(14px, env(safe-area-inset-top));
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`

const ReactionTimerCard = styled.div`
  padding: 12px 32px 14px;
  min-width: min(280px, calc(100vw - 40px));
  text-align: center;
  border-radius: 18px;
  background: rgba(12, 10, 8, 0.94);
  border: 2px solid rgba(250, 204, 21, 0.52);
  backdrop-filter: blur(16px);
  animation: ${timerGlow} 1.85s ease-in-out infinite;
`

const ReactionTimerLabel = styled.div`
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #fde047;
  opacity: 0.85;
  margin-bottom: 4px;
`

const ReactionTimerSeconds = styled.div`
  font-size: clamp(2.25rem, 7vw, 3rem);
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: #fffbeb;
  text-shadow: 0 0 28px rgba(250, 204, 21, 0.42);
`

const ReactionTimerHint = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: rgba(254, 243, 199, 0.78);
  margin-top: 6px;
`

const LockInBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 55;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.38);
  backdrop-filter: blur(8px);
`

const LockInCard = styled.div<{ $timed: boolean }>`
  pointer-events: none;
  padding: 28px 36px;
  border-radius: 22px;
  text-align: center;
  max-width: min(340px, calc(100vw - 48px));
  background: ${({ $timed }) =>
    $timed
      ? 'linear-gradient(165deg, rgba(58, 42, 12, 0.96), rgba(26, 18, 8, 0.98))'
      : 'linear-gradient(165deg, rgba(16, 42, 24, 0.96), rgba(10, 26, 14, 0.98))'};
  border: 2px solid
    ${({ $timed }) => ($timed ? 'rgba(251, 191, 36, 0.55)' : 'rgba(74, 222, 128, 0.58)')};
  box-shadow: ${({ $timed }) =>
    $timed ? '0 0 42px rgba(245, 158, 11, 0.22)' : '0 0 42px rgba(34, 197, 94, 0.28)'};
  animation: ${lockPop} 0.48s cubic-bezier(0.34, 1.3, 0.64, 1) both;
  color: #ecfccb;

  svg.lock-ico {
    width: 52px;
    height: 52px;
    margin: 0 auto 14px;
    display: block;
    opacity: 0.95;
    color: ${({ $timed }) => ($timed ? '#fcd34d' : '#86efac')};
  }
`

const LockInTitle = styled.div`
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.85;
  margin-bottom: 8px;
`

const LockInMain = styled.div`
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #f7fee7;
`

const DockChip = styled.div<{ $lit?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${({ $lit }) => ($lit ? '#ecfccb' : '#a1a1aa')};
  background: ${({ $lit }) => ($lit ? 'rgba(34, 197, 94, 0.22)' : 'rgba(255, 255, 255, 0.06)')};
  border: 1px solid ${({ $lit }) => ($lit ? 'rgba(74, 222, 128, 0.45)' : 'rgba(255, 255, 255, 0.08)')};
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    opacity: 0.92;
  }
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
  startingHpHost: number
  startingHpGuest: number
  completedRounds: number
  totalRounds?: number
  onForfeit: () => void
}

const DuelHudBar = memo(function DuelHudBar({
  mode,
  hostHp,
  guestHp,
  hostPts,
  guestPts,
  startingHpHost,
  startingHpGuest,
  completedRounds,
  totalRounds,
  onForfeit,
}: HudBarProps) {
  const roundLabel =
    mode === 'points' && totalRounds != null
      ? `${completedRounds + 1}/${totalRounds}`
      : `${completedRounds + 1}`

  const sumPts = hostPts + guestPts
  const hostShare = sumPts <= 0 ? 50 : (hostPts / sumPts) * 100
  const guestShare = sumPts <= 0 ? 50 : (guestPts / sumPts) * 100

  const hostTint =
    hostPts > guestPts ? 'blue' : guestPts > hostPts ? ('neutral' as const) : ('neutral' as const)
  const guestTint =
    guestPts > hostPts ? 'purple' : hostPts > guestPts ? ('neutral' as const) : ('neutral' as const)

  return (
    <HudRoot>
      <HudTop>
        <ModeBadge $hp={mode === 'hp'} title={mode === 'hp' ? 'HP duel' : 'Points duel'}>
          {mode === 'hp' ? <HeartIcon /> : <LightningBoltIcon />}
        </ModeBadge>

        <MetersGrid>
          {mode === 'hp'
            ? [
                <div key="mh" className="meter-grow">
                  <DuelHpMeter
                    label="Host"
                    current={hostHp}
                    max={startingHpHost}
                    accent="#93c5fd"
                    dense
                    icon={<HeartIcon />}
                  />
                </div>,
                <VsGlyph key="vs">VS</VsGlyph>,
                <div key="mg" className="meter-grow">
                  <DuelHpMeter
                    label="Guest"
                    current={guestHp}
                    max={startingHpGuest}
                    accent="#d8b4fe"
                    dense
                    icon={<HeartIcon />}
                  />
                </div>,
              ]
            : [
                <div key="ph" className="meter-grow">
                  <DuelPointsMeter
                    label="Host"
                    points={hostPts}
                    accent="#93c5fd"
                    dense
                    sharePct={hostShare}
                    barTint={hostTint}
                    icon={<ChartBarIcon />}
                  />
                </div>,
                <VsGlyph key="vsp">VS</VsGlyph>,
                <div key="pg" className="meter-grow">
                  <DuelPointsMeter
                    label="Guest"
                    points={guestPts}
                    accent="#d8b4fe"
                    dense
                    sharePct={guestShare}
                    barTint={guestTint}
                    icon={<ChartBarIcon />}
                  />
                </div>,
              ]}
        </MetersGrid>

        <RoundChip title="Current round">
          <SparklesIcon />
          {roundLabel}
        </RoundChip>

        <IconGhostBtn type="button" title="Forfeit duel" aria-label="Forfeit duel" onClick={() => void onForfeit()}>
          <FlagIcon />
        </IconGhostBtn>
      </HudTop>
    </HudRoot>
  )
})

type FloatingDockProps = {
  deadlineMs: number | null
  youLocked: boolean
  opponentLocked: boolean
}

const DuelFloatingDock = memo(function DuelFloatingDock({
  deadlineMs,
  youLocked,
  opponentLocked,
}: FloatingDockProps) {
  const phaseIdle = deadlineMs === null && !youLocked && !opponentLocked
  const phaseYouNeedGuess = deadlineMs === null && !youLocked && opponentLocked

  return (
    <FloatingDock>
      {phaseIdle && (
        <DockChip title="Place a pin on the map">
          <CursorClickIcon />
        </DockChip>
      )}
      {phaseYouNeedGuess && (
        <DockChip $lit title="Submit your guess">
          <CursorClickIcon />
        </DockChip>
      )}
      <DockChip $lit={youLocked} title={youLocked ? 'You locked in' : 'You have not locked'}>
        <LockClosedIcon />
      </DockChip>
      <DockChip $lit={opponentLocked} title={opponentLocked ? 'Opponent locked in' : 'Opponent still guessing'}>
        <EyeIcon />
      </DockChip>
    </FloatingDock>
  )
})

type StreetSectionProps = {
  duelId: string
  completedRounds: number
  gameData: Game
  duelGuessSubmit: (body: DuelGuessSubmitPayload) => Promise<void>
  deadlineMs: number | null
  youLocked: boolean
  opponentLocked: boolean
}

const DuelStreetSection = memo(
  function DuelStreetSection({
    duelId,
    completedRounds,
    gameData,
    duelGuessSubmit,
    deadlineMs,
    youLocked,
    opponentLocked,
  }: StreetSectionProps) {
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
      <StreetOverlayWrap>
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
        <DuelFloatingDock
          deadlineMs={deadlineMs}
          youLocked={youLocked}
          opponentLocked={opponentLocked}
        />
      </StreetOverlayWrap>
    )
  },
  (prev, next) =>
    prev.duelId === next.duelId &&
    prev.completedRounds === next.completedRounds &&
    prev.gameData === next.gameData &&
    prev.duelGuessSubmit === next.duelGuessSubmit &&
    prev.deadlineMs === next.deadlineMs &&
    prev.youLocked === next.youLocked &&
    prev.opponentLocked === next.opponentLocked
)

type Props = {
  duelId: string
  payload: DuelClientPayload
  role: DuelViewerRole
  onRefresh: () => Promise<void>
}

function frozenHudTotals(payload: DuelClientPayload, lr: DuelRoundResultClient | null, recapOpen: boolean) {
  if (!recapOpen || !lr) {
    return {
      hostHp: payload.host.hp,
      guestHp: payload.guest.hp,
      hostPts: payload.host.totalPoints,
      guestPts: payload.guest.totalPoints,
    }
  }

  if (payload.mode === 'hp') {
    return {
      hostHp: lr.hostHpAfter + lr.damageToHost,
      guestHp: lr.guestHpAfter + lr.damageToGuest,
      hostPts: payload.host.totalPoints,
      guestPts: payload.guest.totalPoints,
    }
  }

  /**
   * Points totals from the API already include `lr`'s round. Show pre-round cumulative while recap is open.
   * Requires ledger round index to match the latest completed round (roundIndex === completedRounds - 1).
   */
  const ledgerMatchesLatestRound = lr.roundIndex === payload.completedRounds - 1
  if (!ledgerMatchesLatestRound) {
    return {
      hostHp: payload.host.hp,
      guestHp: payload.guest.hp,
      hostPts: payload.host.totalPoints,
      guestPts: payload.guest.totalPoints,
    }
  }

  return {
    hostHp: payload.host.hp,
    guestHp: payload.guest.hp,
    hostPts: Math.max(0, payload.host.totalPoints - lr.hostPoints),
    guestPts: Math.max(0, payload.guest.totalPoints - lr.guestPoints),
  }
}

const DuelPlaySurface: FC<Props> = ({ duelId, payload, role, onRefresh }) => {
  const dispatch = useAppDispatch()
  const [now, setNow] = useState(() => Date.now())
  const [lockFlash, setLockFlash] = useState<'none' | 'locked' | 'timed'>('none')

  useEffect(() => {
    if (payload.roundDeadlineAt == null || payload.roundDeadlineAt === '') return
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [payload.roundDeadlineAt])

  const deadlineMs =
    payload.roundDeadlineAt != null && payload.roundDeadlineAt !== ''
      ? Math.max(0, new Date(payload.roundDeadlineAt).getTime() - now)
      : null

  const loc = payload.currentLocation
  const md = payload.mapDetails
  const gs = payload.gameSettings
  const mapBoundsKey = JSON.stringify(md?.bounds ?? null)
  const mapIdStr = md?._id != null ? String(md._id) : ''

  const lr = payload.lastRoundResult
  const revealActual = payload.lastRoundActualLocation
  const recapAck = payload.recapAckRoundIndex ?? -1

  const showRoundReveal =
    payload.status === 'in_progress' &&
    lr != null &&
    revealActual != null &&
    lr.roundIndex > recapAck

  const hudTotals = frozenHudTotals(payload, lr, showRoundReveal)

  useEffect(() => {
    if (lockFlash === 'none') return
    const t = window.setTimeout(() => setLockFlash('none'), 2100)
    return () => window.clearTimeout(t)
  }, [lockFlash])

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

      setLockFlash(body.timedOut ? 'timed' : 'locked')

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

  const showReactionTimer =
    deadlineMs !== null && !showRoundReveal && payload.status === 'in_progress'

  return (
    <PlayColumn>
      {showReactionTimer && (
        <ReactionTimerOverlay aria-live="polite">
          <ReactionTimerCard>
            <ReactionTimerLabel>Reaction time</ReactionTimerLabel>
            <ReactionTimerSeconds>{(deadlineMs / 1000).toFixed(1)}</ReactionTimerSeconds>
            <ReactionTimerHint>
              {payload.flags.opponentLocked ? 'Opponent locked · finish your guess' : 'Clock running'}
            </ReactionTimerHint>
          </ReactionTimerCard>
        </ReactionTimerOverlay>
      )}

      {lockFlash !== 'none' && !showRoundReveal && (
        <LockInBackdrop aria-live="polite">
          <LockInCard $timed={lockFlash === 'timed'}>
            <LockClosedIcon className="lock-ico" />
            <LockInTitle>{lockFlash === 'timed' ? 'Time up' : 'Locked in'}</LockInTitle>
            <LockInMain>{lockFlash === 'timed' ? 'Guess submitted' : 'Your guess is sealed'}</LockInMain>
          </LockInCard>
        </LockInBackdrop>
      )}

      <DuelHudBar
        mode={payload.mode}
        hostHp={hudTotals.hostHp}
        guestHp={hudTotals.guestHp}
        hostPts={hudTotals.hostPts}
        guestPts={hudTotals.guestPts}
        startingHpHost={payload.startingHpHost}
        startingHpGuest={payload.startingHpGuest}
        completedRounds={payload.completedRounds}
        totalRounds={payload.totalRounds}
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
            hostMaxHp={payload.startingHpHost}
            guestMaxHp={payload.startingHpGuest}
            viewerRole={role}
            onContinue={() => void dismissRecap()}
          />
        ) : (
          <DuelStreetSection
            duelId={duelId}
            completedRounds={payload.completedRounds}
            gameData={gameData}
            duelGuessSubmit={duelGuessSubmit}
            deadlineMs={deadlineMs}
            youLocked={payload.flags.youLocked}
            opponentLocked={payload.flags.opponentLocked}
          />
        )}
      </PlayStage>
    </PlayColumn>
  )
}

export default DuelPlaySurface
