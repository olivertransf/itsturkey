import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { GameHistoryList } from '@components/GameHistoryList'
import { HomeFriendsCard } from '@components/HomeFriendsCard'
import { Meta } from '@components/Meta'
import { PageBackLink } from '@components/PageBackLink'
import { WidthController } from '@components/layout'
import { AvatarPickerModal } from '@components/modals'
import { SkeletonLeaderboard, SkeletonProfile } from '@components/skeletons'
import { Avatar, Tab, Tabs } from '@components/system'
import { TextWithLinks } from '@components/TextWithLinks'
import { UserSettingsPanel } from '@components/UserSettingsPanel'
import { VerifiedBadge } from '@components/VerifiedBadge'
import { CameraIcon } from '@heroicons/react/outline'
import { useAppDispatch, useAppSelector } from '@redux/hook'
import { updateAvatar, updateBio, updateUsername } from '@redux/slices'
import StyledProfilePage from '@styles/ProfilePage.Styled'
import StyledSettingsPage from '@styles/SettingsPage.Styled'
import { SITE_NAME } from '@utils/constants/site'
import { UserGameHistoryType } from '@types'
import { formatLargeNumber, formatRoundTime, mailman, showToast } from '@utils/helpers'

import type { NextPage } from 'next'
type NewProfileValuesType = {
  name: string
  bio?: string
  avatar?: { emoji: string; color: string }
}

type UserStatsType = { label: string; data: number }[]
type ProfileTabsType = 'stats' | 'games' | 'friends' | 'settings'

