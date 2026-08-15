import styled from 'styled-components'

const StyledMapsPage = styled.div`
  width: 100%;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));

  .maps-shell {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-4);
    border-radius: var(--radius-xl);
    border: var(--border-default);
    background-color: var(--bg-card);
  }

  .maps-shell-head {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    column-gap: var(--space-3);
  }

  .maps-shell-head > *:first-child {
    justify-self: start;
  }

  .maps-shell-title {
    grid-column: 2;
    margin: 0;
    text-align: center;
    font-size: var(--font-title);
    font-weight: 700;
    letter-spacing: var(--tracking-title);
    line-height: 1.2;
    color: var(--text-primary);
  }

  .browse-tabs-row {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 0 0 4px;
  }

  .maps-panel {
    min-width: 0;
    overflow: hidden;
    border-radius: var(--radius-lg);
    border: var(--border-default);
    background-color: var(--bg-elevated);
  }

  .maps-row-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 16px;

    @media (max-width: 800px) {
      grid-template-columns: 1fr;
    }
  }

  .maps-row-grid .home-row-card {
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
    gap: var(--space-4);
    min-height: 132px;
    padding: 18px;
    border-radius: var(--radius-lg);
    background: var(--bg-card);
    border: var(--border-default);
    box-shadow: none;

    &:hover {
      border-color: var(--border-strong);
      background: var(--control-fill);
    }
  }

  .maps-row-grid .home-row-letter,
  .maps-row-grid .home-row-flag {
    display: none;
  }

  .maps-row-grid .home-row-title {
    white-space: normal;
    font-size: var(--font-title);
  }

  .maps-row-grid .home-row-actions {
    justify-content: flex-end;
    margin-top: auto;
  }

  .maps-empty {
    margin: 0;
    padding: var(--space-4);
    font-size: var(--font-meta);
    color: var(--text-muted);
  }
`

export default StyledMapsPage
