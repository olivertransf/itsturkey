import { useSession } from 'next-auth/react'
import { FC, useEffect, useRef } from 'react'
import { useAppDispatch } from '@redux/hook'
import { logOutUser, updateMapsAPIKey, updateUser } from '@redux/slices'
import { mailman } from '@utils/helpers'

/** Hydrates Redux user from NextAuth after refresh so Navbar/profile stay in sync with the session cookie. */
const SessionSync: FC = () => {
  const { data: session, status } = useSession()
  const dispatch = useAppDispatch()
  const fetchedKeyRef = useRef(false)

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

    if (session.user.mapsAPIKey || fetchedKeyRef.current) {
      return
    }

    fetchedKeyRef.current = true
    void mailman('users/settings').then((res) => {
      if (!res || typeof res !== 'object' || Array.isArray(res)) return
      if ('error' in res && (res as { error?: unknown }).error) return
      const key = typeof (res as { mapsAPIKey?: unknown }).mapsAPIKey === 'string' ? res.mapsAPIKey : ''
      if (key) dispatch(updateMapsAPIKey(key))
    })
  }, [status, session, dispatch])

  useEffect(() => {
    if (status !== 'unauthenticated') {
      return
    }
    fetchedKeyRef.current = false
    dispatch(logOutUser())
  }, [status, dispatch])

  return null
}

export default SessionSync
