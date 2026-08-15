import { locationFromGuessMapClick } from '@utils/helpers/guessMapClick'
import { multiPanelGuessMap } from '@utils/helpers/multiGuessMap'

test('keeps the guess map mounted after a panel has been active so later pins still work', () => {
  expect(
    multiPanelGuessMap({ isActive: true, playable: true, isPanelDone: false, hasBeenActive: true })
  ).toEqual({
    hideGuessMap: false,
    interactive: true,
  })

  expect(
    multiPanelGuessMap({ isActive: false, playable: true, isPanelDone: false, hasBeenActive: false })
  ).toEqual({
    hideGuessMap: true,
    interactive: false,
  })

  expect(
    multiPanelGuessMap({ isActive: false, playable: true, isPanelDone: false, hasBeenActive: true })
  ).toEqual({
    hideGuessMap: false,
    interactive: false,
  })

  expect(
    multiPanelGuessMap({ isActive: false, playable: false, isPanelDone: false, hasBeenActive: true })
  ).toEqual({
    hideGuessMap: false,
    interactive: false,
  })

  expect(
    multiPanelGuessMap({ isActive: false, playable: false, isPanelDone: true, hasBeenActive: true })
  ).toEqual({
    hideGuessMap: true,
    interactive: false,
  })
})

test('reads a pin from GoogleMapReact onClick or a Maps mouse event', () => {
  expect(locationFromGuessMapClick({ lat: 12.5, lng: -7.25 })).toEqual({ lat: 12.5, lng: -7.25 })
  expect(
    locationFromGuessMapClick({
      latLng: { lat: () => 40.1, lng: () => -74.2 },
    })
  ).toEqual({ lat: 40.1, lng: -74.2 })
  expect(locationFromGuessMapClick({})).toBeNull()
  expect(locationFromGuessMapClick({ lat: Number.NaN, lng: 0 })).toBeNull()
})
