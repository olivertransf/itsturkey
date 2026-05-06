/* eslint-disable @next/next/no-img-element */
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { CountItem } from '@components/Admin/Analytics/CountItem'
import { MapLeaderboard } from '@components/MapLeaderboard'
import { MapPreviewCard } from '@components/MapPreviewCard'
import { Meta } from '@components/Meta'
import { AvatarPickerModal } from '@components/modals'
import { SkeletonCards, SkeletonLeaderboard, SkeletonProfile } from '@components/skeletons'
import { Button, Tab, Tabs } from '@components/system'
import { TextWithLinks } from '@components/TextWithLinks'
import { UserSettingsPanel } from '@components/UserSettingsPanel'
import { VerifiedBadge } from '@components/VerifiedBadge'
import { CameraIcon, LightningBoltIcon } from '@heroicons/react/outline'
import { PencilAltIcon } from '@heroicons/react/solid'
import { useAppDispatch, useAppSelector } from '@redux/hook'
import { updateAvatar, updateBio, updateUsername } from '@redux/slices'
import StyledProfilePage from '@styles/ProfilePage.Styled'
import StyledSettingsPage from '@styles/SettingsPage.Styled'
import { SITE_NAME } from '@utils/constants/site'
import { MapType, UserGameHistoryType } from '@types'
import { USER_AVATAR_PATH } from '@utils/constants/random'
import { defaultQuickDuelBody } from '@utils/defaultQuickDuelBody'
import { formatLargeNumber, formatRoundTime, mailman, showToast } from '@utils/helpers'

import type { NextPage } from 'next'
type NewProfileValuesType = {
  name: string
  bio?: string
  avatar?: { emoji: string; color: string }
}

type UserStatsType = { label: string; data: number }[]
type ProfileTabsType = 'stats' | 'games' | 'maps' | 'friends' | 'settings'

type FriendRow = {
  id: string
  name: string
  friendCode?: string
}
type UserGamesPaginationType = { page: number; hasMore: boolean }

type PersonalBestRow = {
  leaderboardKey: string
  label: string
  totalPoints: number
  totalTime: number
  gameId: string
  mapPageId: string
}

