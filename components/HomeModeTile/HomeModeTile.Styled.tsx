import styled from 'styled-components'

const StyledHomeModeTile = styled.article`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: space-between;
  gap: var(--space-4);
  min-width: 0;
  min-height: 132px;
  padding: 18px;
  background: var(--bg-elevated);
  border: var(--border-default);
  border-radius: var(--radius-lg);
  transition: border-color var(--duration-fast) var(--ease), background-color var(--duration-fast) var(--ease);

  &:hover {
    border-color: var(--border-strong);
    background: var(--control-fill);
  }

  .mode-copy {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-width: 0;
    padding-right: 4px;
  }

  .mode-title {
    margin: 0;
    font-size: var(--font-title);
    font-weight: 700;
    letter-spacing: var(--tracking-title);
    color: var(--text-primary);
    line-height: 1.2;
  }

  .mode-desc {
    margin: 0;
    font-size: var(--font-meta);
    line-height: 1.45;
    color: var(--text-muted);
  }

  .mode-actions {
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-end;
    align-self: flex-end;
    gap: var(--space-2);
    flex-shrink: 0;
  }

  .mode-play,
  .mode-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    padding: 0 14px;
    border-radius: var(--radius-sm);
    font-size: var(--font-meta);
    font-weight: 700;
    text-decoration: none;
    border: 0;
    cursor: pointer;
  }

  .mode-play {
    background: var(--accent-primary);
    color: var(--white);

    &:hover {
      background: var(--accent-primary-hover);
    }
  }

  .mode-secondary {
    background: transparent;
    color: var(--text-muted);
    border: 1px solid var(--border-subtle);

    &:hover {
      color: var(--text-primary);
      border-color: var(--border-strong);
    }
  }
`

export default StyledHomeModeTile
