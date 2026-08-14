import { ButtonHTMLAttributes } from 'react'
import styled from 'styled-components'

export type IconButtonVariant = 'ghost' | 'hud' | 'secondary'
export type IconButtonSize = 'sm' | 'md' | 'lg'
export type IconButtonShape = 'square' | 'circle'

type StyledProps = {
  $variant?: IconButtonVariant
  $size?: IconButtonSize
  $shape?: IconButtonShape
} & ButtonHTMLAttributes<HTMLButtonElement>

const sizeMap = {
  sm: 'var(--control-height-sm)',
  md: 'var(--control-height-md)',
  lg: 'var(--control-height-lg)'
}

const iconMap = {
  sm: 'var(--icon-sm)',
  md: 'var(--icon-md)',
  lg: 'var(--icon-lg)'
}

const StyledIconButton = styled.button<StyledProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  height: ${({ $size }) => sizeMap[$size ?? 'md']};
  width: ${({ $size }) => sizeMap[$size ?? 'md']};
  padding: 0;
  border: 1px solid transparent;
  border-radius: ${({ $shape }) => ($shape === 'circle' ? '50%' : 'var(--radius-md)')};
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease), border-color var(--duration-fast) var(--ease),
    color var(--duration-fast) var(--ease), opacity var(--duration-fast) var(--ease);

  svg {
    height: ${({ $size }) => iconMap[$size ?? 'md']};
    width: ${({ $size }) => iconMap[$size ?? 'md']};
  }

  &:focus-visible {
    outline: var(--focus-ring);
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  ${({ $variant }) =>
    (!$variant || $variant === 'ghost') &&
    `
      background: transparent;
      color: var(--text-muted);

      &:hover:not(:disabled) {
        background-color: var(--control-fill);
        color: var(--text-primary);
      }
    `}

  ${({ $variant }) =>
    $variant === 'secondary' &&
    `
      background-color: var(--control-fill);
      border-color: var(--border-subtle);

      &:hover:not(:disabled) {
        background-color: var(--control-fill-hover);
      }
    `}

  ${({ $variant }) =>
    $variant === 'hud' &&
    `
      background-color: var(--hud-surface);
      border-color: var(--border-strong);
      backdrop-filter: blur(10px);

      &:hover:not(:disabled) {
        background-color: var(--hud-surface-hover);
      }
    `}
`

export default StyledIconButton
