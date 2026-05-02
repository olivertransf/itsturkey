import styled from 'styled-components'

const StyledNavbar = styled.div`
  height: var(--navbarHeight);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  padding: 0 1rem;
  //position: sticky;
  //top: 0;
  z-index: 20;
  background-color: rgba(16, 16, 18, 0.82);
  backdrop-filter: saturate(160%) blur(14px);
  -webkit-backdrop-filter: saturate(160%) blur(14px);
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0 !important;

  .appTitle {
    font-size: 1.125rem;
    font-weight: 600;

    @media (max-width: 800px) {
      font-size: 1rem;
    }
  }

  .leftContainer {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.5rem;
    flex-grow: 1;
    width: 100%;
    height: 100%;

    @media (max-width: 500px) {
      flex-shrink: 3;
    }
  }

  .navBackSlot {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    margin-right: 0.25rem;
  }

  .middleContainer {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 2;
    width: 100%;

    @media (max-width: 700px) {
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
    margin-left: 2rem;
    height: 100%;
  }

  .rightWrapper {
    display: flex;
    align-items: center;
    gap: 10px;

    .geoHubSource {
      display: none;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-muted);
      padding: 6px 10px;
      border-radius: 8px;
      white-space: nowrap;

      &:hover {
        color: var(--text-primary);
        background: rgba(255, 255, 255, 0.06);
      }

      @media (min-width: 880px) {
        display: inline-flex;
        align-items: center;
      }
    }

    .mobile-search {
      display: none;

      @media (max-width: 700px) {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.25rem;
        border-radius: 5px;
        user-select: none;
        background-color: transparent;

        :hover {
          background-color: #444;
        }
      }

      svg {
        height: 20px;
        color: #efeff1;

        path {
          stroke-width: 1.5;
        }
      }
    }
  }

  .userInfo {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .username {
    color: var(--text-muted);
    font-size: 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 250px;

    @media (max-width: 800px) {
      font-size: 1rem;
    }

    @media (max-width: 500px) {
      display: none;
    }
  }

  .cancelSearch {
    margin-left: 1rem;
    font-size: 14px;
    color: #9ca3af;
    cursor: pointer;
  }

  a button {
    font-size: 15px;
    border-radius: 5px;
  }

  @media (max-width: 600px) {
    position: fixed;
    background-color: rgba(16, 16, 18, 0.94);
  }
`

export default StyledNavbar
