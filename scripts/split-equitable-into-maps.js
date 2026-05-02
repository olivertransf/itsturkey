/**
 * Split equitable-world JSON into GeoHub official maps (locations collection).
 *
 * Layouts (--layout):
 *   weighted (default) — **5 disjoint maps**, **every pin used once**:
 *     Weights **60 : 60 : 42 : 42 : 42** → Default World, Default World 2, Equitable ×3.
 *     Those numbers match **~60k + ~60k + ~42k×3 ≈ 246k** targets; one ~125k file **scales down**
 *     (~30.6k / ~21.4k per slice @ 125k) while keeping **same proportions** (defaults larger per map).
 *     Override weights: `EQUITABLE_SPLITS_WEIGHTS=60,60,42,42,42`
 *   five-way — equal **⅕** per map (~25k @ 125k).
 *   two-default-three-equitable — alias for **weighted**.
 *   three-equitable — **only** 3 maps; full dataset in thirds (~42k @ 125k).
 *   two-default — **only** 2 maps; Default World + Default World 2, disjoint halves.
 *   chunk — fixed slice size (EQUITABLE_CHUNK_SIZE, default 60000).
 *
 * JSON input may be `{ customCoordinates, description? }` or a **root array** of `{ lat, lng, heading?, ... }`.
 *
 * Snapshot picker: highest location count among non-partial exports (then newest date).
 *
 * Usage:
 *   node scripts/split-equitable-into-maps.js [--layout weighted|five-way|three-equitable|two-default|chunk] [--replace-existing]
 *
 * Env: MONGO_URI, DB_NAME; EQUITABLE_SNAPSHOTS_DIR; EQUITABLE_SHUFFLE_SEED (1337); EQUITABLE_SPLITS_WEIGHTS; EQUITABLE_CHUNK_SIZE (chunk)
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

const fs = require('fs')
const path = require('path')
const { MongoClient, ObjectId } = require('mongodb')

const BATCH_SIZE = 8000
const WORLD_MAP_SCORE_FACTOR = 2000
const WORLD_MAP_BOUNDS_DISTANCE = 18150
const NEAR_MAX_TOLERANCE = 2500

/** GeoHub maps removed when --replace-existing runs */
const REPLACEABLE_NAMES = [
  'Default World',
  'Default World 2',
  'Equitable World',
  'Equitable World II',
  'Equitable World III',
  'Equitable World IV',
]

/** With `--replace-existing`, only remove maps we are about to recreate (avoid wiping other layouts). */
function replaceableNamesForLayout(layout) {
  if (layout === 'two-default') {
    return ['Default World', 'Default World 2']
  }
  return REPLACEABLE_NAMES
}

function coordsFromExportPayload(payload) {
  if (Array.isArray(payload)) {
    return payload
  }
  if (payload && Array.isArray(payload.customCoordinates)) {
    return payload.customCoordinates
  }
  throw new Error('JSON must be a coordinate array or an object with customCoordinates[]')
}

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
    let count = 0
    try {
      count = coordsFromExportPayload(data).length
    } catch {
      count = 0
    }
    return { file, full, date: file.replace(/\.json$/, ''), count, data }
  })

  if (!snapshots.length) {
    throw new Error(`No JSON files in ${dir}`)
  }

  const maxCount = Math.max(...snapshots.map((s) => s.count))
  const threshold = maxCount - NEAR_MAX_TOLERANCE
  const viable = snapshots.filter((s) => s.count >= threshold)
  viable.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    return b.date.localeCompare(a.date)
  })
  const chosen = viable[0]
  const excluded = snapshots.filter((s) => s.count < threshold)

  return { chosen, maxCount, excluded }
}

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffleInPlace(arr, seed) {
  const rnd = mulberry32(seed)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    const t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
  }
}

/** Equal split: first `remainder` slices get +1 location */
function equalPartitionSizes(total, parts) {
  const base = Math.floor(total / parts)
  const rem = total % parts
  const sizes = []
  for (let i = 0; i < parts; i++) {
    sizes.push(base + (i < rem ? 1 : 0))
  }
  return sizes
}

function slicesFromSizes(plain, sizes) {
  const chunks = []
  let offset = 0
  for (const sz of sizes) {
    chunks.push(plain.slice(offset, offset + sz))
    offset += sz
  }
  return chunks
}

