import styled from 'styled-components'

/** Centers content vertically and horizontally with safe padding (lobby, forms, duel room pre-game). */
export const GamifiedCenterStage = styled.div`
  flex: 1;
  width: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: safe center;
  padding: var(--pad-card-sm) var(--page-gutter);
  box-sizing: border-box;
  overflow-y: auto;
`

/** Glassy card for create/join duel and small forms. */
export const GamifiedFormCard = styled.div`
  width: 100%;
  max-width: 520px;
  padding: var(--pad-card);
  border-radius: var(--radius-xl);
  background-color: var(--bg-elevated);
  border: var(--border-default);
  box-shadow: var(--shadow-card);
  color: var(--text-primary);
  box-sizing: border-box;
`

/** Wider shell for lobby pages with map + settings (uses site content width). */
export const GamifiedFormCardWide = styled(GamifiedFormCard)`
  max-width: min(var(--mainMaxWidth), 100%);
  overflow: visible;
`

/** Two columns on large screens: map list + settings stack. */
export const GamifiedDuelGrid = styled.div`
  display: grid;
  gap: clamp(18px, 2.5vw, 26px);
  width: 100%;
  align-items: start;

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  }
`

export const GamifiedDuelMapColumn = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`

export const GamifiedDuelSettingsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
  padding: var(--pad-card-sm);
  border-radius: var(--radius-lg);
  background-color: var(--bg-surface);
  border: var(--border-default);
`

/**
 * Create-duel layout: map | match rules | movement/FX on wide screens.
 * From 900px, map stays left while match + filters stack on the right.
 */
export const GamifiedDuelCreateGrid = styled.div`
  display: grid;
  gap: clamp(16px, 2vw, 24px);
  width: 100%;
  align-items: start;

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
    grid-template-areas:
      'map match'
      'map filters';
  }

  @media (min-width: 1180px) {
    grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr) minmax(340px, 1.1fr);
    grid-template-areas: 'map match filters';
  }

  > .duel-create-map {
    grid-area: map;
  }

  > .duel-create-match {
    grid-area: match;
  }

  > .duel-create-filters {
    grid-area: filters;
  }

  @media (max-width: 899px) {
    > .duel-create-map,
    > .duel-create-match,
    > .duel-create-filters {
      grid-area: auto;
    }
  }
`

export const GamifiedDuelCreatePanel = styled.section`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding: 14px 14px 16px;
  border-radius: var(--radius-lg);
  background-color: var(--bg-surface);
  border: var(--border-default);
  box-sizing: border-box;

  .panel-title {
    margin: 0 0 4px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .panel-body {
    display: flex;
    flex-direction: column;
    gap: 0;
    min-width: 0;
  }

  .panel-footer {
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid var(--border-subtle);
  }
`
