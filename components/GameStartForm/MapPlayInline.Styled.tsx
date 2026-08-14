import styled from 'styled-components'

export const StyledMapPlayInline = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5);
  width: 100%;
  min-width: 0;

  @media (min-width: 960px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.2fr);
    align-items: start;
  }

  .play-block {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    min-width: 0;
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

  .play-footer {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    min-width: 0;

    @media (min-width: 960px) {
      grid-column: 1 / -1;
    }
  }
`
