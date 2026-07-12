import GoogleMapReact from 'google-map-react'
import { FC, ReactNode, useEffect, useRef, useState } from 'react'
import { HeartIcon } from '@heroicons/react/outline'
import { Marker } from '@components/Marker'
import { Avatar, Button } from '@components/system'
import { DuelHpMeter, DuelPointsMeter } from '@components/duel/DuelHpMeter'
import { useAppSelector } from '@redux/hook'
import type { DuelGuessAvatar, DuelRoundResultClient, DuelViewerRole } from './duelApiTypes'
import { DUEL_GUESS_MARKER_FALLBACK } from './duelApiTypes'
import { duelAvatarAccent } from './duelHudAvatar'
import type { GuessType, LocationType } from '@types'
import { DUEL_DEFAULT_HP } from '@backend/utils/duelConstants'
import { duelRoundDamageMultiplier } from '@backend/utils/duelConstants'
import { RESULT_MAP_OPTIONS } from '@utils/constants/googleMapOptions'
import createMapPolyline from '@utils/helpers/createMapPolyline'
import { formatDistance } from '@utils/helpers'
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

const OverlayRoot = styled.div<{ $fullscreen: boolean; $compact: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $fullscreen, $compact }) => ($fullscreen ? 14 : $compact ? 8 : 12)}px;
  flex: ${({ $fullscreen }) => ($fullscreen ? '1' : '0 0 auto')};
  min-height: ${({ $fullscreen }) => ($fullscreen ? '0' : 'auto')};
  overflow: ${({ $fullscreen }) => ($fullscreen ? 'auto' : 'visible')};
  position: ${({ $fullscreen }) => ($fullscreen ? 'absolute' : 'relative')};
  inset: ${({ $fullscreen }) => ($fullscreen ? '0' : 'auto')};
  z-index: ${({ $fullscreen }) => ($fullscreen ? '40' : '1')};
  padding: ${({ $fullscreen, $compact }) =>
    $fullscreen ? '18px var(--pad-card-sm) 22px' : $compact ? '0' : 'var(--pad-card-sm)'};
  background-color: ${({ $fullscreen }) => ($fullscreen ? 'var(--bg-primary)' : 'transparent')};
  color: var(--text-primary);
  border: ${({ $fullscreen }) => ($fullscreen ? 'none' : 'none')};
  border-radius: 0;

  @media (max-width: 560px) {
    padding: ${({ $fullscreen, $compact }) =>
      $fullscreen ? '14px 12px 18px' : $compact ? '0' : '12px'};
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
  color: #9dc8f0;

  svg {
    width: 16px;
    height: 16px;
  }
`

const RoundHeader = styled.div<{ $compact?: boolean; $inline?: boolean }>`
  display: flex;
  flex-direction: ${({ $inline }) => ($inline ? 'row' : 'column')};
  flex-wrap: ${({ $inline }) => ($inline ? 'wrap' : 'nowrap')};
  justify-content: center;
  align-items: center;
  gap: ${({ $inline }) => ($inline ? '8px 14px' : '10px')};
  text-align: center;
  margin-top: ${({ $compact }) => ($compact ? '0' : '86px')};
  margin-bottom: ${({ $compact, $inline }) => ($compact ? ($inline ? '4px' : '6px') : '10px')};
  padding: 0 10px;
  font-size: ${({ $compact }) => ($compact ? '11px' : '12px')};
  font-weight: 800;
  letter-spacing: ${({ $compact }) => ($compact ? '0.06em' : '0.08em')};
  text-transform: uppercase;
  color: rgba(240, 244, 255, 0.92);
  line-height: 1.35;
  word-break: break-word;
  hyphens: auto;

  @media (max-width: 760px) {
    margin-top: ${({ $compact }) => ($compact ? '0' : '52px')};
    font-size: ${({ $compact }) => ($compact ? '10px' : '10px')};
    letter-spacing: 0.06em;
  }

  @media (max-width: 480px) {
    margin-top: ${({ $compact }) => ($compact ? '0' : '36px')};
    font-size: ${({ $compact }) => ($compact ? '9px' : '9px')};
    padding: 0 6px;
    flex-direction: column;
    gap: 8px;
  }
`

const WinnerBanner = styled.div<{ $tier: 'host' | 'guest' | 'tie'; $compact?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: ${({ $compact }) => ($compact ? '7px 12px' : '12px 16px')};
  border-radius: ${({ $compact }) => ($compact ? '999px' : '14px')};
  font-size: ${({ $compact }) => ($compact ? '12px' : '15px')};
  font-weight: 800;
  letter-spacing: 0.03em;
  border: 1px solid
    ${({ $tier }) =>
      $tier === 'tie'
        ? 'rgba(148, 163, 184, 0.45)'
        : $tier === 'host'
        ? 'rgba(47, 127, 255, 0.45)'
        : 'rgba(251, 191, 36, 0.55)'};
  background: ${({ $tier }) =>
    $tier === 'tie'
      ? 'rgba(51, 65, 85, 0.45)'
      : $tier === 'host'
      ? 'rgba(47, 127, 255, 0.22)'
      : 'rgba(180, 83, 9, 0.35)'};
  color: ${({ $tier }) => ($tier === 'tie' ? '#e2e8f0' : $tier === 'host' ? '#dbeafe' : '#fef3c7')};
  animation: ${winnerPulse} 0.55s ease-out both;

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

const FinishRecapFoot = styled.div`
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const FinishRecapTable = styled.div`
  display: grid;
  grid-template-columns: minmax(88px, 0.9fr) minmax(0, 1.1fr) minmax(0, 1.1fr);
  gap: 0;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
`

const FinishRecapCell = styled.div<{
  $role?: 'label' | 'value' | 'head'
  $align?: 'left' | 'center' | 'right'
  $accent?: string
  $muted?: boolean
  $damage?: boolean
}>`
  display: flex;
  align-items: center;
  justify-content: ${({ $align }) =>
    $align === 'left' ? 'flex-start' : $align === 'right' ? 'flex-end' : 'center'};
  gap: 8px;
  min-height: ${({ $role }) => ($role === 'head' ? '44px' : '40px')};
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  box-sizing: border-box;
  font-variant-numeric: tabular-nums;
  line-height: 1.25;

  &:nth-child(3n) {
    border-right: none;
  }

  &:nth-last-child(-n + 3) {
    border-bottom: none;
  }

  ${({ $role }) =>
    $role === 'label'
      ? `
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-muted);
    background: rgba(0, 0, 0, 0.18);
  `
      : $role === 'head'
      ? `
    font-size: 13px;
    font-weight: 800;
    color: #f4f4f5;
    background: rgba(0, 0, 0, 0.22);
  `
      : `
    font-size: 15px;
    font-weight: 800;
    color: #f8fafc;
  `}

  ${({ $accent, $role }) =>
    $accent && $role === 'head'
      ? `
    box-shadow: inset 0 -2px 0 ${$accent};
  `
      : ''}

  ${({ $muted }) => ($muted ? `color: rgba(228, 228, 231, 0.55); font-weight: 700;` : '')}
  ${({ $damage }) => ($damage ? `color: #f87171;` : '')}
