import { MAP_PICKER_EXCLUDED_IDS } from '@utils/constants/mapPicker'
import { DEFAULT_MAP_PREVIEW_FILE } from '@utils/helpers/mapPreviewSrc'
import { OFFICIAL_WORLD_ID } from '@utils/constants/random'
import officialMapsFallback from '@utils/constants/officialMaps.json'
import { mailman } from '@utils/helpers'

export type MapPickerRow = {
  _id: string
  name: string
  description?: string
  previewImg: string
}

/** Handles string ids and common Mongo JSON shapes (`{ "$oid": "..." }`). */
const mongoIdToString = (raw: unknown): string => {
  if (raw == null) return ''
  if (typeof raw === 'string') return raw.trim()
  if (typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    if (typeof o.$oid === 'string') return o.$oid.trim()
    if (typeof o.oid === 'string') return o.oid.trim()
  }
  const s = String(raw)
  return s === '[object Object]' ? '' : s
}

const normalizeRow = (m: Record<string, unknown>): MapPickerRow | null => {
  const _id = mongoIdToString(m._id)
  const name = typeof m.name === 'string' ? m.name : ''
  if (!_id || !name) return null

  const previewRaw = typeof m.previewImg === 'string' ? m.previewImg.trim() : ''
  return {
    _id,
    name,
    description: typeof m.description === 'string' ? m.description : undefined,
    previewImg: previewRaw || DEFAULT_MAP_PREVIEW_FILE,
  }
}

const mergeRows = (byId: Map<string, MapPickerRow>, list: unknown) => {
  if (!Array.isArray(list)) return

  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const row = normalizeRow(item as Record<string, unknown>)
    if (!row || MAP_PICKER_EXCLUDED_IDS.has(row._id)) continue
    byId.set(row._id, row)
  }
}

const officialSeedRows = (officialMapsFallback as { _id: string }[]).filter(
  (m) => !MAP_PICKER_EXCLUDED_IDS.has(String(m._id))
)

const MAIN_MAP_IDS_ORDER = officialSeedRows.map((x) => String(x._id))

const labelPickerRow = (row: MapPickerRow): MapPickerRow => {
  if (row._id === OFFICIAL_WORLD_ID) {
    return { ...row, name: 'Default World' }
  }
  return row
}

const sortPickerRows = (rows: MapPickerRow[]): MapPickerRow[] => {
  const orderIdx = new Map(MAIN_MAP_IDS_ORDER.map((id, i) => [id, i]))

  const mainPart = MAIN_MAP_IDS_ORDER.map((id) => rows.find((r) => r._id === id)).filter(Boolean) as MapPickerRow[]

  const rest = rows
    .filter((r) => !orderIdx.has(r._id))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))

  return [...mainPart, ...rest]
}

const stripExcludedFromMap = (byId: Map<string, MapPickerRow>) => {
  MAP_PICKER_EXCLUDED_IDS.forEach((id) => {
    byId.delete(id)
  })
}

async function fetchAllOfficialBrowsePages(): Promise<unknown[]> {
  const out: unknown[] = []
  let page = 0

  for (;;) {
    const res = await mailman(`maps/browse/official?page=${page}`)

    if (res?.error || !Array.isArray(res?.data)) {
      break
    }

    out.push(...res.data)

    if (!res.hasMore) {
      break
    }

    page += 1
    if (page > 25) {
      break
    }
  }

  return out
}

export async function loadMapPickerOptions(params: {
  includeAllMapsOption: boolean
}): Promise<MapPickerRow[]> {
  const byId = new Map<string, MapPickerRow>()

  mergeRows(byId, officialSeedRows as unknown[])

  const [officialPages, countryRes, continentRes] = await Promise.all([
    fetchAllOfficialBrowsePages(),
    mailman('maps/equitable-by-country'),
    mailman('maps/equitable-by-continent'),
  ])

  mergeRows(byId, officialPages)
  if (!countryRes?.error) mergeRows(byId, countryRes?.data)
  if (!continentRes?.error) mergeRows(byId, continentRes?.data)

  if (!byId.size) {
    mergeRows(byId, officialSeedRows as unknown[])
  }

  stripExcludedFromMap(byId)

  let rows = sortPickerRows(Array.from(byId.values()).map(labelPickerRow))

  if (params.includeAllMapsOption) {
    const world = byId.get(OFFICIAL_WORLD_ID) ?? rows.find((r) => r._id === OFFICIAL_WORLD_ID) ?? rows[0]
    const previewImg = world?.previewImg?.trim() ? world.previewImg : DEFAULT_MAP_PREVIEW_FILE

    rows = [
      {
        _id: 'all',
        name: 'All Maps',
        description: 'Each panel uses a random official map.',
        previewImg,
      },
      ...rows.filter((r) => r._id !== 'all'),
    ]
  }

  return rows
}
