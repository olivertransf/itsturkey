import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { collections, getUserId, throwError } from '@backend/utils'
import { userProject } from '@backend/utils/dbProjects'
import {
  isMongoObjectIdHex24,
  parseEquitableContinentMapKey,
  parseEquitableCountryMapKey,
} from '@backend/utils/equitableCountryMap'
import type { ContinentSlug } from '@utils/constants/iso2ContinentSlug'
import { CONTINENT_NAMES, COUNTRY_CODES_BY_CONTINENT } from '@utils/constants/iso2ContinentSlug'
import { boundsForVirtualStandardMap } from '@backend/utils/equitableVirtualMapGuessBounds'
import getEquitableCountryStreakSourceMapIds from '@backend/utils/getEquitableCountryStreakSourceMapIds'
import countries from '@utils/constants/countries'
import { EQUITABLE_COUNTRY_STREAK_DETAILS } from '@utils/constants/random'

const getMap = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = await getUserId(req, res)
  const mapId = req.query.id as string
  const includeStats = req.query.stats as string // true or false

  if (!mapId) {
    return throwError(res, 400, 'You must pass a valid mapId')
  }

  const eqCode = parseEquitableCountryMapKey(mapId)
  if (eqCode) {
    const sourceIds = getEquitableCountryStreakSourceMapIds()
    if (!sourceIds.length) {
      return throwError(res, 404, 'Country maps are not configured')
    }

    const locationCount =
      (await collections.locations?.countDocuments({
        mapId: { $in: sourceIds },
        countryCode: { $exists: true, $nin: [null, ''] },
        $expr: { $eq: [{ $toLower: '$countryCode' }, eqCode] },
      })) ?? 0

    if (locationCount < 1) {
      return throwError(res, 404, `Failed to find map with id: ${mapId}`)
    }

    const base = await collections.maps?.findOne({ _id: sourceIds[0] })
    const nm = countries.find((c) => c.code === eqCode)?.name ?? eqCode.toUpperCase()
    const guessBounds = boundsForVirtualStandardMap(mapId)

    const core = {
      _id: mapId,
      name: nm,
      description: `Street View rounds from pins located in ${nm}.`,
      previewImg: EQUITABLE_COUNTRY_STREAK_DETAILS.previewImg,
      creator: 'GeoHub' as const,
      isPublished: true,
      isDeleted: false,
      locationCount,
      avgScore: 0,
      usersPlayed: 0,
      scoreFactor: typeof base?.scoreFactor === 'number' ? base.scoreFactor : 2000,
      ...(guessBounds ? { bounds: guessBounds } : {}),
    }

    if (!includeStats || includeStats === 'false') {
      return res.status(200).send(core)
    }

    return res.status(200).send({
      ...core,
      likes: {
        numLikes: 0,
        likedByUser: false,
      },
    })
  }

  const eqCont = parseEquitableContinentMapKey(mapId) as ContinentSlug | null
  if (eqCont) {
    const sourceIds = getEquitableCountryStreakSourceMapIds()
    if (!sourceIds.length) {
      return throwError(res, 404, 'Continent maps are not configured')
    }

    const countryLowerList = COUNTRY_CODES_BY_CONTINENT[eqCont]
    if (!countryLowerList?.length) {
      return throwError(res, 404, `Failed to find map with id: ${mapId}`)
    }

    const locationCount =
      (await collections.locations?.countDocuments({
        mapId: { $in: sourceIds },
        countryCode: { $exists: true, $nin: [null, ''] },
        $expr: { $in: [{ $toLower: '$countryCode' }, countryLowerList] },
      })) ?? 0

    if (locationCount < 1) {
      return throwError(res, 404, `Failed to find map with id: ${mapId}`)
    }

    const base = await collections.maps?.findOne({ _id: sourceIds[0] })
    const nm = CONTINENT_NAMES[eqCont]
    const guessBounds = boundsForVirtualStandardMap(mapId)

    const core = {
      _id: mapId,
      name: nm,
      description: `Street View rounds from pins across ${nm}.`,
      previewImg: EQUITABLE_COUNTRY_STREAK_DETAILS.previewImg,
      creator: 'GeoHub' as const,
      isPublished: true,
      isDeleted: false,
      locationCount,
      avgScore: 0,
      usersPlayed: 0,
      scoreFactor: typeof base?.scoreFactor === 'number' ? base.scoreFactor : 2000,
      ...(guessBounds ? { bounds: guessBounds } : {}),
    }

    if (!includeStats || includeStats === 'false') {
      return res.status(200).send(core)
    }

    return res.status(200).send({
      ...core,
      likes: {
        numLikes: 0,
        likedByUser: false,
      },
    })
  }

  if (!isMongoObjectIdHex24(mapId)) {
    return throwError(res, 404, `Failed to find map with id: ${mapId}`)
  }

  // Get Map Details
  let mapDetails = await collections.maps?.findOne({ _id: new ObjectId(mapId) })

  if (!mapDetails) {
    return throwError(res, 404, `Failed to find map with id: ${mapId}`)
  }

  // If map is not published or is deleted -> return early
  if (!mapDetails.isPublished || (mapDetails.isDeleted && mapDetails.creator?.toString() !== userId)) {
    return throwError(res, 400, `This map has not been published or does not exist`)
  }

  const isOfficialMap = mapDetails.creator === 'GeoHub'

  // If map is user created -> get the user details
  if (!isOfficialMap) {
    const creatorDetails = await collections.users?.findOne(
      { _id: new ObjectId(mapDetails.creator) },
      { projection: userProject },
    )

    if (!creatorDetails) {
      return throwError(res, 404, `Failed to get creator details for map with id: ${mapId}`)
    }

    mapDetails = { ...mapDetails, creatorDetails }
  }

  // If query does not want stats, return early
  if (!includeStats || includeStats === 'false') {
    return res.status(200).send(mapDetails)
  }

  // Get Map's likes and if it's liked by this user
  const likes = await collections.mapLikes?.find({ mapId: new ObjectId(mapId) }).toArray()

  if (!likes) {
    return throwError(res, 404, `Failed to get likes for map with id: ${mapId}`)
  }

  const likedByUser = likes.some((like) => {
    return like.userId.toString() === userId?.toString()
  })

  res.status(200).send({
    ...mapDetails,
    likes: {
      numLikes: likes.length,
      likedByUser,
    },
  })
}

export default getMap
