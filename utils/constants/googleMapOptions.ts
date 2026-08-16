import Game from '@backend/models/game'
import type { GameSettingsType } from '@types'

// This is the best way I found to enable POIs
const showPOIs = [
  {
    featureType: 'all',
    elementType: 'labels',
    stylers: [
      {
        visibility: '#on',
      },
    ],
  },
]

export const GUESS_MAP_OPTIONS = {
  disableDefaultUI: true,
  clickableIcons: false,
  gestureHandling: 'greedy',
  minZoom: 1,
  draggableCursor: 'crosshair',
  styles: showPOIs,
}

export function isPanZoomEnabled(settings: Pick<GameSettingsType, 'canPan' | 'canZoom'>): boolean {
  return Boolean(settings.canPan || settings.canZoom)
}

export const getGuessMapOptions = (_gameSettings?: Pick<GameSettingsType, 'canPan' | 'canZoom'>) => {
  // Guess-map pan/zoom is always on (including NMPZ). Street View restrictions
  // only apply via getStreetviewOptions / interaction blockers.
  return {
    ...GUESS_MAP_OPTIONS,
    draggable: true,
    gestureHandling: 'greedy' as const,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    keyboardShortcuts: false,
  }
}

export const RESULT_MAP_OPTIONS = {
  disableDefaultUI: true,
  clickableIcons: false,
  gestureHandling: 'greedy',
  minZoom: 2,
  styles: showPOIs,
}

export const SELECTION_MAP_OPTIONS = {
  zoom: 2,
  minZoom: 2,
  center: { lat: 0, lng: 0 },
  disableDefaultUI: true,
  clickableIcons: false,
  gestureHandling: 'greedy',
  draggableCursor: 'crosshair',
  disableDoubleClickZoom: true,
  styles: showPOIs,
}

export const PREVIEW_MAP_OPTIONS = {
  addressControl: false,
  panControl: true,
  panControlOptions: {
    position: 9,
  },
  enableCloseButton: false,
  zoomControl: false,
  showRoadLabels: false,
  motionTracking: false,
  motionTrackingControl: false,
}

export const getStreetviewOptions = (gameData: Game) => {
  const canPan = Boolean(gameData.gameSettings.canPan)
  const canZoom = Boolean(gameData.gameSettings.canZoom)

  return {
    addressControl: false,
    panControl: canPan,
    panControlOptions: {
      position: google.maps.ControlPosition?.LEFT_BOTTOM ?? 6,
    },
    motionTracking: false,
    motionTrackingControl: false,
    enableCloseButton: false,
    zoomControl: false,
    fullscreenControl: false,
    showRoadLabels: false,
    clickToGo: gameData.gameSettings.canMove,
    scrollwheel: canZoom,
    linksControl: gameData.gameSettings.canMove,
  }
}
