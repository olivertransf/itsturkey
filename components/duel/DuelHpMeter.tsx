import { memo } from 'react'
import type { ReactNode } from 'react'
import styled, { css, keyframes } from 'styled-components'

const barShake = keyframes`
  0%,
  100% {
    transform: translateX(0);
  }
  15% {
    transform: translateX(-4px);
  }
  30% {
    transform: translateX(4px);
  }
  45% {
    transform: translateX(-3px);
  }
  60% {
    transform: translateX(3px);
  }
`

const Wrap = styled.div<{ $dense?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $dense }) => ($dense ? 4 : 6)}px;
  min-width: 0;
  flex: 1;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
`

const LabelCluster = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    opacity: 0.85;
  }
`

const LabelText = styled.span<{ $accent: string }>`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ $accent }) => $accent};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ValueText = styled.span`
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: #f4f4f5;
  flex-shrink: 0;
`

const Track = styled.div<{ $animateShake?: boolean }>`
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  ${({ $animateShake }) =>
    $animateShake &&
    css`
      animation: ${barShake} 0.55s ease-out;
    `}
`

const Fill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => `${Math.max(0, Math.min(100, $pct))}%`};
  border-radius: inherit;
  transition: width 0.75s cubic-bezier(0.33, 1, 0.68, 1), filter 0.35s ease, box-shadow 0.35s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
  ${({ $pct }) => {
    const p = $pct / 100
    if (p > 0.52) {
      return css`
        background: linear-gradient(90deg, #15803d 0%, #22c55e 55%, #86efac 100%);
      `
    }
    if (p > 0.28) {
      return css`
        background: linear-gradient(90deg, #a16207 0%, #eab308 50%, #fde047 100%);
      `
    }
    return css`
      background: linear-gradient(90deg, #991b1b 0%, #ef4444 55%, #fca5a5 100%);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.18),
        0 0 12px rgba(239, 68, 68, 0.35);
    `
  }}
`

const POINTS_GRADIENT: Record<'blue' | 'purple' | 'neutral', string> = {
  blue: 'linear-gradient(90deg, #1d4ed8 0%, #3b82f6 55%, #93c5fd 100%)',
  purple: 'linear-gradient(90deg, #6d28d9 0%, #a855f7 55%, #d8b4fe 100%)',
  neutral: 'linear-gradient(90deg, #52525b 0%, #71717a 50%, #a1a1aa 100%)',
}

const PointsFill = styled.div<{ $pct: number; $tint: keyof typeof POINTS_GRADIENT }>`
  height: 100%;
  width: ${({ $pct }) => `${Math.max(0, Math.min(100, $pct))}%`};
  border-radius: inherit;
  transition: width 0.55s cubic-bezier(0.33, 1, 0.68, 1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  background: ${({ $tint }) => POINTS_GRADIENT[$tint]};
`

export type DuelHpMeterProps = {
  label: string
  current: number
  max: number
  accent: string
  icon?: ReactNode
  dense?: boolean
  shakeSignal?: number
}

export const DuelHpMeter = memo(function DuelHpMeter({
  label,
  current,
  max,
  accent,
  icon,
  dense,
  shakeSignal,
}: DuelHpMeterProps) {
  const cap = Math.max(1, max)
  const pct = (current / cap) * 100

  return (
    <Wrap $dense={dense}>
      <Row>
        <LabelCluster>
          {icon}
          <LabelText $accent={accent}>{label}</LabelText>
        </LabelCluster>
        <ValueText>{Math.max(0, Math.round(current))}</ValueText>
      </Row>
      <Track
        key={shakeSignal ?? 'idle'}
        $animateShake={shakeSignal !== undefined && shakeSignal > 0}
      >
        <Fill $pct={pct} />
      </Track>
    </Wrap>
  )
})

export type DuelPointsMeterProps = {
  label: string
  points: number
  accent: string
  icon?: ReactNode
  dense?: boolean
  /** Share of combined score for bar fill (both players). */
  sharePct: number
  barTint: keyof typeof POINTS_GRADIENT
}

export const DuelPointsMeter = memo(function DuelPointsMeter({
  label,
  points,
  accent,
  icon,
  dense,
  sharePct,
  barTint,
}: DuelPointsMeterProps) {
  return (
    <Wrap $dense={dense}>
      <Row>
        <LabelCluster>
          {icon}
          <LabelText $accent={accent}>{label}</LabelText>
        </LabelCluster>
        <ValueText>{Math.round(points)}</ValueText>
      </Row>
      <Track>
        <PointsFill $pct={sharePct} $tint={barTint} />
      </Track>
    </Wrap>
  )
})
