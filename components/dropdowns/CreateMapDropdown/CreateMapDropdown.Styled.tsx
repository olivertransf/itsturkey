import styled, { keyframes } from 'styled-components'

const slideUpAndFade = keyframes`
   from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const slideRightAndFade = keyframes`
 from {
    opacity: 0;
    transform: translateX(-2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`

const slideDownAndFade = keyframes`
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const slideLeftAndFade = keyframes`
    from {
    opacity: 0;
    transform: translateX(2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`

const StyledCreateMapDropdown = styled.div`
  .trigger-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--control-fill);
    height: var(--control-height-md);
    width: var(--control-height-md);
    border-radius: var(--radius-md);
    color: var(--text-muted);
    border: 1px solid var(--border-subtle);

    &:hover {
      background-color: var(--control-fill-hover);
      color: var(--text-primary);
    }

    &:focus-visible {
      outline: var(--focus-ring);
      outline-offset: 2px;
    }

    svg {
      height: var(--icon-md);
      width: var(--icon-md);
    }
  }

  .DropdownMenuContent {
    min-width: 185px;
    background-color: var(--bg-elevated);
    border-radius: var(--radius-md);
    padding: var(--space-1);
    animation-duration: var(--duration);
    animation-timing-function: var(--ease);
    will-change: transform, opacity;
    z-index: var(--z-dropdown);
    border: 1px solid var(--border-strong);
    box-shadow: var(--shadow-card);

    &[data-side='top'] {
      animation-name: ${slideDownAndFade};
    }

    &[data-side='right'] {
      animation-name: ${slideLeftAndFade};
    }

    &[data-side='bottom'] {
      animation-name: ${slideUpAndFade};
    }

    &[data-side='left'] {
      animation-name: ${slideRightAndFade};
    }
  }

  .DropdownMenuSeparator {
    height: 1px;
    background-color: var(--divider-line);
    margin: var(--space-1);
  }

  .new-item-wrapper {
    cursor: pointer;
    height: var(--control-height-md);
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0 var(--space-4);
    font-size: var(--font-meta);
    user-select: none;
    position: relative;
    border-radius: var(--radius-sm);
    font-weight: 500;
    color: var(--text-primary);

    &:hover {
      background-color: var(--control-fill-hover);

      &.destructive {
        background-color: var(--danger-fill);
        color: var(--white);
      }
    }
  }

  input[type='file'] {
    display: none;
  }
`

export default StyledCreateMapDropdown
