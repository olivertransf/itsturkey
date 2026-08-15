import styled from 'styled-components'

type StyledProps = {}

const StyledStreaksLeaderboard = styled.div<StyledProps>`
  margin-top: -20px;
  padding: 0 3.5rem;
  max-width: 1400px;
  width: 100%;
  z-index: 1;
  padding-bottom: 3rem;

  @media (max-width: 1160px) {
    max-width: 100%;
    padding: 8px;
  }

  .leaderboard-wrapper {
    display: flex;
    justify-content: space-between;
    gap: 50px;
    background-color: var(--bg-card);
    border: var(--border-default);
    border-radius: var(--radius-xl);
    padding: 18px;

    @media (max-width: 960px) {
      flex-direction: column;
    }

    .leaderboard-header {
      font-size: var(--font-compact);
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border-bottom: 1px solid var(--divider-line);
      padding: 0 0 12px;
      color: var(--text-subtle);
    }

    .users-list {
      width: 100%;

      .user-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--divider-line);
        padding: 14px 4px;
        cursor: pointer;

        &.selected,
        &:hover {
          background-color: var(--bg-elevated);
        }

        .user-details {
          display: flex;
          align-items: center;
          gap: 15px;
          user-select: none;

          .user-place {
            max-width: 25px;
            width: 100%;
            font-style: italic;
            font-weight: bold;
          }

          .user-info {
            display: flex;
            align-items: center;
            gap: 8px;

            .username {
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 150px;
            }
          }
        }

        .game-details {
          display: grid;
          gap: 4px;

          .streak-count {
            color: #bbb;
            font-size: 14px;
          }

          .time-count {
            font-weight: 400;
            font-size: 14px;
            color: #8f8f8f;
          }
        }
      }
    }

    .countries-list {
      width: 100%;
    }
  }
`

export default StyledStreaksLeaderboard
