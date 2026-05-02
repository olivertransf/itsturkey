#!/usr/bin/env node
/**
 * Import a bundle produced by scripts/export-maps-for-repo.mjs into MongoDB.
 *
 * Usage:
 *   node scripts/import-maps-bundle.mjs --file ./seed-data/private/maps-bundle.json
 *
 * Options:
 *   --file                  Bundle JSON path (required)
 *   --creator-user-id       For maps whose creator is not "GeoHub", set creator to this users._id
 *                           (omit to keep ObjectIds from the bundle)
 *   --dry-run               Print actions only
 *
 * Upserts each map by _id, deletes existing pins for that mapId in the target collection,
 * then inserts bundled locations. Official maps use collection `locations`; custom maps use `userLocations`.
 *
 * Requires MONGO_URI and DB_NAME in geohub/.env
 */

import fs from 'fs'
import path from 'path'

import { EJSON } from 'bson'
import dotenv from 'dotenv'
import { MongoClient, ObjectId } from 'mongodb'

dotenv.config({ path: path.join(process.cwd(), '.env') })

const parseArgs = () => {
  const argv = process.argv.slice(2)
  const out = {}

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]
    if (!token.startsWith('--')) continue

    const key = token.slice(2)
    const next = argv[i + 1]

    if (next === undefined || next.startsWith('--')) {
      out[key] = true
      continue
    }

    out[key] = next
    i++
  }

  return out
}

const BATCH = 5000

const isGeoHubOfficial = (creator) => creator === 'GeoHub'

const main = async () => {
  const args = parseArgs()
  const file = args.file
  const dryRun = Boolean(args['dry-run'])

  if (!file || typeof file !== 'string') {
    console.error('Missing --file path to bundle JSON')
    process.exit(1)
  }

  const abs = path.isAbsolute(file) ? file : path.join(process.cwd(), file)
  if (!fs.existsSync(abs)) {
    console.error(`File not found: ${abs}`)
    process.exit(1)
  }

  const mongoUri = process.env.MONGO_URI
  const dbName = process.env.DB_NAME

  if (!mongoUri || !dbName) {
    console.error('Missing MONGO_URI or DB_NAME in .env')
    process.exit(1)
  }

  const raw = fs.readFileSync(abs, 'utf8')
  const bundle = JSON.parse(raw)

  if (bundle.formatVersion !== 1 || !Array.isArray(bundle.maps)) {
    console.error('Invalid bundle: expected formatVersion 1 and maps array')
    process.exit(1)
  }

  let remapCreator = null
  if (args['creator-user-id']) {
    const cid = String(args['creator-user-id']).trim()
    if (!ObjectId.isValid(cid)) {
      console.error('Invalid --creator-user-id (must be 24-char hex ObjectId)')
      process.exit(1)
    }
    remapCreator = new ObjectId(cid)
  }

  const client = new MongoClient(mongoUri)
  await client.connect()
  const db = client.db(dbName)
  const mapsCol = db.collection('maps')

  try {
    for (const entry of bundle.maps) {
      const { locationCollection, map: mapSerialized, locations: locsSerialized } = entry

      if (locationCollection !== 'locations' && locationCollection !== 'userLocations') {
        console.error(`Bad locationCollection: ${locationCollection}`)
        process.exit(1)
      }

      const mapDoc = EJSON.deserialize(mapSerialized)

      if (!ObjectId.isValid(String(mapDoc._id))) {
        console.error('Map document missing valid _id')
        process.exit(1)
      }

      if (!isGeoHubOfficial(mapDoc.creator)) {
        if (remapCreator) {
          mapDoc.creator = remapCreator
        }
      }

      const mapId = mapDoc._id
      const coll = db.collection(locationCollection)

      const locDocs = (locsSerialized || []).map((row) => {
        const doc = EJSON.deserialize(row)
        doc.mapId = mapId
        return doc
      })

      console.log(
        `[${dryRun ? 'dry-run' : 'import'}] map ${String(mapId)} "${String(mapDoc.name)}" → ${locDocs.length} pins → ${locationCollection}`
      )

      if (dryRun) {
        continue
      }

      await mapsCol.replaceOne({ _id: mapId }, mapDoc, { upsert: true })
      await coll.deleteMany({ mapId })

      for (let i = 0; i < locDocs.length; i += BATCH) {
        const chunk = locDocs.slice(i, i + BATCH)
        if (chunk.length === 0) continue
        await coll.insertMany(chunk, { ordered: false })
      }
    }
  } finally {
    await client.close()
  }

  if (dryRun) {
    console.log('\nDry run complete (no writes).')
  } else {
    console.log('\nImport complete.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
