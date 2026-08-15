import { ButtonHTMLAttributes, FC, ReactNode } from 'react'
import StyledIconButton, { IconButtonShape, IconButtonSize, IconButtonVariant } from './IconButton.Styled'

type Props = {
  variant?: IconButtonVariant
  size?: IconButtonSize
  shape?: IconButtonShape
  children?: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

const IconButton: FC<Props> = ({ variant = 'ghost', size = 'md', shape = 'square', children, type, ...rest }) => {
  return (
    <StyledIconButton $variant={variant} $size={size} $shape={shape} type={type ?? 'button'} {...rest}>
      {children}
    </StyledIconButton>
  )
}

export default IconButton
