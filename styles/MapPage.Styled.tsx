import styled from 'styled-components'

const StyledMapPage = styled.div`
  .mapPlayCard {
    width: 100%;
    box-sizing: border-box;
    padding: var(--space-4) var(--space-5) var(--space-5);
    border-radius: var(--radius-xl);
    border: var(--border-default);
    background-color: var(--bg-card);
  }

  .mapPlayHead {
    margin: var(--space-3) 0 var(--space-5);
  }

  .mapPlayTitle {
    margin: 0;
    font-size: var(--font-title);
    font-weight: 700;
    letter-spacing: var(--tracking-title);
    line-height: 1.2;
    color: var(--text-primary);
  }

  .mapLeaderboardSection {
    margin-top: var(--space-7);
  }

  .mapLeaderboardBucketTabs {
    margin-bottom: var(--space-3);
  }

  .mapLeaderboardGrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-6);

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }

  .mapLeaderboardPanel {
    min-width: 0;
  }

  .skeletonCards {
    margin-top: 3rem;
  }
`

export default StyledMapPage
