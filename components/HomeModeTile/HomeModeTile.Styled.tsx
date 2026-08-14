import styled from 'styled-components'

const ACCENT: Record<string, { border: string; well: string; icon: string }> = {
  streak: {
    border: 'rgba(52, 211, 153, 0.45)',
    well: 'rgba(52, 211, 153, 0.16)',
    icon: '#34d399',
  },
  multi: {
    border: 'rgba(47, 127, 255, 0.5)',
    well: 'var(--accent-muted)',
    icon: 'var(--accent-primary)',
  },
  duel: {
    border: 'rgba(251, 191, 36, 0.45)',
    well: 'rgba(251, 191, 36, 0.14)',
    icon: '#fbbf24',
  },
}

const StyledHomeModeTile = styled.article<{ $accent: string }>`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-width: 0;
  min-height: 240px;
  padding: var(--pad-card);
  border-radius: var(--radius-xl);
  border: 1px solid ${({ $accent }) => ACCENT[$accent]?.border || 'var(--border-subtle)'};
  background: var(--bg-card);
  box-shadow: var(--shadow-card);

  .mode-icon {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ $accent }) => ACCENT[$accent]?.well || 'var(--control-fill)'};
    color: ${({ $accent }) => ACCENT[$accent]?.icon || 'var(--text-primary)'};

    svg {
      width: 28px;
      height: 28px;
    }
  }

  .mode-copy {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    flex: 1;
  }

  .mode-title {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 700;
    letter-spacing: var(--tracking-title);
    color: var(--text-primary);
    line-height: 1.2;
  }

  .mode-desc {
    margin: 0;
    font-size: var(--font-body);
    line-height: 1.45;
    color: var(--text-muted);
  }

  .mode-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: auto;
  }

  .mode-play,
  .mode-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: var(--control-height-md);
    padding: 0 var(--space-4);
    border-radius: var(--radius-md);
    font-size: var(--font-body);
    font-weight: 700;
    text-decoration: none;
    border: 0;
    cursor: pointer;
  }

  .mode-play {
    flex: 1;
    min-width: 96px;
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
