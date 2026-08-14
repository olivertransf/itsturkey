import styled from 'styled-components'

const radixSelectStyles = `
  .SelectTrigger {
    display: inline-flex;
    align-items: center;
    border-radius: var(--radius-md);
    padding: 0 var(--space-4);
    font-size: var(--font-meta);
    line-height: 1;
    height: var(--control-height-md);
    gap: var(--space-2);
    background-color: var(--bg-elevated);
    color: var(--text-primary);
    min-width: 185px;
    position: relative;
    border: 1px solid var(--border-strong);
    font-weight: 500;

    &:hover {
      background-color: var(--control-fill);
    }

    &:focus-visible {
      outline: var(--focus-ring);
      outline-offset: 2px;
    }
  }

  .SelectTrigger[data-placeholder] {
    color: var(--text-muted);
  }

  .SelectIcon {
    color: var(--text-muted);
    position: absolute;
    right: var(--space-2);
    display: inline-flex;
    align-items: center;
    justify-content: center;

    svg {
      height: var(--icon-md);
      width: var(--icon-md);
    }
  }

  .SelectContent {
    overflow: hidden;
    background-color: var(--bg-elevated);
    border-radius: var(--radius-md);
    z-index: var(--z-dropdown);
    border: 1px solid var(--border-strong);
    box-shadow: var(--shadow-card);
    min-width: 185px;
  }

  .SelectViewport {
    padding: var(--space-1);
  }

  .SelectItem {
    font-size: var(--font-meta);
    line-height: 1;
    color: var(--text-primary);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    padding: var(--space-3) var(--space-7) var(--space-3) var(--space-3);
    position: relative;
    user-select: none;
    font-weight: 500;
  }

  .SelectItem[data-disabled] {
    color: var(--text-subtle);
    pointer-events: none;
  }

  .SelectItem[data-highlighted] {
    outline: none;
    background-color: var(--control-fill-hover);
    color: var(--text-primary);
  }

  .SelectLabel {
    padding: 0 var(--space-3);
    font-size: var(--font-compact);
    line-height: 25px;
    color: var(--text-muted);
  }

  .SelectSeparator {
    height: 1px;
    background-color: var(--divider-line);
    margin: var(--space-1);
  }

  .SelectItemIndicator {
    position: absolute;
    right: var(--space-2);
    display: inline-flex;
    align-items: center;
    justify-content: center;

    svg {
      height: var(--icon-sm);
      width: var(--icon-sm);
    }
  }
`

const StyledSelectMapLayers = styled.div`
  ${radixSelectStyles}
`

export default StyledSelectMapLayers
