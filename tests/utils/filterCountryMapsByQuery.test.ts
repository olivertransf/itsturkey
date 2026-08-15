import { filterCountryMapsByQuery } from '@utils/helpers/filterCountryMapsByQuery'

const maps = [
  { _id: 'eqcountry-us', name: 'United States' },
  { _id: 'eqcountry-gb', name: 'United Kingdom' },
  { _id: 'eqcountry-fr', name: 'France' },
]

test('filters country maps by name or ISO code', () => {
  expect(filterCountryMapsByQuery(maps, '').map((m) => m._id)).toEqual([
    'eqcountry-us',
    'eqcountry-gb',
    'eqcountry-fr',
  ])
  expect(filterCountryMapsByQuery(maps, '  united  ').map((m) => m.name)).toEqual([
    'United States',
    'United Kingdom',
  ])
  expect(filterCountryMapsByQuery(maps, 'FR').map((m) => m._id)).toEqual(['eqcountry-fr'])
  expect(filterCountryMapsByQuery(maps, 'zzz')).toEqual([])
})
