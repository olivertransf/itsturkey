import { HTMLAttributes } from 'react'
import styled, { keyframes } from 'styled-components'

type StyledProps = {
  variant?: 'rectangular' | 'circular'
  height?: number
  width?: number
  noBorder?: boolean
} & HTMLAttributes<HTMLDivElement>

const pulse = keyframes`
  0%,
  100% {
    opacity: 0.35;
  }
  50% {
    opacity: 0.55;
  }
`

const StyledSkeleton = styled.div<StyledProps>`
  display: inline-block;
  height: ${({ height }) => (height ? `${height}px` : '100%')};
  width: ${({ width }) => (width ? `${width}px` : '100%')};
  position: relative;
  overflow: hidden;
  background-color: var(--palette-surface);
  animation: ${pulse} 1.2s ease-in-out infinite;
  border-radius: ${({ variant }) => (variant === 'circular' ? '50%' : '6px')};

  ${({ noBorder }) =>
    noBorder &&
    `
      border-radius: 0;
  `}
`

export default StyledSkeleton