`

const FinishRecapNote = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
`

const FinishRecapChip = styled.span<{ $tone?: 'neutral' | 'damage' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  font-size: 12px;
  font-weight: 700;
  color: ${({ $tone }) => ($tone === 'damage' ? '#fca5a5' : '#e4e4e7')};
`

const FinishRecapHeaderStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  text-align: center;
  padding: 0 4px;
`

const FinishRecapTitle = styled.div`
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: #f8fafc;
  line-height: 1.2;
`

const FinishRecapMetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
`

const FinishRecapMetaChip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  font-size: 11px;
  font-weight: 700;
  color: rgba(228, 228, 231, 0.82);
`

const FinishRecapWinner = styled.div<{ $tier: 'host' | 'guest' | 'tie' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  border: 1px solid
    ${({ $tier }) =>
      $tier === 'tie'
        ? 'rgba(148, 163, 184, 0.45)'
        : $tier === 'host'
        ? 'rgba(47, 127, 255, 0.45)'
        : 'rgba(251, 191, 36, 0.55)'};
  background: ${({ $tier }) =>
    $tier === 'tie'
      ? 'rgba(51, 65, 85, 0.45)'
      : $tier === 'host'
      ? 'rgba(47, 127, 255, 0.22)'
      : 'rgba(180, 83, 9, 0.35)'};
  color: ${({ $tier }) => ($tier === 'tie' ? '#e2e8f0' : $tier === 'host' ? '#dbeafe' : '#fef3c7')};
`

const ActionRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  margin-top: 2px;

  .action-spacer {
    min-height: 1px;
  }

  .action-next {
    justify-self: center;
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    .action-next,
    .action-spacer {
      justify-self: center;
    }
  }

  @media (max-width: 480px) {
    padding: 0 4px;

    .action-next {
      width: 100%;
      max-width: min(320px, calc(100vw - 20px));
    }
  }
`

const NextRoundButton = styled(Button)`
  min-width: 200px;

  @media (max-width: 480px) {
    min-width: 0 !important;
    width: 100%;
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
          background: rgba(5, 150, 105, 0.2);
          border: 1px solid rgba(52, 211, 153, 0.5);
          color: #6ee7b7;
        `
      : css`
          background: rgba(180, 83, 9, 0.2);
          border: 1px solid rgba(251, 191, 36, 0.5);
          color: #fcd34d;
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
  color: #ef4444;
  text-shadow:
    0 0 18px rgba(239, 68, 68, 0.85),
    0 2px 4px rgba(0, 0, 0, 0.85);
  pointer-events: none;
  animation: ${damageKick} 1.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: ${({ $delay }) => $delay}ms;
`

const DamagePersistent = styled.div`
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translateX(-50%);
  font-size: 16px;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #ef4444;
  text-shadow:
    0 0 10px rgba(239, 68, 68, 0.6),
    0 2px 6px rgba(0, 0, 0, 0.8);
  pointer-events: none;
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

const MapWrap = styled.div<{ $compact: boolean; $tall?: boolean }>`
  flex: 0 0 auto;
  min-height: ${({ $compact, $tall }) =>
    $tall ? '360px' : $compact ? '220px' : '280px'};
  border-radius: 12px;
  overflow: hidden;
  border: none;
  padding: ${({ $compact, $tall }) =>
    $tall ? '0 48px' : $compact ? '0 4px' : '0 88px'};
  box-sizing: border-box;

  .map {
    height: ${({ $compact, $tall }) =>
      $tall ? 'min(56vh, 560px)' : $compact ? '240px' : 'min(58vh, 520px)'};
    min-height: ${({ $compact, $tall }) =>
      $tall ? '360px' : $compact ? '220px' : '300px'};
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 10px;
    box-sizing: border-box;
  }

  @media (max-width: 900px) {
    padding: ${({ $compact, $tall }) =>
      $tall ? '0 20px' : $compact ? '0 4px' : '0 28px'};
  }

  @media (max-width: 760px) {
    padding: ${({ $compact, $tall }) =>
      $tall ? '0 12px' : $compact ? '0 2px' : '0 16px'};
  }

  @media (max-width: 480px) {
    padding: ${({ $compact, $tall }) =>
      $tall ? '0 8px' : $compact ? '0' : '0 10px'};

    .map {
      min-height: ${({ $compact, $tall }) =>
        $tall ? '280px' : $compact ? '200px' : '240px'};
      height: ${({ $compact, $tall }) =>
        $tall ? 'min(48vh, 420px)' : $compact ? '220px' : 'min(42vh, 380px)'};
    }
  }
`

const UnderMapGrid = styled.div<{ $compact?: boolean; $tall?: boolean }>`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  gap: ${({ $compact }) => ($compact ? '8px 10px' : '12px 18px')};
  align-items: start;
  padding: ${({ $compact, $tall }) =>
    $tall ? '0 48px' : $compact ? '0 4px' : '0 88px'};
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  min-width: 0;

  @media (max-width: 900px) {
    padding: ${({ $compact, $tall }) =>
      $tall ? '0 20px' : $compact ? '0 4px' : '0 28px'};
  }

  @media (max-width: 760px) {
    padding: ${({ $compact, $tall }) =>
      $tall ? '0 12px' : $compact ? '0 2px' : '0 16px'};
    column-gap: ${({ $compact }) => ($compact ? '6px' : '8px')};
    row-gap: ${({ $compact }) => ($compact ? '8px' : '10px')};
  }

  @media (max-width: 480px) {
    padding: ${({ $compact, $tall }) =>
      $tall ? '0 8px' : $compact ? '0' : '0 10px'};
    column-gap: ${({ $compact }) => ($compact ? '4px' : '6px')};
    row-gap: ${({ $compact }) => ($compact ? '6px' : '8px')};
  }
`

const DistanceRowBand = styled.div`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  column-gap: 10px;
  margin-top: 8px;
  width: 100%;
  min-width: 0;

  @media (max-width: 760px) {
    margin-top: 6px;
    column-gap: 8px;
  }
`

const UnderMapCenter = styled.div`
  min-width: 64px;
  max-width: 112px;
  text-align: center;
  justify-self: center;
  align-self: center;
  font-variant-numeric: tabular-nums;
  padding: 0 2px;
  box-sizing: border-box;

  .mid-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.72);
    margin-bottom: 6px;
    line-height: 1.2;
  }

  .mid-mult {
    font-size: 20px;
    font-weight: 900;
    color: #f4f4f5;
    letter-spacing: -0.02em;
    line-height: 1;
  }

  @media (max-width: 760px) {
    min-width: 56px;
    max-width: 88px;

    .mid-label {
      font-size: 8px;
      letter-spacing: 0.08em;
      margin-bottom: 4px;
    }

    .mid-mult {
      font-size: 17px;
    }
  }

  @media (max-width: 400px) {
    min-width: 52px;
    max-width: 76px;

    .mid-label {
      font-size: 7px;
    }

    .mid-mult {
      font-size: 15px;
    }
  }
