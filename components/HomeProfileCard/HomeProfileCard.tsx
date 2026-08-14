import Link from 'next/link'
import { FC } from 'react'
import { useSession } from 'next-auth/react'
import { Avatar } from '@components/system'
import StyledHomeProfileCard from './HomeProfileCard.Styled'

const FALLBACK_AVATAR = { emoji: '1f3b1', color: '#fecaca' }

const HomeProfileCard: FC = () => {
  const { data: session, status } = useSession()
  const user = session?.user
  const userId = user?.id
  const isAuthed = status === 'authenticated' && Boolean(userId)

  if (!isAuthed || !userId) return null

  const avatar = user.avatar ?? FALLBACK_AVATAR
  const name = user.name?.trim() || 'Profile'
  const href = `/user/${encodeURIComponent(String(userId))}`

  return (
    <StyledHomeProfileCard>
      <div className="profile-card-head">
        <h3 className="profile-card-title">Profile</h3>
        <Link href={href} className="profile-card-link">
          View
        </Link>
      </div>
      <div className="profile-card-body">
        <Avatar type="user" src={avatar.emoji} backgroundColor={avatar.color} size={44} />
        <div className="profile-card-copy">
          <span className="profile-card-name">{name}</span>
        </div>
      </div>
    </StyledHomeProfileCard>
  )
}

export default HomeProfileCard
