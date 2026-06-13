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
  if (settings.canPan === settings.canZoom) return settings.canPan
  return settings.canPan || settings.canZoom
}

export const getGuessMapOptions = (gameSettings: Pick<GameSettingsType, 'canPan' | 'canZoom'>) => {
  const panEnabled = isPanZoomEnabled(gameSettings)

  return {
    ...GUESS_MAP_OPTIONS,
    gestureHandling: panEnabled ? 'greedy' : 'none',
    scrollwheel: panEnabled,
    disableDoubleClickZoom: !panEnabled,
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
  return {
    addressControl: false, // hide address
    panControl: true, // compass
    panControlOptions: {
      position: google.maps.ControlPosition.LEFT_BOTTOM,
    }, // compass position
    motionTracking: false, // mobile tracking
    motionTrackingControl: false, // hide default UI elements
    enableCloseButton: false, // hide default UI elements
    zoomControl: false, // hide default UI elements
    fullscreenControl: false, // hide default UI elements
    showRoadLabels: false, // hide road labels
    clickToGo: gameData.gameSettings.canMove, // move on click
    scrollwheel: isPanZoomEnabled(gameData.gameSettings), // pan toggle controls scroll zoom
    linksControl: gameData.gameSettings.canMove, // arrows to move
  }
}
