import styled from 'styled-components'

const StyledGoogleMapsSearch = styled.div`
  max-width: 300px;
  width: 100%;
  position: relative;

  .searchbar-wrapper {
    display: flex;
    align-items: center;
    height: var(--control-height-md);
    border-radius: var(--radius-md);
    background-color: var(--bg-elevated);
    color: var(--text-primary);
    position: relative;
    border: 1px solid var(--border-strong);

    input {
      color: var(--text-primary);
      width: 100%;
      pointer-events: all;
      height: 100%;
      background: transparent;
      font-weight: 500;
      padding-left: var(--space-3);
      padding-right: var(--space-7);
      font-size: var(--font-meta);

      &::placeholder {
        color: var(--text-subtle);
        font-weight: 500;
        font-size: var(--font-meta);
      }
    }

    .search-icon {
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
  }

  .results-wrapper {
    width: 100%;
    background-color: var(--bg-elevated);
    color: var(--text-muted);
    position: absolute;
    top: calc(100% + var(--space-2));
    z-index: var(--z-dropdown);
    pointer-events: all;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-strong);
    box-shadow: var(--shadow-card);
    padding: var(--space-1);

    .result-item {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      font-size: var(--font-meta);
      font-weight: 500;
      cursor: pointer;
      padding: var(--space-3);
      border-radius: var(--radius-sm);

      span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      :hover {
        background-color: var(--control-fill-hover);
      }

      .result-item-place {
        color: var(--text-primary);
      }

      .result-item-country {
        color: var(--text-muted);
      }
    }
  }
`

export default StyledGoogleMapsSearch
