import styled from 'styled-components'

const StyledLoadingPage = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: var(--bg-primary);
  width: 100%;
  z-index: var(--z-blocker);
  position: fixed;
  inset: 0;
`

export default StyledLoadingPage
