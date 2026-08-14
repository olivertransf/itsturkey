import styled from 'styled-components'

export const StyledMapPlayInline = styled.div`
  --play-gap: var(--space-3);

  display: grid;
  grid-template-columns: 1fr;
  gap: var(--play-gap);
  width: 100%;
  min-width: 0;
  position: relative;
  align-items: start;

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);

    .play-col-filters {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: calc((100% - var(--play-gap)) / 2);
      overflow: hidden;
    }
  }

  .play-col {
    display: flex;
    flex-direction: column;
    gap: var(--play-gap);
    min-width: 0;
  }

  .play-heading-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--play-gap);
    flex-shrink: 0;
  }

  .play-heading {
    margin: 0;
    font-size: var(--font-section);
    font-weight: 700;
    letter-spacing: var(--tracking-title);
    color: var(--text-primary);
  }

  .play-clear {
    border: 0;
    background: transparent;
    color: #93c5fd;
    font-size: var(--font-compact);
    font-weight: 600;
    cursor: pointer;
    padding: 0;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  .labelHint {
    font-weight: 500;
    color: var(--text-muted);
  }

  .play-start {
    display: flex;
    flex-direction: column;
    gap: var(--play-gap);
  }

  .play-filters-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding-right: var(--space-2);
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
  }

  .play-filters-scroll > section {
    gap: var(--play-gap);
  }

  .play-col-main .lobby-game-settings-inner,
  .play-col-main .lobby-game-settings-inner .mainContent,
  .play-col-main .lobby-game-settings-inner .settingsWrapper,
  .play-col-main .lobby-game-settings-inner .detailedSettings,
  .play-col-main .lobby-game-settings-inner .checkboxWrapper,
  .play-col-main .lobby-game-settings-inner .setting-options,
  .play-col-main .roundsSection {
    display: contents;
  }

  .play-col div:has(> input[type='range']) {
    padding-block: 0;
  }
`
