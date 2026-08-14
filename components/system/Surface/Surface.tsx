import { FC, HTMLAttributes, ReactNode } from 'react'
import StyledSurface, { SurfaceVariant } from './Surface.Styled'

type Props = {
  variant?: SurfaceVariant
  children?: ReactNode
} & HTMLAttributes<HTMLDivElement>

const Surface: FC<Props> = ({ variant = 'card', children, ...rest }) => {
  return (
    <StyledSurface $variant={variant} {...rest}>
      {children}
    </StyledSurface>
  )
}

export default Surface
