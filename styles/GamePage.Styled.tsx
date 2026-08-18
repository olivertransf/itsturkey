import styled from 'styled-components'

const StyledGamePage = styled.div`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  height: 100dvh;
  overflow: hidden;
  overscroll-behavior: none;

  .resultsWrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
`

export default StyledGamePage
