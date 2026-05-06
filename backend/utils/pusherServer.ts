import Pusher from 'pusher'

let instance: Pusher | null | undefined

/** Server-side Pusher; requires PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER (same cluster slug as dashboard, e.g. us3). */
export function getPusherServer(): Pusher | null {
  if (instance === undefined) {
    const appId = process.env.PUSHER_APP_ID
    const key = process.env.PUSHER_KEY
    const secret = process.env.PUSHER_SECRET
    const cluster = process.env.PUSHER_CLUSTER
    if (!appId || !key || !secret || !cluster) {
      instance = null
      return null
    }
    instance = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    })
  }
  return instance
}

export async function triggerSafe(
  channel: string,
  event: string,
  data: Record<string, unknown>
): Promise<void> {
  const pusher = getPusherServer()
  if (!pusher) return
  try {
    await pusher.trigger(channel, event, data)
  } catch (err) {
    console.error('[pusher] trigger failed', channel, event, err)
  }
}
