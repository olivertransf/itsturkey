import styled from 'styled-components'

export const StyledMapPlayInline = styled.div`
  border-top: 1px solid var(--divider-line);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 52px);

  .map-play-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    padding: var(--stack-gap-md) var(--page-gutter) calc(var(--stack-gap-md) + 4px);
    background: var(--bg-primary);
    border-top: 1px solid var(--divider-line);

    @media (max-width: 520px) {
      flex-direction: column-reverse;
      align-items: stretch;
      padding: var(--stack-gap-md) var(--page-gutter) calc(var(--stack-gap-md) + 4px);

      button {
        width: 100%;
        justify-content: center;
      }
    }
  }
`
