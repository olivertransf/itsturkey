import Link from 'next/link'
import { FC } from 'react'
import HomeSectionRowCard from '@components/HomeSectionRowCard'
import HomePlayGlyph from '@components/HomeSectionRowCard/HomePlayGlyph'

const CountryStreakCard: FC = () => {
  return (
    <HomeSectionRowCard title="Country Streak">
      <Link href="/streak">
        <a className="home-play-btn home-play-btn--icon" aria-label="Play Country Streak">
          <HomePlayGlyph />
        </a>
      </Link>
    </HomeSectionRowCard>
  )
}

export default CountryStreakCard
