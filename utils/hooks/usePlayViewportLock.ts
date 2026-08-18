import { useEffect } from 'react'

export function usePlayViewportLock() {
  useEffect(() => {
    const root = document.documentElement
    root.dataset.playLock = '1'
    return () => {
      delete root.dataset.playLock
    }
  }, [])
}
