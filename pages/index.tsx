import type { NextPage } from 'next'
import { CountryStreakCard } from '@components/CountryStreakCard'
import { HomeWorldCard } from '@components/HomeWorldCard'
import { Meta } from '@components/Meta'
import { MultiGuessrCard } from '@components/MultiGuessrCard'
import StyledHomePage from '@styles/HomePage.Styled'
import type { MapType } from '@types'
import { GEOHUB_UPSTREAM_REPO_URL, SITE_NAME } from '@utils/constants/site'
import { getHomeMapAccentColor } from '@utils/helpers/homeMapAccent'

const parseHomeMapCards = (): Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>[] | null => {
  const raw = process.env.NEXT_PUBLIC_HOME_MAP_CARDS

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return null
    }

    return parsed
      .map((item) => {
        if (!item || typeof item !== 'object') return null

        const rec = item as Record<string, unknown>
        const _id = rec._id
        const name = rec.name
        const previewImg = rec.previewImg

        if (typeof _id !== 'string' || typeof name !== 'string' || typeof previewImg !== 'string') {
          return null
        }

        const description = typeof rec.description === 'string' ? rec.description : ''

        return { _id, name, description, previewImg }
      })
      .filter(Boolean) as Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>[]
  } catch {
    return null
  }
}

const getHomeMaps = (): Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>[] => {
  const fromEnv = parseHomeMapCards()
  return fromEnv && fromEnv.length > 0 ? fromEnv : []
}

const Home: NextPage = () => {
  const homeMaps = getHomeMaps()

  return (
    <StyledHomePage>
      <Meta title={SITE_NAME} />

      <div className="main-content">
        <div className="home-stack">
          <header className="home-hero">
            <h1 className="site-title">{SITE_NAME}</h1>
            <p className="site-tagline">Street View guessing: maps, country streaks, or four boards at once.</p>
          </header>

          <section className="home-section">
            <h2 className="section-title">Gamemodes</h2>
            <div className="card-grid">
              <CountryStreakCard />
              <MultiGuessrCard />
            </div>
          </section>

          <section className="home-section">
            <h2 className="section-title">Maps</h2>
            <div className="card-grid">
              {homeMaps.map((map) => (
                <HomeWorldCard
                  key={String(map._id)}
                  mapId={String(map._id)}
                  name={map.name}
                  description={map.description}
                  accentColor={getHomeMapAccentColor(map.name)}
                />
              ))}
            </div>
          </section>

          {homeMaps.length === 0 && (
            <div className="home-empty">
              No homepage maps configured. Set <code>NEXT_PUBLIC_HOME_MAP_CARDS</code> to a JSON array of maps (one
              entry per card). Example after{' '}
              <code>npm run maps:split-equitable</code>: paste the printed JSON into <code>.env</code>.
            </div>
          )}

          <footer className="home-footer">
            <p className="home-footer-note">
              Uses open-source code from{' '}
              <a href={GEOHUB_UPSTREAM_REPO_URL} target="_blank" rel="noreferrer">
                GeoHub
              </a>
              . APIs and hosting for this site are separate.
            </p>
          </footer>
        </div>
      </div>
    </StyledHomePage>
  )
}

export default Home
