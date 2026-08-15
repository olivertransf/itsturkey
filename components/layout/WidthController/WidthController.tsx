import { FC, ReactNode } from 'react'
import { StyledWidthController } from './'

type Props = {
  children: ReactNode
  customWidth?: string
  mobilePadding?: string
  center?: boolean
}

const WidthController: FC<Props> = ({ children, customWidth, mobilePadding, center }) => {
  return (
    <StyledWidthController customWidth={customWidth} mobilePadding={mobilePadding} $center={center}>
      {children}
    </StyledWidthController>
  )
}

export default WidthController
