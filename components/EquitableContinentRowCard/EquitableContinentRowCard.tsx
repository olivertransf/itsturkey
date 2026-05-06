import Link from 'next/link'
import { FC } from 'react'
import HomeSectionRowCard from '@components/HomeSectionRowCard'
import HomePlayGlyph from '@components/HomeSectionRowCard/HomePlayGlyph'
import { MapType } from '@types'
import { parseEquitableContinentMapKey } from '@utils/helpers/equitableContinentMapId'

type Props = {
  map: Pick<MapType, '_id' | 'name'>
  isForDisplayOnly?: boolean
}

const EquitableContinentRowCard: FC<Props> = ({ map, isForDisplayOnly }) => {
  const slug = typeof map._id === 'string' ? parseEquitableContinentMapKey(map._id) : null
  if (!slug) return null

  const title = map.name?.trim() || slug.toUpperCase()
  const href = `/map/${encodeURIComponent(String(map._id))}`

  return (
    <HomeSectionRowCard title={title}>
      {!isForDisplayOnly ? (
        <Link href={href}>
          <a className="home-play-btn home-play-btn--icon" aria-label={`Play ${title}`}>
            <HomePlayGlyph />
          </a>
        </Link>
      ) : (
        <span className="home-play-btn home-play-btn--icon" aria-hidden>
          <HomePlayGlyph />
        </span>
      )}
    </HomeSectionRowCard>
  )
}

export default EquitableContinentRowCard
