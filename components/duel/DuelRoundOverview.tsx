import GoogleMapReact from 'google-map-react'
import { FC, useEffect, useRef, useState } from 'react'
import {
  HeartIcon,
  LightningBoltIcon,
  LocationMarkerIcon,
  SparklesIcon,
  SwitchHorizontalIcon,
} from '@heroicons/react/outline'
import { Marker } from '@components/Marker'
import { Button } from '@components/system'
import { DuelHpMeter, DuelPointsMeter } from '@components/duel/DuelHpMeter'
import { useAppSelector } from '@redux/hook'
import type { DuelRoundResultClient, DuelViewerRole } from './duelApiTypes'
import type { GuessType, LocationType } from '@types'
import { DUEL_DEFAULT_HP } from '@backend/utils/duelConstants'
import { RESULT_MAP_OPTIONS } from '@utils/constants/googleMapOptions'
import { EQUITABLE_COUNTRY_STREAK_ID } from '@utils/constants/random'
import createMapPolyline from '@utils/helpers/createMapPolyline'
import { formatDistance } from '@utils/helpers'
import { PlonkitGuideLauncher } from '@components/PlonkitCountryGuide'
import { resolvePlonkitGuideCountryIso } from '@utils/helpers/resolvePlonkitGuideCountryIso'
import { getMapsKey, googleMapLoaderAsync } from '@utils/helpers'
import styled, { css, keyframes } from 'styled-components'
import StyledResultMap from '@components/ResultMap/ResultMap.Styled'

const KM_TO_MI = 0.621371

const winnerPulse = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.92);
  }
  55% {
    opacity: 1;
    transform: scale(1.03);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`

const damageKick = keyframes`
  0% {
    opacity: 0;
    transform: translate(-50%, 28px) scale(0.35);
    filter: blur(3px);
  }
  18% {
    opacity: 1;
    transform: translate(-50%, -8px) scale(1.18);
    filter: blur(0);
  }
  55% {
    opacity: 1;
    transform: translate(-50%, -14px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -52px) scale(0.85);
  }
`

const glowSweep = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(250, 204, 21, 0);
  }
  40% {
    box-shadow: 0 0 28px 4px rgba(250, 204, 21, 0.35);
  }
  100% {
    box-shadow: 0 0 12px 0 rgba(250, 204, 21, 0.15);
  }
`

const OverlayRoot = styled.div<{ $fullscreen: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $fullscreen }) => ($fullscreen ? 14 : 12)}px;
  flex: ${({ $fullscreen }) => ($fullscreen ? '1' : '0 0 auto')};
  min-height: ${({ $fullscreen }) => ($fullscreen ? '0' : 'auto')};
  overflow: ${({ $fullscreen }) => ($fullscreen ? 'auto' : 'visible')};
  position: ${({ $fullscreen }) => ($fullscreen ? 'absolute' : 'relative')};
  inset: ${({ $fullscreen }) => ($fullscreen ? '0' : 'auto')};
  z-index: ${({ $fullscreen }) => ($fullscreen ? '40' : '1')};
  padding: ${({ $fullscreen }) => ($fullscreen ? '18px 16px 22px' : '14px')};
  background: ${({ $fullscreen }) =>
    $fullscreen
      ? 'linear-gradient(200deg, rgba(10, 10, 18, 0.97) 0%, rgba(6, 6, 14, 0.98) 42%, rgba(4, 4, 10, 0.99) 100%)'
      : '#0c0c10'};
  color: #e5e5e5;
  border: ${({ $fullscreen }) => ($fullscreen ? 'none' : '1px solid #2a2a2a')};
  border-radius: ${({ $fullscreen }) => ($fullscreen ? '0' : '12px')};

  @media (max-width: 560px) {
    padding: ${({ $fullscreen }) => ($fullscreen ? '14px 12px 18px' : '12px')};
  }
`

const RoundTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #a78bfa;

  svg {
    width: 16px;
    height: 16px;
  }
`

const WinnerBanner = styled.div<{ $tier: 'host' | 'guest' | 'tie' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.03em;
  border: 1px solid
    ${({ $tier }) =>
      $tier === 'tie'
        ? 'rgba(148, 163, 184, 0.45)'
        : $tier === 'host'
        ? 'rgba(96, 165, 250, 0.55)'
        : 'rgba(192, 132, 252, 0.55)'};
  background: ${({ $tier }) =>
    $tier === 'tie'
      ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.35), rgba(30, 41, 59, 0.55))'
      : $tier === 'host'
      ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.35), rgba(30, 58, 138, 0.55))'
      : 'linear-gradient(135deg, rgba(126, 34, 206, 0.38), rgba(76, 29, 149, 0.58))'};
  color: ${({ $tier }) => ($tier === 'tie' ? '#e2e8f0' : $tier === 'host' ? '#dbeafe' : '#f3e8ff')};
  animation: ${winnerPulse} 0.55s ease-out both,
    ${glowSweep} 1.1s ease-out 0.1s both;

  svg {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }
