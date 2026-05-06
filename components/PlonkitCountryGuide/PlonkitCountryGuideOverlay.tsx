import React, { FC, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { XIcon } from '@heroicons/react/outline'
import PlonkitGuideBody from './PlonkitGuideBody'
import { StyledPlonkitBackdrop, StyledPlonkitPanel } from './PlonkitCountryGuideOverlay.Styled'
import { usePlonkitGuide } from './usePlonkitGuide'

type Props = {
  open: boolean
  onClose: () => void
  isoCode: string | null
  mapLabel?: string
  /** Full viewport panel vs right-edge drawer sheet. */
  presentation?: 'drawer' | 'fullscreen'
}

const PlonkitCountryGuideOverlay: FC<Props> = ({
  open,
  onClose,
  isoCode,
  mapLabel,
  presentation = 'fullscreen',
}) => {
  const { loading, error, payload } = usePlonkitGuide(isoCode, Boolean(open && isoCode))

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open || typeof document === 'undefined') return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open || typeof document === 'undefined') return null

  const headline = payload?.meta.title ?? mapLabel ?? 'Country guide'

  return createPortal(
    <>
      <StyledPlonkitBackdrop
        role="presentation"
        onClick={onClose}
        $elevated={presentation === 'fullscreen'}
      />
      <StyledPlonkitPanel aria-label="Plonk It country guide" $presentation={presentation}>
        <header className="plonkit-panel-header">
          <div className="plonkit-panel-header-text">
            <h2>{headline}</h2>
            <p className="plonkit-sub">
              From{' '}
              <a href="https://www.plonkit.net/guide" target="_blank" rel="noopener noreferrer">
                Plonk It
              </a>
              {' · '}
              {payload?.attribution.license ?? 'CC BY-NC-SA 4.0'} (noncommercial, attribution required)
            </p>
          </div>
          <button type="button" className="plonkit-close" onClick={onClose} aria-label="Close guide">
            <XIcon />
          </button>
        </header>

        <div className="plonkit-scroll">
          {loading ? <div className="plonkit-status">Loading guide…</div> : null}
          {!loading && error ? <div className="plonkit-status">{error}</div> : null}
          {!loading && !error && payload ? <PlonkitGuideBody guide={payload.guide} /> : null}

          {payload?.attribution ? (
            <p className="plonkit-panel-foot">
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
        </div>
      </StyledPlonkitPanel>
    </>,
    document.body
  )
}

export default PlonkitCountryGuideOverlay
