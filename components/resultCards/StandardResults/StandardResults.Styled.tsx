import styled from 'styled-components'

const StyledStandardResults = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2px;
  padding: 32px 20px;
  height: 100%;
  width: 100%;
  background-color: var(--bg-primary);
  border-top: var(--border-default);

  .pointsWrapper {
    font-size: 20px;
    font-weight: 600;
    color: #ababab;
  }

  .progress-bar {
    margin-top: 10px;
    margin-bottom: 16px;
    max-width: 525px;
    width: 100%;
  }

  .noGuessMessage {
    font-size: 16px;
    color: #6b6b6b;
  }

  .distanceMessage {
    font-size: 16px;
    color: #808080;

    @media (max-width: 600px) {
      font-size: 14px;
      text-align: center;
    }

    .emphasisText {
      font-weight: bold;
      color: #909090;
    }
  }

  .actionButton {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    .next-round-btn {
      border-radius: 50rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 50px;
      width: 200px;
      font-size: 18px;
      font-weight: 400;
      user-select: none;
      background-color: var(--mediumPurple);
      color: #fff;

      :hover {
        background-color: var(--indigo-600);
      }
    }

    .end-session-btn {
      border-radius: 50rem;
      height: 44px;
      width: 200px;
      font-size: 15px;
      font-weight: 500;
      user-select: none;
      background: transparent;
      color: var(--color3);
      border: 1px solid rgba(255, 255, 255, 0.2);

      :hover:not(:disabled) {
        border-color: rgba(255, 255, 255, 0.35);
        color: #fff;
      }

      :disabled {
        opacity: 0.6;
      }
    }
  }
`

export default StyledStandardResults
