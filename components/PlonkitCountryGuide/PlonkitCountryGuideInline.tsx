import React, { FC } from 'react'
import PlonkitGuideBody from './PlonkitGuideBody'
import { StyledPlonkitInlineSection } from './PlonkitCountryGuideInline.Styled'
import type { PlonkitInlineVariant } from './plonkitGuideTypes'
import { usePlonkitGuide } from './usePlonkitGuide'

type Props = {
  isoCode: string
  mapLabel?: string
  /** Taller scroll + larger type for play settings / modal area. */
  variant?: PlonkitInlineVariant
}

const PlonkitCountryGuideInline: FC<Props> = ({ isoCode, mapLabel, variant = 'default' }) => {
  const { loading, error, payload } = usePlonkitGuide(isoCode, true)

  const loadingLabel = mapLabel ?? 'this country'
  const isSettings = variant === 'settings'

  return (
    <StyledPlonkitInlineSection aria-label="Plonk It country guide preview" $variant={variant}>
      <div className="plonkit-inline-head">
        <span className="sectionEyebrow">Country tips</span>
        <p className="plonkit-inline-summary">
          {isSettings ? (
            <>
              Reference from{' '}
              <a href="https://www.plonkit.net/guide" target="_blank" rel="noopener noreferrer">
                Plonk It
              </a>
              . While playing, use the info button above <strong>Back to start</strong> for the same panel.
            </>
          ) : (
            <>
              Quick reference from{' '}
              <a href="https://www.plonkit.net/guide" target="_blank" rel="noopener noreferrer">
                Plonk It
              </a>
              . In-game: info button above the flag control.
            </>
          )}
        </p>
      </div>

      <div className="plonkit-inline-scroll">
        {!payload && loading ? (
          <p className="plonkit-inline-status">Loading tips for {loadingLabel}…</p>
        ) : null}
        {!loading && error ? <p className="plonkit-inline-status">{error}</p> : null}
        {!loading && !error && payload ? <PlonkitGuideBody guide={payload.guide} /> : null}
      </div>

      {payload?.attribution ? (
        <p className="plonkit-inline-foot">
          © Plonk It · {payload.attribution.license} ·{' '}
          <a href={payload.attribution.siteUrl} target="_blank" rel="noopener noreferrer">
            Guide hub
          </a>
          {' · '}
          <a href={payload.attribution.guideUrl} target="_blank" rel="noopener noreferrer">
            Country page
          </a>
        </p>
      ) : null}
    </StyledPlonkitInlineSection>
  )
}

export default PlonkitCountryGuideInline
