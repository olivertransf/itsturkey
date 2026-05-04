import { NextApiRequest, NextApiResponse } from 'next'
import { collections, throwError } from '@backend/utils'
import getEquitableCountryStreakSourceMapIds from '@backend/utils/getEquitableCountryStreakSourceMapIds'
import type { ContinentSlug } from '@utils/constants/iso2ContinentSlug'
import { CONTINENT_NAMES, ISO2_TO_CONTINENT_SLUG } from '@utils/constants/iso2ContinentSlug'
import { equitableContinentMapIdFromSlug } from '@utils/helpers/equitableContinentMapId'
import { EQUITABLE_COUNTRY_STREAK_DETAILS } from '@utils/constants/random'

const CONTINENT_ORDER: ContinentSlug[] = ['af', 'an', 'as', 'eu', 'na', 'oc', 'sa']

const getEquitableContinentMapsList = async (_req: NextApiRequest, res: NextApiResponse) => {
  const sourceMapIds = getEquitableCountryStreakSourceMapIds()

  if (!sourceMapIds.length) {
    return throwError(
      res,
      503,
      'Continent maps are not configured (set EQUITABLE_COUNTRY_STREAK_MAP_IDS or NEXT_PUBLIC_HOME_MAP_CARDS with Equitable World entries).',
    )
  }

  const rows = await collections.locations
    ?.aggregate<{ _id: string; locationCount: number }>([
      {
        $match: {
          mapId: { $in: sourceMapIds },
          countryCode: { $exists: true, $nin: [null, ''] },
        },
      },
      { $addFields: { cc: { $toLower: '$countryCode' } } },
      { $group: { _id: '$cc', locationCount: { $sum: 1 } } },
      { $match: { locationCount: { $gte: 1 } } },
    ])
    .toArray()

  if (!rows?.length) {
    return res.status(200).send({ data: [] })
  }

  const byCont: Partial<Record<ContinentSlug, number>> = {}
  for (const r of rows) {
    const cc = String(r._id || '').toLowerCase()
    const cont = ISO2_TO_CONTINENT_SLUG[cc]
    if (!cont) continue
    byCont[cont] = (byCont[cont] ?? 0) + r.locationCount
  }

  const previewImg = EQUITABLE_COUNTRY_STREAK_DETAILS.previewImg

  const data = CONTINENT_ORDER.map((slug) => {
    const locationCount = byCont[slug] ?? 0
    if (locationCount < 1) return null
    return {
      _id: equitableContinentMapIdFromSlug(slug),
      name: CONTINENT_NAMES[slug],
      previewImg,
      locationCount,
      creator: 'GeoHub' as const,
    }
  }).filter(Boolean)

  res.status(200).send({ data })
}

export default getEquitableContinentMapsList
