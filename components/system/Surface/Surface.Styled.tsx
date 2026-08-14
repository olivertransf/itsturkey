import { HTMLAttributes } from 'react'
import styled from 'styled-components'

export type SurfaceVariant = 'card' | 'row' | 'hud'

type StyledProps = {
  $variant?: SurfaceVariant
} & HTMLAttributes<HTMLDivElement>

const StyledSurface = styled.div<StyledProps>`
  background-color: var(--bg-card);
  border: var(--border-default);
  color: var(--text-primary);
  box-sizing: border-box;

  ${({ $variant }) =>
    (!$variant || $variant === 'card') &&
    `
      padding: var(--pad-card);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-card);
    `}

  ${({ $variant }) =>
    $variant === 'row' &&
    `
      padding: var(--pad-row-card);
      border-radius: var(--radius-lg);
    `}

  ${({ $variant }) =>
    $variant === 'hud' &&
    `
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      background-color: var(--hud-surface);
      border-color: var(--border-strong);
      backdrop-filter: blur(10px);
      box-shadow: var(--shadow-sm);
    `}
`

export default StyledSurface
