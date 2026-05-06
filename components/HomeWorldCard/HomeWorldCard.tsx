import Link from 'next/link'
import { FC } from 'react'
import HomeSectionRowCard from '@components/HomeSectionRowCard'
import HomePlayGlyph from '@components/HomeSectionRowCard/HomePlayGlyph'

type Props = {
  mapId: string
  name: string
}

const HomeWorldCard: FC<Props> = ({ mapId, name }) => {
  const label = `Play ${name}`

  return (
    <HomeSectionRowCard title={name}>
      <Link href={`/map/${encodeURIComponent(mapId)}`}>
        <a className="home-play-btn home-play-btn--icon" aria-label={label}>
          <HomePlayGlyph />
        </a>
      </Link>
    </HomeSectionRowCard>
  )
}

export default HomeWorldCard
