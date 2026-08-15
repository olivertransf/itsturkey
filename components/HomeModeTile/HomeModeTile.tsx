import { FC, ReactNode } from 'react'
import StyledHomeModeTile from './HomeModeTile.Styled'

type Props = {
  title: string
  description: string
  children: ReactNode
}

const HomeModeTile: FC<Props> = ({ title, description, children }) => {
  return (
    <StyledHomeModeTile>
      <div className="mode-copy">
        <h3 className="mode-title">{title}</h3>
        <p className="mode-desc">{description}</p>
      </div>
      <div className="mode-actions">{children}</div>
    </StyledHomeModeTile>
  )
}

export default HomeModeTile
