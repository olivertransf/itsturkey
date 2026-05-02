import styled, { keyframes } from 'styled-components'

const check = keyframes`
  100% {
    stroke-dashoffset: 0;
  }
`

const StyledDailyChallengePage = styled.div`
  .daily-challenge-wrapper {
    display: grid;
    gap: 1rem;

    .mapDetailsSection {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-card);

      @media (max-width: 1200px) {
        flex-direction: column;
      }

      @media (max-width: 600px) {
        border-radius: var(--radius-md);
        box-shadow: none;
      }

      .mapDescriptionWrapper {
        width: 100%;

        .descriptionColumnWrapper {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          padding: var(--stack-gap-md) var(--page-gutter);
          width: 100%;
          box-sizing: border-box;
          gap: 0;

          .descriptionColumnRow {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: var(--stack-gap-md);
            width: 100%;

            @media (max-width: 600px) {
              flex-direction: column;
              align-items: stretch;
            }
          }

          .play-button {
            width: 148px;
            height: 52px;
            padding: 0;
            flex-shrink: 0;

            @media (max-width: 600px) {
              width: 100%;
              margin-top: 0;
            }

            .completed-wrapper {
              display: flex;
              align-items: center;
              gap: 6px;

              .completed-text {
                font-weight: 400;
                font-size: 14px;

                @media (max-width: 600px) {
                  font-size: 16px;
                }
              }

              .completed-check {
                height: 32px;
                width: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: var(--indigo-800);
                border: 1px solid rgba(255, 255, 255, 0.12);

                svg {
                  height: 20px;
                  color: #fff;

                  path {
                    stroke-width: 2.2px;
                    stroke-dasharray: 1000;
                    stroke-dashoffset: 1000;
                    animation: 30s linear 0s 1 normal forwards running ${check};
                  }
                }
              }
            }
          }

          .descriptionColumn {
            display: flex;
            align-items: flex-start;
            gap: var(--stack-gap-md);
            flex: 1;
            min-width: 0;

            .map-details {
              margin: 0;
              display: grid;
              gap: var(--stack-gap-xs);
              flex: 1;
              min-width: 0;

              .name-container {
                display: flex;
                align-items: center;

                .name-wrapper {
                  display: grid;

                  .name {
                    font-size: 22px;
                    font-weight: 600;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;

                    @media (max-width: 800px) {
                      font-size: 18px;
                    }
                  }
                }
              }

              .description {
                color: var(--text-muted);
                font-weight: 400;

                @media (max-width: 1000px) {
                  display: none;
                }
              }
            }
          }
        }
      }

      .statsWrapper {
        display: flex;
        flex-direction: column;
        border-top: 1px solid var(--divider-line);
      }
    }
  }
`

export default StyledDailyChallengePage
