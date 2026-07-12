import { Collection, Db, MongoClient } from 'mongodb'
import { RecentSearch, UserBansType, FeatureFlagsType } from '@types'
import type DuelFriendInvite from '@backend/models/duelFriendInvite'
import type DuelSession from '@backend/models/duelSession'
import type FriendshipEdge from '@backend/models/friendship'
import { MapLeaderboard, MultiSession } from '@backend/models'

export const collections: {
  users?: Collection
  games?: Collection
  challenges?: Collection
  maps?: Collection
  mapLikes?: Collection
  locations?: Collection
  userLocations?: Collection
  recentSearches?: Collection<RecentSearch>
  passwordResets?: Collection
  featureFlags?: Collection<FeatureFlagsType>
  mapLeaderboard?: Collection<MapLeaderboard>
  multiSessions?: Collection<MultiSession>
  duelSessions?: Collection<DuelSession>
  duelFriendInvites?: Collection<DuelFriendInvite>
  friendships?: Collection<FriendshipEdge>
  userBans?: Collection<UserBansType>
  analytics?: Collection
} = {}

const MONGO_URI = process.env.MONGO_URI as string

type MongoGlobal = {
  client?: MongoClient
  db?: Db
  connectPromise?: Promise<Db>
}

const globalForMongo = globalThis as typeof globalThis & { __geohubMongo?: MongoGlobal }

if (!globalForMongo.__geohubMongo) {
  globalForMongo.__geohubMongo = {}
}

const mongoGlobal = globalForMongo.__geohubMongo

/** Keep pools tiny — Atlas M0 caps ~500 connections; each serverless/HMR client multiplies. */
const CLIENT_OPTIONS = {
  maxPoolSize: 5,
  minPoolSize: 0,
  maxIdleTimeMS: 30_000,
  serverSelectionTimeoutMS: 5_000,
  connectTimeoutMS: 10_000,
}

function assignCollections(db: Db) {
  collections.users = db.collection('users')
  collections.games = db.collection('games')
  collections.challenges = db.collection('challenges')
  collections.maps = db.collection('maps')
  collections.mapLikes = db.collection('mapLikes')
  collections.locations = db.collection('locations')
  collections.userLocations = db.collection('userLocations')
  collections.recentSearches = db.collection('recentSearches')
  collections.passwordResets = db.collection('passwordResets')
  collections.featureFlags = db.collection('featureFlags')
  collections.mapLeaderboard = db.collection('mapLeaderboard')
  collections.multiSessions = db.collection('multiSessions')
  collections.duelSessions = db.collection('duelSessions')
  collections.duelFriendInvites = db.collection('duelFriendInvites')
  collections.friendships = db.collection('friendships')
  collections.userBans = db.collection('userBans')
  collections.analytics = db.collection('analytics')
}

export const dbConnect = async () => {
  if (mongoGlobal.db) {
    assignCollections(mongoGlobal.db)
    return mongoGlobal.db
  }

  if (!mongoGlobal.connectPromise) {
    if (!mongoGlobal.client) {
      mongoGlobal.client = new MongoClient(MONGO_URI, CLIENT_OPTIONS)
    }

    mongoGlobal.connectPromise = mongoGlobal.client
      .connect()
      .then((connected) => {
        const db = connected.db(process.env.DB_NAME)
        mongoGlobal.db = db
        assignCollections(db)
        return db
      })
      .catch((err) => {
        mongoGlobal.connectPromise = undefined
        throw err
      })
  }

  return mongoGlobal.connectPromise
}
