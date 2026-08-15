import styled from 'styled-components'

type StyledProps = {
  showPoints?: boolean
}

const StyledStandardFinalResults = styled.div<StyledProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  height: 100%;
  width: 100%;
  border-top: var(--border-default);
  background-color: var(--bg-primary);

  .results-card {
    /* max-width: 550px; */
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 8px;
  }

  .buttons-wrapper {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: center;
    gap: clamp(16px, 4vw, 28px);
    max-width: min(560px, 100%);

    .side-button {
      display: flex;
      align-items: center;
      flex-direction: column;
      gap: 8px;
      font-size: 10px;
      text-transform: uppercase;
      color: #686868;
    }

    .play-again-btn {
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      min-height: var(--control-height-lg);
      min-width: min(200px, 100%);
      padding-inline: var(--space-5);
      font-size: var(--font-body);
      font-weight: 600;
      letter-spacing: -0.01em;
      user-select: none;
      background-color: var(--accent-primary);
      color: var(--white);
      border: 1px solid transparent;
      box-shadow: var(--shadow-sm);

      :hover {
        background-color: var(--accent-primary-hover);
      }
    }

    .results-btn,
    .map-btn {
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      height: var(--control-height-lg);
      width: var(--control-height-lg);
      background-color: var(--control-fill);
      color: var(--text-muted);
      border: 1px solid var(--border-subtle);
      cursor: pointer;
      transition: background var(--duration-fast) var(--ease), color var(--duration-fast) var(--ease);

      &:hover {
        background-color: var(--control-fill-hover);
        color: var(--text-primary);
      }

      svg {
        height: 22px;
      }
    }
  }

  .pointsWrapper {
    font-size: 20px;
    font-weight: 500;
    color: #8a8a8a;

    span {
      color: #fff;
    }

    @media (max-width: 600px) {
      font-size: 18px;
    }
  }

  .progress-bar {
    margin-top: 10px;
    margin-bottom: 24px;
    max-width: 525px;
    width: 100%;
  }
`

export default StyledStandardFinalResults
