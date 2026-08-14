import styled from 'styled-components'

export const StyledMapPlayInline = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5);
  width: 100%;
  min-width: 0;
  align-items: start;

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: var(--space-6);
  }

  .play-col {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    min-width: 0;
  }

  .play-block {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
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

  .play-start {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-top: var(--space-1);
  }

  .play-col-filters .play-heading {
    flex-shrink: 0;
  }

  .play-filters-scroll {
    max-height: min(420px, 55vh);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding-right: var(--space-2);
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
  }
`
