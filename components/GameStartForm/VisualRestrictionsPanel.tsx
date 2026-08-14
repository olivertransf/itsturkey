import { FC, useMemo } from 'react'
import { Slider } from '@components/system'
import styled from 'styled-components'
import type { VisualRestrictions, VisualRestrictionKey } from '@utils/constants/visualRestrictions'
import {
  VISUAL_RESTRICTION_CATALOG,
  clampPixelateLevel,
  DEFAULT_PIXELATE_LEVEL,
  normalizeVisualRestrictions,
} from '@utils/constants/visualRestrictions'

type Props = {
  value: VisualRestrictions
  onChange: (next: VisualRestrictions) => void
  disabled?: boolean
}

const Root = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const TitleRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: 8px;
`

const Chip = styled.button<{ $on: boolean; $disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  text-align: left;
  padding: 10px 11px;
  border-radius: 12px;
  border: 1px solid
    ${({ $on }) => ($on ? 'rgba(47, 127, 255, 0.55)' : 'var(--border-subtle)')};
  background: ${({ $on }) =>
    $on ? 'rgba(47, 127, 255, 0.16)' : 'rgba(255, 255, 255, 0.03)'};
  color: var(--text-primary);
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.45 : 1)};
  min-height: 64px;

  .chip-label {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  .chip-blurb {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-muted);
    line-height: 1.3;
  }
`

const PixelRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  background: rgba(255, 255, 255, 0.03);

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

const VisualRestrictionsPanel: FC<Props> = ({ value, onChange, disabled }) => {
  const normalized = useMemo(() => normalizeVisualRestrictions(value), [value])
  const anyOn = VISUAL_RESTRICTION_CATALOG.some(({ key }) => Boolean(normalized[key]))

  const toggle = (key: VisualRestrictionKey) => {
    if (disabled) return
    const next = { ...normalized, [key]: !normalized[key] }
    if (key === 'pixelate' && next.pixelate && next.pixelateLevel == null) {
      next.pixelateLevel = DEFAULT_PIXELATE_LEVEL
    }
    if (key === 'pixelate' && !next.pixelate) {
      delete next.pixelateLevel
    }
    onChange(normalizeVisualRestrictions(next))
  }

  return (
    <Root aria-label="Visual restrictions">
      <TitleRow>
        <Title>Wacky filters</Title>
        <ClearBtn
          type="button"
          disabled={disabled || !anyOn}
          onClick={() => onChange({})}
        >
          Clear all
        </ClearBtn>
      </TitleRow>

      <Grid>
        {VISUAL_RESTRICTION_CATALOG.map(({ key, label, blurb }) => {
          const on = Boolean(normalized[key])
          return (
            <Chip
              key={key}
              type="button"
              $on={on}
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
                })
              )
            }
            disabled={disabled}
          />
        </PixelRow>
      ) : null}
    </Root>
  )
}

export default VisualRestrictionsPanel
