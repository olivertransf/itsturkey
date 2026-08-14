import styled from 'styled-components'

const StyledHomeSectionRowCard = styled.div<{ $hasDescription: boolean }>`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;

  .home-row-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--space-3);
    padding: var(--pad-row-card);
    min-height: ${({ $hasDescription }) => ($hasDescription ? '64px' : '56px')};
    box-sizing: border-box;
    border-radius: var(--radius-lg);
    background-color: var(--bg-card);
    border: var(--border-default);
    box-shadow: var(--shadow-card);
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

  .home-row-title {
    margin: 0;
    font-size: var(--font-section);
    font-weight: 600;
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
    font-size: var(--font-compact);
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
    height: var(--control-height-sm);
    padding: 0 var(--space-4);
    border-radius: var(--radius-sm);
    font-size: var(--font-meta);
    font-weight: 600;
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
    width: var(--control-height-sm);
    height: var(--control-height-sm);
    min-width: var(--control-height-sm);
    padding: 0;
    border-radius: var(--radius-sm);
  }

  .home-play-btn--icon svg {
    display: block;
    flex-shrink: 0;
  }

  .home-play-btn--secondary {
    background-color: transparent;
    color: var(--text-primary);
    border: 1px solid var(--border-strong);

    &:hover {
      background-color: var(--control-fill);
    }
  }
`

export default StyledHomeSectionRowCard
