import styled from 'styled-components'

const StyledPageHeader = styled.h1`
  font-size: clamp(1.25rem, 2.8vw, 1.5rem);
  font-weight: 600;
  letter-spacing: -0.025em;
  color: var(--text-primary);
  margin: 0 0 var(--stack-gap-md);
  line-height: 1.25;

  @media (max-width: 600px) {
    margin-bottom: var(--stack-gap-md);
  }
`

export default StyledPageHeader
