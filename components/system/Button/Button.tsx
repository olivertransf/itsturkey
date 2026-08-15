import { ButtonHTMLAttributes, FC, ReactNode } from 'react'
import { Spinner } from '@components/system'
import { StyledButton } from './'
import type { ButtonSize, ButtonVariant } from './Button.Styled'

type Props = {
  variant?: ButtonVariant
  size?: ButtonSize
  color?: string
  backgroundColor?: string
  hoverColor?: string
  isLoading?: boolean
  children?: ReactNode
  width?: string
  height?: string
  spinnerSize?: number
} & ButtonHTMLAttributes<HTMLButtonElement>

const Button: FC<Props> = ({
  variant,
  size,
  color,
  backgroundColor,
  hoverColor,
  isLoading,
  children,
  width,
  height,
  spinnerSize,
  onClick,
  disabled,
  ...rest
}) => {
  return (
    <StyledButton
      variant={variant || 'primary'}
      size={size || 'md'}
      color={color}
      backgroundColor={backgroundColor}
      hoverColor={hoverColor}
      width={width}
      height={height}
      isLoading={isLoading}
      onClick={isLoading ? undefined : onClick}
      disabled={disabled || isLoading}
      {...rest}
    >
      <span className="button-content">{children}</span>

      {isLoading && (
        <div className="spinner">
          <Spinner size={spinnerSize || 20} />
        </div>
      )}
    </StyledButton>
  )
}

export default Button
