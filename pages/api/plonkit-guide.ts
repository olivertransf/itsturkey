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

function attributionFor(meta: GuideListEntry) {
  return {
    name: 'Plonk It Guide to GeoGuessr',
    license: 'CC BY-NC-SA 4.0',
    siteUrl: `${PLONKIT_ORIGIN}/guide`,
    guideUrl: `${PLONKIT_ORIGIN}/${meta.slug}`,
  }
}

async function loadPublicGuideBody(meta: GuideListEntry): Promise<unknown> {
  const now = Date.now()
  const ck = guideCache.get(meta.slug)
  if (ck && now - ck.fetchedAt < GUIDE_TTL_MS) {
    return ck.data
  }
  const detail = (await fetchJson(`${PLONKIT_ORIGIN}/api/guides/${meta.slug}`)) as {
    success?: boolean
    data?: { public?: unknown }
  }
  if (!detail?.success || !detail.data?.public) {
    throw new Error('guide detail failed')
  }
  const publicGuide = detail.data.public
  guideCache.set(meta.slug, { fetchedAt: now, data: publicGuide })
  return publicGuide
}

function normalizeCode(param: string | string[] | undefined): string | null {
  if (!param) return null
  const s = Array.isArray(param) ? param[0] : param
  const t = String(s).trim().toLowerCase()
  if (!/^[a-z]{2}$/.test(t)) return null
  return t
}

function queryTruthy(param: string | string[] | undefined): boolean {
  const v = Array.isArray(param) ? param[0] : param
  return v === '1' || v === 'true'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const wantRandom = queryTruthy(req.query.random)
  const lightweight = queryTruthy(req.query.lightweight)

  try {
    if (wantRandom) {
      const list = await loadGuideList()
      if (!list.length) {
        return res.status(502).json({ error: 'No guides available' })
      }
      const pick = list[Math.floor(Math.random() * list.length)]!
      if (!pick.slug) {
        return res.status(502).json({ error: 'Invalid guide list entry' })
      }
      const isoUpper = (pick.code ?? '').toUpperCase()
      res.setHeader('Cache-Control', 'private, no-store')

      if (lightweight) {
        return res.status(200).json({
          attribution: attributionFor(pick),
          meta: { title: pick.title, slug: pick.slug, code: isoUpper },
          guide: null,
        })
      }

      const publicGuide = await loadPublicGuideBody(pick)
      return res.status(200).json({
        attribution: attributionFor(pick),
        meta: { title: pick.title, slug: pick.slug, code: isoUpper },
        guide: publicGuide,
      })
    }

    const code = normalizeCode(req.query.code)
    if (!code) {
      return res.status(400).json({ error: 'Missing or invalid code (ISO 3166-1 alpha-2)' })
    }

    const list = await loadGuideList()
    const isoUpper = code.toUpperCase()
    const meta = list.find((g) => g.code?.toUpperCase() === isoUpper)
    if (!meta?.slug) {
      return res.status(404).json({ error: 'No guide for this country on Plonk It' })
    }

    const publicGuide = await loadPublicGuideBody(meta)

    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600')

    return res.status(200).json({
      attribution: attributionFor(meta),
      meta: { title: meta.title, slug: meta.slug, code: isoUpper },
      guide: publicGuide,
    })
  } catch {
    return res.status(502).json({ error: 'Plonk It guide service unavailable' })
  }
}
