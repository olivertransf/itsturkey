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

/** Wider shell for duel create (map column + settings). */
export const GamifiedFormCardWide = styled(GamifiedFormCard)`
  max-width: min(960px, 100%);
  overflow: visible;
`

/** Two columns on large screens: map list + settings stack. */
export const GamifiedDuelGrid = styled.div`
  display: grid;
  gap: clamp(18px, 2.5vw, 26px);
  width: 100%;
  align-items: start;

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
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
