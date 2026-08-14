import styled from 'styled-components'

type StyledProps = {
  progress: number
  backgroundColor: string
}

const StyledProgressBar = styled.div<StyledProps>`
  height: 8px;
  width: 100%;
  border-radius: var(--radius-pill);
  background: var(--control-fill);
  border: 1px solid var(--border-subtle);

  .progress {
    width: ${({ progress }) => progress}%;
    height: 100%;
    border-radius: var(--radius-pill);
    background-color: ${({ backgroundColor }) => backgroundColor};
    transition: width var(--duration) var(--ease);
  }
`

export default StyledProgressBar