/** Largest-remainder method: integer sizes sum to `total`, proportions match `weights`. */
function weightedPartitionSizes(total, weights) {
  const sumW = weights.reduce((a, b) => a + b, 0)
  if (sumW <= 0) throw new Error('weights must sum to a positive number')
  const exact = weights.map((w) => (total * w) / sumW)
  const sizes = exact.map((x) => Math.floor(x))
  const assigned = sizes.reduce((a, b) => a + b, 0)
  let rem = total - assigned
  const order = exact.map((x, i) => ({ i, frac: x - Math.floor(x) }))
  order.sort((a, b) => b.frac - a.frac)
  for (let k = 0; k < rem; k++) {
    sizes[order[k].i]++
  }
  return sizes
}

function parseSplitWeightsFromEnv() {
  const raw = process.env.EQUITABLE_SPLITS_WEIGHTS || '60,60,42,42,42'
  const parts = raw.split(',').map((s) => parseInt(s.trim(), 10))
  if (
    parts.length !== 5 ||
    parts.some((n) => !Number.isFinite(n) || n <= 0)
  ) {
    throw new Error(
      'EQUITABLE_SPLITS_WEIGHTS must be five positive integers: Default, Default2, Eq, Eq2, Eq3 (e.g. 60,60,42,42,42)'
    )
  }
  return parts
}

function namesForLayout(layout) {
  if (layout === 'three-equitable') {
    return ['Equitable World', 'Equitable World II', 'Equitable World III']
  }
  if (layout === 'five-way') {
    return ['Default World', 'Default World 2', 'Equitable World', 'Equitable World II', 'Equitable World III']
  }
  if (layout === 'two-default') {
    return ['Default World', 'Default World 2']
  }
  return null
}

/** Alias: intended “2 default + 3 equitable” with 60:60:42:42:42-style weights */
function normalizeLayout(layout) {
  if (layout === 'two-default-three-equitable') return 'weighted'
  return layout
}

function parseArgs(argv) {
  let fromMap = null
  let deleteSource = false
  let layout = process.env.EQUITABLE_LAYOUT || 'weighted'
  let replaceExisting = false
  const positional = []
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--from-map') {
      fromMap = argv[++i]
    } else if (a === '--delete-source') {
      deleteSource = true
    } else if (a === '--layout') {
      layout = argv[++i]
    } else if (a === '--replace-existing') {
      replaceExisting = true
    } else if (!a.startsWith('--')) {
      positional.push(a)
    }
  }
  return { fromMap, deleteSource, jsonPath: positional[0] || null, layout, replaceExisting }
}

async function deleteGeoHubMapsByNames(db, names) {
  const mapsCol = db.collection('maps')
  const locCol = db.collection('locations')
  for (const name of names) {
    const doc = await mapsCol.findOne({ name, creator: 'GeoHub' })
    if (!doc) continue
    const r = await locCol.deleteMany({ mapId: doc._id })
    await mapsCol.deleteOne({ _id: doc._id })
    console.log(`Removed previous GeoHub map "${name}" (${r.deletedCount} locations)`)
  }
}

async function loadCoordsFromMongo(db, mapHexId) {
  const mapId = new ObjectId(mapHexId)
  const map = await db.collection('maps').findOne({ _id: mapId })
  if (!map) {
    throw new Error(`Map not found: ${mapHexId}`)
  }
  const rows = await db
    .collection('locations')
    .find({ mapId })
    .project({ lat: 1, lng: 1, heading: 1, zoom: 1, countryCode: 1 })
    .toArray()

  return {
    coords: rows.map((r) => ({
      lat: r.lat,
      lng: r.lng,
      heading: r.heading,
      zoom: r.zoom,
      countryCode: r.countryCode,
    })),
    baseDescription: map.description || '',
    baseName: map.name || 'Imported map',
    sourceMapId: mapId,
  }
}

