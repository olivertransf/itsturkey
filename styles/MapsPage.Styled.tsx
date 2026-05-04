import styled from 'styled-components'

const StyledMapsPage = styled.div`
  width: 100%;

  .page-wrapper {
    display: grid;
    gap: var(--stack-gap-lg);
    width: 100%;

    .section-title {
      font-size: var(--label-upper-size);
      font-weight: 600;
      letter-spacing: var(--label-upper-tracking);
      text-transform: uppercase;
      color: var(--text-muted);
      text-align: left;
      position: sticky;
      top: 0;
      z-index: 12;
      margin: 0;
      padding: var(--stack-gap-md) 0 var(--stack-gap-sm);
      background: color-mix(in srgb, var(--bg-primary) 88%, transparent);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-subtle);
    }

    .section-subtext {
      margin: -6px 0 14px;
      font-size: 13px;
      line-height: 1.45;
      color: var(--text-muted);
      max-width: 52rem;
    }

    .maps-wrapper {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
      gap: var(--grid-gap-cards);
      align-items: stretch;
      width: 100%;
    }

    .maps-wrapper.equitable-countries-grid {
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 10px;
      align-items: stretch;
    }

    .more-btn-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--stack-gap-lg) 0 var(--stack-gap-sm);

      button {
        background-color: var(--bg-elevated);
        color: var(--text-primary);
        border-radius: var(--radius-pill);
        padding: 8px 18px;
        font-size: 13px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border-subtle);
        transition: background 0.15s ease, border-color 0.15s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.1);
        }
      }
    }
  }
`

export default StyledMapsPage
