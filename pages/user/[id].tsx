/* eslint-disable @next/next/no-img-element */
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { GameHistoryList } from '@components/GameHistoryList'
import { HomeFriendsCard } from '@components/HomeFriendsCard'
import { Meta } from '@components/Meta'
import { PageBackLink } from '@components/PageBackLink'
import { PageHeader, WidthController } from '@components/layout'
import { AvatarPickerModal } from '@components/modals'
import { SkeletonLeaderboard, SkeletonProfile } from '@components/skeletons'
import { Button, Tab, Tabs } from '@components/system'
import { TextWithLinks } from '@components/TextWithLinks'
import { UserSettingsPanel } from '@components/UserSettingsPanel'
import { VerifiedBadge } from '@components/VerifiedBadge'
import { CameraIcon, UserAddIcon } from '@heroicons/react/outline'
import { PencilAltIcon } from '@heroicons/react/solid'
import { useAppDispatch, useAppSelector } from '@redux/hook'
import { updateAvatar, updateBio, updateUsername } from '@redux/slices'
import StyledProfilePage from '@styles/ProfilePage.Styled'
import StyledSettingsPage from '@styles/SettingsPage.Styled'
import { SITE_NAME } from '@utils/constants/site'
import { UserGameHistoryType } from '@types'
import { USER_AVATAR_PATH } from '@utils/constants/random'
import { formatLargeNumber, formatRoundTime, mailman, showToast } from '@utils/helpers'

import type { NextPage } from 'next'
type NewProfileValuesType = {
  name: string
  bio?: string
  avatar?: { emoji: string; color: string }
}

type UserStatsType = { label: string; data: number }[]
type ProfileTabsType = 'stats' | 'games' | 'friends' | 'settings'

