import styled from 'styled-components'

const StyledHomeOngoingCard = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--accent-muted);
  background: var(--bg-card);

  .ongoing-kicker {
    margin: 0 0 var(--space-1);
    font-size: var(--font-label);
    font-weight: 700;
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
    color: var(--accent-primary);
  }

  .ongoing-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: var(--tracking-title);
    color: var(--text-primary);
  }

  .ongoing-meta {
    margin: var(--space-1) 0 0;
    font-size: var(--font-meta);
    color: var(--text-muted);
  }

  .ongoing-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  .ongoing-all {
    font-size: var(--font-meta);
    font-weight: 600;
    color: var(--accent-primary);
    text-decoration: none;
    padding: 0 var(--space-2);

    &:hover {
      color: var(--accent-primary-hover);
    }
  }
`

export default StyledHomeOngoingCard
