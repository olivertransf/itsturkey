import styled from 'styled-components'

const StyledMobileNav = styled.div`
  height: 70px;
  width: 100%;
  border-top: 1px solid var(--border-subtle);
  position: fixed;
  bottom: 0;
  z-index: 20;
  background-color: color-mix(in srgb, var(--bg-primary) 92%, transparent);
  backdrop-filter: blur(16px) saturate(1.5);
  -webkit-backdrop-filter: blur(16px) saturate(1.5);
  display: none;

  @media (max-width: 600px) {
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
`

export default StyledMobileNav
