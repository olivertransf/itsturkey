import styled from 'styled-components'

type StyledProps = {}

const StyledAppLogo = styled.div<StyledProps>`
  .logo {
    user-select: none;
    display: flex;
    align-items: center;
    position: relative;
    width: fit-content;
    transition: 0.2s;

    .wordmark {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.025em;
      color: var(--text-primary);
      line-height: 1;
    }

    &:hover {
      opacity: 0.7;
    }
  }
`

export default StyledAppLogo
