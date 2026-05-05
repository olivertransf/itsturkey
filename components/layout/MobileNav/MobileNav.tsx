import { useSession } from 'next-auth/react'
import { FC } from 'react'
import { Item } from '@components/layout'
import {
  GlobeAltIcon,
  HeartIcon,
  HomeIcon,
  LightningBoltIcon,
  LocationMarkerIcon,
  MapIcon,
  UserCircleIcon,
  ViewGridIcon,
} from '@heroicons/react/outline'
import { StyledMobileNav } from './'

const MobileNav: FC = () => {
  const { data: session } = useSession()

  return (
    <StyledMobileNav>
      <Item text="Home" icon={<HomeIcon />} route="/" />

      <Item text="Find Maps" icon={<ViewGridIcon />} route="/maps" />

      <Item text="My Maps" icon={<MapIcon />} route="/my-maps" />

      <Item text="Liked Maps" icon={<HeartIcon />} route="/liked" />

      <Item text="Country Streaks" icon={<LightningBoltIcon />} route="/streaks" />

      <Item text="Equitable World" icon={<GlobeAltIcon />} route="/equitable-streaks" />

      <Item text="Daily Challenge" icon={<LocationMarkerIcon />} route="/daily-challenge" />

      {session?.user?.id ? (
        <Item text="Profile" icon={<UserCircleIcon />} route={`/user/${session.user.id}`} />
      ) : (
        <Item text="Log In" icon={<UserCircleIcon />} route="/login" />
      )}
    </StyledMobileNav>
  )
}

export default MobileNav
