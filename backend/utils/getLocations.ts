import { ObjectId } from 'mongodb'
import { collections } from '@backend/utils'
import getEquitableCountryStreakSourceMapIds from '@backend/utils/getEquitableCountryStreakSourceMapIds'
import { LocationType } from '@types'
import { COUNTRY_STREAKS_ID, EQUITABLE_COUNTRY_STREAK_ID, OFFICIAL_WORLD_ID } from '@utils/constants/random'
import { OFFICIAL_COUNTRIES } from '@utils/constants/officialCountries'

const getLocations = async (mapId: string, count: number = 5) => {
  if (!mapId) return null

  if (mapId === COUNTRY_STREAKS_ID) {
    const locations = (await collections.locations
      ?.aggregate([
        { $match: { mapId: new ObjectId(OFFICIAL_WORLD_ID), countryCode: { $in: OFFICIAL_COUNTRIES } } },
        { $sample: { size: count } },
      ])
      .toArray()) as LocationType[]

    if (!locations || locations.length === 0) {
      return null
    }

    return locations
  }

  if (mapId === EQUITABLE_COUNTRY_STREAK_ID) {
    const sourceMapIds = getEquitableCountryStreakSourceMapIds()
    if (!sourceMapIds.length) {
      return null
    }

    const locations = (await collections.locations
      ?.aggregate([
        {
          $match: {
            mapId: { $in: sourceMapIds },
            countryCode: { $exists: true, $nin: [null, ''] },
          },
        },
        { $sample: { size: count } },
      ])
      .toArray()) as LocationType[]

    if (!locations || locations.length === 0) {
      return null
    }

    return locations
  }

  // Determine if this map is an official or custom map
  const map = await collections.maps?.findOne({ _id: new ObjectId(mapId) })

  if (!map) {
    return null
  }

  const locationCollection = map.creator === 'GeoHub' ? 'locations' : 'userLocations'

  // Get random locations from DB
  const locations = (await collections[locationCollection]
    ?.aggregate([
      { $match: { mapId: new ObjectId(mapId) } },
      { $sample: { size: count } },
      { $group: { _id: '$_id', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
    ])
    .toArray()) as LocationType[]

  if (!locations || locations.length === 0) {
    return null
  }

  return locations
}

export default getLocations
