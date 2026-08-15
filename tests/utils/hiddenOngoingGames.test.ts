import {
  hideOngoingGame,
  isOngoingGameHidden,
  normalizeOngoingGameId,
  readHiddenOngoingIds,
  unhideAllOngoingGames,
} from '@utils/helpers/hiddenOngoingGames'

beforeEach(() => {
  unhideAllOngoingGames()
})

test('rapid hides keep every previous id', () => {
  hideOngoingGame('a')
  hideOngoingGame('b')
  hideOngoingGame('c')
  expect(readHiddenOngoingIds()).toEqual(['a', 'b', 'c'])
})

test('normalizes mongo-shaped ids so hide matches later reads', () => {
  hideOngoingGame({ $oid: 'aaaaaaaaaaaaaaaaaaaaaaaa' })
  expect(normalizeOngoingGameId({ $oid: 'aaaaaaaaaaaaaaaaaaaaaaaa' })).toBe('aaaaaaaaaaaaaaaaaaaaaaaa')
  expect(isOngoingGameHidden('aaaaaaaaaaaaaaaaaaaaaaaa')).toBe(true)
  expect(isOngoingGameHidden({ $oid: 'aaaaaaaaaaaaaaaaaaaaaaaa' })).toBe(true)
})

test('spreading a stale hidden list drops earlier hides', () => {
  hideOngoingGame('a')
  const stale = [] as string[]
  hideOngoingGame('b')
  const nextFromStale = Array.from(new Set([...stale, 'b']))
  expect(nextFromStale).toEqual(['b'])
  expect(readHiddenOngoingIds()).toEqual(['a', 'b'])
})