const pickStat = (stats: UserStatsType | undefined, label: string) =>
  stats?.find((s) => s.label === label)?.data ?? 0

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
    <StyledProfilePage>
      <WidthController>
        <Meta title={userDetails ? `${userDetails.name} — ${SITE_NAME}` : SITE_NAME} />
        <section className="profile-shell">
          <header className="profile-shell-head">
            <PageBackLink href="/" label="Back" compact />
            <div className="profile-shell-actions">
              {userDetails && isThisUsersProfile() && !isEditing ? (
                <button type="button" className="profile-card-link" onClick={() => setIsEditing(true)}>
                  Edit
                </button>
              ) : null}
              {userDetails && isThisUsersProfile() && isEditing ? (
                <>
                  <button type="button" className="profile-card-link" onClick={() => void updateUserInfo()}>
                    Save
                  </button>
                  <button type="button" className="profile-card-link" onClick={() => cancelEditing()}>
                    Cancel
                  </button>
                </>
              ) : null}
              {userDetails && !isThisUsersProfile() && session?.user?.id && isFriendWithProfile === false ? (
                <button
                  type="button"
                  className="profile-card-link"
                  disabled={addFriendBusy}
                  onClick={() => void addProfileAsFriend()}
                >
                  Add friend
                </button>
              ) : null}
            </div>
          </header>

          {loading || !userStats || !userDetails ? (
            <SkeletonProfile />
          ) : (
            <div className="profile-body">
              <div className="profile-identity">
                {isEditing ? (
                  <button
                    type="button"
                    className="profile-avatar-btn"
                    onClick={() => setAvatarModalOpen(true)}
                    aria-label="Change avatar"
                  >
                    <Avatar
                      type="user"
                      src={newProfileValues?.avatar?.emoji}
                      backgroundColor={newProfileValues?.avatar?.color}
                      size={112}
                    />
                    <span className="profile-avatar-edit">
                      <CameraIcon />
                    </span>
                  </button>
                ) : (
                  <Avatar
                    type="user"
                    src={userDetails.avatar?.emoji}
                    backgroundColor={userDetails.avatar?.color}
                    size={112}
                  />
                )}
                <div className="profile-copy">
                  {isEditing ? (
                    <input
                      className="profile-name-input"
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
                      aria-label="Display name"
                    />
                  ) : (
                    <h1 className="profile-name">
                      <span>{userDetails.name}</span>
                      {userDetails.isAdmin ? <VerifiedBadge /> : null}
                    </h1>
                  )}
                  {isEditing ? (
                    <textarea
                      className="profile-bio-input"
                      value={newProfileValues?.bio}
                      onChange={(e) =>
                        setNewProfileValues({
                          name: newProfileValues?.name || '',
                          bio: e.target.value,
                          avatar: newProfileValues?.avatar,
                        })
                      }
                      maxLength={200}
                      rows={3}
                      placeholder="Bio"
                    />
                  ) : userDetails.bio ? (
                    <p className="profile-bio">
                      <TextWithLinks>{userDetails.bio}</TextWithLinks>
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="profile-main">
              <div className="profile-tabs">
                <Tabs>
                  <Tab isActive={selectedTab === 'stats'} onClick={() => setSelectedTab('stats')}>
                    Stats
                  </Tab>
                  <Tab isActive={selectedTab === 'games'} onClick={() => setSelectedTab('games')}>
                    Games
                  </Tab>
                  {isThisUsersProfile() && session ? (
                    <Tab isActive={selectedTab === 'friends'} onClick={() => setSelectedTab('friends')}>
                      Friends
                    </Tab>
                  ) : null}
                  {isThisUsersProfile() ? (
                    <Tab isActive={selectedTab === 'settings'} onClick={() => setSelectedTab('settings')}>
                      Settings
                    </Tab>
                  ) : null}
                </Tabs>
              </div>

              {selectedTab === 'stats' ? (
                <>
                  <section className="profile-panel">
                    <ul className="stats-hero">
                      <li>
                        <span className="stats-value">{formatLargeNumber(pickStat(userStats, 'Best score (pts)'))}</span>
                        <span className="stats-label">Best</span>
                      </li>
                      <li>
                        <span className="stats-value">{formatLargeNumber(pickStat(userStats, 'Average score (pts)'))}</span>
                        <span className="stats-label">Career avg</span>
                      </li>
                      <li>
                        <span className="stats-value">{formatLargeNumber(pickStat(userStats, 'Last 5 average (pts)'))}</span>
                        <span className="stats-label">Last 5</span>
                      </li>
                    </ul>
                    <dl className="stats-meta">
                      <div>
                        <dt>Games</dt>
                        <dd>{formatLargeNumber(pickStat(userStats, 'Games finished'))}</dd>
                      </div>
                      <div>
                        <dt>Avg miss</dt>
                        <dd>{formatLargeNumber(pickStat(userStats, 'Average miss (km)'))} km</dd>
                      </div>
                      <div>
                        <dt>Best streak</dt>
                        <dd>{formatLargeNumber(pickStat(userStats, 'Best streak (countries)'))}</dd>
                      </div>
                      <div>
                        <dt>Duels</dt>
                        <dd>
                          {formatLargeNumber(pickStat(userStats, 'Duel wins'))}/
                          {formatLargeNumber(pickStat(userStats, 'Duels finished'))}
                          {pickStat(userStats, 'Duels finished') > 0
                            ? ` · ${pickStat(userStats, 'Duel win rate (%)')}%`
                            : ''}
                        </dd>
                      </div>
                      <div>
                        <dt>Daily wins</dt>
                        <dd>{formatLargeNumber(pickStat(userStats, 'Daily challenge wins'))}</dd>
                      </div>
                      <div>
                        <dt>Streaks</dt>
                        <dd>{formatLargeNumber(pickStat(userStats, 'Streaks finished'))}</dd>
                      </div>
                    </dl>
                  </section>

                  {personalBests.length > 0 ? (
                    <section className="profile-panel">
                      <h2 className="profile-panel-title">Personal bests</h2>
                      <ul className="profile-list">
                        {personalBests.map((row) => (
                          <li key={row.leaderboardKey} className="profile-row">
                            <Link href={`/map/${encodeURIComponent(row.mapPageId)}`} className="profile-row-name">
                              {row.label}
                            </Link>
                            <span className="profile-row-meta">
                              {`${formatLargeNumber(row.totalPoints)} pts · ${formatRoundTime(row.totalTime)} · `}
                              <Link href={`/results/${row.gameId}`}>Results</Link>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                </>
              ) : null}

              {selectedTab === 'games' ? (
                <section className="profile-panel profile-panel--flush">
                  {userGames ? (
                    userGames.length ? (
                      <GameHistoryList
                        games={userGames}
                        hasMore={userGamesPagination.hasMore}
                        loadMore={getUserGames}
                      />
                    ) : (
                      <p className="profile-empty">No finished games yet.</p>
                    )
                  ) : (
                    <div className="profile-panel-pad">
                      <SkeletonLeaderboard removeHeader />
                    </div>
                  )}
                </section>
              ) : null}

              {selectedTab === 'settings' && isThisUsersProfile() ? (
                <section className="profile-panel">
                  <StyledSettingsPage className="profile-settings-embed">
                    <UserSettingsPanel embedded />
                  </StyledSettingsPage>
                </section>
              ) : null}

              {selectedTab === 'friends' && isThisUsersProfile() && session ? (
                <section className="profile-panel profile-panel--flush">
                  <HomeFriendsCard embedded />
                </section>
              ) : null}
              </div>
            </div>
          )}
        </section>
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
