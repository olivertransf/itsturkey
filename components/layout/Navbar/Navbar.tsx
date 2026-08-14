import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
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

const HUB_LINKS = [
  { href: '/', label: 'Play' },
  { href: '/maps', label: 'Maps' },
  { href: '/friends', label: 'Friends' },
] as const

const isHubActive = (pathname: string, href: string) => {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

const Navbar: FC<NavbarProps> = ({ backHref, backLabel }) => {
  const { data: session } = useSession()
  const user = useAppSelector((state) => state.user)
  const { pathname } = useRouter()
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
            <nav className="hubLinks" aria-label="Hub">
              {HUB_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`hubLink${isHubActive(pathname, link.href) ? ' is-active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
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
                <Link href={`/user/${user.id}`} className="userInfo">
                  <span className="username">{user.name}</span>
                  <Avatar type="user" src={user.avatar.emoji} backgroundColor={user.avatar.color} />
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="secondary" size="sm">
                      Log In
                    </Button>
                  </Link>

                  <Link href="/register">
                    <Button size="sm">Sign Up</Button>
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
