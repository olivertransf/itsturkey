import styled from 'styled-components'

const ACCENT: Record<string, { well: string; icon: string }> = {
  streak: {
    well: 'rgba(52, 211, 153, 0.16)',
    icon: '#34d399',
  },
  multi: {
    well: 'var(--accent-muted)',
    icon: 'var(--accent-primary)',
  },
  duel: {
    well: 'rgba(251, 191, 36, 0.14)',
    icon: '#fbbf24',
  },
}

const StyledHomeModeTile = styled.article<{ $accent: string }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
  min-height: 64px;
  padding: 12px 14px;
  border-radius: var(--radius-lg);
  border: var(--border-default);
  background: var(--bg-card);

  .mode-icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: ${({ $accent }) => ACCENT[$accent]?.well || 'var(--control-fill)'};
    color: ${({ $accent }) => ACCENT[$accent]?.icon || 'var(--text-primary)'};

    svg {
      width: 20px;
      height: 20px;
    }
  }

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
    font-weight: 700;
    letter-spacing: var(--tracking-title);
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
    height: var(--control-height-md);
    padding: 0 var(--space-3);
    border-radius: var(--radius-md);
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
    background: var(--control-fill);
    color: var(--text-primary);
    border: 1px solid var(--border-subtle);

    &:hover {
      background: var(--control-fill-hover);
    }
  }
`

export default StyledHomeModeTile
