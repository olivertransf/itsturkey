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

const BarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  width: 100%;
`

/** HUD: big avatar column + name above bar + bar row; icon left for “you”, right for opponent. */
const AsideRoot = styled.div<{ $iconLeading: boolean }>`
  display: flex;
  align-items: stretch;
  gap: 10px;
  min-width: 0;
  width: 100%;
  flex: 1;
  flex-direction: ${({ $iconLeading }) => ($iconLeading ? 'row' : 'row-reverse')};
`

const IconAside = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: stretch;
`

const TextStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
`

const NameRow = styled.div<{ $alignEnd: boolean }>`
  min-width: 0;
  width: 100%;
  display: flex;
  ${({ $alignEnd }) => ($alignEnd ? 'justify-content: flex-end;' : 'justify-content: flex-start;')}
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

const LabelText = styled.span<{ $accent: string; $labelTransform: 'uppercase' | 'none' }>`
  font-size: ${({ $labelTransform }) => ($labelTransform === 'none' ? '12px' : '11px')};
  font-weight: ${({ $labelTransform }) => ($labelTransform === 'none' ? 600 : 700)};
  letter-spacing: ${({ $labelTransform }) => ($labelTransform === 'none' ? '0.01em' : '0.06em')};
  text-transform: ${({ $labelTransform }) => ($labelTransform === 'uppercase' ? 'uppercase' : 'none')};
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
  display: inline-flex;
  align-items: center;
  gap: 5px;
`

const Track = styled.div<{ $animateShake?: boolean; $flex?: boolean }>`
  height: 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  ${({ $flex }) =>
    $flex &&
    css`
      flex: 1;
      min-width: 0;
    `}
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
        background-color: #84cc16;
      `
    }
    if (p > 0.28) {
      return css`
        background-color: #eab308;
      `
    }
    return css`
      background-color: #ef4444;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.18),
        0 0 12px rgba(239, 68, 68, 0.35);
    `
  }}
