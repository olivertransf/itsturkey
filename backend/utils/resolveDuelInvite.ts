import { ObjectId } from 'mongodb'
import type DuelSession from '@backend/models/duelSession'
import { collections } from './dbConnect'
import { normalizeDuelInviteCode } from './duelShortCode'

/** Resolve `duels/:id` URL segment: 24-char ObjectId hex, or 4–8 char short invite code. */
export function duelInviteLookupFilter(raw: string): { _id: ObjectId } | { shortCode: string } | null {
  const trimmed = typeof raw === 'string' ? raw.trim() : ''
  if (!trimmed) return null

  if (/^[a-f\d]{24}$/i.test(trimmed)) {
    try {
      return { _id: new ObjectId(trimmed) }
    } catch {
      return null
    }
  }

  const code = normalizeDuelInviteCode(trimmed)
  if (code) return { shortCode: code }

  return null
}

export async function findDuelSessionByInvite(idParam: string): Promise<DuelSession | null> {
  const filter = duelInviteLookupFilter(idParam)
  if (!filter) return null
  const doc = await collections.duelSessions?.findOne(filter)
  return doc as DuelSession | null
}
