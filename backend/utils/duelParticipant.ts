import { ObjectId } from 'mongodb'
import type { DuelSession, DuelSide } from '@backend/models/duelSession'

export type DuelViewerRole = DuelSide | 'spectator' | null

export const duelParticipantRole = (
  duel: DuelSession,
  userId: string | undefined,
  anonymousId: string | undefined
): DuelSide | null => {
  const matches = (
    slot: { userId?: ObjectId; anonymousId?: string },
    uid: string | undefined,
    aid: string | undefined
  ) => {
    if (slot.userId && uid && slot.userId.toString() === uid) return true
    if (slot.anonymousId && aid && slot.anonymousId === aid) return true
    return false
  }

  if (matches(duel.host, userId, anonymousId)) return 'host'
  if (duel.guest.joined && matches(duel.guest, userId, anonymousId)) return 'guest'
  return null
}

export const duelSlotForRole = (duel: DuelSession, role: DuelSide) => (role === 'host' ? duel.host : duel.guest)

export const resolveDuelViewerRole = (
  duel: DuelSession,
  userId: string | undefined,
  anonymousId: string | undefined,
  opts?: { allowSpectator?: boolean }
): DuelViewerRole => {
  const participant = duelParticipantRole(duel, userId, anonymousId)
  if (participant) return participant

  if (
    opts?.allowSpectator &&
    (duel.status === 'in_progress' || duel.status === 'finished')
  ) {
    return 'spectator'
  }

  return null
}
