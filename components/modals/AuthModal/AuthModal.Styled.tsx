import styled from 'styled-components'

const StyledAuthModal = styled.div`
  .header {
    padding: var(--space-4);
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: var(--border-default);

    .modal-title {
      font-size: var(--font-section);
      font-weight: 600;
      letter-spacing: var(--tracking-title);
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
        height: var(--icon-lg);
        width: var(--icon-lg);
      }
    }
  }

  .mainContent {
    padding: var(--space-4);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-elevated);
  }

  .buttonsWrapper {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: var(--space-4);

    a {
      width: 100%;
    }
  }
`

export default StyledAuthModal
