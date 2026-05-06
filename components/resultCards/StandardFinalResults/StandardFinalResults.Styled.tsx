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
      border-radius: var(--radius-pill, 999px);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 52px;
      min-width: min(200px, 100%);
      padding-inline: 22px;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: -0.02em;
      user-select: none;
      background-color: var(--accent-primary, var(--mediumPurple));
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);

      :hover {
        background-color: var(--accent-primary-hover, #4a8ac4);
      }
    }

    .results-btn,
    .map-btn {
      border-radius: var(--radius-pill, 999px);
      display: flex;
      align-items: center;
      justify-content: center;
      height: 52px;
      width: 52px;
      background-color: rgba(255, 255, 255, 0.06);
      color: #a3a3ad;
      border: 1px solid rgba(255, 255, 255, 0.08);
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: #e4e4e7;
        border-color: rgba(255, 255, 255, 0.12);
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
