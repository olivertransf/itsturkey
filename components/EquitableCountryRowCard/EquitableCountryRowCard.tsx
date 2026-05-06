import Link from 'next/link'
import { FC } from 'react'
import HomeSectionRowCard from '@components/HomeSectionRowCard'
import HomePlayGlyph from '@components/HomeSectionRowCard/HomePlayGlyph'
import { MapType } from '@types'
import { flagEmojiFromIsoAlpha2 } from '@utils/helpers/flagEmoji'
import { parseEquitableCountryMapKey } from '@utils/helpers/equitableCountryMapId'

type Props = {
  map: Pick<MapType, '_id' | 'name'>
  isForDisplayOnly?: boolean
}

const EquitableCountryRowCard: FC<Props> = ({ map, isForDisplayOnly }) => {
  const code = typeof map._id === 'string' ? parseEquitableCountryMapKey(map._id) : null
  if (!code) return null

  const countryName = map.name?.trim() || code.toUpperCase()
  const flag = flagEmojiFromIsoAlpha2(code)
  const href = `/map/${encodeURIComponent(String(map._id))}`

  return (
    <HomeSectionRowCard
      title={countryName}
      titleLeading={
        flag ? (
          <span className="home-row-flag" title={countryName} aria-hidden>
            {flag}
          </span>
        ) : undefined
      }
    >
      {!isForDisplayOnly ? (
        <Link href={href}>
          <a className="home-play-btn home-play-btn--icon" aria-label={`Play ${countryName}`}>
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

export default EquitableCountryRowCard
