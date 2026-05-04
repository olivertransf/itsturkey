import { NextApiRequest, NextApiResponse } from 'next'
import { collections, throwError } from '@backend/utils'
import { equitableCountryMapIdFromCode } from '@utils/helpers/equitableCountryMapId'
import getEquitableCountryStreakSourceMapIds from '@backend/utils/getEquitableCountryStreakSourceMapIds'
import countries from '@utils/constants/countries'
import { EQUITABLE_COUNTRY_STREAK_DETAILS } from '@utils/constants/random'

const countryName = (code: string): string => {
  const hit = countries.find((c) => c.code === code)
  return hit?.name ?? code.toUpperCase()
}

const getEquitableCountryMapsList = async (_req: NextApiRequest, res: NextApiResponse) => {
  const sourceMapIds = getEquitableCountryStreakSourceMapIds()

  if (!sourceMapIds.length) {
    return throwError(
      res,
      503,
      'Country maps are not configured (set EQUITABLE_COUNTRY_STREAK_MAP_IDS or NEXT_PUBLIC_HOME_MAP_CARDS with Equitable World entries).',
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
      { $sort: { _id: 1 } },
    ])
    .toArray()

  if (!rows?.length) {
    return res.status(200).send({ data: [] })
  }

  const previewImg = EQUITABLE_COUNTRY_STREAK_DETAILS.previewImg

  const data = rows.map(
    (r) => {
      const code = r._id
      const nm = countryName(code)
      return {
        _id: equitableCountryMapIdFromCode(code),
        name: nm,
        description: `Street View rounds sampled only from pins in ${nm}.`,
        previewImg,
        locationCount: r.locationCount,
        creator: 'GeoHub' as const,
      }
    },
  )

  res.status(200).send({ data })
}

export default getEquitableCountryMapsList