async function main() {
  if (!process.env.MONGO_URI || !process.env.DB_NAME) {
    throw new Error('MONGO_URI and DB_NAME must be set')
  }

  const chunkSizeEnv = parseInt(process.env.EQUITABLE_CHUNK_SIZE || '60000', 10)
  const shuffleSeed = parseInt(process.env.EQUITABLE_SHUFFLE_SEED || '1337', 10)

  let { fromMap, deleteSource, jsonPath, layout, replaceExisting } = parseArgs(process.argv)

  layout = normalizeLayout(layout)

  if (!['weighted', 'five-way', 'three-equitable', 'two-default', 'chunk'].includes(layout)) {
    throw new Error(
      `Invalid --layout. Use weighted | five-way | two-default-three-equitable | three-equitable | two-default | chunk`
    )
  }

  let coords
  let sourceLabel
  let sourceMapId = null
  let baseDescription = ''

  const client = new MongoClient(process.env.MONGO_URI)
  await client.connect()
  const db = client.db(process.env.DB_NAME)

  if (replaceExisting) {
    const removeNames = replaceableNamesForLayout(layout)
    console.log(`Removing prior GeoHub maps: ${removeNames.join(', ')}…`)
    await deleteGeoHubMapsByNames(db, removeNames)
  }

  if (fromMap) {
    const loaded = await loadCoordsFromMongo(db, fromMap)
    coords = loaded.coords
    baseDescription = loaded.baseDescription
    sourceMapId = loaded.sourceMapId
    sourceLabel = `Mongo map ${fromMap} (${coords.length} locations)`
    console.log(`Loaded ${coords.length} locations from ${sourceLabel}`)
  } else {
    let payload
    if (jsonPath) {
      const full = path.isAbsolute(jsonPath) ? jsonPath : path.join(process.cwd(), jsonPath)
      payload = JSON.parse(fs.readFileSync(full, 'utf8'))
      sourceLabel = path.basename(full)
      console.log(`Using JSON file: ${sourceLabel}`)
    } else {
      const dir = process.env.EQUITABLE_SNAPSHOTS_DIR || defaultSnapshotsDir()
      if (!fs.existsSync(dir)) {
        throw new Error(`Missing snapshot dir ${dir} — pass a .json path or set EQUITABLE_SNAPSHOTS_DIR`)
      }
      const { chosen, maxCount, excluded } = pickBestSnapshot(dir)
      payload = chosen.data
      sourceLabel = chosen.file
      console.log(`Best snapshot: ${chosen.file} (${chosen.count} pts; folder max=${maxCount})`)
      if (excluded.length) {
        console.log('Excluded partial:', excluded.map((e) => `${e.file} (${e.count})`).join('; '))
      }
    }
    coords = coordsFromExportPayload(payload)
    baseDescription = Array.isArray(payload) ? '' : payload.description || ''
    console.log(`Coordinates: ${coords.length}`)
  }

  if (!Array.isArray(coords) || coords.length < 5) {
    throw new Error('Need at least 5 coordinate records')
  }

  const plain = coords.map((c) => ({
    lat: c.lat,
    lng: c.lng,
    heading: c.heading,
    zoom: c.zoom,
    countryCode: c.countryCode,
  }))

  shuffleInPlace(plain, shuffleSeed)

  let chunks
  let names
  let splitWeights = null

  if (layout === 'chunk') {
    console.log(`Layout chunk: slice size ${chunkSizeEnv}, shuffle seed ${shuffleSeed}`)
    chunks = []
    for (let i = 0; i < plain.length; i += chunkSizeEnv) {
      chunks.push(plain.slice(i, i + chunkSizeEnv))
    }
    names = []
    const eqSuffix = ['III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
    for (let i = 0; i < chunks.length; i++) {
      if (i === 0) names.push('Default World')
      else if (i === 1) names.push('Default World 2')
      else names.push(`Equitable World ${eqSuffix[i - 2] || String(i + 1)}`)
    }
  } else if (layout === 'weighted') {
    names = namesForLayout('five-way')
    splitWeights = parseSplitWeightsFromEnv()
    const sumW = splitWeights.reduce((a, b) => a + b, 0)
    const sizes = weightedPartitionSizes(plain.length, splitWeights)
    chunks = slicesFromSizes(plain, sizes)
    console.log(
      `Layout weighted: ${plain.length} pins, weights [${splitWeights.join(', ')}] (sum ${sumW}) → sizes [${sizes.join(', ')}]. ` +
        `~60k+60k+42k×3 needs ~246k pins; scaled proportionally here. Seed ${shuffleSeed}`
    )
  } else if (layout === 'five-way') {
    names = namesForLayout('five-way')
    const sizes = equalPartitionSizes(plain.length, 5)
    chunks = slicesFromSizes(plain, sizes)
    const n = plain.length
    const defPair = sizes[0] + sizes[1]
    const eqTrio = sizes[2] + sizes[3] + sizes[4]
    console.log(
      `Layout five-way: ${n} pins total → Default World + Default World 2 share ${defPair} (${sizes[0]} + ${sizes[1]}); ` +
        `Equitable ×3 share ${eqTrio}, split in thirds (${sizes[2]} + ${sizes[3]} + ${sizes[4]}). Seed ${shuffleSeed}`
    )
  } else if (layout === 'two-default') {
    names = namesForLayout('two-default')
    const sizes = equalPartitionSizes(plain.length, 2)
    chunks = slicesFromSizes(plain, sizes)
    console.log(
      `Layout two-default: ${plain.length} pins → halves (${sizes.join(', ')}). Disjoint; seed ${shuffleSeed}`
    )
  } else {
    names = namesForLayout('three-equitable')
    const sizes = equalPartitionSizes(plain.length, 3)
    chunks = slicesFromSizes(plain, sizes)
    console.log(
      `Layout three-equitable: full dataset in 3 thirds (${sizes.join(', ')} pts). Seed ${shuffleSeed}`
    )
  }

  console.log(
    `Creating ${chunks.length} maps:`,
    chunks.map((ch, idx) => `${names[idx]} (${ch.length})`).join(', ')
  )

  const mapsCol = db.collection('maps')
  const locCol = db.collection('locations')

  const createdIds = []

  for (let c = 0; c < chunks.length; c++) {
    const slice = chunks[c]
    const mapId = new ObjectId()
    const docs = slice.map((row) => ({ ...row, mapId }))
    const bounds = getBounds(docs)
    const scoreFactor = scoreFactorFromBounds(bounds)

    const blurb =
      baseDescription.length > 450 ? `${baseDescription.slice(0, 450).trim()}…` : baseDescription
    const layoutNote =
      layout === 'weighted'
        ? c < 2
          ? `Default World (${c + 1}/2): disjoint weighted slice (target ratio ${splitWeights[c]}/246 @ ~246k pins).`
          : `Equitable World (${c - 1}/3): disjoint weighted slice (target ratio ${splitWeights[c]}/246 @ ~246k pins).`
        : layout === 'five-way'
          ? c < 2
            ? `Default World (${c + 1}/2): ~⅕ of full shuffled dataset.`
            : `Equitable World (${c - 1}/3 of equitable trio): ~⅓ of the 3/5 equitable pool (~⅕ of full dataset).`
          : layout === 'two-default'
            ? `Default World (${c + 1}/2): half of shuffled import (~equal pins per map).`
            : layout === 'three-equitable'
              ? `Third ${c + 1}/${chunks.length} of full dataset (~equal pins per map).`
              : `Part ${c + 1}/${chunks.length} (chunk layout).`
    const descPart = `${layoutNote} ${blurb}`.trim()

    await mapsCol.insertOne({
      _id: mapId,
      name: names[c],
      description: descPart,
      previewImg: 'custom-map.svg',
      creator: 'GeoHub',
      isPublished: true,
      isDeleted: false,
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
      avgScore: 0,
      usersPlayed: 0,
      locationCount: docs.length,
      bounds,
      scoreFactor,
    })

    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = docs.slice(i, i + BATCH_SIZE)
      await locCol.insertMany(batch)
      process.stdout.write(`\r${names[c]}: ${Math.min(i + BATCH_SIZE, docs.length)}/${docs.length}`)
    }
    console.log('')
    createdIds.push({ name: names[c], id: mapId.toHexString(), count: docs.length })
  }

  if (fromMap && deleteSource && sourceMapId) {
    console.warn('Deleting source map: existing games/challenges referencing this map id may break.')
    const dr = await locCol.deleteMany({ mapId: sourceMapId })
    await mapsCol.deleteOne({ _id: sourceMapId })
    console.log(`Removed source map ${sourceMapId.toHexString()} and ${dr.deletedCount} old locations.`)
  }

  await client.close()

  console.log('\nCreated maps:')
  createdIds.forEach((m) => console.log(`  ${m.name}  _id=${m.id}  locations=${m.count}`))
  console.log(`\nSource: ${sourceLabel}`)

  const homeCards = createdIds.map((m) => ({
    _id: m.id,
    name: m.name,
    description: `~${m.count.toLocaleString()} locations`,
    previewImg: 'custom-map.svg',
  }))
  console.log('\n--- Homepage: add to .env ---')
  console.log(`NEXT_PUBLIC_HOME_MAP_CARDS=${JSON.stringify(homeCards)}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