`

/** Left column (you) when leading; right column (opponent) when leading; otherwise neutral. */
export const POINTS_BAR_FILL: Record<'you' | 'opponent' | 'neutral', string> = {
  you: '#5b9bd4',
  opponent: '#f59e0b',
  neutral: '#71717a',
}

const PointsFill = styled.div<{
  $pct: number
  $tint: keyof typeof POINTS_BAR_FILL
  /** When set (e.g. duel HUD), uses profile color instead of lead/neutral tints. */
  $fillColor?: string
}>`
  height: 100%;
  width: ${({ $pct }) => `${Math.max(0, Math.min(100, $pct))}%`};
  border-radius: inherit;
  transition: width 0.55s cubic-bezier(0.33, 1, 0.68, 1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  background-color: ${({ $fillColor, $tint }) =>
    $fillColor != null && $fillColor !== '' ? $fillColor : POINTS_BAR_FILL[$tint]};
`

export type DuelHpMeterProps = {
  label: string
  /** Use `none` for display names (HUD); default `uppercase` for short tags. */
  labelTransform?: 'uppercase' | 'none'
  current: number
  max: number
  accent: string
  icon?: ReactNode
  valueIcon?: ReactNode
  /** When set, renders the numeric HP before or after `valueIcon`. */
  valueIconAfter?: boolean
  valueOffsetPx?: number
  valueSide?: 'left' | 'right'
  /** HP value + optional valueIcon on the same row as the bar (recap layout). */
  valueBesideBar?: boolean
  /** Duel HUD: name above bar; icon column spans both rows, left or right of the stack. */
  asideIcon?: 'left' | 'right'
  dense?: boolean
  shakeSignal?: number
}

export const DuelHpMeter = memo(function DuelHpMeter({
  label,
  labelTransform = 'uppercase',
  current,
  max,
  accent,
  icon,
  valueIcon,
  valueIconAfter = false,
  valueOffsetPx = 0,
  valueSide = 'right',
  valueBesideBar = false,
  asideIcon,
  dense,
  shakeSignal,
}: DuelHpMeterProps) {
  const cap = Math.max(1, max)
  const pct = (current / cap) * 100
  const n = Math.max(0, Math.round(current))

  const valueNode = (
    <ValueText style={{ transform: valueOffsetPx ? `translateX(${valueOffsetPx}px)` : undefined }}>
      {valueIconAfter ? (
        <>
          {n}
          {valueIcon}
        </>
      ) : (
        <>
          {valueIcon}
          {n}
        </>
      )}
    </ValueText>
  )

  const trackNode = (
    <Track
      key={shakeSignal ?? 'idle'}
      $flex={valueBesideBar}
      $animateShake={shakeSignal !== undefined && shakeSignal > 0}
    >
      <Fill $pct={pct} />
    </Track>
  )

  if (valueBesideBar) {
    const showAsideHud = asideIcon != null && icon != null && label !== ''

    if (showAsideHud) {
      return (
        <Wrap $dense={dense}>
          <AsideRoot $iconLeading={asideIcon === 'left'}>
            <IconAside>{icon}</IconAside>
            <TextStack>
              <NameRow $alignEnd={asideIcon === 'right'}>
                <LabelText
                  $accent={accent}
                  $labelTransform={labelTransform}
                  style={{
                    width: '100%',
                    textAlign: asideIcon === 'right' ? 'right' : 'left',
                  }}
                >
                  {label}
                </LabelText>
              </NameRow>
              <BarRow>
                {valueSide === 'left' ? (
                  <>
                    {valueNode}
                    {trackNode}
                  </>
                ) : (
                  <>
                    {trackNode}
                    {valueNode}
                  </>
                )}
              </BarRow>
            </TextStack>
          </AsideRoot>
        </Wrap>
      )
    }

    const showLabelRow = Boolean(label || icon)
    return (
      <Wrap $dense={dense}>
        {showLabelRow ? (
          <Row>
            <LabelCluster>
              {icon}
              <LabelText $accent={accent} $labelTransform={labelTransform}>
                {label}
              </LabelText>
            </LabelCluster>
          </Row>
        ) : null}
        <BarRow>
          {valueSide === 'left' ? (
            <>
              {valueNode}
              {trackNode}
            </>
          ) : (
            <>
              {trackNode}
              {valueNode}
            </>
          )}
        </BarRow>
      </Wrap>
    )
  }

  return (
    <Wrap $dense={dense}>
      <Row>
        {valueSide === 'left' ? (
          <>
            {valueNode}
            <LabelCluster>
              {icon}
              <LabelText $accent={accent} $labelTransform={labelTransform}>
                {label}
              </LabelText>
            </LabelCluster>
          </>
        ) : (
          <>
            <LabelCluster>
              {icon}
              <LabelText $accent={accent} $labelTransform={labelTransform}>
                {label}
              </LabelText>
            </LabelCluster>
            {valueNode}
          </>
        )}
      </Row>
      {trackNode}
    </Wrap>
  )
})

export type DuelPointsMeterProps = {
  label: string
  labelTransform?: 'uppercase' | 'none'
  points: number
  accent: string
  icon?: ReactNode
  dense?: boolean
  /** Share of combined score for bar fill (both players). */
  sharePct: number
  barTint: keyof typeof POINTS_BAR_FILL
  /** Solid fill (duel HUD: player avatar ring color). */
  barFillColor?: string
  valueBesideBar?: boolean
  asideIcon?: 'left' | 'right'
  valueSide?: 'left' | 'right'
}

export const DuelPointsMeter = memo(function DuelPointsMeter({
  label,
  labelTransform = 'uppercase',
  points,
  accent,
  icon,
  dense,
  sharePct,
  barTint,
  barFillColor,
  valueBesideBar = false,
  asideIcon,
  valueSide = 'right',
}: DuelPointsMeterProps) {
  const n = Math.round(points)
  const valueNode = <ValueText>{n}</ValueText>
  const trackNode = (
    <Track $flex={valueBesideBar}>
      <PointsFill $pct={sharePct} $tint={barTint} $fillColor={barFillColor} />
    </Track>
  )

  if (valueBesideBar) {
    const showAsideHud = asideIcon != null && icon != null && label !== ''

    if (showAsideHud) {
      return (
        <Wrap $dense={dense}>
          <AsideRoot $iconLeading={asideIcon === 'left'}>
            <IconAside>{icon}</IconAside>
            <TextStack>
              <NameRow $alignEnd={asideIcon === 'right'}>
                <LabelText
                  $accent={accent}
                  $labelTransform={labelTransform}
                  style={{
                    width: '100%',
                    textAlign: asideIcon === 'right' ? 'right' : 'left',
                  }}
                >
                  {label}
                </LabelText>
              </NameRow>
              <BarRow>
                {valueSide === 'left' ? (
                  <>
                    {valueNode}
                    {trackNode}
                  </>
                ) : (
                  <>
                    {trackNode}
                    {valueNode}
                  </>
                )}
              </BarRow>
            </TextStack>
          </AsideRoot>
        </Wrap>
      )
    }

    const showLabelRow = Boolean(label || icon)
    return (
      <Wrap $dense={dense}>
        {showLabelRow ? (
          <Row>
            <LabelCluster>
              {icon}
              <LabelText $accent={accent} $labelTransform={labelTransform}>
                {label}
              </LabelText>
            </LabelCluster>
          </Row>
        ) : null}
        <BarRow>
          {valueSide === 'left' ? (
            <>
              {valueNode}
              {trackNode}
            </>
          ) : (
            <>
              {trackNode}
              {valueNode}
            </>
          )}
        </BarRow>
      </Wrap>
    )
  }

  return (
    <Wrap $dense={dense}>
      <Row>
        <LabelCluster>
          {icon}
          <LabelText $accent={accent} $labelTransform={labelTransform}>
            {label}
          </LabelText>
        </LabelCluster>
        {valueNode}
      </Row>
      {trackNode}
    </Wrap>
  )
})
