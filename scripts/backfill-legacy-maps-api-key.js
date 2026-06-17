require('dotenv').config()

const Cryptr = require('cryptr')
const { MongoClient } = require('mongodb')

async function main() {
  const { MONGO_URI, DB_NAME, CRYPTR_SECRET, LEGACY_MAPS_API_KEY } = process.env

  if (!MONGO_URI || !DB_NAME) {
    throw new Error('MONGO_URI and DB_NAME are required')
  }
  if (!CRYPTR_SECRET) {
    throw new Error('CRYPTR_SECRET is required')
  }
  if (!LEGACY_MAPS_API_KEY) {
    throw new Error('LEGACY_MAPS_API_KEY is required (the Google key to assign existing users)')
  }

  const cryptr = new Cryptr(CRYPTR_SECRET)
  const encrypted = cryptr.encrypt(LEGACY_MAPS_API_KEY)

  const client = new MongoClient(MONGO_URI)
  await client.connect()

  const db = client.db(DB_NAME)
  const users = db.collection('users')

  const filter = {
    $or: [{ mapsAPIKey: { $exists: false } }, { mapsAPIKey: null }, { mapsAPIKey: '' }],
  }

  const result = await users.updateMany(filter, {
    $set: { mapsAPIKey: encrypted, mapsAPIKeyVerifiedAt: new Date() },
  })

  await client.close()

  console.log(
    `Backfilled mapsAPIKey for ${result.modifiedCount} users (matched ${result.matchedCount}).`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

