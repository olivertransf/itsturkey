import styled from 'styled-components'

const StyledSkeletonProfile = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;

  .skel-card {
    overflow: hidden;
    border-radius: var(--radius-lg);
    border: var(--border-default);
    background: var(--bg-card);
  }

  .skel-head {
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--divider-line);
  }

  .skel-identity {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--pad-row-card);
  }

  .skel-copy {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-width: 0;
  }

  .skel-tabs {
    display: flex;
    gap: var(--space-5);
    padding: 4px 0 8px;
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
