import styled from 'styled-components'

const StyledHomeModeTile = styled.article`
  --tile-accent: #2f7fff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  min-width: 0;
  min-height: 124px;
  padding: var(--space-3);
  box-sizing: border-box;
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--tile-accent) 32%, var(--border-subtle));
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--tile-accent) 18%, var(--bg-elevated)) 0%,
    var(--bg-elevated) 70%
  );

  .mode-copy {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .mode-title {
    margin: 0;
    font-size: var(--font-body);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    line-height: 1.25;
  }

  .mode-desc {
    margin: 0;
    font-size: var(--font-meta);
    line-height: 1.35;
    color: var(--text-muted);
  }

  .mode-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
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
