import { ObjectId } from 'mongodb'
import type DuelSession from '@backend/models/duelSession'
import type { LocationType } from '@types'
import { DUEL_ROUND_LOCATION_POOL_ID } from './duelConstants'
import getLocations from './getLocations'

const playedLocationIds = (locations: LocationType[]): ObjectId[] => {
  const ids: ObjectId[] = []
  for (const loc of locations) {
    const id = (loc as LocationType & { _id?: ObjectId })._id
    if (id) ids.push(id)
  }
  return ids
}

/** Ensures locations[completedRounds] exists for HP continuation. */
export const ensureNextRoundLocation = async (duel: DuelSession): Promise<boolean> => {
  if (duel.completedRounds < duel.locations.length) return true

  const batch = 48
  const excludeIds = playedLocationIds(duel.locations)
  const more = await getLocations(DUEL_ROUND_LOCATION_POOL_ID, batch, { excludeIds })

  if (!more?.length) return false

  duel.locations = duel.locations.concat(more)
  return true
}
