import { useSession } from 'next-auth/react'
import type { NextPage } from 'next'
import Link from 'next/link'
import { useMemo } from 'react'
import { GlobeAltIcon, LightningBoltIcon, ViewGridIcon } from '@heroicons/react/outline'
import HomeEquitableContinentGrid from '@components/HomeEquitableContinentGrid'
import HomeEquitableCountryGrid from '@components/HomeEquitableCountryGrid'
import { HomeFriendsCard } from '@components/HomeFriendsCard'
import { HomeModeTile } from '@components/HomeModeTile'
import { HomeOngoingCard } from '@components/HomeOngoingCard'
import { HomeProfileCard } from '@components/HomeProfileCard'
import { HomeUserStats } from '@components/HomeUserStats'
import { MapPreviewCard } from '@components/MapPreviewCard'
import { Meta } from '@components/Meta'
import { Button } from '@components/system'
import StyledHomePage from '@styles/HomePage.Styled'
import type { MapType } from '@types'
import { OFFICIAL_WORLD_ID } from '@utils/constants/random'
import { GEOHUB_UPSTREAM_REPO_URL, SITE_NAME } from '@utils/constants/site'

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
  const { data: session } = useSession()
  const homeMaps = getHomeMaps()
  const showFriendsRail = Boolean(session?.user?.id)

  const featured = useMemo(() => {
    const official = homeMaps.find((m) => String(m._id) === OFFICIAL_WORLD_ID)
    return official ?? homeMaps[0] ?? null
  }, [homeMaps])

  const otherMaps = useMemo(
    () => homeMaps.filter((m) => !featured || String(m._id) !== String(featured._id)),
    [homeMaps, featured]
  )

  return (
    <StyledHomePage>
      <Meta title={SITE_NAME} />

      <div className="main-content">
        <div className={`home-shell${showFriendsRail ? ' home-shell--with-friends' : ''}`}>
          <header className="home-topbar">
            <Link href="/" className="home-wordmark">
              {SITE_NAME}
            </Link>
            <div className="home-topbar-end">
              {showFriendsRail ? (
                <a className="home-online-jump" href="#home-friends">
                  Friends
                </a>
              ) : null}
              {!session?.user?.id ? (
                <>
                  <Link href="/login">
                    <Button variant="solidGray" size="sm">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </>
              ) : null}
            </div>
          </header>

          <div className="home-body">
            <div className="home-main">
              {showFriendsRail ? <HomeOngoingCard /> : null}

              <section className="home-section">
                <h2 className="section-title">Play</h2>
                <div className="mode-grid">
                  <HomeModeTile
                    accent="streak"
                    title="Country Streak"
                    description="Keep naming countries until you miss."
                    icon={<GlobeAltIcon />}
                  >
                    <Link href="/streak" className="mode-play">
                      Play
                    </Link>
                  </HomeModeTile>
                  <HomeModeTile
                    accent="multi"
                    title="MultiGuessr"
                    description="Several Street Views at once. One map guess each."
                    icon={<ViewGridIcon />}
                  >
                    <Link href="/multi" className="mode-play">
                      Play
                    </Link>
                  </HomeModeTile>
                  <HomeModeTile
                    accent="duel"
                    title="Duels"
                    description="1v1 on the same locations. Invite a friend or join a code."
                    icon={<LightningBoltIcon />}
                  >
                    <Link href="/duel" className="mode-play">
                      Create
                    </Link>
                    <Link href="/duel/join" className="mode-secondary">
                      Join
                    </Link>
                  </HomeModeTile>
                </div>
              </section>

              <section className="home-section">
                <h2 className="section-title">Maps</h2>
                {featured ? (
                  <div className="home-featured-map">
                    <MapPreviewCard map={featured} showDescription type="large" />
                  </div>
                ) : (
                  <p className="home-empty-quiet">No featured maps yet. Browse by country below.</p>
                )}
                {otherMaps.length > 0 ? (
                  <div className="card-grid">
                    {otherMaps.map((map) => (
                      <MapPreviewCard key={String(map._id)} map={map} type="large" />
                    ))}
                  </div>
                ) : null}
              </section>

              <section className="home-section" id="equitable-by-country">
                <h2 className="section-title">By country</h2>
                <HomeEquitableCountryGrid variant="spotlight" />
              </section>

              <section className="home-section" id="equitable-by-continent">
                <h2 className="section-title">By continent</h2>
                <HomeEquitableContinentGrid />
              </section>

              <div className="home-geo-cta-row">
                <Link href="/maps" className="home-geo-cta">
                  Browse all maps
                </Link>
              </div>

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

            {showFriendsRail ? (
              <aside className="home-friends-rail" id="home-friends" aria-label="Profile, friends, and stats">
                <HomeProfileCard />
                <HomeFriendsCard />
                <HomeUserStats />
              </aside>
            ) : null}
          </div>
        </div>
      </div>
    </StyledHomePage>
  )
}

export default Home