const STAT_GROUPS: { title: string; labels: string[] }[] = [
  {
    title: 'Standard',
    labels: ['Games finished', 'Best score (pts)', 'Average score (pts)', 'Last 5 average (pts)'],
  },
  { title: 'Precision', labels: ['5k guesses', '5k rate (%)', 'Average miss (km)'] },
  { title: 'Streaks', labels: ['Streaks finished', 'Best streak (countries)'] },
  { title: 'Duels', labels: ['Duels finished', 'Duel wins', 'Duel win rate (%)'] },
  { title: 'Daily', labels: ['Daily challenge wins'] },
]

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
  const [newProfileValues, setNewProfileValues] = useState<NewProfileValuesType>()
  const [selectedTab, setSelectedTab] = useState<ProfileTabsType>('stats')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [personalBests, setPersonalBests] = useState<PersonalBestRow[]>([])
  const [isFriendWithProfile, setIsFriendWithProfile] = useState<boolean | null>(null)
  const [addFriendBusy, setAddFriendBusy] = useState(false)

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
  }, [selectedTab])

  useEffect(() => {
    setIsFriendWithProfile(null)
  }, [userId])

  useEffect(() => {
    if (!session?.user?.id || !userId || session.user.id === userId) return

    void mailman('users/friends').then((res) => {
      if (!Array.isArray(res)) return
      const rows = res as { id: string }[]
      setIsFriendWithProfile(rows.some((f) => f.id === String(userId)))
    })
  }, [session?.user?.id, userId])

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

  const addProfileAsFriend = async () => {
    if (!session?.user?.id || !userId) {
      showToast('error', 'Sign in to add friends')
      void router.push(`/login?callbackUrl=${encodeURIComponent(`/user/${String(userId)}`)}`)
      return
    }

    const code = typeof userDetails?.friendCode === 'string' ? userDetails.friendCode.trim() : ''
    const identifier = code || (typeof userDetails?.name === 'string' ? userDetails.name.trim() : '')
    if (!identifier) {
      showToast('error', 'Could not add this player')
      return
    }

    setAddFriendBusy(true)
    const res = await mailman('users/friends', 'POST', JSON.stringify({ identifier }))
    setAddFriendBusy(false)

    if (res?.error) {
      showToast('error', res.error.message)
      return
    }

    setIsFriendWithProfile(true)
    showToast('success', `Added ${typeof res.name === 'string' ? res.name : userDetails?.name ?? 'friend'}`)
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
      <WidthController>
        <Meta title={userDetails ? `${userDetails.name} — ${SITE_NAME}` : SITE_NAME} />
        <div className="page-back-toolbar">
          <PageBackLink href="/" label="Back to home" compact />
        </div>
        <PageHeader>Profile</PageHeader>

      {loading || !userStats ? (
        <SkeletonProfile />
      ) : (
        <div className="profile-stack">
          <div className="profile-details">
            <section className="profile-card">
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

                {!isThisUsersProfile() && session?.user?.id && !isEditing && isFriendWithProfile === false && (
                  <div className="profile-actions">
                    <Button
                      variant="primary"
                      disabled={addFriendBusy}
                      isLoading={addFriendBusy}
                      spinnerSize={18}
                      onClick={() => void addProfileAsFriend()}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <UserAddIcon style={{ width: 16, height: 16 }} />
                        Add friend
                      </span>
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
            </section>

            <div className="profile-tabs">
              <Tabs>
                <Tab isActive={selectedTab === 'stats'} onClick={() => setSelectedTab('stats')}>
                  Stats
                </Tab>

                <Tab isActive={selectedTab === 'games'} onClick={() => setSelectedTab('games')}>
                  Games
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
              <div className="user-stats">
                {STAT_GROUPS.map((group) => (
                  <section key={group.title} className="profile-card">
                    <header className="profile-card-head">
                      <h3 className="profile-card-title">{group.title}</h3>
                    </header>
                    <ul className="stat-group-list">
                      {group.labels.map((label) => {
                        const row = userStats.find((s) => s.label === label)
                        return (
                          <li key={label} className="stat-item">
                            <span className="stat-value">{formatLargeNumber(row?.data ?? 0)}</span>
                            <span className="stat-label">{label}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                ))}

                {personalBests.length > 0 ? (
                  <section className="profile-card">
                    <header className="profile-card-head">
                      <h3 className="profile-card-title">Personal bests</h3>
                    </header>
                    <ul className="personal-bests-list">
                      {personalBests.map((row) => (
                        <li key={row.leaderboardKey} className="personal-best-row">
                          <Link href={`/map/${encodeURIComponent(row.mapPageId)}`}>{row.label}</Link>
                          <span className="personal-best-meta">
                            {`${formatLargeNumber(row.totalPoints)} pts · ${formatRoundTime(row.totalTime)} · `}
                            <Link href={`/results/${row.gameId}`} className="personal-best-results">
                              Results
                            </Link>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>
            )}

            {selectedTab === 'games' && (
              <section className="profile-card">
                <header className="profile-card-head">
                  <h3 className="profile-card-title">Games</h3>
                </header>
                <div className="profile-card-body">
                  {userGames ? (
                    userGames.length ? (
                      <GameHistoryList
                        games={userGames}
                        hasMore={userGamesPagination.hasMore}
                        loadMore={getUserGames}
                      />
                    ) : (
                      <span className="no-results-message">No finished games yet.</span>
                    )
                  ) : (
                    <SkeletonLeaderboard removeHeader />
                  )}
                </div>
              </section>
            )}

            {selectedTab === 'settings' && isThisUsersProfile() && (
              <section className="profile-card">
                <header className="profile-card-head">
                  <h3 className="profile-card-title">Settings</h3>
                </header>
                <div className="profile-card-body">
                  <StyledSettingsPage className="profile-settings-embed">
                    <UserSettingsPanel embedded />
                  </StyledSettingsPage>
                </div>
              </section>
            )}

            {selectedTab === 'friends' && isThisUsersProfile() && session && (
              <HomeFriendsCard />
            )}
          </div>
        </div>
      )}
      </WidthController>

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
