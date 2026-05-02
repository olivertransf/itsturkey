/**
 * Import an "equitable world" GeoGuessr export into MongoDB as a new official map
 * (maps + locations collections, creator GeoHub).
 *
 * Snapshot choice (when no file arg):
 * - Drops exports that look partial (count well below the folder maximum).
 * - Picks the newest ISO-dated file among the remaining (full) snapshots.
 *
 * Typical: excludes 2024-12-15 (~83k), selects 2025-01-18 (~125k).
 *
 * Usage:
 *   node scripts/import-equitable-world-map.js
 *   node scripts/import-equitable-world-map.js /path/to/snapshot.json
 *
 * Env:
 *   MONGO_URI, DB_NAME (required)
 *   EQUITABLE_SNAPSHOTS_DIR (optional; default: ~/Downloads/equitable-world.final.resolved)
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

const fs = require('fs')
const path = require('path')
const { MongoClient, ObjectId } = require('mongodb')

const BATCH_SIZE = 8000
const WORLD_MAP_SCORE_FACTOR = 2000
const WORLD_MAP_BOUNDS_DISTANCE = 18150
const NEAR_MAX_TOLERANCE = 2500

const toRadians = (degrees) => degrees * (Math.PI / 180)

const calculateDistance = (loc1, loc2, distanceUnit) => {
  const lat1Rad = toRadians(loc1.lat)
  const lng1Rad = toRadians(loc1.lng)
  const lat2Rad = toRadians(loc2.lat)
  const lng2Rad = toRadians(loc2.lng)
  const deltaLat = lat2Rad - lat1Rad
  const deltaLng = lng2Rad - lng1Rad
  const R = distanceUnit === 'imperial' ? 3958.799 : 6371.071
  return (
    2 *
    R *
    Math.asin(
      Math.sqrt(
        Math.sin(deltaLat / 2) ** 2 +
          Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLng / 2) ** 2
      )
    )
  )
}

const getBounds = (locations) => {
  let minLat = Infinity
  let minLng = Infinity
  let maxLat = -Infinity
  let maxLng = -Infinity
  for (let i = 0; i < locations.length; i++) {
    const l = locations[i]
    if (l.lat < minLat) minLat = l.lat
    if (l.lng < minLng) minLng = l.lng
    if (l.lat > maxLat) maxLat = l.lat
    if (l.lng > maxLng) maxLng = l.lng
  }
  return {
    min: { lat: minLat, lng: minLng },
    max: { lat: maxLat, lng: maxLng },
  }
}

const scoreFactorFromBounds = (bounds) => {
  if (!bounds) return WORLD_MAP_SCORE_FACTOR
  const distance = calculateDistance(bounds.min, bounds.max, 'metric')
  return (WORLD_MAP_SCORE_FACTOR * Number(distance)) / WORLD_MAP_BOUNDS_DISTANCE
}

function defaultSnapshotsDir() {
  const home = process.env.HOME || process.env.USERPROFILE || ''
  return path.join(home, 'Downloads', 'equitable-world.final.resolved')
}

function pickBestSnapshot(dir) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
  const snapshots = files.map((file) => {
    const full = path.join(dir, file)
    const data = JSON.parse(fs.readFileSync(full, 'utf8'))
    const count = Array.isArray(data.customCoordinates) ? data.customCoordinates.length : 0
    return { file, full, date: file.replace(/\.json$/, ''), count, data }
  })

  if (!snapshots.length) {
    throw new Error(`No JSON files in ${dir}`)
  }

  const maxCount = Math.max(...snapshots.map((s) => s.count))
  const threshold = maxCount - NEAR_MAX_TOLERANCE
  const viable = snapshots.filter((s) => s.count >= threshold)
  viable.sort((a, b) => b.date.localeCompare(a.date))
  const chosen = viable[0]
  const excluded = snapshots.filter((s) => s.count < threshold)

  return { chosen, maxCount, excluded }
}

async function main() {
  if (!process.env.MONGO_URI || !process.env.DB_NAME) {
    throw new Error('MONGO_URI and DB_NAME must be set (e.g. in .env)')
  }

  let payload
  let chosenMeta

  const argPath = process.argv[2]
  if (argPath) {
    const full = path.isAbsolute(argPath) ? argPath : path.join(process.cwd(), argPath)
    payload = JSON.parse(fs.readFileSync(full, 'utf8'))
    chosenMeta = { file: path.basename(full), count: payload.customCoordinates?.length || 0 }
    console.log(`Using explicit file: ${chosenMeta.file} (${chosenMeta.count} locations)`)
  } else {
    const dir = process.env.EQUITABLE_SNAPSHOTS_DIR || defaultSnapshotsDir()
    if (!fs.existsSync(dir)) {
      throw new Error(`Snapshot directory missing: ${dir}\nSet EQUITABLE_SNAPSHOTS_DIR or pass a .json path.`)
    }
    const { chosen, maxCount, excluded } = pickBestSnapshot(dir)
    payload = chosen.data
    chosenMeta = { file: chosen.file, count: chosen.count }
    console.log(`Best snapshot: ${chosen.file} (${chosen.count} locations; folder max=${maxCount}).`)
    console.log(
      `Logic: exclude partial exports (count < max−${NEAR_MAX_TOLERANCE}), then newest date among the rest.`
    )
    if (excluded.length) {
      console.log(
        'Excluded:',
        excluded.map((e) => `${e.file} (${e.count})`).join('; ')
      )
    }
  }

  const coords = payload.customCoordinates
  if (!Array.isArray(coords) || coords.length < 5) {
    throw new Error('Invalid payload: need customCoordinates array with at least 5 points')
  }

  const mapId = new ObjectId()

  const locationDocs = coords.map((c) => ({
    lat: c.lat,
    lng: c.lng,
    heading: c.heading,
    zoom: c.zoom,
    countryCode: c.countryCode,
    mapId,
  }))

  const bounds = getBounds(locationDocs)
  const scoreFactor = scoreFactorFromBounds(bounds)

  const mapDoc = {
    _id: mapId,
    name: payload.name || 'Equitable World',
    description: payload.description || '',
    previewImg: 'custom-map.svg',
    creator: 'GeoHub',
    isPublished: true,
    isDeleted: false,
    createdAt: new Date(),
    lastUpdatedAt: new Date(),
    avgScore: 0,
    usersPlayed: 0,
    locationCount: locationDocs.length,
    bounds,
    scoreFactor,
  }

  const client = new MongoClient(process.env.MONGO_URI)
  await client.connect()
  const db = client.db(process.env.DB_NAME)
  const maps = db.collection('maps')
  const locations = db.collection('locations')

  await maps.insertOne(mapDoc)

  for (let i = 0; i < locationDocs.length; i += BATCH_SIZE) {
    const batch = locationDocs.slice(i, i + BATCH_SIZE)
    await locations.insertMany(batch)
    process.stdout.write(`\rInserted locations ${Math.min(i + BATCH_SIZE, locationDocs.length)}/${locationDocs.length}`)
  }
  console.log('')

  await client.close()

  console.log('\nDone.')
  console.log(`New map _id: ${mapId.toHexString()}`)
  console.log(`Source: ${chosenMeta.file}`)
  const oneCard = [
    {
      _id: mapId.toHexString(),
      name: payload.name || 'Default World',
      description: `~${locationDocs.length.toLocaleString()} locations`,
      previewImg: 'custom-map.svg',
    },
  ]
  console.log(`NEXT_PUBLIC_HOME_MAP_CARDS='${JSON.stringify(oneCard)}'`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
