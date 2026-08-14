import styled from 'styled-components'

export const StyledMapPlayInline = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  max-width: 28rem;

  .play-block {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .play-heading {
    margin: 0;
    font-size: var(--font-section);
    font-weight: 700;
    letter-spacing: var(--tracking-title);
    color: var(--text-primary);
  }

  .labelHint {
    font-weight: 500;
    color: var(--text-muted);
  }
`
