import { CheckIcon } from '@heroicons/react/solid'
import Image from 'next/image'
import { FC, useMemo } from 'react'
import { MAP_AVATAR_PATH } from '@utils/constants/random'
import type { MapPickerRow } from '@utils/loadMapPickerOptions'
import { equitableContinentAccentColor } from '@utils/helpers/equitableContinentAccent'
import { parseEquitableContinentMapKey } from '@utils/helpers/equitableContinentMapId'
import { equitableCountryAccentColor } from '@utils/helpers/equitableCountryAccent'
import { parseEquitableCountryMapKey } from '@utils/helpers/equitableCountryMapId'
import { flagEmojiFromIsoAlpha2 } from '@utils/helpers/flagEmoji'
import { getHomeMapAccentColor } from '@utils/helpers/homeMapAccent'
import {
  CheckWrap,
  ColumnList,
  LeadFlag,
  LeadMedia,
  LoadingHint,
  MapRow,
  RowDesc,
  RowTitle,
  ScrollRegion,
  TextCol,
} from './MapPickerGrid.Styled'

const FALLBACK_PREVIEW = 'custom-map.svg'

function rowAccent(mapId: string, name: string): string {
  const country = parseEquitableCountryMapKey(mapId)
  if (country) return equitableCountryAccentColor(country)

  const continent = parseEquitableContinentMapKey(mapId)
  if (continent) return equitableContinentAccentColor(continent)

  if (mapId === 'all') return '#22d3ee'

  return getHomeMapAccentColor(name)
}

type Props = {
  options: MapPickerRow[]
  value: string
  onChange: (id: string) => void
  loading?: boolean
  maxHeight?: number
  emptyMessage?: string
}

const MapPickerGrid: FC<Props> = ({
  options,
  value,
  onChange,
  loading,
  maxHeight = 260,
  emptyMessage = 'No maps available.',
}) => {
  const optionAccents = useMemo(() => {
    const m = new Map<string, string>()
    for (const o of options) {
      m.set(String(o._id), rowAccent(String(o._id), o.name))
    }
    return m
  }, [options])

  if (loading) {
    return <LoadingHint>Loading maps…</LoadingHint>
  }

  if (!options.length) {
    return <LoadingHint>{emptyMessage}</LoadingHint>
  }

  return (
    <ScrollRegion $maxHeight={maxHeight} role="group" aria-label="Choose map">
      <ColumnList>
        {options.map((row) => {
          const id = String(row._id)
          const selected = id === String(value)
          const accent = optionAccents.get(id) ?? getHomeMapAccentColor(row.name)
          const countryCode = parseEquitableCountryMapKey(id)
          const img = row.previewImg?.trim() ? row.previewImg : FALLBACK_PREVIEW
          const desc = row.description?.trim()

          return (
            <MapRow
              key={id}
              type="button"
              aria-pressed={selected}
              aria-label={desc ? `${row.name}. ${desc}` : row.name}
              $accent={accent}
              $selected={selected}
              onClick={() => onChange(id)}
            >
              {countryCode ? (
                <LeadFlag title={row.name}>
                  <span aria-hidden>{flagEmojiFromIsoAlpha2(countryCode)}</span>
                </LeadFlag>
              ) : (
                <LeadMedia>
                  <Image
                    src={`${MAP_AVATAR_PATH}/${img}`}
                    alt=""
                    width={40}
                    height={40}
                    style={{ objectFit: 'cover' }}
                  />
                </LeadMedia>
              )}
              <TextCol>
                <RowTitle>{row.name}</RowTitle>
                {desc ? <RowDesc>{desc}</RowDesc> : null}
              </TextCol>
              <CheckWrap aria-hidden>{selected ? <CheckIcon className="map-picker-check" /> : null}</CheckWrap>
            </MapRow>
          )
        })}
      </ColumnList>
    </ScrollRegion>
  )
}

export default MapPickerGrid
