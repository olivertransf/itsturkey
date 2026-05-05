import styled from 'styled-components'

const StyledMapPage = styled.div`
  .mainContent {
    max-width: 1100px;

    @media (max-width: 600px) {
      padding: 0;
    }
  }

  .name-wrapper {
    display: flex;
    align-items: center;

    .name {
      font-size: clamp(1.15rem, 2.8vw, 1.4rem);
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }
  }

  .map-creator {
    font-size: 14px;
    color: var(--text-muted);
  }

  .map-creator-link {
    color: var(--text-muted);

    &:hover {
      text-decoration: underline;
      color: var(--text-primary);
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

  .otherMapsWrapper {
    margin-top: 2rem;

    @media (max-width: 600px) {
      padding: 1rem;
    }
  }

  .otherMapsTitle {
    font-size: 18px;
    color: #dcdcdc;
  }

  .mapAvatar {
    @media (max-width: 600px) {
      display: none;
    }
  }

  .otherMaps {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.2rem;
    margin-top: 12px;
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
      margin-inline: 0;
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

  .mapLeaderboardSection {
    margin-top: var(--stack-gap-md);
  }

  .mapLeaderboardGrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--stack-gap-md);

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }

  .mapLeaderboardPanel {
    padding: var(--stack-gap-md) var(--page-gutter);
    background-color: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    min-width: 0;
  }

  .descriptionColumnWrapper {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: var(--stack-gap-md) var(--page-gutter) var(--stack-gap-md);
    width: 100%;
    box-sizing: border-box;
    gap: 0;

    @media (max-width: 600px) {
      padding-top: var(--stack-gap-sm);
    }

    .descriptionColumn {
      display: flex;
      align-items: flex-start;
      gap: var(--stack-gap-md);
      width: 100%;
    }
  }

  .skeletonCards {
    margin-top: 3rem;
  }
`

export default StyledMapPage
