import styled from 'styled-components'

const StyledStandardResults = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-6) var(--space-5);
  height: 100%;
  width: 100%;
  background-color: var(--bg-primary);
  border-top: var(--border-default);

  .pointsWrapper {
    font-size: var(--font-title);
    font-weight: 600;
    color: var(--text-muted);
  }

  .progress-bar {
    margin-top: var(--space-3);
    margin-bottom: var(--space-4);
    max-width: 525px;
    width: 100%;
  }

  .noGuessMessage {
    font-size: var(--font-body);
    color: var(--text-subtle);
  }

  .distanceMessage {
    font-size: var(--font-body);
    color: var(--text-muted);

    @media (max-width: 600px) {
      font-size: var(--font-meta);
      text-align: center;
    }

    .emphasisText {
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .actionButton {
    margin-top: var(--space-6);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);

    .next-round-btn {
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      height: var(--control-height-lg);
      width: 200px;
      font-size: var(--font-section);
      font-weight: 600;
      user-select: none;
      background-color: var(--accent-primary);
      color: var(--white);

      :hover {
        background-color: var(--accent-primary-hover);
      }
    }

    .end-session-btn {
      border-radius: var(--radius-md);
      height: var(--control-height-md);
      width: 200px;
      font-size: var(--font-body);
      font-weight: 600;
      user-select: none;
      background: transparent;
      color: var(--text-muted);
      border: 1px solid var(--border-strong);

      :hover:not(:disabled) {
        border-color: var(--border-strong);
        color: var(--text-primary);
        background: var(--control-fill);
      }

      :disabled {
        opacity: 0.45;
      }
    }
  }
`

export default StyledStandardResults
