import styled from 'styled-components'

const StyledLikedMapsPage = styled.div`
  height: 100%;
  width: 100%;

  .map-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
    gap: var(--grid-gap-cards);
    align-items: stretch;
    width: 100%;
  }
`

export default StyledLikedMapsPage
