import styled from 'styled-components'

export const StyledMapPlayInline = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
  width: 100%;
  min-width: 0;
  align-items: start;

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: stretch;

    .play-col-filters {
      min-height: 0;
      overflow: hidden;
    }

    .play-filters-scroll {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }
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
    margin-top: 0;
  }

  .play-col-filters .play-heading {
    flex-shrink: 0;
  }

  .play-filters-scroll {
    overscroll-behavior: contain;
    padding-right: var(--space-2);
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
  }

  .play-filters-scroll > section {
    gap: var(--space-3);
  }

  .lobby-game-settings-inner .mainContent {
    gap: var(--space-3);
  }

  .lobby-game-settings-inner .settingsWrapper {
    gap: var(--space-3);
    padding-top: 0;
  }

  .lobby-game-settings-inner .checkboxWrapper {
    padding: var(--space-3);
  }

  .lobby-game-settings-inner .detailedSettings {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .lobby-game-settings-inner .setting-options {
    gap: var(--space-3);
    margin-top: 0;
  }

  .roundsSection {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
`
