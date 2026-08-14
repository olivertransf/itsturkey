import { FC, ReactNode } from 'react'
import StyledHomeModeTile from './HomeModeTile.Styled'

type Accent = 'streak' | 'multi' | 'duel'

type Props = {
  title: string
  description: string
  icon: ReactNode
  accent: Accent
  children: ReactNode
}

const HomeModeTile: FC<Props> = ({ title, description, icon, accent, children }) => {
  return (
    <StyledHomeModeTile $accent={accent}>
      <div className="mode-icon" aria-hidden>
        {icon}
      </div>
      <div className="mode-copy">
        <h3 className="mode-title">{title}</h3>
        <p className="mode-desc">{description}</p>
      </div>
      <div className="mode-actions">{children}</div>
    </StyledHomeModeTile>
  )
}

export default HomeModeTile
