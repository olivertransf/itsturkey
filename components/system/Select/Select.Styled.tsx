import styled from 'styled-components'

const StyledSelect = styled.div`
  label {
    font-weight: 600;
    margin-bottom: var(--space-2);
    display: block;
    color: var(--text-muted);
    font-size: var(--font-meta);
  }

  .select-wrapper {
    position: relative;
    display: flex;
    align-items: center;

    select {
      width: 100%;
      height: var(--control-height-md);
      border-radius: var(--radius-md);
      padding: 0 var(--space-7) 0 var(--space-4);
      color: var(--text-primary);
      background-color: var(--bg-elevated);
      appearance: none;
      cursor: pointer;
      font-size: var(--font-body);
      font-weight: 500;
      transition: background-color var(--duration) var(--ease), border-color var(--duration) var(--ease),
        box-shadow var(--duration) var(--ease);
      border: 1px solid var(--border-strong);

      &:focus-visible {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 2px var(--accent-muted);
      }
    }

    .selectSuffix {
      display: inline-flex;
      position: absolute;
      right: var(--space-3);
      pointer-events: none;
      color: var(--text-muted);
    }
  }
`

export default StyledSelect
