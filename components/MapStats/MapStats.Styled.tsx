import styled from 'styled-components'

const StyledMapStats = styled.div`
  padding: var(--stack-gap-md) var(--page-gutter) var(--stack-gap-md);
  display: flex;
  flex-direction: column;
  gap: var(--stack-gap-xs);

  .locations-eyebrow {
    font-size: var(--label-upper-size);
    font-weight: 600;
    letter-spacing: var(--label-upper-tracking);
    text-transform: uppercase;
    color: var(--text-muted);
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
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border-subtle);

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
    color: var(--text-primary);
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