`

const MidSpacer = styled.div`
  width: 0;
  min-width: 0;
`

const UnderMapPlayerCol = styled.div<{ $side: 'left' | 'right' }>`
  min-width: 0;
  width: 100%;
  justify-self: stretch;
`

/** Player line: left column = badge + name (flush left); right column = name + badge (flush right). */
const RecapPlayerTitle = styled.div<{ $edge: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $edge }) => ($edge === 'left' ? 'flex-start' : 'flex-end')};
  flex-direction: row;
  gap: 8px;
  margin-bottom: 6px;
  min-width: 0;
  width: 100%;

  .recap-name {
    flex: 1 1 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #f4f4f5;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    ${({ $edge }) =>
      $edge === 'right' &&
      css`
        text-align: right;
      `}
  }

  .recap-badge {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
  }

  @media (max-width: 760px) {
    gap: 6px;

    .recap-name {
      font-size: 11px;
      letter-spacing: 0.04em;
    }
  }

  @media (max-width: 400px) {
    gap: 4px;

    .recap-name {
      font-size: 10px;
    }
  }
`

const RECAP_TITLE_AVATAR_SZ = 26

const DistanceRow = styled.div<{
  $color: string
  $align?: 'left' | 'center' | 'right'
  $flush?: boolean
}>`
  margin-top: ${({ $flush }) => ($flush ? 0 : '8px')};
  text-align: ${({ $align }) => $align ?? 'center'};
  font-size: 15px;
  font-weight: 700;
  color: #f4f4f5;
  font-variant-numeric: tabular-nums;
  padding: 0 2px;
  word-break: break-word;

  @media (max-width: 760px) {
    font-size: 13px;
    margin-top: ${({ $flush }) => ($flush ? 0 : '6px')};
  }

  @media (max-width: 400px) {
    font-size: 12px;
  }
`

