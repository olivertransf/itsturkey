import styled from 'styled-components'

export const StyledCompactPlonkLauncher = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  .plonk-inline-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 500;
    background: transparent;
    color: var(--color3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    cursor: pointer;

    &:hover {
      border-color: rgba(255, 255, 255, 0.35);
      color: #fff;
    }

    svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }
  }
`
