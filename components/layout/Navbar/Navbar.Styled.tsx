import styled from 'styled-components'

const StyledNavbar = styled.div`
  height: var(--navbarHeight);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  padding: 0 var(--space-4);
  z-index: var(--z-sticky);
  background-color: var(--backdrop-nav);
  backdrop-filter: saturate(140%) blur(16px);
  -webkit-backdrop-filter: saturate(140%) blur(16px);
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0 !important;

  .appTitle {
    font-size: var(--font-section);
    font-weight: 600;
    letter-spacing: var(--tracking-title);
  }

  .leftContainer {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: var(--space-2);
    flex-grow: 1;
    width: 100%;
    height: 100%;

    @media (max-width: 600px) {
      flex-shrink: 3;
    }
  }

  .navBackSlot {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    margin-right: var(--space-1);
  }

  .middleContainer {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 2;
    width: 100%;

    @media (max-width: 600px) {
      display: none;
    }
  }

  .rightContainer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-grow: 1;
    width: 100%;
  }

  .navLinks {
    display: flex;
    align-items: center;
    margin-left: var(--space-5);
    height: 100%;
  }

  .rightWrapper {
    display: flex;
    align-items: center;
    gap: var(--space-3);

    .geoHubSource {
      display: none;
      font-size: var(--font-meta);
      font-weight: 500;
      color: var(--text-muted);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-sm);
      white-space: nowrap;

      &:hover {
        color: var(--text-primary);
        background: var(--control-fill);
      }

      @media (min-width: 960px) {
        display: inline-flex;
        align-items: center;
      }
    }

    .mobile-search {
      display: none;

      @media (max-width: 600px) {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-1);
        border-radius: var(--radius-sm);
        user-select: none;
        background-color: transparent;

        :hover {
          background-color: var(--control-fill);
        }
      }

      svg {
        height: var(--icon-md);
        width: var(--icon-md);
        color: var(--text-primary);

        path {
          stroke-width: 1.5;
        }
      }
    }
  }

  .userInfo {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .username {
    color: var(--text-muted);
    font-size: var(--font-body);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 250px;

    @media (max-width: 600px) {
      display: none;
    }
  }

  .cancelSearch {
    margin-left: var(--space-4);
    font-size: var(--font-meta);
    color: var(--text-muted);
    cursor: pointer;
  }

  @media (max-width: 960px) {
    position: sticky;
    top: 0;
    padding-left: max(var(--space-4), env(safe-area-inset-left, 0px));
    padding-right: max(var(--space-4), env(safe-area-inset-right, 0px));
  }
`

export default StyledNavbar
