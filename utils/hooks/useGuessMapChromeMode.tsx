import { useEffect, useState } from 'react'
import { PHONE_MQ, TOUCH_PRIMARY_MQ } from '@utils/constants/breakpoints'

export type GuessMapChromeMode = 'desktop' | 'tabletTouch' | 'phone'

const readChromeMode = (): GuessMapChromeMode => {
  if (typeof window === 'undefined') return 'desktop'
  if (window.matchMedia(PHONE_MQ).matches) return 'phone'
  if (window.matchMedia(TOUCH_PRIMARY_MQ).matches) return 'tabletTouch'
  // iPad Safari sometimes reports hover:hover with a trackpad attached; still treat
  // coarse any-pointer + tablet width as touch chrome.
  if (
    window.matchMedia('(any-pointer: coarse)').matches &&
    window.matchMedia('(max-width: 1366px)').matches
  ) {
    return 'tabletTouch'
  }
  return 'desktop'
}

/** In-game guess-map chrome: desktop hover, iPad tap-expand, or phone sheet. */
const useGuessMapChromeMode = (): GuessMapChromeMode => {
  const [mode, setMode] = useState<GuessMapChromeMode>('desktop')

  useEffect(() => {
    const sync = () => setMode(readChromeMode())
    sync()

    const phoneMq = window.matchMedia(PHONE_MQ)
    const touchMq = window.matchMedia(TOUCH_PRIMARY_MQ)
    const coarseMq = window.matchMedia('(any-pointer: coarse)')
    const widthMq = window.matchMedia('(max-width: 1366px)')

    phoneMq.addEventListener('change', sync)
    touchMq.addEventListener('change', sync)
    coarseMq.addEventListener('change', sync)
    widthMq.addEventListener('change', sync)
    window.addEventListener('resize', sync)

    return () => {
      phoneMq.removeEventListener('change', sync)
      touchMq.removeEventListener('change', sync)
      coarseMq.removeEventListener('change', sync)
      widthMq.removeEventListener('change', sync)
      window.removeEventListener('resize', sync)
    }
  }, [])

  return mode
}

export default useGuessMapChromeMode
