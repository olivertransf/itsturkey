import { FC, useMemo } from 'react'
import { Slider } from '@components/system'
import styled from 'styled-components'
import type { VisualRestrictions, VisualRestrictionKey } from '@utils/constants/visualRestrictions'
import {
  VISUAL_RESTRICTION_CATALOG,
  clampPixelateLevel,
  clampVisualIntensity,
  DEFAULT_PIXELATE_LEVEL,
  DEFAULT_VISUAL_INTENSITY,
  MAX_VISUAL_INTENSITY,
  MIN_VISUAL_INTENSITY,
  normalizeVisualRestrictions,
  visualIntensityLabel,
} from '@utils/constants/visualRestrictions'

type Props = {
  value: VisualRestrictions
  onChange: (next: VisualRestrictions) => void
  disabled?: boolean
  /** Constrain chip list height so create lobbies stay compact. */
  listMaxHeight?: number
  /** Hide the inner "Wacky filters" title when the accordion already says it. */
  embedded?: boolean
}

const Root = styled.section<{ $fill?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-width: 0;
  ${({ $fill }) =>
    $fill
      ? `
    flex: 1;
    min-height: 0;
    overflow: hidden;
  `
      : ''}
`

const GridScroll = styled.div<{ $scroll?: boolean }>`
  ${({ $scroll }) =>
    $scroll
      ? `
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    flex: 1;
    min-height: 0;
    overflow-y: scroll;
    scrollbar-gutter: stable;
    padding-right: var(--space-1);
  `
      : ''}
`

const TitleRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
`

const Title = styled.h3`
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #a1a1aa;
`

const ClearBtn = styled.button`
  border: 0;
  background: transparent;
  color: #93c5fd;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

const IntensityRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  flex-shrink: 0;

  .intensity-label {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    font-size: 12px;
    font-weight: 600;
    color: #c8c8d0;
  }

  .intensity-val {
    font-variant-numeric: tabular-nums;
    color: #f4f4f5;
  }

  .intensity-hint {
    margin: 0;
    font-size: 11px;
    line-height: 1.35;
    color: var(--text-muted);
  }
`

const Grid = styled.div<{ $maxHeight?: number; $twoCol?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $twoCol }) => ($twoCol ? '1fr 1fr' : 'repeat(auto-fill, minmax(132px, 1fr))')};
  gap: ${({ $twoCol }) => ($twoCol ? 'var(--space-2)' : 'var(--space-3)')};
  ${({ $maxHeight }) =>
    $maxHeight
      ? `
    max-height: ${$maxHeight}px;
    overflow: auto;
    padding-right: 2px;
  `
      : ''}
`

const Chip = styled.button<{ $on: boolean; $disabled?: boolean; $thin?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ $thin }) => ($thin ? '2px' : '4px')};
  text-align: left;
  padding: ${({ $thin }) => ($thin ? '6px 8px' : '10px 11px')};
  border-radius: ${({ $thin }) => ($thin ? 'var(--radius-sm)' : '12px')};
  border: 1px solid
    ${({ $on }) => ($on ? 'rgba(47, 127, 255, 0.55)' : 'var(--border-subtle)')};
  background: ${({ $on }) =>
    $on ? 'rgba(47, 127, 255, 0.16)' : 'rgba(255, 255, 255, 0.03)'};
  color: var(--text-primary);
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.45 : 1)};
  min-height: ${({ $thin }) => ($thin ? '40px' : '64px')};

  .chip-label {
    font-size: ${({ $thin }) => ($thin ? '12px' : '13px')};
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .chip-blurb {
    font-size: ${({ $thin }) => ($thin ? '10px' : '11px')};
    font-weight: 500;
    color: var(--text-muted);
    line-height: 1.3;
    ${({ $thin }) =>
      $thin
        ? `
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `
        : ''}
  }
`

const PixelRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  .pixel-label {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    font-size: 12px;
    font-weight: 600;
    color: #c8c8d0;
  }

  .pixel-val {
    font-variant-numeric: tabular-nums;
    color: #f4f4f5;
  }
