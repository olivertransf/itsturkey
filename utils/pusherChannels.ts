/** Pusher channel naming shared by server triggers and browser subscriptions. */

export function sanitizeChannelSegment(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_\-=@,.;]/g, '_').slice(0, 160)
}

export function duelPrivateChannel(segment: string): string {
  return `private-duel-${sanitizeChannelSegment(segment)}`
}

export function userPrivateChannel(userId: string): string {
  return `private-user-${sanitizeChannelSegment(userId)}`
}

/** Public channel so anonymous map pages still receive leaderboard pushes without auth. */
export function mapScoresPublicChannel(mapKey: string): string {
  return `map-scores-${sanitizeChannelSegment(mapKey)}`
}
