import styled from 'styled-components'

export const StyledMapPlayInline = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.055);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.028) 0%, transparent 56px);

  .map-play-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    padding: 18px 24px 22px;
    background: #0b0b0b;
    border-top: 1px solid rgba(255, 255, 255, 0.07);

    @media (max-width: 520px) {
      flex-direction: column-reverse;
      align-items: stretch;
      padding: 16px 18px 20px;

      button {
        width: 100%;
        justify-content: center;
      }
    }
  }
`