`

const VisualRestrictionsPanel: FC<Props> = ({ value, onChange, disabled, listMaxHeight, embedded }) => {
  const normalized = useMemo(() => normalizeVisualRestrictions(value), [value])
  const anyOn = VISUAL_RESTRICTION_CATALOG.some(({ key }) => Boolean(normalized[key]))
  const intensity = clampVisualIntensity(
    normalized.intensity ?? value.intensity ?? DEFAULT_VISUAL_INTENSITY
  )

  const setIntensity = (n: number) => {
    if (disabled) return
    const nextIntensity = clampVisualIntensity(n)
    if (!anyOn) {
      onChange({ ...value, intensity: nextIntensity })
      return
    }
    onChange(normalizeVisualRestrictions({ ...normalized, intensity: nextIntensity }))
  }

  const toggle = (key: VisualRestrictionKey) => {
    if (disabled) return
    const intensitySeed = clampVisualIntensity(
      normalized.intensity ?? value.intensity ?? DEFAULT_VISUAL_INTENSITY
    )
    const next = { ...normalized, intensity: intensitySeed, [key]: !normalized[key] }
    if (key === 'pixelate' && next.pixelate && next.pixelateLevel == null) {
      next.pixelateLevel = DEFAULT_PIXELATE_LEVEL
    }
    if (key === 'pixelate' && !next.pixelate) {
      delete next.pixelateLevel
    }
    onChange(normalizeVisualRestrictions(next))
  }

  return (
    <Root aria-label="Visual restrictions" $fill={embedded}>
      {embedded ? null : (
        <TitleRow>
          <Title>Filters</Title>
          <ClearBtn
            type="button"
            disabled={disabled || !anyOn}
            onClick={() => onChange({})}
          >
            Clear all
          </ClearBtn>
        </TitleRow>
      )}

      <IntensityRow>
        <div className="intensity-label">
          <span>Effect intensity</span>
          <span className="intensity-val">
            {intensity} · {visualIntensityLabel(intensity)}
          </span>
        </div>
        <Slider
          value={intensity}
          min={MIN_VISUAL_INTENSITY}
          max={MAX_VISUAL_INTENSITY}
          onChange={setIntensity}
          disabled={disabled}
        />
        <p className="intensity-hint">
          1 is the normal look.
        </p>
      </IntensityRow>

      <GridScroll $scroll={embedded} className={embedded ? 'play-filter-grid-scroll' : undefined}>
        <Grid $maxHeight={embedded ? undefined : listMaxHeight} $twoCol={embedded}>
          {VISUAL_RESTRICTION_CATALOG.map(({ key, label, blurb }) => {
            const on = Boolean(normalized[key])
            return (
              <Chip
                key={key}
                type="button"
                $on={on}
                $thin={embedded}
                $disabled={disabled}
                aria-pressed={on}
                disabled={disabled}
                onClick={() => toggle(key)}
              >
                <span className="chip-label">{label}</span>
                <span className="chip-blurb">{blurb}</span>
              </Chip>
            )
          })}
        </Grid>

        {normalized.pixelate ? (
          <PixelRow>
            <div className="pixel-label">
              <span>Pixel size</span>
              <span className="pixel-val">
                {clampPixelateLevel(normalized.pixelateLevel ?? DEFAULT_PIXELATE_LEVEL)}
              </span>
            </div>
            <Slider
              value={clampPixelateLevel(normalized.pixelateLevel ?? DEFAULT_PIXELATE_LEVEL)}
              min={2}
              max={16}
              onChange={(n) =>
                onChange(
                  normalizeVisualRestrictions({
                    ...normalized,
                    pixelate: true,
                    pixelateLevel: n,
                    intensity,
                  })
                )
              }
              disabled={disabled}
            />
          </PixelRow>
        ) : null}
      </GridScroll>
    </Root>
  )
}

export default VisualRestrictionsPanel
