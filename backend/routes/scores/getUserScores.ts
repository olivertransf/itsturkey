import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { collections } from '@backend/utils'
import countries from '@utils/constants/countries'
import { CONTINENT_NAMES } from '@utils/constants/iso2ContinentSlug'
import { parseEquitableContinentMapKey } from '@utils/helpers/equitableContinentMapId'
import { parseEquitableCountryMapKey } from '@utils/helpers/equitableCountryMapId'

function labelForNonDbMap(mapId: unknown): string {
  const s = String(mapId ?? '')
  const cc = parseEquitableCountryMapKey(s)
  if (cc) {
    return countries.find((c) => c.code === cc)?.name ?? s
  }
  const ct = parseEquitableContinentMapKey(s)
  if (ct) {
    return CONTINENT_NAMES[ct]
  }
  return s
}

const getUserScores = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = req.query.id as string
  const page = req.query.page ? Number(req.query.page) : 0
  const gamesPerPage = 20

  const query = { userId: new ObjectId(userId), mode: 'standard', state: 'finished' }
  const games = await collections.games
    ?.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: page * gamesPerPage },
      { $limit: gamesPerPage + 1 },
      {
        $project: {
          _id: 1,
          mapId: 1,
          totalPoints: 1,
          totalTime: 1,
          createdAt: 1,
        },
      },
      {
        $lookup: {
          from: 'maps',
          localField: 'mapId',
          foreignField: '_id',
          as: 'mapDetails',
        },
      },
      {
        $addFields: {
          mapDetails: {
            $cond: {
              if: { $gt: [{ $size: '$mapDetails' }, 0] },
              then: { $arrayElemAt: ['$mapDetails', 0] },
              else: {
                name: '',
                previewImg: 'custom-map.svg',
              },
            },
          },
        },
      },
    ])
    .toArray()

  if (!games) {
    return res.status(404).send(`Failed to find games for user with id: ${userId}`)
  }

  const data = games.slice(0, gamesPerPage).map((item) => ({
    _id: item._id,
    mapId: item.mapId,
    mapName: item.mapDetails?.name?.trim() ? item.mapDetails.name : labelForNonDbMap(item.mapId),
    mapAvatar: item.mapDetails?.previewImg ?? 'custom-map.svg',
    totalPoints: item.totalPoints,
    totalTime: item.totalTime,
    playedAt: item.createdAt ? new Date(item.createdAt).toISOString() : undefined,
  }))

  // We set limit to gamesPerPage + 1 so we know if there is atleast 1 more game after this batch
  // Note that we still slice the response to only return gamesPerPage elements
  const hasMore = games.length > gamesPerPage

  res.status(200).send({
    data,
    hasMore,
  })
}

export default getUserScores
