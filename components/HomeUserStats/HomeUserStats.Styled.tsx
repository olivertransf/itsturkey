import styled from 'styled-components'

const StyledHomeUserStats = styled.div`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent 48%),
    var(--palette-surface, #1c1e22);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.04) inset,
    0 18px 40px rgba(0, 0, 0, 0.28);

  .stats-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .stats-title {
    margin: 0;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-primary);
  }

  .stats-link {
    font-size: 12px;
    font-weight: 600;
    color: var(--palette-accent, #2f7fff);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }

  .stats-loading {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 12px;
  }

  .stats-skel {
    height: 54px;
    border-radius: 12px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.03),
      rgba(255, 255, 255, 0.07),
      rgba(255, 255, 255, 0.03)
    );
    background-size: 200% 100%;
    animation: stats-shimmer 1.2s ease-in-out infinite;
  }

  @keyframes stats-shimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }

  .stats-grid {
    list-style: none;
    margin: 0;
    padding: 10px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .stats-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    padding: 10px 11px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.04);
  }

  .stats-value {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.2;
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
  }

  .stats-label {
    font-size: 11px;
    line-height: 1.3;
    color: var(--text-muted);
  }
`

export default StyledHomeUserStats
