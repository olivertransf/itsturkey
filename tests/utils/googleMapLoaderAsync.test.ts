import {
  assignMissingMapsExports,
  mapsApiMissing,
  mapsApiReady,
  streetViewApiReady,
  triggerMapsEvent,
} from '@utils/helpers/googleMapLoaderAsync'

const addListener = () => ({ remove: () => undefined })
const trigger = jest.fn()
const OverlayView = function OverlayView() {}
const LatLng = function LatLng() {}
const Map = function Map() {}
const StreetViewPanorama = function StreetViewPanorama() {}
const StreetViewService = function StreetViewService() {}

const readyCore = {
  LatLng,
  Map,
  OverlayView,
  StreetViewPanorama,
  StreetViewService,
  event: { addListener, trigger },
}

describe('assignMissingMapsExports', () => {
  test('copies event.addListener from importLibrary core onto google.maps', () => {
    const maps: Record<string, unknown> = { LatLng, Map }

    assignMissingMapsExports(maps, {
      event: { addListener, trigger },
    })

    expect(typeof (maps.event as { addListener?: unknown })?.addListener).toBe('function')
    expect(typeof (maps.event as { trigger?: unknown })?.trigger).toBe('function')
  })

  test('replaces a stub event namespace that has no addListener', () => {
    const maps = {
      event: {} as { addListener?: typeof addListener },
    }

    assignMissingMapsExports(maps, {
      event: { addListener, trigger },
    })

    expect(maps.event.addListener).toBe(addListener)
  })

  test('copies ControlPosition and OverlayView from core/maps libraries', () => {
    const maps: Record<string, unknown> = {}

    assignMissingMapsExports(maps, {
      OverlayView,
      ControlPosition: { LEFT_BOTTOM: 6 },
    })

    expect(maps.OverlayView).toBe(OverlayView)
    expect((maps.ControlPosition as { LEFT_BOTTOM: number }).LEFT_BOTTOM).toBe(6)
  })

  test('treats a callable event namespace with addListener as ready', () => {
    const eventFn = function event() {} as { addListener?: typeof addListener; trigger?: typeof trigger } & (() => void)
    eventFn.addListener = addListener
    eventFn.trigger = trigger

    const maps: Record<string, unknown> = { LatLng, Map, OverlayView }
    assignMissingMapsExports(maps, { event: eventFn })

    expect(mapsApiReady(maps as typeof google.maps)).toBe(true)
  })
})

describe('mapsApiReady', () => {
  test('is true once LatLng, Map, OverlayView, and event exist (Street View optional)', () => {
    const maps: Record<string, unknown> = { LatLng, Map }

    expect(mapsApiReady(maps as typeof google.maps)).toBe(false)

    assignMissingMapsExports(maps, {
      OverlayView,
      event: { addListener, trigger },
    })

    expect(mapsApiReady(maps as typeof google.maps)).toBe(true)
  })

  test('mapsApiMissing names the constructors that are still stubs', () => {
    const maps: Record<string, unknown> = { LatLng, Map }

    expect(mapsApiMissing(maps as typeof google.maps)).toEqual(['OverlayView', 'event'])
  })
})

describe('streetViewApiReady', () => {
  test('is independent of the core maps constructors', () => {
    const maps: Record<string, unknown> = { LatLng, Map, OverlayView, event: { addListener, trigger } }

    expect(mapsApiReady(maps as typeof google.maps)).toBe(true)
    expect(streetViewApiReady(maps as typeof google.maps)).toBe(false)

    assignMissingMapsExports(maps, { StreetViewPanorama, StreetViewService })

    expect(streetViewApiReady(maps as typeof google.maps)).toBe(true)
  })
})

describe('triggerMapsEvent', () => {
  test('no-ops when google.maps.event.trigger is missing', () => {
    const prev = (global as { google?: unknown }).google
    ;(global as { google?: unknown }).google = { maps: {} }

    expect(() => triggerMapsEvent({ id: 1 }, 'resize')).not.toThrow()

    ;(global as { google?: unknown }).google = prev
  })

  test('calls trigger when the event namespace is hydrated', () => {
    const prev = (global as { google?: unknown }).google
    const triggerFn = jest.fn()
    const target = { id: 1 }
    ;(global as { google?: unknown }).google = {
      maps: { event: { trigger: triggerFn } },
    }

    triggerMapsEvent(target, 'resize')

    expect(triggerFn).toHaveBeenCalledWith(target, 'resize')
    ;(global as { google?: unknown }).google = prev
  })
})
