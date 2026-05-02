import styled from 'styled-components'

export const StyledMultiGameView = styled.div`
  min-height: 100vh;
  background: #050505;
  color: #fff;

  .multi-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 18px;
    background: rgba(10, 10, 10, 0.96);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .multi-title {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .multi-title h1 {
    margin: 0;
    font-size: 18px;
  }

  .multi-title span {
    color: #a1a1aa;
    font-size: 13px;
  }

  .multi-stats {
    display: flex;
    align-items: center;
    gap: 14px;
    color: #d4d4d8;
    font-size: 13px;
  }

  .multi-grid {
    display: grid;
    grid-template-columns: repeat(var(--multi-columns), minmax(0, 1fr));
    gap: 8px;
    padding: 8px;
    height: calc(100vh - 69px);
    height: calc(100dvh - 69px);
  }

  @media (max-width: 900px) {
    .multi-grid {
      grid-template-columns: 1fr;
      height: auto;
      min-height: calc(100vh - 69px);
    }
  }
`

export const StyledMultiPanel = styled.div`
  position: relative;
  overflow: hidden;
  min-height: 360px;
  border-radius: 14px;
  background: #101010;
  border: 1px solid rgba(255, 255, 255, 0.08);

  .panel-streetview {
    height: 100%;
  }

  .panel-overlay {
    position: absolute;
    inset: 0;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.72);
    backdrop-filter: blur(3px);
  }

  .panel-card {
    min-width: 220px;
    padding: 18px 20px;
    border-radius: 14px;
    text-align: center;
    background: rgba(20, 20, 20, 0.96);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .panel-card strong {
    display: block;
    margin-bottom: 6px;
    font-size: 22px;
  }

  .panel-card span {
    color: #a1a1aa;
    font-size: 13px;
  }

  .panel-label {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 4;
    padding: 7px 10px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.72);
    color: #fff;
    font-size: 12px;
    font-weight: 700;
  }
`

export const StyledMultiFinalResults = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: #050505;
  color: #fff;

  .final-card {
    width: min(760px, 100%);
    padding: 28px;
    border-radius: 18px;
    background: #101010;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .total-points {
    margin-bottom: 22px;
    text-align: center;
  }

  .total-points strong {
    display: block;
    font-size: 46px;
  }

  .panel-results {
    display: grid;
    gap: 10px;
  }

  .panel-result-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 14px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.04);
    color: #d4d4d8;
  }

  .final-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 24px;
  }
`
