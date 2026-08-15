import Link from 'next/link'
import { FC } from 'react'
import HomeSectionRowCard from '@components/HomeSectionRowCard'
import HomePlayGlyph from '@components/HomeSectionRowCard/HomePlayGlyph'

const MultiGuessrCard: FC = () => {
  return (
    <HomeSectionRowCard title="MultiGuessr">
      <Link href="/multi" className="home-play-btn home-play-btn--icon" aria-label="Play MultiGuessr">
        <HomePlayGlyph />
      </Link>
    </HomeSectionRowCard>
  )
}

export default MultiGuessrCard
