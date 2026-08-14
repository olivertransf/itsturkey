import Link from 'next/link'
import { FC } from 'react'
import HomeSectionRowCard from '@components/HomeSectionRowCard'
import HomePlayGlyph from '@components/HomeSectionRowCard/HomePlayGlyph'
import { mapNameInitials } from '@utils/helpers/mapPreviewSrc'

type Props = {
  mapId: string
  name: string
  description?: string
}

const HomeWorldCard: FC<Props> = ({ mapId, name, description }) => {
  const label = `Play ${name}`

  return (
    <HomeSectionRowCard
      title={name}
      description={description}
      titleLeading={
        <span className="home-row-letter" aria-hidden>
          {mapNameInitials(name)}
        </span>
      }
    >
      <Link href={`/map/${encodeURIComponent(mapId)}`} className="home-play-btn home-play-btn--icon" aria-label={label}>
        <HomePlayGlyph />
      </Link>
    </HomeSectionRowCard>
  )
}

export default HomeWorldCard
