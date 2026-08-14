import styled from 'styled-components'

type StyledProps = {
  isFocused: boolean
  isSmall?: boolean
}

const StyledSearchbar = styled.div<StyledProps>`
  max-width: 450px;
  width: 100%;
  position: relative;

  .searchbarWrapper {
    display: flex;
    align-items: center;
    width: 100%;
    height: ${({ isSmall }) => (isSmall ? 'var(--control-height-sm)' : 'var(--control-height-md)')};
    border-radius: var(--radius-md);
    background-color: var(--bg-elevated);
    color: var(--text-muted);
    transition: background-color var(--duration-fast) var(--ease), box-shadow var(--duration-fast) var(--ease),
      border-color var(--duration-fast) var(--ease);
    box-shadow: ${({ isFocused }) => (isFocused ? '0 0 0 2px var(--accent-muted)' : 'none')};
    border: 1px solid ${({ isFocused }) => (isFocused ? 'var(--accent-primary)' : 'var(--border-strong)')};
  }

  input {
    color: var(--text-primary);
    width: 100%;
    pointer-events: all;
    height: 100%;
    background: transparent;
    font-weight: 500;
    font-size: var(--font-body);
    margin-left: var(--space-3);
    border-radius: var(--radius-md);

    ::placeholder {
      color: var(--text-subtle);
      font-weight: 500;
    }
  }

  .searchBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0 var(--space-4);
    transition: background-color var(--duration-fast) var(--ease);
    background-color: transparent;
    border-left: 1px solid var(--border-subtle);
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
    color: var(--text-muted);

    svg {
      height: var(--icon-md);
      width: var(--icon-md);

      path {
        stroke-width: 1.5;
      }
    }

    &:hover {
      background-color: var(--control-fill);
      color: var(--text-primary);
    }
  }
`

export default StyledSearchbar
