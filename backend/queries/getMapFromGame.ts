import { ObjectId } from 'mongodb'
import { Game } from '@backend/models'
import { collections } from '@backend/utils'
import getEquitableCountryStreakSourceMapIds from '@backend/utils/getEquitableCountryStreakSourceMapIds'
import { ChallengeType, GameType } from '@types'
import {
  COUNTRY_STREAKS_ID,
  EQUITABLE_COUNTRY_STREAK_DETAILS,
  EQUITABLE_COUNTRY_STREAK_ID,
  OFFICIAL_WORLD_ID,
} from '@utils/constants/random'

const getMapFromGame = async (game: GameType | Game | ChallengeType) => {
  const rawMapId = game.mapId as string | ObjectId
  const stringMapId = typeof rawMapId === 'string' ? rawMapId : rawMapId?.toString()

  if (game.isDailyChallenge || stringMapId === COUNTRY_STREAKS_ID) {
    return collections.maps?.findOne({ _id: new ObjectId(OFFICIAL_WORLD_ID) })
  }

  if (stringMapId === EQUITABLE_COUNTRY_STREAK_ID) {
    const ids = getEquitableCountryStreakSourceMapIds()
    if (!ids.length) {
      return null
    }
    const base = await collections.maps?.findOne({ _id: ids[0] })
    if (!base) {
      return null
    }
    return {
      ...base,
      name: EQUITABLE_COUNTRY_STREAK_DETAILS.name,
      description: EQUITABLE_COUNTRY_STREAK_DETAILS.description,
      previewImg: EQUITABLE_COUNTRY_STREAK_DETAILS.previewImg,
    }
  }

  const mapDetails = await collections.maps?.findOne({ _id: new ObjectId(rawMapId) })
  return mapDetails
}

export default getMapFromGame
