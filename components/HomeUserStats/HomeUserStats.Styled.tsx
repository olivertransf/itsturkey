import styled from 'styled-components'

const StyledHomeUserStats = styled.div`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: var(--radius-xl);
  border: var(--border-default);
  background: var(--bg-card);

  .stats-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: var(--pad-row-card);
    border-bottom: 1px solid var(--divider-line);
  }

  .stats-title {
    margin: 0;
    font-size: var(--font-section);
    font-weight: 700;
    letter-spacing: var(--tracking-title);
    text-transform: none;
    color: var(--text-primary);
  }

  .stats-link {
    font-size: var(--font-compact);
    font-weight: 600;
    color: var(--accent-primary);
    text-decoration: none;

    &:hover {
      color: var(--accent-primary-hover);
    }
  }

  .stats-loading {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--space-2);
    padding: var(--space-3);
  }

  .stats-skel {
    height: 54px;
    border-radius: var(--radius-md);
    background: var(--control-fill);
  }

  .stats-grid {
    list-style: none;
    margin: 0;
    padding: var(--space-3);
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--space-2);
  }

  .stats-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    padding: var(--space-3);
    border-radius: var(--radius-md);
    background: var(--control-fill);
    border: 1px solid var(--border-subtle);
  }

  .stats-value {
    font-size: var(--font-title);
    font-weight: 700;
    letter-spacing: var(--tracking-title);
    line-height: 1.2;
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
  }

  .stats-label {
    font-size: var(--font-compact);
    line-height: 1.3;
    color: var(--text-muted);
  }
`

export default StyledHomeUserStats
