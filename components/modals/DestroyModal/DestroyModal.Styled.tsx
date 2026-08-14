import styled from 'styled-components'

const StyledDestroyModal = styled.div`
  .a {
    display: grid;
    gap: var(--space-4);
    padding: var(--space-5);

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .title {
        font-size: var(--font-section);
        font-weight: 600;
      }

      .close-button {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        color: var(--text-muted);
        padding: var(--space-1);
        border-radius: var(--radius-sm);

        &:hover {
          background-color: var(--control-fill);
          color: var(--text-primary);
        }
        svg {
          height: var(--icon-md);
          width: var(--icon-md);
        }
      }
    }
  }

  .message {
    color: var(--text-muted);
    font-weight: 500;
    font-size: var(--font-meta);
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-5);
    border-top: var(--border-default);
  }
`

export default StyledDestroyModal