`

const BattleRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`

const FighterCard = styled.div<{ $accent: string; $highlight?: boolean }>`
  position: relative;
  padding: 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${({ $highlight }) => ($highlight ? 'rgba(250, 204, 21, 0.55)' : 'rgba(255, 255, 255, 0.08)')};
  box-shadow: ${({ $highlight }) =>
    $highlight ? '0 0 0 1px rgba(250, 204, 21, 0.15), 0 12px 40px rgba(0, 0, 0, 0.35)' : 'none'};
  overflow: visible;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    opacity: ${({ $highlight }) => ($highlight ? 1 : 0)};
    box-shadow: inset 0 0 40px ${({ $accent }) => `${$accent}33`};
  }
`

const FighterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`

const Badge = styled.span<{ $side: 'host' | 'guest' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  border-radius: 10px;
  font-weight: 900;
  font-size: 13px;
  ${({ $side }) =>
    $side === 'host'
      ? css`
          background: rgba(37, 99, 235, 0.22);
          border: 1px solid rgba(96, 165, 250, 0.55);
          color: #93c5fd;
        `
      : css`
          background: rgba(126, 34, 206, 0.22);
          border: 1px solid rgba(192, 132, 252, 0.55);
          color: #d8b4fe;
        `}
`

const DamageFloater = styled.div<{ $delay: number }>`
  position: absolute;
  left: 50%;
  bottom: 72%;
  font-weight: 900;
  font-size: 26px;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  color: #fca5a5;
  text-shadow:
    0 0 18px rgba(239, 68, 68, 0.85),
    0 2px 4px rgba(0, 0, 0, 0.85);
  pointer-events: none;
  animation: ${damageKick} 1.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: ${({ $delay }) => $delay}ms;
`

const StatPillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`

const StatPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e4e4e7;

  svg {
    width: 14px;
    height: 14px;
    opacity: 0.85;
  }
`

const MapWrap = styled.div<{ $compact: boolean }>`
  flex: ${({ $compact }) => ($compact ? '0 0 auto' : '1')};
  min-height: ${({ $compact }) => ($compact ? '240px' : '180px')};
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);

  .map {
    height: ${({ $compact }) => ($compact ? '240px' : 'min(42vh, 360px)')};
    min-height: ${({ $compact }) => ($compact ? '240px' : '180px')};
  }
`

const toGuess = (lat: number, lng: number, distKm: number): GuessType => ({
  lat,
  lng,
  points: 0,
  distance: { metric: distKm, imperial: distKm * KM_TO_MI },
  time: 0,
})

type Props = {
  variant: 'fullscreen' | 'compact'
  roundOneBased: number
  mode: 'hp' | 'points'
  actual: LocationType
  result: DuelRoundResultClient
  hostMaxHp?: number
  guestMaxHp?: number
  viewerRole?: DuelViewerRole
  /** Lobby virtual map id (e.g. equitable-country-streak). */
  sessionMapId?: string
  plonkMapLabel?: string
  onContinue?: () => void
}

