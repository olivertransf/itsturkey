import Link from 'next/link'
import { FC } from 'react'
import HomeSectionRowCard from '@components/HomeSectionRowCard'
import HomePlayGlyph from '@components/HomeSectionRowCard/HomePlayGlyph'

const ACCENT = '#a855f7'

const CountryStreakCard: FC = () => {
  return (
    <HomeSectionRowCard
      accentColor={ACCENT}
      title="Country Streak"
      description="Guess the country from Street View — equitable world coverage only. Keep your streak going."
    >
      <Link href="/equitable-streaks">
        <a className="home-play-btn home-play-btn--icon" aria-label="Play Country Streak">
          <HomePlayGlyph />
        </a>
      </Link>
    </HomeSectionRowCard>
  )
}

export default CountryStreakCard
