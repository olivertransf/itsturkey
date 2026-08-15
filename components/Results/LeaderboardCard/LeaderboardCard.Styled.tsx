import styled from 'styled-components'

const StyledLeaderboardCard = styled.div`
  margin-top: -20px;
  padding: 0 3.5rem;
  max-width: 1400px;
  width: 100%;
  z-index: 1;
  padding-bottom: 3rem;

  @media (max-width: 600px) {
    margin-top: 0;
  }

  @media (max-width: 1300px) {
    max-width: 100%;
    padding: 8px;
  }

  .leaderboardWrapper {
    display: grid;
    gap: 0;
    background-color: var(--bg-card);
    border: var(--border-default);
    border-radius: var(--radius-xl);
    overflow: hidden;

    .gameInfoWrapper {
      display: flex;
      align-items: center;
      gap: 50px;
      padding: 18px;
      border-bottom: 1px solid var(--divider-line);

      @media (max-width: 600px) {
        gap: 10px;
        justify-content: space-between;
        padding: 20px 1rem;
      }

      .gameInfoItem {
        display: flex;
        align-items: center;
        gap: 10px;

        .settingsAvatar {
          background-color: var(--control-fill);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          height: 40px;
          width: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          @media (max-width: 600px) {
            height: 40px;
            width: 40px;
          }

          svg {
            height: 30px;
            color: var(--color2);

            path {
              stroke-width: 1.5;
            }
          }
        }

        .gameInfoContent {
          display: flex;
          flex-direction: column;
          gap: 5px;

          .label1 {
            font-size: 14px;
          }

          .label2 {
            font-size: 12px;
            color: var(--color2);
            font-weight: 400;
          }
        }
      }
    }
  }

  .leaderboardSection {
    .titleSection {
      font-size: var(--font-compact);
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-subtle);
      padding: 12px 0 10px;

      &:first-child {
        padding-left: 16px;
      }
    }

    .leaderboardHeaderRow {
      display: grid;
      grid-template-columns: 250px repeat(6, 1fr);

      @media (max-width: 800px) {
        grid-template-columns: 1fr 90px;
      }
    }

    .leaderboardRow {
      display: grid;
      grid-template-columns: 250px repeat(6, 1fr);
      border-top: 1px solid var(--divider-line);
      cursor: pointer;
      padding: 6px 0;

      @media (max-width: 800px) {
        grid-template-columns: 1fr 90px;
      }

      &.selected {
        background-color: var(--bg-elevated);
      }

      &:hover {
        background-color: var(--bg-elevated);
      }
    }

    .userSection {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 1rem;
      user-select: none;

      .userPlace {
        max-width: 25px;
        width: 100%;
        font-style: italic;
        font-weight: bold;
      }

      .userInfo {
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
  }

  .userResultSection {
    display: flex;
    flex-direction: column;
    user-select: none;

    @media (max-width: 1100px) {
      display: flex;
      align-items: flex-start;
      justify-content: center;
    }

    .pointsWrapper {
      font-weight: 400;
      font-size: 14px;
      margin-top: auto;

      @media (max-width: 1100px) {
        margin-top: 0;
      }
    }

    .distanceTimeWrapper {
      display: flex;
      align-items: center;
      gap: 5px;
      color: var(--color3);
      font-size: 13px;
      font-weight: 400;
      margin-top: 5px;
      margin-bottom: auto;

      @media (max-width: 1100px) {
        display: none;
      }

      .divider {
        color: #606060;
      }
    }
  }

  .hideOnSmall {
    @media (max-width: 800px) {
      display: none;
    }
  }
`

export default StyledLeaderboardCard
