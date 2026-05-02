import styled from 'styled-components'

const StyledMapStats = styled.div`
  padding: 18px 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  .locations-eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #7d7d85;
  }

  .locations-line {
    display: flex;
    align-items: center;
    gap: 11px;
  }

  .locations-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);

    svg {
      height: 20px;
      width: 20px;
      color: #a1a1aa;

      path {
        stroke-width: 1.5;
      }
    }
  }

  .locations-text {
    color: #e4e4e7;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0.01em;
    font-variant-numeric: tabular-nums;

    @media (max-width: 600px) {
      font-size: 15px;
    }
  }
`

export default StyledMapStats
