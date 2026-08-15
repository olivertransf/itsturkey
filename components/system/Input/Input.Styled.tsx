import styled from 'styled-components'

type StyledProps = {
  fontSize?: string
}

const StyledInput = styled.div<StyledProps>`
  width: 100%;

  label {
    font-weight: 600;
    margin-bottom: var(--space-2);
    display: block;
    color: var(--text-muted);
    font-size: var(--font-meta);
  }

  .input-wrapper {
    height: var(--control-height-md);
    display: flex;
    align-items: center;
    position: relative;

    input {
      height: 100%;
      border-radius: var(--radius-md);
      padding: 0 var(--space-4);
      background-color: var(--bg-elevated);
      width: 100%;
      box-sizing: border-box;
      color: var(--text-primary);
      font-size: ${({ fontSize }) => fontSize ?? 'var(--font-body)'};
      font-weight: 500;
      transition: background-color var(--duration) var(--ease), border-color var(--duration) var(--ease),
        box-shadow var(--duration) var(--ease);
      border: 1px solid var(--border-strong);

      ::placeholder {
        color: var(--text-subtle);
      }

      :focus-visible {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 2px var(--accent-muted);
      }
    }
  }

  .input-icon {
    position: absolute;
    right: var(--space-3);
    background: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);

    svg {
      height: var(--icon-md);
      width: var(--icon-md);

      path {
        stroke-width: 1.5;
      }
    }
  }

  .inputError {
    color: var(--danger);
    font-size: var(--font-meta);
    margin-top: var(--space-2);
    font-weight: 500;
    display: flex;
    align-items: center;

    svg {
      fill: var(--danger);
      height: var(--icon-sm);
      width: var(--icon-sm);
    }
  }

  .inputErrorText {
    display: block;
    margin-top: 0;
    margin-left: var(--space-2);
  }

  .textarea-wrapper {
    height: 80px;
    position: relative;

    textarea {
      height: 100%;
      border-radius: var(--radius-md);
      padding: var(--space-3) var(--space-4);
      background-color: var(--bg-elevated);
      width: 100%;
      box-sizing: border-box;
      color: var(--text-primary);
      font-size: ${({ fontSize }) => fontSize ?? 'var(--font-body)'};
      font-weight: 500;
      transition: background-color var(--duration) var(--ease), border-color var(--duration) var(--ease),
        box-shadow var(--duration) var(--ease);
      border: 1px solid var(--border-strong);
      resize: none;

      ::placeholder {
        color: var(--text-subtle);
      }

      :focus-visible {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 2px var(--accent-muted);
      }
    }

    .char-count {
      color: var(--text-subtle);
      font-size: var(--font-compact);
      position: absolute;
      bottom: var(--space-2);
      right: var(--space-2);
      font-weight: 500;
    }
  }
`

export default StyledInput
