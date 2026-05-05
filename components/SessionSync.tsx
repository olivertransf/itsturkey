import { useSession } from 'next-auth/react'
import { FC, useEffect } from 'react'
import { useAppDispatch } from '@redux/hook'
import { logOutUser, updateUser } from '@redux/slices'

/** Hydrates Redux user from NextAuth after refresh so Navbar/profile stay in sync with the session cookie. */
const SessionSync: FC = () => {
  const { data: session, status } = useSession()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) {
      return
    }

    dispatch(
      updateUser({
        id: session.user.id,
        name: session.user.name || '',
        email: session.user.email || '',
        avatar: session.user.avatar ?? { emoji: '1f3b1', color: '#fecaca' },
        bio: session.user.bio,
        isAdmin: session.user.isAdmin,
        distanceUnit: session.user.distanceUnit,
        mapsAPIKey: session.user.mapsAPIKey,
      })
    )
  }, [status, session, dispatch])

  useEffect(() => {
    if (status !== 'unauthenticated') {
      return
    }
    dispatch(logOutUser())
  }, [status, dispatch])

  return null
}

export default SessionSync
