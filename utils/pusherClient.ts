import Pusher from 'pusher-js'

let singleton: Pusher | null = null

/** Browser singleton; requires NEXT_PUBLIC_PUSHER_KEY and NEXT_PUBLIC_PUSHER_CLUSTER. */
export function getPusherBrowserClient(): Pusher | null {
  if (typeof window === 'undefined') return null
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  if (!key || !cluster) return null
  if (!singleton) {
    singleton = new Pusher(key, {
      cluster,
      authEndpoint: '/api/pusher/auth',
      authTransport: 'ajax',
      enabledTransports: ['ws', 'wss'],
    })
  }
  return singleton
}
