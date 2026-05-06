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

  .mapPageHero {
    position: relative;
    min-height: 220px;
    border-bottom: 1px solid var(--divider-line);
  }

  .mapPageHeroMedia {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    background-color: var(--bg-elevated);
  }

  .mapPageHeroMedia--placeholder {
    background-image: none;
    /* Match custom-map.svg stops without rendering the embedded title copy */
    background: linear-gradient(135deg, #1d4ed8 0%, #0d9488 52%, #16a34a 100%);
  }

  .mapPageHeroScrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.78) 0%, rgba(0, 0, 0, 0.38) 42%, rgba(0, 0, 0, 0.18) 100%);
    pointer-events: none;
  }

  .mapPageHeroInner {
    position: relative;
    z-index: 1;
    min-height: 220px;
    padding: var(--stack-gap-md) var(--page-gutter);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--stack-gap-sm);
  }

  .mapPageHeroInner .page-back-toolbar {
    align-self: flex-start;
  }

  .mapPageHeroInner .page-back-link {
    color: rgba(255, 255, 255, 0.88);

    &:hover {
      color: #ffffff;
    }
  }

  .mapPageHeroTitle {
    margin: auto 0 0;
    padding: 0;
    font-size: clamp(1.35rem, 4vw, 1.75rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.15;
    color: #fafafa;
    text-shadow: 0 1px 20px rgba(0, 0, 0, 0.55);
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
