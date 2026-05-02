import styled from 'styled-components'

const StyledPlayStreaksPage = styled.div`
  // Override Horizontal Padding and Max Width In Layout.Styled
  .mainContent {
    max-width: 1100px;

    @media (max-width: 600px) {
      padding: 0;
    }
  }

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

  .map-creator {
    font-size: 14px;
    color: var(--color3);
    position: relative;
    top: 1px;
  }

  .map-creator-link {
    color: var(--color3);

    &:hover {
      text-decoration: underline;
      color: var(--color2);
    }
  }

  .map-details {
    margin: 0;
    flex: 1;
    min-width: 0;
    display: grid;
    gap: var(--stack-gap-xs);
  }

  .description {
    color: var(--text-muted);
    font-weight: 400;

    @media (max-width: 1000px) {
      display: none;
    }
  }

  .mapAvatar {
    @media (max-width: 600px) {
      display: none;
    }
  }

  .mapDetailsSection {
    background-color: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    margin-bottom: var(--stack-gap-md);
    overflow: hidden;
    box-shadow: var(--shadow-card);

    @media (max-width: 1200px) {
      flex-direction: column;
    }

    @media (max-width: 600px) {
      border-radius: var(--radius-md);
      box-shadow: none;
    }
  }

  .mapDescriptionWrapper {
    width: 100%;
  }

  .statsWrapper {
    display: flex;
    flex-direction: column;
    border-top: 1px solid var(--divider-line);
  }

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
    }

    .descriptionColumn {
      display: flex;
      align-items: flex-start;
      gap: var(--stack-gap-md);
      flex: 1;
      min-width: 0;
    }
  }
`

export default StyledPlayStreaksPage
