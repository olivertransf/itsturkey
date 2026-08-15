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

  .maps-country-search {
    position: relative;
    margin: 10px 10px 0;
  }

  .maps-country-search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: var(--text-muted);
    pointer-events: none;
  }

  .maps-country-search-input {
    width: 100%;
    height: var(--control-height-sm);
    box-sizing: border-box;
    padding: 0 10px 0 32px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-subtle);
    background: var(--bg-surface);
    color: var(--text-primary);
    font-size: var(--font-meta);

    &::placeholder {
      color: var(--text-muted);
    }

    &:focus-visible {
      outline: var(--focus-ring);
      outline-offset: 2px;
    }
  }

  .maps-row-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    padding: 10px;

    @media (max-width: 900px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 560px) {
      grid-template-columns: 1fr;
    }
  }

  .maps-row-grid .home-row-card {
    min-height: 44px;
    padding: 8px 10px;
    gap: 10px;
    border-radius: var(--radius-md);
    background: var(--bg-card);
    border: var(--border-default);
    box-shadow: none;

    &:hover {
      border-color: var(--border-strong);
      background: var(--control-fill);
    }
  }

  .maps-row-grid .home-row-title {
    font-size: var(--font-meta);
  }

  .maps-row-grid .home-play-btn {
    height: 28px;
    padding: 0 10px;
  }

  .maps-empty {
    margin: 0;
    padding: var(--space-4);
    font-size: var(--font-meta);
    color: var(--text-muted);
  }
`

export default StyledMapsPage
