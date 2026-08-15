import styled from 'styled-components'

const StyledSkeletonProfile = styled.div`
  display: grid;
  gap: var(--space-4);
  width: 100%;

  @media (min-width: 800px) {
    grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
    align-items: start;
  }

  .skel-identity {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    padding: 72px 0 var(--space-2);
  }

  .skel-copy {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
  }

  .skel-main {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    min-width: 0;
  }

  .skel-tabs {
    display: flex;
    gap: var(--space-5);
  }

  .skel-panel {
    overflow: hidden;
    border-radius: var(--radius-lg);
    border: var(--border-default);
    background: var(--bg-elevated);
  }

  .skel-hero {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--space-3);
    padding: var(--space-4);
  }

  .skel-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3) var(--space-4);
    padding: var(--space-3) var(--space-4) var(--space-4);
    border-top: 1px solid var(--divider-line);
  }

  @media (max-width: 600px) {
    .skel-hero {
      grid-template-columns: 1fr;
    }
  }
`

export default StyledSkeletonProfile