const ScoreCell = styled.div`
  margin-top: 8px;
  padding-top: 6px;
  padding-bottom: 8px;
  text-align: center;
  min-width: 0;
  font-variant-numeric: tabular-nums;

  .points {
    font-size: clamp(2.1rem, 5.2vw, 3.15rem);
    line-height: 1;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: var(--text-primary);
    text-shadow:
      0 1px 0 rgba(0, 0, 0, 0.22),
      0 2px 14px rgba(0, 0, 0, 0.35);
  }

  @media (max-width: 760px) {
    margin-top: 6px;
    padding-top: 4px;
    padding-bottom: 6px;

    .points {
      font-size: clamp(1.45rem, 7vw, 2.4rem);
    }
  }

  @media (max-width: 400px) {
    .points {
      font-size: clamp(1.25rem, 8.5vw, 1.95rem);
    }
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
  totalRounds?: number
  multiplierMode?: 'round_ramp' | 'win_streak'
  mode: 'hp' | 'points'
  actual: LocationType
  result: DuelRoundResultClient
  hostMaxHp?: number
  guestMaxHp?: number
  viewerRole?: DuelViewerRole
  /** Lobby virtual map id (e.g. equitable-country-streak). */
  sessionMapId?: string
  plonkMapLabel?: string
  hostPlayerName?: string
  guestPlayerName?: string
  /** From duel API (`playerAvatars`); guess pins use emoji SVG + color from each profile. */
  playerAvatars?: { host: DuelGuessAvatar; guest: DuelGuessAvatar }
  onContinue?: () => void
  /** Override default “Next round” continue button label. */
  continueLabel?: string
  /** Hide bottom cumulative points row (e.g. duel finish — totals already in parent). */
  omitScoreRow?: boolean
  /** Duel match finish: no duplicate player HP rows; compact round-only stats. */
  finishRecap?: boolean
  /** Match summary: taller map (compact variant is otherwise too short). */
  tallMap?: boolean
  /** Match summary: round meta + winner on one horizontal row. */
  inlineHeader?: boolean
  /** Replace the round map (e.g. all-guesses map) while keeping the same chrome. */
  customMap?: ReactNode
  /** Skip HP drain animation (final match totals). */
  skipDamageAnim?: boolean
  /** Override the upper meta line (e.g. “All rounds”). */
  headerLabel?: string
  /** Override winner banner text / tier. */
  winnerLabelOverride?: string
  winnerTierOverride?: 'host' | 'guest' | 'tie'
  /** Center column between meters. */
  centerLabel?: string
  centerValue?: string
}

const DuelRoundOverview: FC<Props> = ({
  variant,
  roundOneBased,
  totalRounds,
  multiplierMode = 'round_ramp',
  mode,
  actual,
  result,
  hostMaxHp,
  guestMaxHp,
  viewerRole,
  sessionMapId: _sessionMapId,
  plonkMapLabel,
  hostPlayerName = 'Player 1',
  guestPlayerName = 'Player 2',
  playerAvatars,
  onContinue,
  continueLabel = 'Next round',
  omitScoreRow = false,
  finishRecap = false,
  tallMap = false,
  inlineHeader = false,
  customMap,
  skipDamageAnim = false,
  headerLabel,
  winnerLabelOverride,
  winnerTierOverride,
  centerLabel,
  centerValue,
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

  const [displayHostHp, setDisplayHostHp] = useState(skipDamageAnim ? result.hostHpAfter : hostBefore)
  const [displayGuestHp, setDisplayGuestHp] = useState(skipDamageAnim ? result.guestHpAfter : guestBefore)
  const [damagePhase, setDamagePhase] = useState(skipDamageAnim)

  const sumPtsPreview =
    mode === 'points'
      ? Math.max(1, result.hostPoints + result.guestPoints)
      : 1

  useEffect(() => {
    if (skipDamageAnim) {
      setDisplayHostHp(result.hostHpAfter)
      setDisplayGuestHp(result.guestHpAfter)
      setDamagePhase(true)
      return
    }

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
    skipDamageAnim,
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

  const winTier = winnerTierOverride ?? (result.winner === 'tie' ? 'tie' : result.winner)

  const winnerLabel =
    winnerLabelOverride ??
    (result.winner === 'tie'
      ? 'Tie round'
      : result.winner === 'host'
      ? `${hostPlayerName} takes the round`
      : `${guestPlayerName} takes the round`)

  const hostYou = viewerRole === 'host'
  const guestYou = viewerRole === 'guest'
  const leftIsHost = viewerRole !== 'guest'

  const hostCardAccent =
    viewerRole === 'host' ? '#7eb8ea' : viewerRole === 'guest' ? '#ef4444' : '#38bdf8'
  const guestCardAccent =
    viewerRole === 'guest' ? '#7eb8ea' : viewerRole === 'host' ? '#ef4444' : '#ef4444'

  const hostMeterAccent =
    viewerRole === 'host' ? '#7eb8ea' : viewerRole === 'guest' ? '#ef4444' : '#38bdf8'
  const guestMeterAccent =
    viewerRole === 'guest' ? '#7eb8ea' : viewerRole === 'host' ? '#ef4444' : '#ef4444'

  const hostLeading = result.hostPoints > result.guestPoints
  const guestLeading = result.guestPoints > result.hostPoints
  const hostBarTint =
    leftIsHost ? (hostLeading ? 'you' : 'neutral') : hostLeading ? 'opponent' : 'neutral'
  const guestBarTint =
    leftIsHost ? (guestLeading ? 'opponent' : 'neutral') : guestLeading ? 'you' : 'neutral'

  const hostGuessPin: DuelGuessAvatar = playerAvatars?.host
    ? playerAvatars.host
    : viewerRole === 'host' && user.avatar?.emoji
    ? { emoji: user.avatar.emoji, color: user.avatar.color }
    : DUEL_GUESS_MARKER_FALLBACK

  const guestGuessPin: DuelGuessAvatar = playerAvatars?.guest
    ? playerAvatars.guest
    : viewerRole === 'guest' && user.avatar?.emoji
    ? { emoji: user.avatar.emoji, color: user.avatar.color }
    : DUEL_GUESS_MARKER_FALLBACK

  const damageMultDisplay =
    result.damageMultiplierUsed > 0
      ? result.damageMultiplierUsed
      : multiplierMode === 'round_ramp'
      ? duelRoundDamageMultiplier(roundOneBased, true)
      : 1

  const leftPts = leftIsHost ? result.hostPoints : result.guestPoints
  const rightPts = leftIsHost ? result.guestPoints : result.hostPoints

  const heartIconRecap = (
    <HeartIcon
      style={{
        width: 12,
        height: 12,
        opacity: 0.9,
        transform: 'translateY(-1px)',
        flexShrink: 0,
      }}
      aria-hidden
    />
  )

  const hostBarHeadEl = (
    <UnderMapPlayerCol $side="left">
      <RecapPlayerTitle $edge="left">
        <span className="recap-badge">
          <Avatar
            type="user"
            size={RECAP_TITLE_AVATAR_SZ}
            src={hostGuessPin.emoji}
            backgroundColor={hostGuessPin.color}
            alt=""
          />
        </span>
        <span className="recap-name">{hostPlayerName}</span>
      </RecapPlayerTitle>
    </UnderMapPlayerCol>
  )

  const guestBarHeadEl = (
    <UnderMapPlayerCol $side="right">
      <RecapPlayerTitle $edge="right">
        <span className="recap-name">{guestPlayerName}</span>
        <span className="recap-badge">
          <Avatar
            type="user"
            size={RECAP_TITLE_AVATAR_SZ}
            src={guestGuessPin.emoji}
            backgroundColor={guestGuessPin.color}
            alt=""
          />
        </span>
      </RecapPlayerTitle>
    </UnderMapPlayerCol>
  )

  const hostHpEl = (
    <UnderMapPlayerCol $side="left">
      {mode === 'hp' ? (
        <div style={{ position: 'relative' }}>
          <DuelHpMeter
            label=""
            current={displayHostHp}
            max={hostCap}
            accent={hostMeterAccent}
            icon={undefined}
            valueIcon={heartIconRecap}
            valueIconAfter
            shakeSignal={hostShakeKey}
          />
          {result.damageToHost > 0 ? <DamagePersistent>-{Math.round(result.damageToHost)}</DamagePersistent> : null}
          {result.damageToHost > 0 && damagePhase && (
            <DamageFloater $delay={80}>-{Math.round(result.damageToHost)}</DamageFloater>
          )}
        </div>
      ) : (
        <DuelPointsMeter
          label=""
          points={result.hostPoints}
          accent={hostMeterAccent}
          sharePct={(result.hostPoints / sumPtsPreview) * 100}
          barTint={hostBarTint}
          icon={undefined}
        />
      )}
    </UnderMapPlayerCol>
  )

  const guestHpEl = (
    <UnderMapPlayerCol $side="right">
      {mode === 'hp' ? (
        <div style={{ position: 'relative' }}>
          <DuelHpMeter
            label=""
            current={displayGuestHp}
            max={guestCap}
            accent={guestMeterAccent}
            icon={undefined}
            valueIcon={heartIconRecap}
            valueSide="left"
            shakeSignal={guestShakeKey}
          />
          {result.damageToGuest > 0 ? <DamagePersistent>-{Math.round(result.damageToGuest)}</DamagePersistent> : null}
          {result.damageToGuest > 0 && damagePhase && (
            <DamageFloater $delay={140}>-{Math.round(result.damageToGuest)}</DamageFloater>
          )}
        </div>
      ) : (
        <DuelPointsMeter
          label=""
          points={result.guestPoints}
          accent={guestMeterAccent}
          sharePct={(result.guestPoints / sumPtsPreview) * 100}
          barTint={guestBarTint}
          icon={undefined}
        />
      )}
    </UnderMapPlayerCol>
  )

  const centerBetweenMeters =
    centerLabel || centerValue ? (
      <UnderMapCenter>
        <div className="mid-label">{centerLabel ?? (mode === 'hp' ? 'Damage mult' : 'Round result')}</div>
        <div className="mid-mult">
          {centerValue ??
            (mode === 'hp' ? `×${damageMultDisplay.toFixed(1)}` : winnerLabel)}
        </div>
      </UnderMapCenter>
    ) : mode === 'hp' ? (
      <UnderMapCenter>
        <div className="mid-label">Damage mult</div>
        <div className="mid-mult">×{damageMultDisplay.toFixed(1)}</div>
      </UnderMapCenter>
    ) : (
      <UnderMapCenter>
        <div className="mid-label">Round result</div>
        <div className="mid-mult">{winnerLabel}</div>
      </UnderMapCenter>
    )

  const isCompact = variant === 'compact'

  const leftDist = leftIsHost
    ? result.hostNoGuess
      ? '—'
      : hostDistLabel
    : result.guestNoGuess
    ? '—'
    : guestDistLabel
  const rightDist = leftIsHost
    ? result.guestNoGuess
      ? '—'
      : guestDistLabel
    : result.hostNoGuess
    ? '—'
    : hostDistLabel

  const leftAccent = duelAvatarAccent(leftIsHost ? hostGuessPin : guestGuessPin)
  const rightAccent = duelAvatarAccent(leftIsHost ? guestGuessPin : hostGuessPin)
  const roundDamage = Math.max(result.damageToHost, result.damageToGuest)

  const leftName = leftIsHost ? hostPlayerName : guestPlayerName
  const rightName = leftIsHost ? guestPlayerName : hostPlayerName
  const leftDamageTaken = leftIsHost ? result.damageToHost : result.damageToGuest
  const rightDamageTaken = leftIsHost ? result.damageToGuest : result.damageToHost

  const finishRecapStats = finishRecap ? (
    <FinishRecapFoot>
      <FinishRecapTable>
        <FinishRecapCell $role="label" />
        <FinishRecapCell $role="head" $align="center" $accent={leftAccent}>
          {leftName}
        </FinishRecapCell>
        <FinishRecapCell $role="head" $align="center" $accent={rightAccent}>
          {rightName}
        </FinishRecapCell>

        <FinishRecapCell $role="label">Distance</FinishRecapCell>
        <FinishRecapCell $role="value" $align="center">
          {leftDist}
        </FinishRecapCell>
        <FinishRecapCell $role="value" $align="center">
          {rightDist}
        </FinishRecapCell>

        <FinishRecapCell $role="label">Round score</FinishRecapCell>
        <FinishRecapCell $role="value" $align="center">
          {Math.round(leftPts).toLocaleString()}
        </FinishRecapCell>
        <FinishRecapCell $role="value" $align="center">
          {Math.round(rightPts).toLocaleString()}
        </FinishRecapCell>

        {mode === 'hp' ? (
          <>
            <FinishRecapCell $role="label">HP taken</FinishRecapCell>
            <FinishRecapCell
              $role="value"
              $align="center"
              $damage={leftDamageTaken > 0}
              $muted={leftDamageTaken <= 0}
            >
              {leftDamageTaken > 0
                ? `−${Math.round(leftDamageTaken).toLocaleString()}`
                : '0'}
            </FinishRecapCell>
            <FinishRecapCell
              $role="value"
              $align="center"
              $damage={rightDamageTaken > 0}
              $muted={rightDamageTaken <= 0}
            >
              {rightDamageTaken > 0
                ? `−${Math.round(rightDamageTaken).toLocaleString()}`
                : '0'}
            </FinishRecapCell>
          </>
        ) : null}
      </FinishRecapTable>

      {mode === 'hp' ? (
        <FinishRecapNote>
          <FinishRecapChip>Damage mult ×{damageMultDisplay.toFixed(1)}</FinishRecapChip>
          <FinishRecapChip $tone={roundDamage > 0 ? 'damage' : 'neutral'}>
            {roundDamage > 0
              ? `−${Math.round(roundDamage).toLocaleString()} HP dealt this round`
              : 'No damage this round'}
          </FinishRecapChip>
        </FinishRecapNote>
      ) : null}
    </FinishRecapFoot>
  ) : null

  const distanceRowBand = (
    <DistanceRowBand>
      <UnderMapPlayerCol $side="left">
        <DistanceRow
          $color={leftIsHost ? hostMeterAccent : guestMeterAccent}
          $align="left"
          $flush
        >
          {leftIsHost
            ? result.hostNoGuess
              ? '—'
              : hostDistLabel
            : result.guestNoGuess
            ? '—'
            : guestDistLabel}
        </DistanceRow>
      </UnderMapPlayerCol>
      <div aria-hidden style={{ width: 1 }} />
      <UnderMapPlayerCol $side="right">
        <DistanceRow
          $color={leftIsHost ? guestMeterAccent : hostMeterAccent}
          $align="right"
          $flush
        >
          {leftIsHost
            ? result.guestNoGuess
              ? '—'
              : guestDistLabel
            : result.hostNoGuess
            ? '—'
            : hostDistLabel}
        </DistanceRow>
      </UnderMapPlayerCol>
    </DistanceRowBand>
  )

  return (
    <OverlayRoot $fullscreen={variant === 'fullscreen'} $compact={isCompact}>
      {finishRecap ? (
        <FinishRecapHeaderStack>
          <FinishRecapTitle>Round {roundOneBased}</FinishRecapTitle>
          <FinishRecapMetaRow>
            <FinishRecapMetaChip>{mode === 'hp' ? 'Damage round' : 'Points round'}</FinishRecapMetaChip>
            {totalRounds ? <FinishRecapMetaChip>of {totalRounds}</FinishRecapMetaChip> : null}
            {plonkMapLabel ? <FinishRecapMetaChip>{plonkMapLabel}</FinishRecapMetaChip> : null}
          </FinishRecapMetaRow>
          <FinishRecapWinner $tier={winTier}>{winnerLabel}</FinishRecapWinner>
        </FinishRecapHeaderStack>
      ) : (
        <RoundHeader $compact={isCompact} $inline={inlineHeader}>
          <span>
            {headerLabel ??
              `Round ${roundOneBased}${totalRounds ? ` of ${totalRounds}` : ''} · ${
                mode === 'hp' ? 'Damage round' : 'Points round'
              }${!inlineHeader && plonkMapLabel ? ` · ${plonkMapLabel}` : ''}`}
          </span>
          <WinnerBanner $tier={winTier} $compact={inlineHeader}>
            {winnerLabel}
          </WinnerBanner>
        </RoundHeader>
      )}

      {!finishRecap ? (
        <MapWrap $compact={isCompact} $tall={tallMap}>
          <StyledResultMap>
            <div className="map">
              {customMap ? (
                customMap
              ) : (
                <GoogleMapReact
                  googleMapLoader={googleMapLoaderAsync}
                  bootstrapURLKeys={getMapsKey(user.mapsAPIKey, { allowFallback: false })}
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
                      userAvatar={{ emoji: hostGuessPin.emoji, color: hostGuessPin.color }}
                      isFinalResults={false}
                    />
                  )}
                  {guestGuess && (
                    <Marker
                      key="guest-g"
                      type="guess"
                      lat={guestGuess.lat}
                      lng={guestGuess.lng}
                      userAvatar={{ emoji: guestGuessPin.emoji, color: guestGuessPin.color }}
                      isFinalResults={false}
                    />
                  )}
                  {actualMarkers.map((m, idx) => (
                    <Marker key={`a-${idx}`} type="actual" lat={m.lat} lng={m.lng} isFinalResults={false} />
                  ))}
                </GoogleMapReact>
              )}
            </div>
          </StyledResultMap>
        </MapWrap>
      ) : null}

      {finishRecap ? (
        finishRecapStats
      ) : (
        <UnderMapGrid $compact={isCompact} $tall={tallMap}>
          {leftIsHost ? hostBarHeadEl : guestBarHeadEl}
          <MidSpacer aria-hidden />
          {leftIsHost ? guestBarHeadEl : hostBarHeadEl}

          {leftIsHost ? hostHpEl : guestHpEl}
          {centerBetweenMeters}
          {leftIsHost ? guestHpEl : hostHpEl}

          {distanceRowBand}

          {!omitScoreRow && (
            <>
              <ScoreCell>
                <span className="points">{Math.round(leftPts)}</span>
              </ScoreCell>
              <MidSpacer aria-hidden />
              <ScoreCell>
                <span className="points">{Math.round(rightPts)}</span>
              </ScoreCell>
            </>
          )}
        </UnderMapGrid>
      )}

      {onContinue ? (
        <ActionRow>
          <div className="action-spacer" />
          <NextRoundButton
            variant="primary"
            size="sm"
            className="action-next"
            onClick={onContinue}
            style={{
              height: 44,
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              fontSize: 12,
            }}
          >
            {continueLabel}
          </NextRoundButton>
          <div className="action-spacer" />
        </ActionRow>
      ) : null}
    </OverlayRoot>
  )
}

export default DuelRoundOverview
