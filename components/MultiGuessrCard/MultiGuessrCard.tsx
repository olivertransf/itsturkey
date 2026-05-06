import Link from 'next/link'
import { FC } from 'react'
import HomeSectionRowCard from '@components/HomeSectionRowCard'
import HomePlayGlyph from '@components/HomeSectionRowCard/HomePlayGlyph'

const MultiGuessrCard: FC = () => {
  return (
    <HomeSectionRowCard title="MultiGuessr">
      <Link href="/multi" passHref legacyBehavior>
        <a className="home-play-btn home-play-btn--icon" aria-label="Play MultiGuessr">
          <HomePlayGlyph />
        </a>
      </Link>
    </HomeSectionRowCard>
  )
}

export default MultiGuessrCard
