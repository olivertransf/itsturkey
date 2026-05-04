import Link from 'next/link'
import { FC } from 'react'
import HomeSectionRowCard from '@components/HomeSectionRowCard'
import HomePlayGlyph from '@components/HomeSectionRowCard/HomePlayGlyph'

type Props = {
  mapId: string
  name: string
  description?: string
  accentColor: string
}

const DEFAULT_TAGLINE = 'Street View geography — find yourself on the map.'

const HomeWorldCard: FC<Props> = ({ mapId, name, description, accentColor }) => {
  const subtitle = description?.trim() || DEFAULT_TAGLINE
  const label = `Play ${name}`

  return (
    <HomeSectionRowCard accentColor={accentColor} title={name} description={subtitle}>
      <Link href={`/map/${encodeURIComponent(mapId)}`}>
        <a className="home-play-btn home-play-btn--icon" aria-label={label}>
          <HomePlayGlyph />
        </a>
      </Link>
    </HomeSectionRowCard>
  )
}

export default HomeWorldCard
