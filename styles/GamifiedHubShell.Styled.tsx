import styled from 'styled-components'

/** Centers content vertically and horizontally with safe padding (lobby, forms, duel room pre-game). */
export const GamifiedCenterStage = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(16px, 4vw, 36px);
  box-sizing: border-box;
  overflow-y: auto;
`

/** Glassy card for create/join duel and small forms. */
export const GamifiedFormCard = styled.div`
  width: 100%;
  max-width: 520px;
  padding: clamp(20px, 3.5vw, 28px);
  border-radius: 20px;
  background: linear-gradient(165deg, rgba(22, 22, 34, 0.94), rgba(12, 12, 22, 0.97));
  border: 1px solid rgba(167, 139, 250, 0.22);
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.35),
    0 28px 90px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  color: #e4e4e7;
  box-sizing: border-box;
`
