import styled from 'styled-components'

const StyledMapsPage = styled.div`
  width: 100%;

  .browse-tabs-row {
    margin-bottom: var(--stack-gap-md);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 4px 8px 8px;
    margin-left: -8px;
    margin-right: -8px;
  }

  .page-wrapper {
    display: grid;
    gap: var(--stack-gap-lg);
    width: 100%;
    padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));

    .section-title {
      font-size: var(--font-title);
      font-weight: 700;
      letter-spacing: var(--tracking-title);
      text-transform: none;
      color: var(--text-primary);
      text-align: left;
      margin: 0;
      padding: 0;
      line-height: 1.15;
    }

    .section-subtext {
      margin: 0 0 var(--space-4);
      font-size: var(--font-body);
      line-height: 1.5;
      color: var(--text-muted);
      max-width: 52rem;
    }

    .maps-wrapper {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
      gap: var(--space-4);
      align-items: stretch;
      width: 100%;
    }

    .maps-wrapper.equitable-countries-grid {
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
      gap: var(--space-4);
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
        border-radius: var(--radius-md);
        padding: var(--space-2) var(--space-4);
        font-size: var(--font-meta);
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border-subtle);
        transition: background var(--duration-fast) var(--ease), border-color var(--duration-fast) var(--ease);

        &:hover {
          background: var(--control-fill);
          border-color: var(--border-strong);
        }
      }
    }
  }
`

export default StyledMapsPage
