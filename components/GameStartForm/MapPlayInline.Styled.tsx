import styled from 'styled-components'

export const StyledMapPlayInline = styled.div`
  border-top: var(--border-default);
  background-color: var(--bg-primary);

  .map-play-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    row-gap: 14px;
    padding: var(--stack-gap-md) var(--page-gutter) calc(var(--stack-gap-md) + 4px);
    background: var(--bg-primary);
    border-top: 1px solid var(--divider-line);
  }

  .map-play-actions-lead {
    flex: 1;
    min-width: min(100%, 200px);
  }

  .map-play-actions-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
  }

  @media (max-width: 520px) {
    .map-play-actions {
      flex-direction: column-reverse;
      align-items: stretch;
    }

    .map-play-actions-buttons {
      flex-direction: column-reverse;
      width: 100%;

      button {
        width: 100%;
        justify-content: center;
      }
    }

    .map-play-actions-lead {
      width: 100%;
    }
  }
`
