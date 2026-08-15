import Link from 'next/link'
import { FC } from 'react'
import HomeSectionRowCard from '@components/HomeSectionRowCard'
import { MapType } from '@types'
import { parseEquitableCountryMapKey } from '@utils/helpers/equitableCountryMapId'
import { flagEmojiFromIsoAlpha2 } from '@utils/helpers/flagEmoji'

type Props = {
  map: Pick<MapType, '_id' | 'name'>
  isForDisplayOnly?: boolean
}

const EquitableCountryRowCard: FC<Props> = ({ map, isForDisplayOnly }) => {
  const code = typeof map._id === 'string' ? parseEquitableCountryMapKey(map._id) : null
  if (!code) return null

  const countryName = map.name?.trim() || code.toUpperCase()
  const href = `/map/${encodeURIComponent(String(map._id))}`
  const flag = flagEmojiFromIsoAlpha2(code)

  return (
    <HomeSectionRowCard
      title={countryName}
      titleLeading={
        flag ? (
          <span className="home-row-flag" title={countryName} aria-hidden>
            {flag}
          </span>
        ) : null
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

export default EquitableCountryRowCard

export default EquitableCountryRowCard
