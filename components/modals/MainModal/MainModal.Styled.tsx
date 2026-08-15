import styled from 'styled-components'

const StyledMainModal = styled.div`
  .modal-header {
    padding: var(--space-4) var(--space-5);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    border-bottom: var(--border-default);
    background-color: var(--bg-elevated);

    .modal-title {
      font-size: var(--font-section);
      font-weight: 600;
      letter-spacing: var(--tracking-title);
      flex: 1;
      min-width: 0;
    }

    .modal-header-trailing {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-shrink: 0;
    }

    .close-button {
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      color: var(--text-muted);
      padding: var(--space-1);
      border-radius: var(--radius-sm);
      height: var(--icon-lg);
      width: var(--icon-lg);

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

  .modal-body {
    max-height: calc(100vh * 0.7);
    overflow: hidden auto;
    background-color: var(--bg-elevated);
  }

  .modal-footer {
    border-top: var(--border-default);
    padding: var(--space-4) var(--space-5);
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    flex-shrink: 0;
    background-color: var(--bg-surface);
  }

  .modal-below-footer {
    border-top: var(--border-default);
    padding: var(--space-3) var(--space-4) var(--space-4);
    background-color: var(--bg-surface);
    flex-shrink: 0;
  }
`

export default StyledMainModal
