import {
  ANONYMOUS_GAME_COOKIE,
  buildAnonymousGameCookie,
  canAccessGame,
} from '@backend/utils/anonymousGame'

test('builds an http-only anonymous game cookie', () => {
  expect(buildAnonymousGameCookie('guest-123')).toBe(
    `${ANONYMOUS_GAME_COOKIE}=guest-123; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
  )
})

test('allows a session user to access their own game', () => {
  expect(canAccessGame({ userId: 'user-123' }, { userId: 'user-123' })).toBe(true)
})

test('allows a guest browser to access its own anonymous game', () => {
  expect(canAccessGame({ anonymousId: 'guest-123' }, { anonymousId: 'guest-123' })).toBe(true)
})

test('rejects users and guests that do not own the game', () => {
  expect(canAccessGame({ userId: 'user-123' }, { userId: 'user-456' })).toBe(false)
  expect(canAccessGame({ anonymousId: 'guest-123' }, { anonymousId: 'guest-456' })).toBe(false)
  expect(canAccessGame({ anonymousId: 'guest-123' }, { userId: 'user-123' })).toBe(false)
})
