import { pickLastUsedAt } from '@utils/helpers/lastUsedAt'

test('prefers the latest live activity over createdAt', () => {
  const created = '2026-01-01T12:00:00.000Z'
  const lastUsed = '2026-08-14T18:00:00.000Z'
  const picked = pickLastUsedAt({
    createdAt: created,
    liveView: { updatedAt: lastUsed },
  })
  expect(picked?.toISOString()).toBe(lastUsed)
})

test('falls back to createdAt when nothing else exists', () => {
  const created = '2026-03-02T08:15:00.000Z'
  const picked = pickLastUsedAt({ createdAt: created })
  expect(picked?.toISOString()).toBe(created)
})

test('uses explicit lastUsedAt when present', () => {
  const picked = pickLastUsedAt({
    lastUsedAt: '2026-08-10T01:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    liveView: { updatedAt: '2026-02-01T00:00:00.000Z' },
  })
  expect(picked?.toISOString()).toBe('2026-08-10T01:00:00.000Z')
})

test('sorts unfinished games by last used, not created', () => {
  const olderCreatedButJustPlayed = {
    _id: 'a',
    createdAt: '2026-01-01T00:00:00.000Z',
    liveView: { updatedAt: '2026-08-14T20:00:00.000Z' },
  }
  const newerCreatedNeverPlayed = {
    _id: 'b',
    createdAt: '2026-08-13T00:00:00.000Z',
  }
  const games = [newerCreatedNeverPlayed, olderCreatedButJustPlayed]
  const sorted = [...games].sort((left, right) => {
    const leftAt = pickLastUsedAt(left)?.getTime() ?? 0
    const rightAt = pickLastUsedAt(right)?.getTime() ?? 0
    return rightAt - leftAt
  })
  expect(sorted.map((game) => game._id)).toEqual(['a', 'b'])
})
