import styled from 'styled-components'

type StyledProps = {
  isActive: boolean
}

const StyledItem = styled.div<StyledProps>`
  border-radius: var(--radius-md);
  background-color: ${({ isActive }) => (isActive ? 'rgba(5, 150, 105, 0.18)' : 'transparent')};
  /* background-color: ${({ isActive }) => (isActive ? '#2f2f36' : 'transparent')}; */
  /* background-color: ${({ isActive }) => (isActive ? '#312c40' : 'transparent')}; */
  /* box-shadow: ${({ isActive }) => isActive && '0 0 0 1px rgba(255, 255, 255, 0.08)'}; */

  //transition: background-color 0.2s ease 0s, color 0.2s ease 0s;

  // #271d37 #2f2a39 #312c40
  &:hover {
    /* background-color: ${({ isActive }) => !isActive && '#333'}; */
    /* background-color: ${({ isActive }) => (isActive ? '#2f2f36' : '#2a2a30')}; */
    /* background-color: ${({ isActive }) => (isActive ? '#312c40' : '#2a2a30')}; */

    ${({ isActive }) =>
      !isActive &&
      `
          background-color: rgba(255, 255, 255, 0.06);

          .item {
            color: var(--text-primary);

            svg {
              color: var(--text-muted);
            }
          }
    `}
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  .item {
    background-color: transparent;
    color: ${({ isActive }) => (isActive ? 'var(--text-primary)' : 'var(--text-muted)')};
    padding: 8px 10px;
    display: flex;
    align-items: center;
    cursor: pointer;
    width: 100%;
    position: relative;

    @media (max-width: 1200px) {
      justify-content: center;
    }

    svg {
      height: 22px;
      color: ${({ isActive }) => (isActive ? 'var(--text-primary)' : 'var(--text-muted)')};

      @media (max-width: 1200px) {
        height: 22px;
      }
    }
  }

  .itemText {
    margin-top: 0;
    font-weight: 500;
    font-size: 14px;
    margin-left: 10px;

    @media (max-width: 1200px) {
      display: none;
    }
  }

  @media (max-width: 600px) {
    background-color: transparent;

    .item {
      svg {
        height: 30px;
        path {
          stroke-width: 1.5px;
        }
      }
    }

    &:hover {
      background-color: transparent;

      .item {
        color: ${({ isActive }) => (isActive ? 'var(--text-primary)' : 'var(--text-muted)')};

        svg {
          color: ${({ isActive }) => (isActive ? 'var(--text-primary)' : 'var(--text-muted)')};
        }
      }
    }
  }
`

export default StyledItem
