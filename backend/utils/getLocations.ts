import { ObjectId } from 'mongodb'
import { collections } from '@backend/utils'
import getEquitableCountryStreakSourceMapIds from '@backend/utils/getEquitableCountryStreakSourceMapIds'
import { shuffleArrayInPlace } from '@backend/utils/shuffleArray'
import { LocationType } from '@types'
import { COUNTRY_STREAKS_ID, EQUITABLE_COUNTRY_STREAK_ID, OFFICIAL_WORLD_ID } from '@utils/constants/random'
import { OFFICIAL_COUNTRIES } from '@utils/constants/officialCountries'

export type GetLocationsOptions = {
  /** Skip these location doc ids (e.g. rounds already played in an HP duel). */
  excludeIds?: ObjectId[]
}

const getLocations = async (mapId: string, count: number = 5, options?: GetLocationsOptions) => {
  const excludeIds = options?.excludeIds?.filter(Boolean) ?? []
  if (!mapId) return null

  if (mapId === COUNTRY_STREAKS_ID) {
    const match: Record<string, unknown> = {
      mapId: new ObjectId(OFFICIAL_WORLD_ID),
      countryCode: { $in: OFFICIAL_COUNTRIES },
    }
    if (excludeIds.length > 0) {
      match._id = { $nin: excludeIds }
    }

    const locations = (await collections.locations
      ?.aggregate([{ $match: match }, { $sample: { size: count } }])
      .toArray()) as LocationType[]

    if (!locations || locations.length === 0) {
      return null
    }

    shuffleArrayInPlace(locations)
    return locations
  }

  if (mapId === EQUITABLE_COUNTRY_STREAK_ID) {
    const sourceMapIds = getEquitableCountryStreakSourceMapIds()
    if (!sourceMapIds.length) {
      return null
    }

    const eqMatch: Record<string, unknown> = {
      mapId: { $in: sourceMapIds },
      countryCode: { $exists: true, $nin: [null, ''] },
    }
    if (excludeIds.length > 0) {
      eqMatch._id = { $nin: excludeIds }
    }

    const locations = (await collections.locations
      ?.aggregate([{ $match: eqMatch }, { $sample: { size: count } }])
      .toArray()) as LocationType[]

    if (!locations || locations.length === 0) {
      return null
    }

    shuffleArrayInPlace(locations)
    return locations
  }

  // Determine if this map is an official or custom map
  const map = await collections.maps?.findOne({ _id: new ObjectId(mapId) })

  if (!map) {
    return null
  }

  const locationCollection = map.creator === 'GeoHub' ? 'locations' : 'userLocations'

  const mapMatch: Record<string, unknown> = { mapId: new ObjectId(mapId) }
  if (excludeIds.length > 0) {
    mapMatch._id = { $nin: excludeIds }
  }

  const locations = (await collections[locationCollection]
    ?.aggregate([
      { $match: mapMatch },
      { $sample: { size: count } },
      { $group: { _id: '$_id', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
    ])
    .toArray()) as LocationType[]

  if (!locations || locations.length === 0) {
    return null
  }

  shuffleArrayInPlace(locations)
  return locations
}

export default getLocations
