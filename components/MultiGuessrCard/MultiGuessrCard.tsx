import { FC, useState } from 'react'
import { GameSettingsModal } from '@components/modals'
import HomeSectionRowCard from '@components/HomeSectionRowCard'
import HomePlayGlyph from '@components/HomeSectionRowCard/HomePlayGlyph'
import { MapType } from '@types'
import officialMaps from '@utils/constants/officialMaps.json'

const ACCENT = '#22d3ee'

const defaultMap = officialMaps[0] as Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>

const MultiGuessrCard: FC = () => {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [modalKey, setModalKey] = useState(0)

  const openSettings = () => {
    setModalKey((k) => k + 1)
    setSettingsOpen(true)
  }

  return (
    <HomeSectionRowCard
      accentColor={ACCENT}
      title="MultiGuessr"
      description="Up to four Street View boards at once — combine every panel score into one run."
    >
      <button
        type="button"
        className="home-play-btn home-play-btn--icon"
        aria-label="Play MultiGuessr"
        onClick={openSettings}
      >
        <HomePlayGlyph />
      </button>

      <GameSettingsModal
        key={modalKey}
        isOpen={settingsOpen}
        closeModal={() => setSettingsOpen(false)}
        mapDetails={defaultMap}
        gameMode="standard"
        initialPlayMode="multi"
        allowHomeMapPicker
      />
    </HomeSectionRowCard>
  )
}

export default MultiGuessrCard
