#!/usr/bin/env node
/**
 * Import a GeoGuessr-like locations JSON array into GeoHub Mongo collections:
 * - inserts a row into `maps` (custom map; creator must be an existing users._id)
 * - replaces rows in `userLocations` for that mapId
 *
 * Usage:
 *   node scripts/import-custom-map-from-json.mjs \
 *     --file ./likeacw.json \
 *     --creator-user-id "<your users._id hex>" \
 *     --name "Like ACW" \
 *     --description "Imported locations" \
 *     --preview-img "custom-map.svg" \
 *     --published true \
 *     --max-locations 60000
 *
 * Requires dotenv + mongodb (already project deps). Loads geohub/.env by default.
 */

import fs from 'fs'
import path from 'path'

import dotenv from 'dotenv'
import { MongoClient, ObjectId } from 'mongodb'

dotenv.config({ path: path.join(process.cwd(), '.env') })

const WORLD_MAP_SCORE_FACTOR = 2000
const WORLD_MAP_BOUNDS_DISTANCE = 18150

const toRadians = (degrees) => degrees * (Math.PI / 180)

const calculateDistanceKm = (loc1, loc2) => {
  const lat1Rad = toRadians(loc1.lat)
  const lng1Rad = toRadians(loc1.lng)
  const lat2Rad = toRadians(loc2.lat)
  const lng2Rad = toRadians(loc2.lng)

  const deltaLat = lat2Rad - lat1Rad
  const deltaLng = lng2Rad - lng1Rad

  const R = 6371.071

  const distance =
    2 *
    R *
    Math.asin(
      Math.sqrt(
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
          Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
      )
    )

  return distance
}

const getBoundsFromLocations = (locations) => {
  let minLat = Infinity
  let minLng = Infinity
  let maxLat = -Infinity
  let maxLng = -Infinity

  for (const loc of locations) {
    minLat = Math.min(minLat, loc.lat)
    minLng = Math.min(minLng, loc.lng)
    maxLat = Math.max(maxLat, loc.lat)
    maxLng = Math.max(maxLng, loc.lng)
  }

  return {
    min: { lat: minLat, lng: minLng },
    max: { lat: maxLat, lng: maxLng },
  }
}

const calculateScoreFactor = (bounds) => {
  if (!bounds) return WORLD_MAP_SCORE_FACTOR

  const distance = calculateDistanceKm(bounds.min, bounds.max)
  return (WORLD_MAP_SCORE_FACTOR * Number(distance)) / WORLD_MAP_BOUNDS_DISTANCE
}

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

const coerceBool = (v, defaultValue = false) => {
  if (v === undefined || v === null) return defaultValue
  if (typeof v === 'boolean') return v
  const s = String(v).trim().toLowerCase()
  if (['1', 'true', 'yes', 'y'].includes(s)) return true
  if (['0', 'false', 'no', 'n'].includes(s)) return false
  return defaultValue
}

const coerceNumber = (v, fallback) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

const shuffleInPlace = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to download JSON (${res.status})`)
  }
  return await res.json()
}

async function main() {
  const args = parseArgs()

  const mongoUri = process.env.MONGO_URI
  const dbName = process.env.DB_NAME

  if (!mongoUri || !dbName) {
    throw new Error('Missing MONGO_URI or DB_NAME in environment (.env)')
  }

  const filePath = args.file
  const gistUrl = args['gist-url'] || args.url

  if ((!filePath && !gistUrl) || (filePath && gistUrl)) {
    throw new Error('Provide exactly one of --file <path> OR --gist-url <url>')
  }

  const creatorUserId = args['creator-user-id']
  if (!creatorUserId) {
    throw new Error('Missing --creator-user-id <users._id hex>')
  }

  const mapName = args.name || 'Imported Map'
  const description = args.description || ''
  const previewImg = args['preview-img'] || 'custom-map.svg'

  const published = coerceBool(args.published, false)
  const dryRun = coerceBool(args['dry-run'], false)
  const shuffle = coerceBool(args.shuffle, true)

  const maxLocations = coerceNumber(args['max-locations'], 60000)

  let rawJson

  if (gistUrl) {
    rawJson = await fetchJson(gistUrl)
  } else {
    const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)
    rawJson = JSON.parse(fs.readFileSync(abs, 'utf8'))
  }

  if (!Array.isArray(rawJson)) {
    throw new Error('Top-level JSON must be an array of location objects')
  }

  const cleaned = []

  for (const item of rawJson) {
    if (!item || typeof item !== 'object') continue

    const lat = item.lat
    const lng = item.lng

    if (typeof lat !== 'number' || typeof lng !== 'number') continue
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue
    if (lat > 90 || lat < -90 || lng > 180 || lng < -180) continue

    cleaned.push({
      lat,
      lng,
      ...(item.panoId ? { panoId: item.panoId } : {}),
      ...(typeof item.heading === 'number' && Number.isFinite(item.heading) ? { heading: item.heading } : {}),
      ...(typeof item.pitch === 'number' && Number.isFinite(item.pitch) ? { pitch: item.pitch } : {}),
      ...(typeof item.zoom === 'number' && Number.isFinite(item.zoom) ? { zoom: item.zoom } : {}),
      ...(typeof item.countryCode === 'string' ? { countryCode: item.countryCode } : {}),
    })
  }

  if (cleaned.length === 0) {
    throw new Error('No valid locations found (need numeric lat/lng on each row)')
  }

  if (shuffle) {
    shuffleInPlace(cleaned)
  }

  const truncated = cleaned.length > maxLocations ? cleaned.slice(0, maxLocations) : cleaned

  const bounds = getBoundsFromLocations(truncated)
  const scoreFactor = calculateScoreFactor(bounds)

  const client = new MongoClient(mongoUri)
  await client.connect()

  const db = client.db(dbName)
  const users = db.collection('users')
  const maps = db.collection('maps')
  const userLocations = db.collection('userLocations')

  const creatorId = new ObjectId(String(creatorUserId))
  const creator = await users.findOne({ _id: creatorId }, { projection: { _id: 1 } })

  if (!creator) {
    await client.close()
    throw new Error(`No user found with _id ${creatorId.toString()} in ${dbName}.users`)
  }

  if (dryRun) {
    console.log('[dry-run] shuffle:', shuffle)
    console.log('[dry-run] would import locations:', truncated.length)
    console.log('[dry-run] previewImg:', previewImg)
    console.log('[dry-run] published:', published)
    console.log('[dry-run] bounds:', bounds)
    console.log('[dry-run] scoreFactor:', scoreFactor)
    await client.close()
    return
  }

  const now = new Date()

  const newMapDoc = {
    name: mapName,
    description,
    previewImg,
    creator: creatorId,
    createdAt: now,
    lastUpdatedAt: now,
    isPublished: published,
    isDeleted: false,
    avgScore: 0,
    locationCount: truncated.length,
    usersPlayed: 0,
    bounds,
    scoreFactor,
  }

  const insertResult = await maps.insertOne(newMapDoc)
  const mapId = insertResult.insertedId

  const docs = truncated.map((loc) => ({
    ...loc,
    mapId,
  }))

  // deleteMany on a brand new mapId is harmless; keeps script re-runnable if you edit to upsert later
  await userLocations.deleteMany({ mapId })

  const BATCH = 2000
  for (let i = 0; i < docs.length; i += BATCH) {
    const slice = docs.slice(i, i + BATCH)
    await userLocations.insertMany(slice, { ordered: false })
  }

  console.log('Inserted map:', mapId.toString())
  console.log('Inserted locations:', docs.length)

  await client.close()
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
