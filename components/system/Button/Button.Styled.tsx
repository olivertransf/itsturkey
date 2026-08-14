import { ButtonHTMLAttributes } from 'react'
import styled from 'styled-components'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'hud' | 'solidGray' | 'solidCustom' | 'destroy'
export type ButtonSize = 'sm' | 'md' | 'lg'

type StyledProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  color?: string
  backgroundColor?: string
  hoverColor?: string
  width?: string
  height?: string
  isLoading?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>

const resolveVariant = (variant?: ButtonVariant) => {
  if (variant === 'solidGray') return 'secondary'
  if (variant === 'destroy') return 'danger'
  return variant ?? 'primary'
}

const StyledButton = styled.button<StyledProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border-radius: var(--radius-md);
  height: ${({ height }) => height ?? 'var(--control-height-md)'};
  width: ${({ width }) => width ?? 'fit-content'};
  padding: 0 var(--space-4);
  font-size: var(--font-body);
  font-weight: 600;
  letter-spacing: -0.01em;
  user-select: none;
  position: relative;
  flex-shrink: 0;
  border: 1px solid transparent;
  color: ${({ isLoading }) => isLoading && 'transparent !important'};
  transition: background-color var(--duration-fast) var(--ease), border-color var(--duration-fast) var(--ease),
    color var(--duration-fast) var(--ease), opacity var(--duration-fast) var(--ease);

  .button-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);

    svg {
      height: var(--icon-md);
      width: var(--icon-md);
      flex-shrink: 0;
    }
  }

  .spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &:focus-visible {
    outline: var(--focus-ring);
    outline-offset: 2px;
  }

  ${({ size }) =>
    size === 'sm' &&
    `
      height: var(--control-height-sm);
      font-size: var(--font-meta);
      padding: 0 var(--space-3);
      border-radius: var(--radius-sm);

      .button-content svg {
        height: var(--icon-sm);
        width: var(--icon-sm);
      }
  `}

  ${({ size }) =>
    size === 'lg' &&
    `
      height: var(--control-height-lg);
      min-height: var(--control-height-lg);
      font-size: 1rem;
      padding: 0 var(--space-5);
  `}

  ${({ variant }) =>
    resolveVariant(variant) === 'primary' &&
    `
      background-color: var(--accent-primary);
      color: var(--white);

      &:hover:not(:disabled) {
        background-color: var(--accent-primary-hover);
      }

      &:active:not(:disabled) {
        background-color: var(--accent-primary-hover);
      }
    `}

  ${({ variant }) =>
    resolveVariant(variant) === 'secondary' &&
    `
      background-color: var(--control-fill);
      color: var(--text-primary);
      border-color: var(--border-subtle);

      &:hover:not(:disabled) {
        background-color: var(--control-fill-hover);
      }
    `}

  ${({ variant }) =>
    resolveVariant(variant) === 'ghost' &&
    `
      background-color: transparent;
      color: var(--text-muted);

      &:hover:not(:disabled) {
        background-color: var(--control-fill);
        color: var(--text-primary);
      }
    `}

  ${({ variant }) =>
    resolveVariant(variant) === 'danger' &&
    `
      color: var(--white);
      background-color: var(--danger-fill);

      &:hover:not(:disabled) {
        background-color: var(--danger-fill-hover);
      }
    `}

  ${({ variant }) =>
    resolveVariant(variant) === 'hud' &&
    `
      background-color: var(--hud-surface);
      color: var(--text-primary);
      border-color: var(--border-strong);
      backdrop-filter: blur(10px);
      font-size: var(--font-compact);
      font-weight: 600;

      &:hover:not(:disabled) {
        background-color: var(--hud-surface-hover);
      }
    `}

  ${({ variant, color, backgroundColor }) =>
    variant === 'solidCustom' &&
    `
      color: ${color};
      background-color: ${backgroundColor};
  `}

  ${({ hoverColor }) =>
    hoverColor &&
    `
      &:hover:not(:disabled) {
        background-color: ${hoverColor};
      }
    `}

  ${({ disabled }) =>
    disabled &&
    `
      cursor: not-allowed;
      opacity: 0.45;
    `}
`

export default StyledButton
