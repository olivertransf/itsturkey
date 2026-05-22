import { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Game from '@backend/models/game'
import StreetView from '@components/StreetView/StreetView'
import type { DuelGuessSubmitPayload } from '@components/StreetView/StreetView'
import { ChevronLeftIcon, FlagIcon, LockClosedIcon } from '@heroicons/react/outline'
import { useRouter } from 'next/router'
import { DuelHpMeter, DuelPointsMeter } from '@components/duel/DuelHpMeter'
import { useAppDispatch } from '@redux/hook'
import { updateStartTime } from '@redux/slices'
import type { GameViewType, LocationType } from '@types'
import { mailman, showToast } from '@utils/helpers'
import { useVisibleInterval } from '@utils/useVisibleInterval'
import styled, { css, keyframes } from 'styled-components'
import { USER_AVATAR_PATH } from '@utils/constants/random'
import { duelRoundDamageMultiplier } from '@backend/utils/duelConstants'
import DuelRoundOverview from './DuelRoundOverview'
import type { DuelClientPayload, DuelGuessAvatar, DuelRoundResultClient, DuelViewerRole } from './duelApiTypes'

const HudRoot = styled.div`
  z-index: 34;
  position: absolute;
  top: max(8px, env(safe-area-inset-top));
  left: 0;
  right: 0;
  padding: 0 var(--pad-card-sm);
  pointer-events: none;

  @media (max-width: 640px) {
    top: max(6px, env(safe-area-inset-top));
    padding: 0 10px;
  }
`

const HudTop = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px 12px;
  background: rgba(12, 14, 18, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  backdrop-filter: blur(10px) saturate(135%);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.38);
  padding: 9px 10px;
  min-height: 56px;
  pointer-events: auto;

  @media (max-width: 880px) {
    gap: 8px 10px;
    padding: 8px;
  }

  max-width: min(980px, 100%);
  margin: 0 auto;

  .hud-meter {
    min-width: 0;
  }

  .hud-exit {
    justify-self: start;
  }

  .hud-forfeit-only {
    justify-self: end;
  }

  .hud-round {
    align-self: start;
    padding-top: 1px;
  }

  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    grid-template-rows: auto auto;

    .hud-meter--you {
      grid-column: 1;
      grid-row: 1;
    }

    .hud-round {
      grid-column: 2;
      grid-row: 1;
    }

    .hud-meter--opp {
      grid-column: 3;
      grid-row: 1;
    }

    .hud-exit {
      grid-column: 1;
      grid-row: 2;
      justify-self: start;
    }

    .hud-forfeit-only {
      grid-column: 3;
      grid-row: 2;
      justify-self: end;
    }
  }
`

const HudRoundStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  padding: 0 4px;
  flex-shrink: 0;
`

const HudRoundLabel = styled.div`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(244, 244, 245, 0.88);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  line-height: 1.15;

  @media (max-width: 640px) {
    font-size: 10px;
    letter-spacing: 0.1em;
  }
`

const HudRoundRampLabel = styled.div`
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(163, 163, 173, 0.75);
  line-height: 1;

  @media (max-width: 640px) {
    font-size: 8px;
    letter-spacing: 0.08em;
  }
`

const HudRoundRampMult = styled.div`
  font-size: 13px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: rgba(244, 244, 245, 0.92);
  line-height: 1.1;

  @media (max-width: 640px) {
    font-size: 12px;
  }
`

/** Compact multiplier for HUD (e.g. 1, 1.25) — pair with × in UI. */
function formatDuelDmgMultShort(n: number): string {
  const r = Math.round(n * 100) / 100
  if (Number.isInteger(r)) return String(r)
  return String(r)
}

function isUnityDamageMult(n: number): boolean {
  return Math.round(n * 100) === 100
}

function hpMeterLabelWithMult(baseName: string, mult: number): string {
  if (isUnityDamageMult(mult)) return baseName
  return `${baseName} (×${formatDuelDmgMultShort(mult)})`
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.trim().replace('#', '')
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16)
    const g = parseInt(h[1] + h[1], 16)
    const b = parseInt(h[2] + h[2], 16)
    return `rgba(${r},${g},${b},${alpha})`
  }
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }
  return `rgba(148, 163, 184, ${alpha})`
}

const HudMiniAvatar = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 999px;
  overflow: hidden;
  background: ${({ $color }) => hexToRgba($color, 0.4)};
  box-shadow: 0 0 0 2px ${({ $color }) => $color};

  img {
    width: 26px;
    height: 26px;
    object-fit: contain;
  }
