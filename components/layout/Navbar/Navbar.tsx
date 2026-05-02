import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { FC, useState } from 'react'
import { PageBackLink } from '@components/PageBackLink'
import { GEOHUB_UPSTREAM_REPO_URL } from '@utils/constants/site'
import { Avatar, Button, Searchbar } from '@components/system'
import { SearchIcon } from '@heroicons/react/outline'
import { useAppSelector } from '../../../redux-utils'
import { AppLogo } from '../../AppLogo'
import { StyledNavbar } from './'

type NavbarProps = {
  backHref?: string
  backLabel?: string
}

const Navbar: FC<NavbarProps> = ({ backHref, backLabel }) => {
  const { data: session } = useSession()
  const user = useAppSelector((state) => state.user)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <StyledNavbar>
      {searchOpen && (
        <>
          <Searchbar autoFocus onClickOutside={() => setSearchOpen(false)} />
          <span className="cancelSearch" onClick={() => setSearchOpen(false)}>
            Cancel
          </span>
        </>
      )}

      {!searchOpen && (
        <>
          <div className="leftContainer">
            {backHref ? (
              <div className="navBackSlot">
                <PageBackLink href={backHref} label={backLabel ?? 'Back'} compact />
              </div>
            ) : null}
            <AppLogo />
          </div>

          <div className="middleContainer">
            <Searchbar />
          </div>

          <div className="rightContainer">
            <div className="rightWrapper">
              <a className="geoHubSource" href={GEOHUB_UPSTREAM_REPO_URL} target="_blank" rel="noreferrer">
                GeoHub code
              </a>
              <button className="mobile-search" onClick={() => setSearchOpen(true)}>
                <SearchIcon />
              </button>

              {session && user.id ? (
                <Link href={`/user/${user.id}`}>
                  <a className="userInfo">
                    <span className="username">{user.name}</span>
                    <Avatar type="user" src={user.avatar.emoji} backgroundColor={user.avatar.color} />
                  </a>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <a>
                      <Button variant="solidCustom" size="sm" backgroundColor="#3d3d3d" color="#fff" hoverColor="#444">
                        Log In
                      </Button>
                    </a>
                  </Link>

                  <Link href="/register">
                    <a>
                      <Button size="sm">Sign Up</Button>
                    </a>
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </StyledNavbar>
  )
}

export default Navbar
