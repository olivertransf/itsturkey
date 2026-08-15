import Link from 'next/link'
import { FC } from 'react'
import HomeSectionRowCard from '@components/HomeSectionRowCard'
import { MapType } from '@types'
import { parseEquitableContinentMapKey } from '@utils/helpers/equitableContinentMapId'
import { mapNameInitials } from '@utils/helpers/mapPreviewSrc'

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
    <HomeSectionRowCard
      title={title}
      titleLeading={
        <span className="home-row-letter" aria-hidden>
          {mapNameInitials(title)}
        </span>
      }
    >
      {!isForDisplayOnly ? (
        <Link href={href} className="home-play-btn">
          Play
        </Link>
      ) : (
        <span className="home-play-btn" aria-hidden>
          Play
        </span>
      )}
    </HomeSectionRowCard>
  )
}

export default EquitableContinentRowCard