`

const IconGhostBtn = styled.button`
  margin-left: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md, 10px);
  border: 1px solid rgba(248, 113, 113, 0.2);
  background: rgba(127, 29, 29, 0.16);
  color: #f87171;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.18s ease;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: rgba(153, 27, 27, 0.28);
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

const reactionSecondPulse = keyframes`
  0% {
    transform: scale(0.92);
    filter: brightness(1.35);
  }
  55% {
    transform: scale(1.08);
    filter: brightness(1.15);
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
`

const reactionEdgeFlash = keyframes`
  0% {
    opacity: 0.95;
  }
  100% {
    opacity: 0;
  }
`

const reactionRingGlowPulse = keyframes`
  0%,
  100% {
    opacity: 0.38;
    filter: drop-shadow(0 0 3px rgba(239, 68, 68, 0.15));
  }
  50% {
    opacity: 1;
    filter: drop-shadow(0 0 14px rgba(239, 68, 68, 0.72));
  }
`

const ReactionTimerArcProgress = styled.circle`
  fill: none;
  stroke: url(#reactionRingGradDuels);
  stroke-linecap: round;
  animation: ${reactionRingGlowPulse} 1.65s ease-in-out infinite;
`

const ReactionTimerVignette = styled.div<{ $urgency: number }>`
  position: fixed;
  inset: 0;
  z-index: 49;
  pointer-events: none;
  transition:
    opacity 0.1s linear,
    box-shadow 0.1s linear;
  ${({ $urgency }) => {
    const u = Math.min(1, Math.max(0, $urgency))
    const aBand = 0.06 + u * 0.34
    const aMid = 0.1 + u * 0.42
    const aDeep = 0.18 + u * 0.55
    const borderW = 2 + u * 14
    const borderA = 0.18 + u * 0.55
    return css`
      background: radial-gradient(
        ellipse 145% 130% at 50% 46%,
        transparent 0%,
        transparent 26%,
        rgba(239, 68, 68, ${aBand * 0.75}) 44%,
        rgba(185, 28, 28, ${aMid}) 62%,
        rgba(69, 10, 10, ${aDeep}) 82%,
        rgba(24, 6, 6, ${Math.min(0.92, aDeep * 1.08)}) 100%
      );
      box-shadow: inset 0 0 0 ${borderW}px rgba(248, 113, 113, ${borderA});
    `
  }}
`

const ReactionTimerEdgePulse = styled.div`
  position: fixed;
  inset: 0;
  z-index: 49;
  pointer-events: none;
  box-shadow: inset 0 0 0 5px rgba(248, 113, 113, 0.55);
  animation: ${reactionEdgeFlash} 0.65s ease-out forwards;
`

const ReactionTimerOverlay = styled.div`
  position: fixed;
  top: max(16px, env(safe-area-inset-top));
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const ReactionTimerCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: var(--radius-xl, 18px);
  background: transparent;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
`

const ReactionTimerRingWrap = styled.div`
  position: relative;
  width: 108px;
  height: 108px;
  flex-shrink: 0;
`

const ReactionTimerSecondsCenter = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1.5rem, 4.8vw, 1.95rem);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  letter-spacing: -0.03em;
  color: #f87171;
  text-shadow:
    0 0 20px rgba(239, 68, 68, 0.55),
    0 0 40px rgba(185, 28, 28, 0.25);
  animation: ${reactionSecondPulse} 0.48s ease-out;
  pointer-events: none;
`

const LockInBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 55;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`

const LockInCard = styled.div<{ $timed: boolean }>`
  pointer-events: none;
  padding: 18px 26px 20px;
  border-radius: var(--radius-xl, 18px);
  text-align: center;
  max-width: min(280px, calc(100vw - 40px));
  background-color: ${({ $timed }) => ($timed ? 'rgba(38, 32, 24, 0.96)' : 'rgba(18, 20, 26, 0.96)')};
  border: 1px solid
    ${({ $timed }) => ($timed ? 'rgba(251, 191, 36, 0.4)' : 'rgba(96, 165, 250, 0.35)')};
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px) saturate(140%);
  animation: ${lockPop} 0.42s cubic-bezier(0.34, 1.2, 0.64, 1) both;
  color: var(--text-primary);

  svg.lock-ico {
    width: 36px;
    height: 36px;
    margin: 0 auto 10px;
    display: block;
    opacity: 0.92;
    color: ${({ $timed }) => ($timed ? '#fbbf24' : 'var(--palette-accent)')};
  }
`

const LockInMain = styled.div`
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #f4f4f5;
  line-height: 1.25;
`

