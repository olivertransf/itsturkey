import { SearchIcon } from '@heroicons/react/outline'
import { CheckIcon } from '@heroicons/react/solid'
import Image from 'next/image'
import { FC, useMemo, useState } from 'react'
import { isGenericMapPreview, mapNameInitials, resolveMapImageSrc } from '@utils/helpers/mapPreviewSrc'
import type { MapPickerRow } from '@utils/loadMapPickerOptions'
import { parseEquitableCountryMapKey } from '@utils/helpers/equitableCountryMapId'
import { flagEmojiFromIsoAlpha2 } from '@utils/helpers/flagEmoji'
import {
  CheckWrap,
  ColumnList,
  LeadFlag,
  LeadInitials,
  LeadMedia,
  LoadingHint,
  MapRow,
  PickerRoot,
  RowDesc,
  RowTitle,
  ScrollRegion,
  SearchWrap,
  TextCol,
} from './MapPickerGrid.Styled'

type Props = {
  options: MapPickerRow[]
  value: string
  onChange: (id: string) => void
  loading?: boolean
  maxHeight?: number
  emptyMessage?: string
  /** When false, only map titles show (denser rows). Default true. */
  showDescriptions?: boolean
  /** Search filter on map name. Default true. */
  showSearch?: boolean
  scrollClassName?: string
}

const MapPickerGrid: FC<Props> = ({
  options,
  value,
  onChange,
  loading,
  maxHeight = 260,
  emptyMessage = 'No maps available.',
  showDescriptions = true,
  showSearch = true,
  scrollClassName,
}) => {
  const [query, setQuery] = useState('')

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.name.toLowerCase().includes(q))
  }, [options, query])

  if (loading) {
    return <LoadingHint>Loading maps…</LoadingHint>
  }

  if (!options.length) {
    return <LoadingHint>{emptyMessage}</LoadingHint>
  }

  return (
    <PickerRoot>
      {showSearch ? (
        <SearchWrap>
          <div className="search-field">
            <SearchIcon className="search-icon" aria-hidden />
            <input
              type="search"
              className="map-picker-search"
              placeholder="Search maps…"
              aria-label="Search maps"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </SearchWrap>
      ) : null}
      <ScrollRegion $maxHeight={maxHeight} className={scrollClassName} role="group" aria-label="Choose map">
        <ColumnList>
          {filteredOptions.length === 0 ? (
            <LoadingHint>No maps match your search.</LoadingHint>
          ) : (
            filteredOptions.map((row) => {
              const id = String(row._id)
              const selected = id === String(value)
              const countryCode = parseEquitableCountryMapKey(id)
              const thumbSrc = resolveMapImageSrc(row.previewImg)
              const usePlaceholderArt = isGenericMapPreview(row.previewImg)
              const descRaw = row.description?.trim()
              const desc = showDescriptions ? descRaw : undefined

              return (
                <MapRow
                  key={id}
                  type="button"
                  aria-pressed={selected}
                  aria-label={descRaw && showDescriptions ? `${row.name}. ${descRaw}` : row.name}
                  $selected={selected}
                  $compact={!showDescriptions}
                  onClick={() => onChange(id)}
                >
                  {countryCode ? (
                    <LeadFlag title={row.name}>
                      <span aria-hidden>{flagEmojiFromIsoAlpha2(countryCode)}</span>
                    </LeadFlag>
                  ) : usePlaceholderArt ? (
                    <LeadInitials title={row.name}>
                      <span aria-hidden>{mapNameInitials(row.name)}</span>
                    </LeadInitials>
                  ) : (
                    <LeadMedia>
                      <Image
                        src={thumbSrc}
                        alt=""
                        width={28}
                        height={28}
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
            })
          )}
        </ColumnList>
      </ScrollRegion>
    </PickerRoot>
  )
}

export default MapPickerGrid
