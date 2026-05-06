import { ObjectId } from 'mongodb'
import type DuelSession from '@backend/models/duelSession'
import type { DuelPlayerSlot } from '@backend/models/duelSession'
import { collections } from '@backend/utils'

const MAX_LEN = 32

/** SVG key under `/images/userAvatars` for anonymous / missing profile (8-ball). */
export const DUEL_GUESS_AVATAR_FALLBACK = { emoji: '1f3b1', color: '#94a3b8' } as const

export type DuelGuessAvatar = { emoji: string; color: string }

export const sanitizeDuelDisplayName = (raw: unknown): string | undefined => {
  if (typeof raw !== 'string') return undefined
  const t = raw.trim().replace(/\s+/g, ' ')
  if (!t) return undefined
  return t.length > MAX_LEN ? t.slice(0, MAX_LEN) : t
}

async function labelForSlot(slot: DuelPlayerSlot, fallback: string): Promise<string> {
  const direct = slot.displayName?.trim()
  if (direct) return direct.length > MAX_LEN ? direct.slice(0, MAX_LEN) : direct

  if (slot.userId) {
    const u = await collections.users?.findOne({ _id: slot.userId }, { projection: { name: 1 } })
    const n = u && typeof u.name === 'string' ? u.name.trim() : ''
    if (n) return n.length > MAX_LEN ? n.slice(0, MAX_LEN) : n
  }

  return fallback
}

/** Resolved labels for HUD / recap. Guest side shows "Waiting" until someone has joined. */
export async function resolveDuelPlayerNames(duel: DuelSession): Promise<{ host: string; guest: string }> {
  const host = await labelForSlot(duel.host, 'Player 1')
  const guest = duel.guest.joined ? await labelForSlot(duel.guest, 'Player 2') : 'Waiting'
  return { host, guest }
}

function normalizeGuessAvatar(raw: unknown): DuelGuessAvatar | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const em = o.emoji
  const co = o.color
  const emoji = typeof em === 'string' ? em.trim() : ''
  const color = typeof co === 'string' ? co.trim() : ''
  if (!emoji) return null
  return { emoji, color: color || DUEL_GUESS_AVATAR_FALLBACK.color }
}

async function avatarForSlot(slot: DuelPlayerSlot): Promise<DuelGuessAvatar> {
  if (slot.userId) {
    const u = await collections.users?.findOne({ _id: slot.userId }, { projection: { avatar: 1 } })
    const a = normalizeGuessAvatar(u?.avatar)
    if (a) return a
  }
  return { ...DUEL_GUESS_AVATAR_FALLBACK }
}

/** Map-marker avatars for recap / HUD; anonymous or missing users get `DUEL_GUESS_AVATAR_FALLBACK`. */
export async function resolveDuelPlayerAvatars(duel: DuelSession): Promise<{ host: DuelGuessAvatar; guest: DuelGuessAvatar }> {
  const host = await avatarForSlot(duel.host)
  const guest = duel.guest.joined ? await avatarForSlot(duel.guest) : { ...DUEL_GUESS_AVATAR_FALLBACK }
  return { host, guest }
}

export async function fetchUserDisplayName(userId: string): Promise<string | undefined> {
  if (!ObjectId.isValid(userId)) return undefined
  const u = await collections.users?.findOne({ _id: new ObjectId(userId) }, { projection: { name: 1 } })
  const n = u && typeof u.name === 'string' ? u.name.trim() : ''
  if (!n) return undefined
  return n.length > MAX_LEN ? n.slice(0, MAX_LEN) : n
}
