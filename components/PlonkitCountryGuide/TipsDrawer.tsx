import React, { FC, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { XIcon } from '@heroicons/react/outline'
import PlonkitGuideBody from './PlonkitGuideBody'
import { usePlonkitGuide } from './usePlonkitGuide'
import styled from 'styled-components'
import { plonkitReadableGuideCss } from './plonkitGuideReadable.styles'

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 59;
  backdrop-filter: blur(2px);
`

const Sheet = styled.aside`
  ${plonkitReadableGuideCss}

  .plonkit-guide-body {
    font-size: 16px;
    line-height: 1.68;
  }

  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 61;
  max-height: min(88vh, 720px);
  display: flex;
  flex-direction: column;
  background-color: var(--bg-elevated);
  color: #ebebf5;
  border-radius: 18px 18px 0 0;
  box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.45);
  font-family: inherit;

  .plonkit-panel-header {
    flex-shrink: 0;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    padding: 16px 18px 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(0, 0, 0, 0.2);
  }

  .plonkit-panel-header-text {
    min-width: 0;

    h2 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      line-height: 1.28;
      letter-spacing: -0.02em;
      color: #fafafa;
    }

    .plonkit-sub {
      margin: 8px 0 0;
      font-size: 0.88rem;
      line-height: 1.45;
      color: #c9c9d4;

      a {
        color: #d8ccff;
        font-weight: 600;
        text-decoration: underline;
        text-underline-offset: 2px;

        &:hover {
          color: #f0ebff;
        }
      }
    }
  }

  .plonkit-close {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.08);
    color: #f4f4f8;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 20px;
      height: 20px;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.14);
    }
  }

  .plonkit-scroll {
    flex: 1;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 16px 18px calc(24px + env(safe-area-inset-bottom, 0px));
    -webkit-overflow-scrolling: touch;
  }

  .plonkit-panel-foot {
    margin: 20px 0 0;
    padding-top: 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 10px;
    line-height: 1.45;
    color: #8b8799;

    a {
      color: #c4b5fd;
      text-decoration: underline;
      text-underline-offset: 2px;

      &:hover {
        color: #e9e5ff;
      }
    }
  }

  .plonkit-status {
    padding: 28px 16px;
    text-align: center;
    font-size: 15px;
    line-height: 1.5;
    color: #d4d4dc;
  }
`

type Props = {
  open: boolean
  onClose: () => void
  isoCode: string | null
  mapLabel?: string
}

const TipsDrawer: FC<Props> = ({ open, onClose, isoCode, mapLabel }) => {
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
      <Backdrop role="presentation" onClick={onClose} />
      <Sheet aria-label="Plonk It country guide">
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
      </Sheet>
    </>,
    document.body
  )
}

export default TipsDrawer
