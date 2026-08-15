import styled from 'styled-components'

const StyledHomeModeTile = styled.article`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-4);
  min-width: 0;
  min-height: 56px;
  padding: 14px 16px;
  background: transparent;
  border: 0;
  border-right: 1px solid var(--divider-line);
  border-bottom: 1px solid var(--divider-line);

  .mode-copy {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  .mode-title {
    margin: 0;
    font-size: var(--font-body);
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    line-height: 1.25;
  }

  .mode-desc {
    margin: 0;
    font-size: var(--font-meta);
    line-height: 1.35;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .mode-actions {
    display: flex;
    flex-wrap: nowrap;
    gap: var(--space-2);
    flex-shrink: 0;
  }

  .mode-play,
  .mode-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: var(--control-height-sm);
    padding: 0 var(--space-3);
    border-radius: var(--radius-sm);
    font-size: var(--font-meta);
    font-weight: 600;
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