const PanoStretch = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`

const PIN_PATCH_MS = 2000
const PIN_EPS = 1e-7

const REACTION_RING_R = 36
const REACTION_RING_C = 2 * Math.PI * REACTION_RING_R
const REACTION_RING_STROKE = 8

function reactionTimeRemainingFraction(deadlineMs: number, reactiveSeconds: number): number {
  const total = Math.max(250, reactiveSeconds * 1000)
  return Math.min(1, Math.max(0, deadlineMs / total))
}

function duelHudAvatarIcon(avatar: DuelGuessAvatar) {
  const c = avatar.color?.trim() || '#94a3b8'
  return (
    <HudMiniAvatar $color={c}>
      <img src={`${USER_AVATAR_PATH}/${avatar.emoji}.svg`} alt="" />
    </HudMiniAvatar>
  )
}

const buildSyntheticGame = (payload: DuelClientPayload, role: DuelViewerRole): Game => {
  const loc = payload.currentLocation
  const mapDetails = payload.mapDetails ?? undefined

  return {
    _id: payload.id as unknown as Game['_id'],
    mapId: payload.mapId || (mapDetails?._id != null ? String(mapDetails._id) : String(payload.id)),
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
  /** Seat order: you on the left, opponent on the right. */
  viewerRole: Exclude<DuelViewerRole, null>
  playerNames: { host: string; guest: string }
  playerAvatars: { host: DuelGuessAvatar; guest: DuelGuessAvatar }
  damageMultiplierHost: number
  damageMultiplierGuest: number
  useRoundRamp: boolean
  onExit: () => void
  onForfeit: () => void
}

/** When avatar has no color (shouldn’t happen); avoids bare blue/red for anonymous fallbacks. */
const ACCENT_FALLBACK = '#94a3b8'

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
  viewerRole,
  playerNames,
  playerAvatars,
  damageMultiplierHost,
  damageMultiplierGuest,
  useRoundRamp,
  onExit,
  onForfeit,
}: HudBarProps) {
  const roundRampDisplay = duelRoundDamageMultiplier(completedRounds + 1, useRoundRamp)

  const roundLabel =
    mode === 'points' && totalRounds != null
      ? `Round ${completedRounds + 1} / ${totalRounds}`
      : `Round ${completedRounds + 1}`

  const youAreHost = viewerRole === 'host'
  const youHp = youAreHost ? hostHp : guestHp
  const oppHp = youAreHost ? guestHp : hostHp
  const youPts = youAreHost ? hostPts : guestPts
  const oppPts = youAreHost ? guestPts : hostPts
  const youStartHp = youAreHost ? startingHpHost : startingHpGuest
  const oppStartHp = youAreHost ? startingHpGuest : startingHpHost

  const sumPts = youPts + oppPts
  const youShare = sumPts <= 0 ? 50 : (youPts / sumPts) * 100
  const oppShare = sumPts <= 0 ? 50 : (oppPts / sumPts) * 100

  const youTint = youPts > oppPts ? 'you' : ('neutral' as const)
  const oppTint = oppPts > youPts ? 'opponent' : ('neutral' as const)

  const youName = youAreHost ? playerNames.host : playerNames.guest
  const oppName = youAreHost ? playerNames.guest : playerNames.host
  const youAvatar = youAreHost ? playerAvatars.host : playerAvatars.guest
  const oppAvatar = youAreHost ? playerAvatars.guest : playerAvatars.host

  const youAccent = youAvatar.color?.trim() || ACCENT_FALLBACK
  const oppAccent = oppAvatar.color?.trim() || ACCENT_FALLBACK

  const youDmgMult = youAreHost ? damageMultiplierHost : damageMultiplierGuest
  const oppDmgMult = youAreHost ? damageMultiplierGuest : damageMultiplierHost

  const youMeterLabel = mode === 'hp' ? hpMeterLabelWithMult(youName, youDmgMult) : youName
  const oppMeterLabel = mode === 'hp' ? hpMeterLabelWithMult(oppName, oppDmgMult) : oppName

  return (
    <HudRoot>
      <HudTop>
        <IconGhostBtn
          className="hud-exit"
          type="button"
          title="Exit duel"
          aria-label="Exit duel"
          onClick={() => void onExit()}
        >
          <ChevronLeftIcon />
        </IconGhostBtn>

        <div className="hud-meter hud-meter--you">
          {mode === 'hp' ? (
            <DuelHpMeter
              label={youMeterLabel}
              labelTransform="none"
              icon={duelHudAvatarIcon(youAvatar)}
              current={youHp}
              max={youStartHp}
              accent={youAccent}
              dense
              valueBesideBar
              asideIcon="left"
              valueSide="right"
            />
          ) : (
            <DuelPointsMeter
              label={youMeterLabel}
              labelTransform="none"
              icon={duelHudAvatarIcon(youAvatar)}
              points={youPts}
              accent={youAccent}
              dense
              sharePct={youShare}
              barTint={youTint}
              barFillColor={youAccent}
              valueBesideBar
              asideIcon="left"
              valueSide="right"
            />
          )}
        </div>

        <HudRoundStack className="hud-round" title="Current round">
          <HudRoundLabel>{roundLabel}</HudRoundLabel>
          {mode === 'hp' ? (
            <>
              <HudRoundRampLabel>Damage mult</HudRoundRampLabel>
              <HudRoundRampMult title="Round damage ramp (matches scoring)">
                ×{roundRampDisplay.toFixed(1)}
              </HudRoundRampMult>
            </>
          ) : null}
        </HudRoundStack>

        <div className="hud-meter hud-meter--opp">
          {mode === 'hp' ? (
            <DuelHpMeter
              label={oppMeterLabel}
              labelTransform="none"
              icon={duelHudAvatarIcon(oppAvatar)}
              current={oppHp}
              max={oppStartHp}
              accent={oppAccent}
              dense
              valueBesideBar
              asideIcon="right"
              valueSide="left"
            />
          ) : (
            <DuelPointsMeter
              label={oppMeterLabel}
              labelTransform="none"
              icon={duelHudAvatarIcon(oppAvatar)}
              points={oppPts}
              accent={oppAccent}
              dense
              sharePct={oppShare}
              barTint={oppTint}
              barFillColor={oppAccent}
              valueBesideBar
              asideIcon="right"
              valueSide="left"
            />
          )}
        </div>

        <IconGhostBtn
          className="hud-forfeit-only"
          type="button"
          title="Forfeit duel"
          aria-label="Forfeit duel"
          onClick={() => void onForfeit()}
        >
          <FlagIcon />
        </IconGhostBtn>
      </HudTop>
    </HudRoot>
  )
})

type StreetSectionProps = {
  duelId: string
  completedRounds: number
  gameData: Game
  duelGuessSubmit: (body: DuelGuessSubmitPayload) => Promise<void>
  youLocked: boolean
}

const DuelStreetSection = memo(
  function DuelStreetSection({
    duelId,
    completedRounds,
    gameData,
    duelGuessSubmit,
    youLocked,
  }: StreetSectionProps) {
    const [view, setView] = useState<GameViewType>('Game')
    const pinRef = useRef<{ lat: number; lng: number } | null>(null)
    const lastSentPinRef = useRef<{ lat: number; lng: number } | null>(null)

    const syncPin = useCallback(() => {
      if (youLocked) return
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
    }, [duelId, youLocked])

    useVisibleInterval(syncPin, PIN_PATCH_MS)

    const onGuessCoordinateChange = useCallback((loc: LocationType | null) => {
      if (youLocked) return
      pinRef.current = loc ? { lat: loc.lat, lng: loc.lng } : null
    }, [youLocked])

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
            isDuel
            duelGuessSubmit={duelGuessSubmit}
            duelGuessLocked={youLocked}
            onGuessCoordinateChange={onGuessCoordinateChange}
          />
        </PanoStretch>
      </StreetOverlayWrap>
    )
  },
  (prev, next) =>
    prev.duelId === next.duelId &&
    prev.completedRounds === next.completedRounds &&
    prev.gameData === next.gameData &&
    prev.duelGuessSubmit === next.duelGuessSubmit &&
    prev.youLocked === next.youLocked
)

type Props = {
  duelId: string
  payload: DuelClientPayload
  role: Exclude<DuelViewerRole, null>
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
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [now, setNow] = useState(() => Date.now())
  const [lockFlash, setLockFlash] = useState<'none' | 'locked' | 'timed'>('none')

  const lr = payload.lastRoundResult
  const revealActual = payload.lastRoundActualLocation
  const recapAck = payload.recapAckRoundIndex ?? -1

  const showRoundReveal =
    payload.status === 'in_progress' &&
    lr != null &&
    revealActual != null &&
    lr.roundIndex > recapAck

  useEffect(() => {
    const noDeadline = payload.roundDeadlineAt == null || payload.roundDeadlineAt === ''
    if (noDeadline || payload.status !== 'in_progress' || showRoundReveal) return
    let raf = 0
    const loop = () => {
      setNow(Date.now())
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [payload.roundDeadlineAt, payload.status, showRoundReveal])

  const deadlineMs =
    payload.roundDeadlineAt != null && payload.roundDeadlineAt !== ''
      ? Math.max(0, new Date(payload.roundDeadlineAt).getTime() - now)
      : null

  const loc = payload.currentLocation
  const md = payload.mapDetails
  const gs = payload.gameSettings
  const mapBoundsKey = JSON.stringify(md?.bounds ?? null)
  const mapIdStr = md?._id != null ? String(md._id) : ''

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
      payload.mapId,
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

  const handleDuelExit = useCallback(async () => {
    const mapId = md?._id != null ? String(md._id) : payload.mapId

    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }

    if (mapId) {
      await router.push(`/map/${mapId}`)
      return
    }

    await router.push('/ongoing')
  }, [md, payload.mapId, router])

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

  /** Red stress UI only for the player still guessing; hide once you’ve locked in. */
  const showReactionTimerStress = showReactionTimer && !payload.flags.youLocked

  return (
    <PlayColumn>
      {showReactionTimerStress && (
        <>
          <ReactionTimerVignette
            aria-hidden
            $urgency={1 - reactionTimeRemainingFraction(deadlineMs, payload.reactiveSeconds)}
          />
          <ReactionTimerEdgePulse key={Math.ceil(deadlineMs / 1000)} aria-hidden />
          <ReactionTimerOverlay aria-live="polite">
            <ReactionTimerCard>
              <ReactionTimerRingWrap>
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 100 100"
                  aria-hidden
                  style={{ display: 'block', transform: 'rotate(-90deg)' }}
                >
                  <defs>
                    <linearGradient id="reactionRingGradDuels" x1="14%" y1="14%" x2="86%" y2="86%">
                      <stop offset="0%" stopColor="#fecaca" stopOpacity="0.25" />
                      <stop offset="45%" stopColor="#ef4444" stopOpacity="1" />
                      <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.35" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="50"
                    cy="50"
                    r={REACTION_RING_R}
                    fill="none"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth={REACTION_RING_STROKE}
                  />
                  <ReactionTimerArcProgress
                    cx="50"
                    cy="50"
                    r={REACTION_RING_R}
                    strokeWidth={REACTION_RING_STROKE}
                    strokeDasharray={REACTION_RING_C}
                    strokeDashoffset={
                      REACTION_RING_C *
                      (1 - reactionTimeRemainingFraction(deadlineMs, payload.reactiveSeconds))
                    }
                  />
                </svg>
                <ReactionTimerSecondsCenter key={Math.ceil(deadlineMs / 1000)}>
                  {(deadlineMs / 1000).toLocaleString(undefined, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}
                </ReactionTimerSecondsCenter>
              </ReactionTimerRingWrap>
            </ReactionTimerCard>
          </ReactionTimerOverlay>
        </>
      )}

      {lockFlash !== 'none' && !showRoundReveal && (
        <LockInBackdrop aria-live="polite">
          <LockInCard $timed={lockFlash === 'timed'}>
            <LockClosedIcon className="lock-ico" />
            <LockInMain>{lockFlash === 'timed' ? 'Time up — submitted' : 'Locked in'}</LockInMain>
          </LockInCard>
        </LockInBackdrop>
      )}

      <PlayStage>
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
          viewerRole={role}
          playerNames={payload.playerNames}
          playerAvatars={payload.playerAvatars}
          damageMultiplierHost={payload.damageMultiplierHost}
          damageMultiplierGuest={payload.damageMultiplierGuest}
          useRoundRamp={payload.useRoundRamp}
          onExit={handleDuelExit}
          onForfeit={handleForfeit}
        />
        {showRoundReveal && lr && revealActual ? (
          <DuelRoundOverview
            variant="fullscreen"
            roundOneBased={lr.roundIndex + 1}
            totalRounds={payload.totalRounds}
            useRoundRamp={payload.useRoundRamp}
            mode={payload.mode}
            actual={revealActual}
            result={lr}
            hostMaxHp={payload.startingHpHost}
            guestMaxHp={payload.startingHpGuest}
            viewerRole={role}
            sessionMapId={payload.mapId}
            plonkMapLabel={payload.mapDetails?.name}
            hostPlayerName={payload.playerNames.host}
            guestPlayerName={payload.playerNames.guest}
            playerAvatars={payload.playerAvatars}
            onContinue={() => void dismissRecap()}
          />
        ) : (
          <DuelStreetSection
            duelId={duelId}
            completedRounds={payload.completedRounds}
            gameData={gameData}
            duelGuessSubmit={duelGuessSubmit}
            youLocked={payload.flags.youLocked}
          />
        )}
      </PlayStage>
    </PlayColumn>
  )
}

export default DuelPlaySurface
