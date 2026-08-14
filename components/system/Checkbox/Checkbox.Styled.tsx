import styled from 'styled-components'

type StyledProps = {
  $checked?: boolean
}

const StyledCheckbox = styled.div<StyledProps>`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;

  .checkbox {
    background: ${({ $checked }) => ($checked ? 'var(--accent-primary)' : 'var(--bg-elevated)')};
    height: var(--icon-lg);
    width: var(--icon-lg);
    border-radius: var(--radius-sm);
    border: 1px solid ${({ $checked }) => ($checked ? 'var(--accent-primary)' : 'var(--border-strong)')};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color var(--duration-fast) var(--ease), border-color var(--duration-fast) var(--ease);

    .checkIcon {
      height: var(--icon-sm);
      width: var(--icon-sm);
      color: var(--white);
    }
  }

  label {
    cursor: pointer;
    font-size: var(--font-body);
    color: var(--text-primary);
  }

  &:focus-visible {
    outline: var(--focus-ring);
    outline-offset: 2px;
  }

  @media (max-width: 600px) {
    label {
      font-size: var(--font-meta);
    }
  }
`

export default StyledCheckbox
