import styled from 'styled-components'

const StyledMapPage = styled.div`
  min-height: 100%;
  display: flex;
  flex-direction: column;

  .mapPlayCard {
    width: 100%;
    box-sizing: border-box;
    padding: var(--space-4);
    border-radius: var(--radius-xl);
    border: var(--border-default);
    background-color: var(--bg-card);
  }

  .mapPlayHead {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    column-gap: var(--space-3);
    margin: 0 0 var(--space-4);
  }

  .mapPlayHead > *:first-child {
    justify-self: start;
  }

  .mapPlayTitle {
    grid-column: 2;
    margin: 0;
    text-align: center;
    font-size: var(--font-title);
    font-weight: 700;
    letter-spacing: var(--tracking-title);
    line-height: 1.2;
    color: var(--text-primary);
  }

  .mapLeaderboardSection {
    margin-top: var(--space-6);
  }

  .mapLeaderboardBucketTabs {
    margin-bottom: var(--space-3);
  }

  .mapLeaderboardGrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);

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
