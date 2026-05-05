import { FC, useState } from 'react'
import { InformationCircleIcon } from '@heroicons/react/outline'
import { Tooltip } from '@components/system'
import PlonkitCountryGuideOverlay from './PlonkitCountryGuideOverlay'
import { StyledCompactPlonkLauncher } from './PlonkitGuideLauncher.Styled'

type Props = {
  countryIso: string | null
  mapLabel?: string
  variant?: 'streetControl' | 'compact'
  presentation?: 'drawer' | 'fullscreen'
  /** Pill alignment for compact variant */
  compactAlign?: 'center' | 'start' | 'end'
  /** When false, compact variant shows icon only (e.g. modal header). */
  compactShowLabel?: boolean
  /** Compact container width:auto (toolbar / modal header). */
  compactShrinkWrap?: boolean
}

const PlonkitGuideLauncher: FC<Props> = ({
  countryIso,
  mapLabel,
  variant = 'streetControl',
  presentation = 'drawer',
  compactAlign = 'center',
  compactShowLabel = true,
  compactShrinkWrap = false,
}) => {
  const [open, setOpen] = useState(false)
  const [tip, setTip] = useState(false)

  if (!countryIso) return null

  const overlay = (
    <PlonkitCountryGuideOverlay
      open={open}
      onClose={() => setOpen(false)}
      isoCode={countryIso}
      mapLabel={mapLabel}
      presentation={presentation}
    />
  )

  if (variant === 'compact') {
    return (
      <>
        <StyledCompactPlonkLauncher $align={compactAlign} $shrinkWrap={compactShrinkWrap}>
          <button
            type="button"
            className={`plonk-inline-btn${compactShowLabel ? '' : ' plonk-inline-btn--icon-only'}`}
            onClick={() => setOpen(true)}
            aria-label="Country tips from Plonk It guide"
          >
            <InformationCircleIcon />
            {compactShowLabel ? <span>Country tips</span> : null}
          </button>
        </StyledCompactPlonkLauncher>
        {overlay}
      </>
    )
  }

  return (
    <>
      <div
        className="control-button-wrapper"
        onMouseOver={() => setTip(true)}
        onMouseOut={() => setTip(false)}
      >
        <button
          type="button"
          className="control-button"
          onClick={() => setOpen(true)}
          aria-label="Country tips from Plonk It guide"
        >
          <InformationCircleIcon />
        </button>
        {tip ? <Tooltip label="Country tips (Plonk It)" position="left" /> : null}
      </div>
      {overlay}
    </>
  )
}

export default PlonkitGuideLauncher
