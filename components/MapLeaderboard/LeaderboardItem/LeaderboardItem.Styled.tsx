import styled from 'styled-components'

type StyledProps = {
  highlight: boolean
  removeResults?: boolean
}

const StyledLeaderboardItem = styled.div<StyledProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  background-color: ${({ highlight }) => (highlight ? 'var(--bg-elevated)' : 'transparent')};

  &:not(:first-child) {
    border-top: 1px solid var(--divider-line);
  }

  &:hover {
    background-color: var(--bg-elevated);
  }

  @media (max-width: 1000px) {
    padding: 14px 16px;
  }

  .userPlace {
    font-feature-settings: 'tnum';
    font-variant-numeric: tabular-nums;
    font-size: var(--font-meta);
    font-weight: 700;
    color: var(--text-subtle);
    min-width: 28px;
  }

  .userSection {
    display: flex;
    align-items: center;
    gap: 14px;
    user-select: none;
    font-weight: 500;
    min-width: 0;
  }

  .userInfo {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .username-wrapper {
    display: grid;
    min-width: 0;

    .username {
      font-size: var(--font-body);
      font-weight: 600;
      letter-spacing: var(--tracking-title);
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;

      @media (max-width: 850px) {
        font-size: var(--font-meta);
      }
    }
  }

  .resultsSection {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0;

    ${({ removeResults }) => removeResults && 'margin-right: -8px'};

    .results-link {
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        height: 18px;
        color: var(--text-subtle);

        path {
          stroke-width: 1.5;
        }
      }

      &:hover svg {
        color: var(--text-primary);
      }
    }
  }

  .totalTime {
    color: var(--text-muted);
    font-size: var(--font-meta);
    width: 80px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;

    @media (max-width: 650px) {
      display: none;
    }
  }

  .bestStreakWrapper {
    display: flex;
    align-items: center;

    .bestStreak {
      width: 55px;
      font-size: var(--font-body);
      font-variant-numeric: tabular-nums;

      @media (max-width: 850px) {
        font-size: var(--font-meta);
      }
    }

    svg {
      height: 18px;
      margin-right: 6px;
      color: var(--text-muted);
    }
  }

  .totalPoints {
    width: 120px;
    font-size: var(--font-body);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--text-primary);

    @media (max-width: 850px) {
      width: 100px;
      font-size: var(--font-meta);
    }
  }
`

export default StyledLeaderboardItem
