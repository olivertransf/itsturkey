import type { NextApiRequest, NextApiResponse } from 'next'
import { PLONKIT_ORIGIN } from '@utils/constants/plonkitGuide'

type GuideListEntry = {
  title: string
  slug: string
  code: string
}

const LIST_TTL_MS = 60 * 60 * 1000
const GUIDE_TTL_MS = 30 * 60 * 1000

let cachedList: { fetchedAt: number; entries: GuideListEntry[] } | null = null
const guideCache = new Map<string, { fetchedAt: number; data: unknown }>()

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`upstream ${res.status}`)
  }
  return res.json()
}

async function loadGuideList(): Promise<GuideListEntry[]> {
  const now = Date.now()
  if (cachedList && now - cachedList.fetchedAt < LIST_TTL_MS) {
    return cachedList.entries
  }
  const raw = (await fetchJson(`${PLONKIT_ORIGIN}/api/guides`)) as {
    success?: boolean
    data?: GuideListEntry[]
  }
  if (!raw?.success || !Array.isArray(raw.data)) {
    throw new Error('invalid guides list')
  }
  cachedList = { fetchedAt: now, entries: raw.data }
  return raw.data
}

function normalizeCode(param: string | string[] | undefined): string | null {
  if (!param) return null
  const s = Array.isArray(param) ? param[0] : param
  const t = String(s).trim().toLowerCase()
  if (!/^[a-z]{2}$/.test(t)) return null
  return t
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const code = normalizeCode(req.query.code)
  if (!code) {
    return res.status(400).json({ error: 'Missing or invalid code (ISO 3166-1 alpha-2)' })
  }

  try {
    const list = await loadGuideList()
    const isoUpper = code.toUpperCase()
    const meta = list.find((g) => g.code?.toUpperCase() === isoUpper)
    if (!meta?.slug) {
      return res.status(404).json({ error: 'No guide for this country on Plonk It' })
    }

    const now = Date.now()
    const ck = guideCache.get(meta.slug)
    let publicGuide: unknown
    if (ck && now - ck.fetchedAt < GUIDE_TTL_MS) {
      publicGuide = ck.data
    } else {
      const detail = (await fetchJson(`${PLONKIT_ORIGIN}/api/guides/${meta.slug}`)) as {
        success?: boolean
        data?: { public?: unknown }
      }
      if (!detail?.success || !detail.data?.public) {
        return res.status(502).json({ error: 'Failed to load guide content' })
      }
      publicGuide = detail.data.public
      guideCache.set(meta.slug, { fetchedAt: now, data: publicGuide })
    }

    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600')

    return res.status(200).json({
      attribution: {
        name: 'Plonk It Guide to GeoGuessr',
        license: 'CC BY-NC-SA 4.0',
        siteUrl: `${PLONKIT_ORIGIN}/guide`,
        guideUrl: `${PLONKIT_ORIGIN}/${meta.slug}`,
      },
      meta: { title: meta.title, slug: meta.slug, code: isoUpper },
      guide: publicGuide,
    })
  } catch {
    return res.status(502).json({ error: 'Plonk It guide service unavailable' })
  }
}
