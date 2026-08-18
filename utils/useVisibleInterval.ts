import { useEffect, useRef } from 'react'

export const useVisibleInterval = (tick: () => void, ms: number | null, enabled = true) => {
  const tickRef = useRef(tick)
  tickRef.current = tick

  useEffect(() => {
    if (!enabled) return undefined

    const runIfVisible = () => {
      if (document.visibilityState === 'visible') tickRef.current()
    }

    runIfVisible()
    const intervalId = ms != null && ms > 0 ? window.setInterval(runIfVisible, ms) : undefined

    window.addEventListener('focus', runIfVisible)
    document.addEventListener('visibilitychange', runIfVisible)

    return () => {
      if (intervalId != null) window.clearInterval(intervalId)
      window.removeEventListener('focus', runIfVisible)
      document.removeEventListener('visibilitychange', runIfVisible)
    }
  }, [ms, enabled])
}
