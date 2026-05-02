#!/usr/bin/env node
/**
 * Export selected maps plus their location pins from MongoDB into a JSON bundle
 * you can commit (small samples) or share privately (full dumps).
 *
 * Usage:
 *   node scripts/export-maps-for-repo.mjs --map-ids "<hex>,<hex>"
 *   node scripts/export-maps-for-repo.mjs --from-home-env
 *   node scripts/export-maps-for-repo.mjs --from-home-env --max-locations-per-map 500
 *
 * Options:
 *   --map-ids              Comma-separated maps._id hex strings
 *   --from-home-env        Also include every _id from NEXT_PUBLIC_HOME_MAP_CARDS in .env
 *   --out                  Output file (default: seed-data/private/maps-bundle.json)
 *   --max-locations-per-map Cap pins per map (0 = all). Sorted by _id for stable samples.
 *
 * Requires MONGO_URI and DB_NAME in geohub/.env
 */

import fs from 'fs'
import path from 'path'

import { EJSON } from 'bson'
import dotenv from 'dotenv'
import { MongoClient, ObjectId } from 'mongodb'

dotenv.config({ path: path.join(process.cwd(), '.env') })

const FORMAT_VERSION = 1

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

const parseHomeMapIdsFromEnv = () => {
  const raw = process.env.NEXT_PUBLIC_HOME_MAP_CARDS?.trim()
  if (!raw) {
    throw new Error('NEXT_PUBLIC_HOME_MAP_CARDS is missing or empty in .env')
  }

  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed)) {
    throw new Error('NEXT_PUBLIC_HOME_MAP_CARDS must be a JSON array')
  }

  const ids = []
  for (const item of parsed) {
    if (!item || typeof item !== 'object') continue
    const id = item._id
    if (typeof id === 'string' && ObjectId.isValid(id)) {
      ids.push(id)
    }
  }

  return ids
}

const locationCollectionForMap = (mapDoc) => (mapDoc.creator === 'GeoHub' ? 'locations' : 'userLocations')

const main = async () => {
  const args = parseArgs()
  const mongoUri = process.env.MONGO_URI
  const dbName = process.env.DB_NAME

  if (!mongoUri || !dbName) {
    console.error('Missing MONGO_URI or DB_NAME in .env')
    process.exit(1)
  }

  const mapIdSet = new Set()

  if (args['map-ids']) {
    for (const id of String(args['map-ids'])
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)) {
      if (!ObjectId.isValid(id)) {
        console.warn(`Skipping invalid map id: ${id}`)
        continue
      }
      mapIdSet.add(id)
    }
  }

  if (args['from-home-env']) {
    try {
      for (const id of parseHomeMapIdsFromEnv()) {
        mapIdSet.add(id)
      }
    } catch (e) {
      console.error(String(e?.message || e))
      process.exit(1)
    }
  }

  const mapIds = [...mapIdSet]
  if (mapIds.length === 0) {
    console.error('No map ids. Pass --map-ids "<id>,<id>" and/or --from-home-env')
    process.exit(1)
  }

  const maxPerMap = Number(args['max-locations-per-map'])
  const maxLocationsPerMap = Number.isFinite(maxPerMap) && maxPerMap > 0 ? maxPerMap : 0

  const defaultOut = path.join('seed-data', 'private', 'maps-bundle.json')
  const outFile = typeof args.out === 'string' ? args.out : defaultOut

  const client = new MongoClient(mongoUri)
  await client.connect()
  const db = client.db(dbName)
  const mapsCol = db.collection('maps')
  const locationsCol = db.collection('locations')
  const userLocationsCol = db.collection('userLocations')

  const bundle = {
    formatVersion: FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    dbNameHint: dbName,
    maps: [],
  }

  try {
    for (const idStr of mapIds) {
      const _id = new ObjectId(idStr)
      const map = await mapsCol.findOne({ _id })

      if (!map) {
        console.warn(`No map document for ${idStr}`)
        continue
      }

      const locationCollection = locationCollectionForMap(map)
      const coll = locationCollection === 'locations' ? locationsCol : userLocationsCol

      const cursor = coll.find({ mapId: _id }).sort({ _id: 1 })
      const locationsSerialized = []
      let n = 0

      for await (const loc of cursor) {
        if (maxLocationsPerMap > 0 && n >= maxLocationsPerMap) break
        locationsSerialized.push(EJSON.serialize(loc, { relaxed: false }))
        n++
      }

      const totalPins = await coll.countDocuments({ mapId: _id })

      bundle.maps.push({
        locationCollection,
        locationCountExported: n,
        locationCountInDb: totalPins,
        truncated: maxLocationsPerMap > 0 && totalPins > maxLocationsPerMap,
        map: EJSON.serialize(map, { relaxed: false }),
        locations: locationsSerialized,
      })

      console.log(
        `Map ${idStr} (${String(map.name)}) → ${n} pins exported (${totalPins} in DB), collection=${locationCollection}`
      )
    }
  } finally {
    await client.close()
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, JSON.stringify(bundle, null, 2), 'utf8')
  console.log(`\nWrote bundle: ${path.resolve(outFile)}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