const DuelRoundOverview: FC<Props> = ({
  variant,
  roundOneBased,
  mode,
  actual,
  result,
  hostMaxHp,
  guestMaxHp,
  viewerRole,
  sessionMapId,
  plonkMapLabel,
  onContinue,
}) => {
  const user = useAppSelector((state) => state.user)
  const mapRef = useRef<google.maps.Map | null>(null)
  const polylinesRef = useRef<google.maps.Polyline[]>([])
  const [hostGuess, setHostGuess] = useState<GuessType | null>(null)
  const [guestGuess, setGuestGuess] = useState<GuessType | null>(null)
  const [actualMarkers, setActualMarkers] = useState<LocationType[]>([])

  const hostCap = hostMaxHp ?? DUEL_DEFAULT_HP
  const guestCap = guestMaxHp ?? DUEL_DEFAULT_HP

  const hostBefore = result.hostHpAfter + result.damageToHost
  const guestBefore = result.guestHpAfter + result.damageToGuest

  const [displayHostHp, setDisplayHostHp] = useState(hostBefore)
  const [displayGuestHp, setDisplayGuestHp] = useState(guestBefore)
  const [damagePhase, setDamagePhase] = useState(false)

  const sumPtsPreview =
    mode === 'points'
      ? Math.max(1, result.hostPoints + result.guestPoints)
      : 1

  useEffect(() => {
    setDisplayHostHp(hostBefore)
    setDisplayGuestHp(guestBefore)
    setDamagePhase(false)

    const kick = window.setTimeout(() => {
      setDamagePhase(true)
      setDisplayHostHp(result.hostHpAfter)
      setDisplayGuestHp(result.guestHpAfter)
    }, mode === 'hp' ? 520 : 280)

    return () => window.clearTimeout(kick)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by round ledger
  }, [
    mode,
    result.roundIndex,
    result.hostHpAfter,
    result.guestHpAfter,
    result.damageToHost,
    result.damageToGuest,
    hostBefore,
    guestBefore,
  ])

  const hostShakeKey = damagePhase && result.damageToHost > 0 ? result.roundIndex + 1 : 0
  const guestShakeKey = damagePhase && result.damageToGuest > 0 ? result.roundIndex + 1 : 0

  const fitAndDraw = (map: google.maps.Map) => {
    polylinesRef.current.forEach((p) => p.setMap(null))
    polylinesRef.current = []

    const hg =
      result.hostGuess && !result.hostNoGuess
        ? toGuess(result.hostGuess.lat, result.hostGuess.lng, result.hostDistanceMetric)
        : null
    const gg =
      result.guestGuess && !result.guestNoGuess
        ? toGuess(result.guestGuess.lat, result.guestGuess.lng, result.guestDistanceMetric)
        : null

    setHostGuess(hg)
    setGuestGuess(gg)
    setActualMarkers([actual])

    const bounds = new google.maps.LatLngBounds()
    bounds.extend(actual)
    if (hg) bounds.extend(hg)
    if (gg) bounds.extend(gg)

    map.fitBounds(bounds, { top: 24, bottom: 24, left: 24, right: 24 })

    if (hg) {
      polylinesRef.current.push(createMapPolyline(hg, actual, map))
    }
    if (gg) {
      polylinesRef.current.push(createMapPolyline(gg, actual, map))
    }
  }

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    fitAndDraw(map)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- redraw when ledger fields change
  }, [
    actual.lat,
    actual.lng,
    result.roundIndex,
    result.hostPoints,
    result.guestPoints,
    result.damageToHost,
    result.damageToGuest,
    result.hostNoGuess,
    result.guestNoGuess,
    result.hostGuess?.lat,
    result.hostGuess?.lng,
    result.guestGuess?.lat,
    result.guestGuess?.lng,
  ])

  useEffect(() => {
    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null))
      polylinesRef.current = []
    }
  }, [])

  const hostDistLabel = formatDistance(
    { metric: result.hostDistanceMetric, imperial: result.hostDistanceMetric * KM_TO_MI },
    'metric'
  )
  const guestDistLabel = formatDistance(
    { metric: result.guestDistanceMetric, imperial: result.guestDistanceMetric * KM_TO_MI },
    'metric'
  )

  const winTier = result.winner === 'tie' ? 'tie' : result.winner

  const winnerLabel =
    result.winner === 'tie'
      ? 'Tie round'
      : result.winner === 'host'
      ? 'Host takes the round'
      : 'Guest takes the round'

  const hostYou = viewerRole === 'host'
  const guestYou = viewerRole === 'guest'

  const guideMapKey = sessionMapId?.trim() ? sessionMapId : EQUITABLE_COUNTRY_STREAK_ID
  const plonkIso = resolvePlonkitGuideCountryIso(guideMapKey, actual)

  return (
    <OverlayRoot $fullscreen={variant === 'fullscreen'}>
      <RoundTag>
        <SparklesIcon />
        Round {roundOneBased}
      </RoundTag>

      <WinnerBanner $tier={winTier === 'tie' ? 'tie' : winTier}>
        {result.winner === 'tie' ? <SwitchHorizontalIcon /> : <LightningBoltIcon />}
        {winnerLabel}
      </WinnerBanner>

      {plonkIso ? (
        <PlonkitGuideLauncher variant="compact" countryIso={plonkIso} mapLabel={plonkMapLabel} />
      ) : null}

      <BattleRow>
        <FighterCard
          $accent="#60a5fa"
          $highlight={hostYou || (viewerRole === null && result.winner === 'host')}
        >
          <FighterHeader>
            <Badge $side="host">H</Badge>
            {hostYou && (
              <StatPill style={{ margin: 0, borderColor: 'rgba(250, 204, 21, 0.45)', color: '#fde047' }}>You</StatPill>
            )}
          </FighterHeader>

          {mode === 'hp' ? (
            <div style={{ position: 'relative' }}>
              <DuelHpMeter
                label="Host"
                current={displayHostHp}
                max={hostCap}
                accent="#93c5fd"
                icon={<HeartIcon />}
                shakeSignal={hostShakeKey}
              />
              {result.damageToHost > 0 && damagePhase && (
                <DamageFloater $delay={80}>-{Math.round(result.damageToHost)}</DamageFloater>
              )}
            </div>
          ) : (
            <DuelPointsMeter
              label="Host"
              points={result.hostPoints}
              accent="#93c5fd"
              sharePct={(result.hostPoints / sumPtsPreview) * 100}
              barTint={result.hostPoints > result.guestPoints ? 'blue' : 'neutral'}
              icon={<LightningBoltIcon />}
            />
          )}

          <StatPillRow>
            <StatPill title="Distance to actual">
              <LocationMarkerIcon />
              {result.hostNoGuess ? '—' : hostDistLabel}
            </StatPill>
            <StatPill title="Round score">
              <SparklesIcon />
              +{Math.round(result.hostPoints)}
            </StatPill>
          </StatPillRow>
        </FighterCard>

        <FighterCard
          $accent="#c084fc"
          $highlight={guestYou || (viewerRole === null && result.winner === 'guest')}
        >
          <FighterHeader>
            <Badge $side="guest">G</Badge>
            {guestYou && (
              <StatPill style={{ margin: 0, borderColor: 'rgba(250, 204, 21, 0.45)', color: '#fde047' }}>You</StatPill>
            )}
          </FighterHeader>

          {mode === 'hp' ? (
            <div style={{ position: 'relative' }}>
              <DuelHpMeter
                label="Guest"
                current={displayGuestHp}
                max={guestCap}
                accent="#d8b4fe"
                icon={<HeartIcon />}
                shakeSignal={guestShakeKey}
              />
              {result.damageToGuest > 0 && damagePhase && (
                <DamageFloater $delay={140}>-{Math.round(result.damageToGuest)}</DamageFloater>
              )}
            </div>
          ) : (
            <DuelPointsMeter
              label="Guest"
              points={result.guestPoints}
              accent="#d8b4fe"
              sharePct={(result.guestPoints / sumPtsPreview) * 100}
              barTint={result.guestPoints > result.hostPoints ? 'purple' : 'neutral'}
              icon={<LightningBoltIcon />}
            />
          )}

          <StatPillRow>
            <StatPill title="Distance to actual">
              <LocationMarkerIcon />
              {result.guestNoGuess ? '—' : guestDistLabel}
            </StatPill>
            <StatPill title="Round score">
              <SparklesIcon />
              +{Math.round(result.guestPoints)}
            </StatPill>
          </StatPillRow>
        </FighterCard>
      </BattleRow>

      <MapWrap $compact={variant === 'compact'}>
        <StyledResultMap>
          <div className="map">
            <GoogleMapReact
              googleMapLoader={googleMapLoaderAsync}
              bootstrapURLKeys={getMapsKey(user.mapsAPIKey)}
              center={{ lat: actual.lat, lng: actual.lng }}
              zoom={3}
              yesIWantToUseGoogleMapApiInternals
              onGoogleApiLoaded={({ map }) => {
                mapRef.current = map
                fitAndDraw(map)
              }}
              options={RESULT_MAP_OPTIONS}
            >
              {hostGuess && (
                <Marker
                  key="host-g"
                  type="guess"
                  lat={hostGuess.lat}
                  lng={hostGuess.lng}
                  userAvatar={{ emoji: 'H', color: '#2563eb' }}
                  isFinalResults={false}
                />
              )}
              {guestGuess && (
                <Marker
                  key="guest-g"
                  type="guess"
                  lat={guestGuess.lat}
                  lng={guestGuess.lng}
                  userAvatar={{ emoji: 'G', color: '#9333ea' }}
                  isFinalResults={false}
                />
              )}
              {actualMarkers.map((m, idx) => (
                <Marker key={`a-${idx}`} type="actual" lat={m.lat} lng={m.lng} isFinalResults={false} />
              ))}
            </GoogleMapReact>
          </div>
        </StyledResultMap>
      </MapWrap>

      {onContinue && (
        <Button
          variant="primary"
          size="sm"
          onClick={onContinue}
          style={{
            alignSelf: 'center',
            marginTop: 4,
            minWidth: 200,
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            fontSize: 12,
          }}
        >
          Next round
        </Button>
      )}
    </OverlayRoot>
  )
}

export default DuelRoundOverview
