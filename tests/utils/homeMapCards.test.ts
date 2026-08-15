import { OFFICIAL_WORLD_ID } from '@utils/constants/random'
import { getHomeDefaultWorldMapId, resolveStandardMapIdForLocations } from '@utils/helpers/homeMapCards'

const HOME_CARDS = JSON.stringify([
  {
    _id: '69f55bd324e506f5968b932f',
    name: 'Default World',
    description: '~99,907 locations',
    previewImg: 'custom-map.svg',
  },
  {
    _id: '69f55b314abcf00fad9b602d',
    name: 'Equitable World',
    description: '~124,879 locations',
    previewImg: 'custom-map.svg',
  },
])

test('uses the home Default World card instead of the legacy GeoHub world id', () => {
  expect(getHomeDefaultWorldMapId(HOME_CARDS)).toBe('69f55bd324e506f5968b932f')
})

test('falls back to the official world id when home cards are missing', () => {
  expect(getHomeDefaultWorldMapId('')).toBe(OFFICIAL_WORLD_ID)
  expect(getHomeDefaultWorldMapId('[]')).toBe(OFFICIAL_WORLD_ID)
  expect(getHomeDefaultWorldMapId('not-json')).toBe(OFFICIAL_WORLD_ID)
})

test('remaps legacy official world requests onto the home Default World map', () => {
  expect(resolveStandardMapIdForLocations(OFFICIAL_WORLD_ID, HOME_CARDS)).toBe('69f55bd324e506f5968b932f')
  expect(resolveStandardMapIdForLocations('69f55bd324e506f5968b932f', HOME_CARDS)).toBe(
    '69f55bd324e506f5968b932f'
  )
})