const ProfilePage: NextPage = () => {
  const [userDetails, setUserDetails] = useState<any>()
  const [userStats, setUserStats] = useState<UserStatsType>()
  const [userGames, setUserGames] = useState<UserGameHistoryType[] | null>(null)
  const [userGamesPagination, setUserGamesPagination] = useState<UserGamesPaginationType>({ page: 0, hasMore: true })
  const [userMaps, setUserMaps] = useState<MapType[]>()
  const [newProfileValues, setNewProfileValues] = useState<NewProfileValuesType>()
  const [selectedTab, setSelectedTab] = useState<ProfileTabsType>('stats')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [personalBests, setPersonalBests] = useState<PersonalBestRow[]>([])
  const [friendsList, setFriendsList] = useState<FriendRow[] | null>(null)
  const [friendsLoading, setFriendsLoading] = useState(false)
  const [inviteBusyFriendId, setInviteBusyFriendId] = useState<string | null>(null)

  const user = useAppSelector((state) => state.user)
  const router = useRouter()
  const userId = router.query.id
  const dispatch = useAppDispatch()
  const { data: session } = useSession()

  useEffect(() => {
    if (!userId) {
      return
    }

    getUserDetails()
  }, [userId])

  useEffect(() => {
    if (!userId) {
      return
    }

    ;(async () => {
      const res = await mailman(`scores/user/${userId}/bests`)
      if (Array.isArray(res)) {
        setPersonalBests(res as PersonalBestRow[])
      }
    })()
  }, [userId])

  useEffect(() => {
    if (selectedTab === 'stats' && !userStats) {
      getUserStats()
    }

    if (selectedTab === 'games' && !userGames) {
      getUserGames()
    }

    if (selectedTab === 'maps' && !userMaps) {
      getUserMaps()
    }
  }, [selectedTab])

  useEffect(() => {
    setFriendsList(null)
  }, [userId])

  useEffect(() => {
    if (selectedTab !== 'friends' || !session?.user?.id || session.user.id !== userId) return

    let cancelled = false
    const loadFriends = async () => {
      setFriendsLoading(true)
      const res = await mailman('users/friends')
      if (cancelled) return
      setFriendsLoading(false)
      if (res?.error) {
        showToast('error', res.error.message)
        return
      }
      if (Array.isArray(res)) {
        setFriendsList(res as FriendRow[])
      }
    }
    void loadFriends()
    return () => {
      cancelled = true
    }
  }, [selectedTab, userId, session?.user?.id])

  const getUserDetails = async () => {
    const res = await mailman(`users/${userId}`)

    setUserDetails(res)
    setNewProfileValues({ name: res.name, bio: res.bio, avatar: user.avatar })
    setLoading(false)
  }

  const getUserGames = async () => {
    const res = await mailman(`scores/user/${userId}?page=${userGamesPagination.page}`)

    if (res.error || !res.data) return

    setUserGames((prev) => [...(prev || []), ...res.data])

    setUserGamesPagination({
      page: userGamesPagination.page + 1,
      hasMore: res.hasMore,
    })
  }

  const getUserMaps = async () => {
    const res = await mailman(`maps/custom?userId=${userId}`)

    if (res.error) {
      return showToast('error', res.error.message)
    }

    setUserMaps(res)
  }

  const getUserStats = async () => {
    const res = await mailman(`users/stats?userId=${userId}`)

    if (res.error) {
      return showToast('error', res.error.message)
    }

    setUserStats(res)
  }

  const isThisUsersProfile = () => {
    return !!session?.user?.id && session.user.id === userId
  }

  const inviteFriendToDuel = async (friend: FriendRow) => {
    if (!session?.user?.id) {
      showToast('error', 'Sign in to host a duel invite')
      void router.push(`/login?callbackUrl=${encodeURIComponent(`/user/${String(userId)}`)}`)
      return
    }

    setInviteBusyFriendId(friend.id)
    const res = await mailman('duels', 'POST', JSON.stringify(defaultQuickDuelBody()))
    setInviteBusyFriendId(null)

    if (res?.error) {
      showToast('error', res.error.message)
      return
    }

    const shortCode = typeof res.shortCode === 'string' ? res.shortCode.trim() : ''
    const fallbackId = res._id != null ? String(res._id) : ''
    const inviteSegment = shortCode || fallbackId
    if (!inviteSegment) {
      showToast('error', 'Could not create duel — try again')
      return
    }

    const url = `${window.location.origin}/duel/${encodeURIComponent(inviteSegment)}`
    try {
      await navigator.clipboard.writeText(url)
      showToast('success', `Invite link copied — send it to ${friend.name}`)
    } catch {
      showToast('success', 'Duel room ready — share the URL from the address bar')
    }

    await router.push(`/duel/${inviteSegment}`)
  }

  const setNewUserDetails = (changedValues: any) => {
    setNewProfileValues({ ...newProfileValues, ...changedValues })
  }

  const updateUserInfo = async () => {
    const res = await mailman('users/update', 'POST', JSON.stringify({ _id: user.id, ...newProfileValues }))

    if (res.error) {
      return showToast('error', res.error.message)
    }

    dispatch(updateBio(newProfileValues?.bio))
    dispatch(updateUsername(newProfileValues?.name))
    dispatch(updateAvatar(newProfileValues?.avatar))

    setUserDetails({
      ...userDetails,
      name: newProfileValues?.name,
      bio: newProfileValues?.bio,
      avatar: newProfileValues?.avatar,
    })

    setIsEditing(false)
  }

  const cancelEditing = () => {
    setNewProfileValues({ name: userDetails.name, bio: userDetails.bio, avatar: userDetails.avatar })
    setIsEditing(false)
  }

  return (
    <StyledProfilePage isEditing={isEditing}>
      <Meta title={userDetails ? `${userDetails.name} — ${SITE_NAME}` : SITE_NAME} />

      {loading || !userStats ? (
        <SkeletonProfile />
      ) : (
        <div>
          <div className="profile-details">
            <div className="profile-heading">
              <div className="avatar-wrapper">
                {isEditing ? (
                  <button
                    className="profile-avatar"
                    style={{ backgroundColor: newProfileValues?.avatar?.color }}
                    onClick={() => setAvatarModalOpen(true)}
                  >
                    <Image
                      src={`${USER_AVATAR_PATH}/${newProfileValues?.avatar?.emoji}.svg`}
                      alt=""
                      layout="fill"
                      className="emoji"
                    />
                    <div className="profile-avatar-editing-icon">
                      <CameraIcon />
                    </div>
                  </button>
                ) : (
                  <div className="profile-avatar" style={{ backgroundColor: userDetails.avatar?.color }}>
                    <Image
                      src={`${USER_AVATAR_PATH}/${userDetails.avatar?.emoji}.svg`}
                      alt=""
                      layout="fill"
                      className="emoji"
                    />
                  </div>
                )}

                {isThisUsersProfile() && !isEditing && (
                  <div className="profile-actions">
                    <Button variant="solidGray" onClick={() => setIsEditing(true)}>
                      <PencilAltIcon /> Edit Profile
                    </Button>
                  </div>
                )}

                {isThisUsersProfile() && isEditing && (
                  <div className="profile-actions">
                    <Button variant="solidGray" onClick={() => updateUserInfo()}>
                      Save Changes
                    </Button>
                    <Button variant="destroy" className="cancel-btn" onClick={() => cancelEditing()}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <h1 className="profile-name">
                {isEditing ? (
                  <input
                    type="text"
                    value={newProfileValues?.name}
                    onChange={(e) =>
                      setNewProfileValues({
                        name: e.target.value,
                        bio: newProfileValues?.bio,
                        avatar: newProfileValues?.avatar,
                      })
                    }
                    maxLength={30}
                  />
                ) : (
                  <div className="name-container">
                    <div className="name-wrapper">
                      <span className="name">{userDetails.name}</span>
                    </div>
                    {userDetails.isAdmin && <VerifiedBadge />}
                  </div>
                )}
              </h1>

              {(userDetails.bio || isEditing) && (
                <span className="profile-bio">
                  {isEditing ? (
                    <textarea
                      value={newProfileValues?.bio}
                      onChange={(e) =>
                        setNewProfileValues({
                          name: newProfileValues?.name || '',
                          bio: e.target.value,
                          avatar: newProfileValues?.avatar,
                        })
                      }
                      maxLength={200}
                    ></textarea>
                  ) : (
                    <TextWithLinks>{userDetails.bio}</TextWithLinks>
                  )}
                </span>
              )}
            </div>

            <div className="profile-tabs">
              <Tabs>
                <Tab isActive={selectedTab === 'stats'} onClick={() => setSelectedTab('stats')}>
                  Stats
                </Tab>

                <Tab isActive={selectedTab === 'games'} onClick={() => setSelectedTab('games')}>
                  Games
                </Tab>

                <Tab isActive={selectedTab === 'maps'} onClick={() => setSelectedTab('maps')}>
                  Maps
                </Tab>

                {isThisUsersProfile() && session && (
                  <Tab isActive={selectedTab === 'friends'} onClick={() => setSelectedTab('friends')}>
                    Friends
                  </Tab>
                )}

                {isThisUsersProfile() && (
                  <Tab isActive={selectedTab === 'settings'} onClick={() => setSelectedTab('settings')}>
                    Settings
                  </Tab>
                )}
              </Tabs>
            </div>

            {selectedTab === 'stats' && userStats && (
              <>
                <div className="user-stats">
                  {userStats.map((statItem) => (
                    <CountItem key={statItem.label} title={statItem.label} count={statItem.data} />
                  ))}
                </div>

                {personalBests.length > 0 && (
                  <div className="personal-bests">
                    <h3 className="personal-bests-title">Personal bests (standard)</h3>
                    <ul className="personal-bests-list">
                      {personalBests.map((row) => (
                        <li key={row.leaderboardKey} className="personal-best-row">
                          <Link href={`/map/${encodeURIComponent(row.mapPageId)}`}>
                            <a>{row.label}</a>
                          </Link>
                          <span className="personal-best-meta">
                            {`${formatLargeNumber(row.totalPoints)} pts · ${formatRoundTime(row.totalTime)} · `}
                            <Link href={`/results/${row.gameId}`}>
                              <a className="personal-best-results">Results</a>
                            </Link>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {selectedTab === 'games' && (
              <>
                {userGames ? (
                  userGames.length ? (
                    <MapLeaderboard
                      removeHeader
                      leaderboard={userGames}
                      infiniteScrollCallback={getUserGames}
                      hasMore={userGamesPagination.hasMore}
                    />
                  ) : (
                    <span className="no-results-message">{userDetails.name} has not finished any games yet</span>
                  )
                ) : (
                  <SkeletonLeaderboard removeHeader />
                )}
              </>
            )}

            {selectedTab === 'maps' && (
              <>
                {userMaps ? (
                  userMaps.length ? (
                    <div className="user-maps">
                      {userMaps?.map((map, idx) => (
                        <MapPreviewCard key={idx} map={map} />
                      ))}
                    </div>
                  ) : (
                    <span className="no-results-message">{userDetails.name} has not created any maps yet</span>
                  )
                ) : (
                  <SkeletonCards numCards={2} />
                )}
              </>
            )}

            {selectedTab === 'settings' && isThisUsersProfile() && (
              <StyledSettingsPage className="profile-settings-embed">
                <UserSettingsPanel embedded />
              </StyledSettingsPage>
            )}

            {selectedTab === 'friends' && isThisUsersProfile() && session && (
              <div className="friends-panel">
                <p className="friends-hint">
                  Tap a name to view their profile. Duel invite creates an HP room (equitable country streak, default
                  rules) and copies the link. Add or remove friends in the Settings tab.
                </p>
                {friendsLoading && !friendsList ? (
                  <SkeletonCards numCards={3} />
                ) : friendsList && friendsList.length === 0 ? (
                  <span className="no-results-message">
                    No friends yet. Add people by friend code, email, or name in Settings.
                  </span>
                ) : (
                  <ul className="friends-list">
                    {(friendsList ?? []).map((friend) => (
                      <li key={friend.id} className="friend-row">
                        <div className="friend-info">
                          <Link href={`/user/${encodeURIComponent(friend.id)}`}>
                            <a>{friend.name}</a>
                          </Link>
                          {friend.friendCode ? (
                            <span className="friend-code">{friend.friendCode}</span>
                          ) : null}
                        </div>
                        <div className="friend-actions">
                          <Button
                            variant="primary"
                            style={{ padding: '0 12px' }}
                            disabled={inviteBusyFriendId === friend.id}
                            isLoading={inviteBusyFriendId === friend.id}
                            spinnerSize={18}
                            onClick={() => void inviteFriendToDuel(friend)}
                          >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <LightningBoltIcon style={{ width: 16, height: 16 }} />
                              Duel invite
                            </span>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <AvatarPickerModal
        isOpen={avatarModalOpen}
        closeModal={() => setAvatarModalOpen(false)}
        setNewUserDetails={setNewUserDetails}
      />
    </StyledProfilePage>
  )
}

// Fixes issue where state doesnt reset when navigating to same page
ProfilePage.getInitialProps = ({ query }) => ({
  userGames: null,
  leaderboardPage: 0,
  leaderboardHasMore: true,
  key: query.id,
})

export default ProfilePage
