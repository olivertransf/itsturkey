import { FC, useState } from 'react'
import { InformationCircleIcon } from '@heroicons/react/outline'
import { Tooltip } from '@components/system'
import PlonkitCountryGuideOverlay from './PlonkitCountryGuideOverlay'
import { StyledCompactPlonkLauncher } from './PlonkitGuideLauncher.Styled'

type Props = {
  countryIso: string | null
  mapLabel?: string
  variant?: 'streetControl' | 'compact'
}

const PlonkitGuideLauncher: FC<Props> = ({ countryIso, mapLabel, variant = 'streetControl' }) => {
  const [open, setOpen] = useState(false)
  const [tip, setTip] = useState(false)

  if (!countryIso) return null

  const overlay = (
    <PlonkitCountryGuideOverlay
      open={open}
      onClose={() => setOpen(false)}
      isoCode={countryIso}
      mapLabel={mapLabel}
    />
  )

  if (variant === 'compact') {
    return (
      <>
        <StyledCompactPlonkLauncher>
          <button
            type="button"
            className="plonk-inline-btn"
            onClick={() => setOpen(true)}
            aria-label="Country tips from Plonk It guide"
          >
            <InformationCircleIcon />
            <span>Country tips</span>
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
