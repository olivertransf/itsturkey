import styled from 'styled-components'

const StyledHomeUserStats = styled.div`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: var(--radius-xl);
  border: var(--border-default);
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  min-height: 0;

  .stats-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-3);
    padding: 14px 18px;
    border-bottom: 1px solid var(--divider-line);
  }

  .stats-title {
    margin: 0;
    font-size: var(--font-compact);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-subtle);
  }

  .stats-link {
    font-size: var(--font-compact);
    font-weight: 600;
    color: var(--text-muted);
    text-decoration: none;

    &:hover {
      color: var(--text-primary);
    }
  }

  .stats-loading {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-4);
    flex: 1 1 auto;
  }

  .stats-skel {
    height: 44px;
    border-radius: var(--radius-sm);
    background: var(--control-fill);

    &--wide {
      height: 72px;
    }
  }

  .stats-hero {
    list-style: none;
    margin: 0;
    padding: var(--space-4);
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--space-3);
    flex: 1 1 auto;
  }

  .stats-hero li {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stats-value {
    font-size: 1.25rem;
    font-weight: 650;
    letter-spacing: -0.03em;
    line-height: 1.1;
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
  }

  .stats-label {
    font-size: var(--font-compact);
    line-height: 1.3;
    color: var(--text-muted);
  }

  .stats-meta {
    margin: 0;
    margin-top: auto;
    padding: var(--space-3) var(--space-4) var(--space-4);
    border-top: 1px solid var(--divider-line);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3) var(--space-4);
  }

  .stats-meta div {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stats-meta dt {
    font-size: var(--font-compact);
    color: var(--text-subtle);
  }

  .stats-meta dd {
    margin: 0;
    font-size: var(--font-meta);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--text-primary);
  }
`

export default StyledHomeUserStats
