import { useSession } from 'next-auth/react'
import type { NextPage } from 'next'
import Link from 'next/link'
import { HomeFriendsCard } from '@components/HomeFriendsCard'
import { HomeModeTile } from '@components/HomeModeTile'
import { HomeOngoingCard } from '@components/HomeOngoingCard'
import { HomeProfileCard } from '@components/HomeProfileCard'
import { HomeUserStats } from '@components/HomeUserStats'
import { HomeWorldCard } from '@components/HomeWorldCard'
import { Meta } from '@components/Meta'
import StyledHomePage from '@styles/HomePage.Styled'
import type { MapType } from '@types'
import { GEOHUB_UPSTREAM_REPO_URL, SITE_NAME } from '@utils/constants/site'
import { parseHomeMapCards } from '@utils/helpers/homeMapCards'

const getHomeMaps = (): Pick<MapType, '_id' | 'name' | 'description' | 'previewImg'>[] =>
  parseHomeMapCards()
    .filter((card): card is typeof card & { previewImg: string } => typeof card.previewImg === 'string')
    .map((card) => ({
      _id: card._id,
      name: card.name,
      description: card.description ?? '',
      previewImg: card.previewImg,
    }))

const Home: NextPage = () => {
  const { data: session } = useSession()
  const homeMaps = getHomeMaps()
  const showFriendsRail = Boolean(session?.user?.id)

  return (
    <StyledHomePage>
      <Meta title={SITE_NAME} />

      <header className="home-hero">
        <h1 className="home-hero-title">itsturkey</h1>
      </header>

      <div className="main-content">
        <div className={`home-shell${showFriendsRail ? ' home-shell--with-friends' : ''}`}>
          <div className="home-body">
            <div className="home-main">
              {showFriendsRail ? <HomeOngoingCard /> : null}

              <section className="home-panel">
                <header className="home-panel-head">
                  <h2 className="home-panel-title">Play</h2>
                </header>
                <div className="home-play-grid">
                  <HomeModeTile title="Country streak" description="Name countries until you miss">
                    <Link href="/streak" className="mode-play">
                      Play
                    </Link>
                  </HomeModeTile>
                  <HomeModeTile title="MultiGuessr" description="Several panoramas, one pin each">
                    <Link href="/multi" className="mode-play">
                      Play
                    </Link>
                  </HomeModeTile>
                  <HomeModeTile title="Duels" description="Same locations, 1v1">
                    <Link href="/duel/join" className="mode-secondary">
                      Join
                    </Link>
                    <Link href="/duel" className="mode-play">
                      Play
                    </Link>
                  </HomeModeTile>
                </div>
              </section>

              <section className="home-panel">
                <header className="home-panel-head">
                  <h2 className="home-panel-title">Maps</h2>
                  <Link href="/maps" className="home-panel-link">
                    All maps
                  </Link>
                </header>
                {homeMaps.length > 0 ? (
                  <div className="home-maps-grid">
                    {homeMaps.map((map) => (
                      <HomeWorldCard key={String(map._id)} mapId={String(map._id)} name={map.name} />
                    ))}
                  </div>
                ) : (
                  <p className="home-empty-quiet">No featured maps yet.</p>
                )}
              </section>
            </div>

            {showFriendsRail ? (
              <aside className="home-friends-rail" id="home-friends" aria-label="Profile, friends, and stats">
                <HomeProfileCard />
                <HomeFriendsCard />
                <HomeUserStats />
              </aside>
            ) : null}
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
      </div>
    </StyledHomePage>
  )
}

export default Home
