import { useEffect } from 'react'

/**
 * Runs `tick` on an interval only while the document is visible.
 * When `ms` is null, skips the interval and only runs on mount, focus, and visibility regain.
 */
export const useVisibleInterval = (tick: () => void, ms: number | null, enabled = true) => {
  useEffect(() => {
    if (!enabled) return

    const runIfVisible = () => {
      if (document.visibilityState === 'visible') {
        tick()
      }
    }

    runIfVisible()

    const intervalId = ms != null && ms > 0 ? window.setInterval(runIfVisible, ms) : undefined

    const onVisible = () => {
      if (document.visibilityState === 'visible') tick()
    }

    window.addEventListener('focus', onVisible)
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      if (intervalId != null) window.clearInterval(intervalId)
      window.removeEventListener('focus', onVisible)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [tick, ms, enabled])
}
