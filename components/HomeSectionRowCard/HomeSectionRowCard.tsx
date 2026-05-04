import { FC, ReactNode } from 'react'
import StyledHomeSectionRowCard from './HomeSectionRowCard.Styled'

type Props = {
  accentColor: string
  /** Country / map name (plain text for the heading). */
  title: string
  /** Omit for single-line cards (e.g. per-country maps). */
  description?: string
  /** e.g. flag emoji before the title */
  titleLeading?: ReactNode
  children: ReactNode
}

const HomeSectionRowCard: FC<Props> = ({ accentColor, title, description, titleLeading, children }) => {
  const descText = description?.trim()
  const hasDescription = Boolean(descText)

  return (
    <StyledHomeSectionRowCard $accentColor={accentColor} $hasDescription={hasDescription}>
      <div className="home-row-card">
        <div className="home-row-text">
          <div className="home-row-title-line">
            {titleLeading}
            <h2 className="home-row-title">{title}</h2>
          </div>
          {hasDescription && descText ? <p className="home-row-desc">{descText}</p> : null}
        </div>
        <div className="home-row-actions">{children}</div>
      </div>
    </StyledHomeSectionRowCard>
  )
}

export default HomeSectionRowCard
