import styled from 'styled-components'

export const StyledMultiGameView = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--bg-primary);
  color: var(--text-primary);

  .multi-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 10px 16px;
    background: var(--bg-elevated);
    border-bottom: var(--border-default);
  }

  .multi-title {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  }

  .multi-title-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .multi-kicker {
    color: var(--text-muted);
    font-size: var(--font-compact);
    font-weight: 700;
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
  }

  .multi-title h1 {
    margin: 0;
    font-size: var(--font-section);
    font-weight: 700;
    letter-spacing: var(--tracking-title);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .multi-stats {
    display: flex;
    align-items: center;
    gap: 14px;
    color: var(--text-muted);
    font-size: var(--font-compact);
    font-weight: 600;
    flex-shrink: 0;
  }

  .multi-stats strong {
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
  }

  .multi-grid {
    display: grid;
    grid-template-columns: repeat(var(--multi-columns), minmax(0, 1fr));
    gap: 8px;
    padding: 8px;
    height: calc(100vh - 58px);
    height: calc(100dvh - 58px);
  }

  @media (max-width: 900px) {
    .multi-header {
      flex-wrap: wrap;
      padding: 10px 12px;
    }

    .multi-grid {
      grid-template-columns: 1fr;
      height: auto;
      min-height: calc(100vh - 58px);
    }
  }
`

export const StyledMultiPanel = styled.div`
  position: relative;
  overflow: hidden;
  height: 100%;
  min-height: 280px;
  border-radius: var(--radius-lg);
  background: var(--bg-elevated);
  border: var(--border-default);

  &.is-active {
    border-color: rgba(47, 127, 255, 0.7);
    box-shadow: 0 0 0 1px rgba(47, 127, 255, 0.35);
  }

  .panel-streetview {
    height: 100%;
    min-height: 0;
  }

  .panel-overlay {
    position: absolute;
    inset: 0;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(12, 13, 15, 0.78);
  }

  .panel-card {
    min-width: 180px;
    padding: 16px 18px;
    border-radius: var(--radius-lg);
    text-align: center;
    background: var(--bg-elevated);
    border: var(--border-default);
  }

  .panel-card strong {
    display: block;
    margin-bottom: 6px;
    font-size: 1.25rem;
  }

  .panel-card span {
    color: var(--text-muted);
    font-size: var(--font-compact);
  }

  .panel-label {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 4;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 999px;
    background: var(--hud-surface);
    border: 1px solid var(--border-strong);
    color: var(--text-primary);
    font-size: var(--font-compact);
    font-weight: 700;
    pointer-events: none;
  }

  .panel-label span {
    color: var(--text-muted);
    font-weight: 600;
  }
`

export const StyledMultiFinalResults = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: var(--bg-primary);
  color: var(--text-primary);

  .final-card {
    width: min(640px, 100%);
    padding: 28px;
    border-radius: var(--radius-lg);
    background: var(--bg-elevated);
    border: var(--border-default);
  }

  .total-points {
    margin-bottom: 22px;
    text-align: center;
  }

  .total-points strong {
    display: block;
    font-size: 2.5rem;
    font-variant-numeric: tabular-nums;
  }

  .total-points span {
    color: var(--text-muted);
    font-size: var(--font-compact);
    font-weight: 700;
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
  }

  .panel-results {
    display: grid;
    gap: 8px;
  }

  .panel-result-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 14px;
    border-radius: var(--radius-md);
    background: var(--bg-surface);
    color: var(--text-muted);
    font-weight: 600;
  }

  .final-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 24px;
  }
`
