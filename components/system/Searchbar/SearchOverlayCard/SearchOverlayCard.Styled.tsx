import styled from 'styled-components'

const StyledSearchOverlayCard = styled.div`
  .searchOverlayCard {
    width: 100%;
    background-color: var(--bg-elevated);
    color: var(--text-muted);
    border-radius: var(--radius-md);
    position: absolute;
    top: calc(100% + var(--space-2));
    left: 0;
    z-index: var(--z-dropdown);
    pointer-events: all;
    box-shadow: var(--shadow-card);
    border: var(--border-default);

    .searchOverlayBody {
      display: grid;
      width: 100%;

      .search-result-skeleton {
        padding: var(--space-3);
        display: flex;
        align-items: center;
        gap: var(--space-3);
      }
    }
  }

  .seeAllResults {
    height: var(--control-height-md);
    border-top: var(--border-default);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    cursor: pointer;
    font-size: var(--font-meta);
    font-weight: 600;

    :hover {
      background-color: var(--control-fill);
      color: var(--text-primary);
    }
  }
`

export default StyledSearchOverlayCard
