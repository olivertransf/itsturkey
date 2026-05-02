import styled from 'styled-components'

const StyledMyMapsPage = styled.div`
  width: 100%;

  .map-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
    gap: var(--grid-gap-cards);
    align-items: stretch;
    width: 100%;
  }

  .create-map-card {
    border-radius: var(--radius-lg);
    background-color: ${({ theme }) => theme.color.gray[900]};
    border: 1px solid var(--border-subtle);
    box-shadow: var(--shadow-card);
    position: relative;
    color: var(--color2);
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 150px;

    &:hover {
      background-color: var(--bg-surface);
      border-color: rgba(255, 255, 255, 0.1);
    }

    .create-map-plus {
      background-color: rgba(255, 255, 255, 0.08);

      border-radius: var(--radius-pill);
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        height: 20px;
        width: 20px;
        color: #fff;
      }
    }
  }
`

export default StyledMyMapsPage
