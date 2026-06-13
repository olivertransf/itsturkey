import type { CSSProperties, KeyboardEvent } from 'react'
import { openStreetViewLocation } from '@utils/helpers/openStreetViewLocation'

type LocationCoords = { lat: number; lng: number }

export function streakFlagImgProps(location: LocationCoords | null | undefined): {
  role?: 'button'
  tabIndex?: number
  title?: string
  style?: CSSProperties
  onClick?: () => void
  onKeyDown?: (e: KeyboardEvent<HTMLImageElement>) => void
} {
  if (!location) return {}

  return {
    role: 'button',
    tabIndex: 0,
    title: 'Open location in Street View',
    style: { cursor: 'pointer' },
    onClick: () => openStreetViewLocation(location.lat, location.lng),
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        openStreetViewLocation(location.lat, location.lng)
      }
    },
  }
}
