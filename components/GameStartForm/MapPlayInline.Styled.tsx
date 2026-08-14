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

    .play-card-filters {
      height: 100%;
    }
  }

  .play-col {
    display: flex;
    flex-direction: column;
    gap: var(--play-gap);
    min-width: 0;
  }

  .play-card {
    display: flex;
    flex-direction: column;
    gap: var(--play-gap);
    min-width: 0;
    padding: var(--space-4);
    border-radius: var(--radius-lg);
    border: var(--border-default);
    background-color: var(--bg-elevated);
    box-sizing: border-box;
  }

  .play-card-filters {
    min-height: 0;
    overflow: hidden;
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

  .play-filter-grid-scroll {
    overflow-y: scroll;
    scrollbar-gutter: stable;
    scrollbar-width: auto;
    scrollbar-color: rgba(255, 255, 255, 0.45) rgba(255, 255, 255, 0.08);

    @media (max-width: 899px) {
      max-height: min(420px, 50vh);
    }
  }

  .play-filter-grid-scroll::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 10px;
  }

  .play-filter-grid-scroll::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-pill);
  }

  .play-filter-grid-scroll::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.38);
    border-radius: var(--radius-pill);
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  .play-card .lobby-game-settings-inner,
  .play-card .lobby-game-settings-inner .mainContent,
  .play-card .lobby-game-settings-inner .settingsWrapper,
  .play-card .lobby-game-settings-inner .detailedSettings,
  .play-card .lobby-game-settings-inner .checkboxWrapper,
  .play-card .lobby-game-settings-inner .setting-options,
  .play-card .roundsSection {
    display: contents;
  }

  .play-col div:has(> input[type='range']) {
    padding-block: 0;
  }
`
