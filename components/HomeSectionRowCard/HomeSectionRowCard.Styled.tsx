import styled from 'styled-components'

const StyledHomeSectionRowCard = styled.div<{ $hasDescription: boolean }>`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;

  .home-row-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--space-4);
    padding: 12px 14px;
    min-height: ${({ $hasDescription }) => ($hasDescription ? '64px' : '56px')};
    box-sizing: border-box;
    border-radius: var(--radius-lg);
    background-color: var(--bg-card);
    border: var(--border-default);
    transition: border-color var(--duration-fast) var(--ease), background-color var(--duration-fast) var(--ease);

    &:hover {
      border-color: var(--border-strong);
      background-color: var(--bg-elevated);
    }
  }

  .home-row-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: ${({ $hasDescription }) => ($hasDescription ? 'var(--space-1)' : '0')};
  }

  .home-row-title-line {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--space-3);
    min-width: 0;
  }

  .home-row-flag {
    font-size: 22px;
    line-height: 1;
    flex-shrink: 0;
    user-select: none;
  }

  .home-row-letter {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--text-primary);
    background: var(--control-fill);
    flex-shrink: 0;
    user-select: none;
  }

  .home-row-title {
    margin: 0;
    font-size: var(--font-body);
    font-weight: 700;
    letter-spacing: var(--tracking-title);
    line-height: 1.28;
    color: var(--text-primary);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .home-row-desc {
    margin: 0;
    font-size: var(--font-meta);
    font-weight: 500;
    line-height: 1.4;
    color: var(--text-muted);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
  }

  .home-row-actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-2);
    flex-shrink: 0;
    flex-wrap: nowrap;
  }

  .home-play-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    padding: 0 14px;
    border-radius: var(--radius-sm);
    font-size: var(--font-meta);
    font-weight: 700;
    white-space: nowrap;
    box-sizing: border-box;
    border: none;
    cursor: pointer;
    text-decoration: none;
    background-color: var(--accent-primary);
    color: var(--white);

    &:hover {
      background-color: var(--accent-primary-hover);
    }

    &:disabled {
      cursor: default;
      opacity: 0.45;
    }
  }

  a.home-play-btn {
    color: var(--white);
  }

  .home-play-btn--icon {
    width: 32px;
    height: 32px;
    min-width: 32px;
    padding: 0;
    border-radius: var(--radius-sm);
  }

  .home-play-btn--icon svg {
    display: block;
    flex-shrink: 0;
  }

  .home-play-btn--secondary {
    background-color: var(--control-fill);
    color: var(--text-primary);
    border: 1px solid var(--border-subtle);

    &:hover {
      background-color: var(--control-fill-hover);
    }
  }
`

export default StyledHomeSectionRowCard
