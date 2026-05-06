import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRightIcon } from '@heroicons/react/outline'
import { Button, Input, Select, Spinner } from '@components/system'
import { useAppDispatch } from '@redux/hook'
import { logOutUser, updateDistanceUnit, updateMapsAPIKey } from '@redux/slices'
import { mailman, showToast } from '@utils/helpers'

const DISTANCE_UNIT_OPTIONS = [
  { value: 'metric', label: 'Metric (km)' },
  { value: 'imperial', label: 'Imperial (miles)' },
]

type SettingsType = {
  distanceUnit: 'metric' | 'imperial'
  mapsAPIKey: string
  friendCode?: string
}

type FriendRow = {
  id: string
  name: string
  friendCode?: string
}

type Props = {
  /** When true, omits duplicate page chrome; use inside profile Settings tab. */
  embedded?: boolean
}

const UserSettingsPanel: FC<Props> = ({ embedded }) => {
  const [distanceUnit, setDistanceUnit] = useState('metric')
  const [mapsAPIKey, setMapsAPIKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialSettings, setInitialSettings] = useState<SettingsType>()
  const [friendCode, setFriendCode] = useState('')
  const [friends, setFriends] = useState<FriendRow[]>([])
  const [friendIdentifier, setFriendIdentifier] = useState('')
  const [friendBusy, setFriendBusy] = useState(false)
  const dispatch = useAppDispatch()

  const hasEdited = useMemo(
    () =>
      initialSettings && (distanceUnit !== initialSettings?.distanceUnit || mapsAPIKey !== initialSettings?.mapsAPIKey),
    [distanceUnit, mapsAPIKey, initialSettings]
  )

  const fetchFriends = useCallback(async () => {
    const fr = await mailman('users/friends')
    if (fr?.error) return
    if (Array.isArray(fr)) setFriends(fr as FriendRow[])
  }, [])

  const fetchUserSettings = useCallback(async () => {
    setLoading(true)

    const res = await mailman('users/settings')

    if (res.error) {
      setLoading(false)
      return showToast('error', res.error.message)
    }

    setLoading(false)
    setInitialSettings({
      distanceUnit: res.distanceUnit,
      mapsAPIKey: res.mapsAPIKey,
      friendCode: typeof res.friendCode === 'string' ? res.friendCode : undefined,
    })
    setDistanceUnit(res.distanceUnit)
    setMapsAPIKey(res.mapsAPIKey)
    setFriendCode(typeof res.friendCode === 'string' ? res.friendCode : '')
    void fetchFriends()
  }, [fetchFriends])

  useEffect(() => {
    void fetchUserSettings()
  }, [fetchUserSettings])

  const copyFriendCode = async () => {
    if (!friendCode) return
    try {
      await navigator.clipboard.writeText(friendCode)
      showToast('success', 'Friend code copied')
    } catch {
      showToast('error', 'Could not copy')
    }
  }

  const handleAddFriend = async () => {
    const id = friendIdentifier.trim()
    if (!id) {
      showToast('error', 'Enter a friend code, email, or display name')
      return
    }
    setFriendBusy(true)
    const res = await mailman('users/friends', 'POST', JSON.stringify({ identifier: id }))
    setFriendBusy(false)
    if (res?.error) {
      showToast('error', res.error.message)
      return
    }
    setFriendIdentifier('')
    showToast('success', `Added ${typeof res.name === 'string' ? res.name : 'friend'}`)
    void fetchFriends()
  }

  const handleRemoveFriend = async (peerId: string) => {
    setFriendBusy(true)
    const res = await mailman(`users/friends/${peerId}`, 'DELETE')
    setFriendBusy(false)
    if (res?.error) {
      showToast('error', res.error.message)
      return
    }
    showToast('success', 'Removed friend')
    void fetchFriends()
  }

  const handleSaveChanges = async () => {
    const newSettings = { distanceUnit, mapsAPIKey } as SettingsType

    const res = await mailman('users/settings', 'POST', JSON.stringify(newSettings))

    if (res.error) {
      return showToast('error', res.error.message)
    }

    setInitialSettings(newSettings)

    dispatch(updateDistanceUnit(distanceUnit))
    dispatch(updateMapsAPIKey(mapsAPIKey))

    showToast('success', 'Successfully updated user settings')
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
    dispatch(logOutUser())
  }

  return (
    <>
      <div className={`header ${embedded ? 'header--embedded' : ''}`}>
        <div className="header-details">
          <h1>{embedded ? 'Settings' : 'Account'}</h1>
          <h2>{embedded ? 'Distance, API key, friends' : 'Manage your settings'}</h2>
        </div>

        <Button
          variant={hasEdited ? 'primary' : 'solidGray'}
          onClick={() => handleSaveChanges()}
          style={{ padding: '0 12px' }}
          disabled={!hasEdited}
        >
          Save Changes
        </Button>
      </div>

      {loading ? (
        <div className="settings-loader">
          <Spinner size={32} />
        </div>
      ) : (
        <div className="settings-body">
          <div className="settings-form">
            <Select
              label="Distance Unit"
              options={DISTANCE_UNIT_OPTIONS}
              callback={setDistanceUnit}
              value={distanceUnit}
            />
            <Input
              id="maps-key"
              label="Custom API Key"
              type="text"
              placeholder="Ex. AIza-lots-of-characters"
              value={mapsAPIKey}
              callback={setMapsAPIKey}
            />
          </div>

          <div className="friends-section">
            <h3 className="friends-heading">Friends & duels</h3>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.45, color: '#9e9e9e' }}>
              Share your friend code so others can add you. Add someone by their friend code, email, or exact display
              name (if it is unique).
            </p>
            <div className="friend-code-row">
              <span>Your friend code</span>
              {friendCode ? <code>{friendCode}</code> : <span style={{ opacity: 0.7 }}>Loading…</span>}
              <Button variant="solidGray" style={{ padding: '0 12px' }} onClick={() => void copyFriendCode()}>
                Copy
              </Button>
            </div>
            <div className="friend-add-row">
              <div style={{ flex: '1 1 200px' }}>
                <Input
                  id="add-friend"
                  label="Add friend"
                  type="text"
                  placeholder="Friend code, email, or display name"
                  value={friendIdentifier}
                  callback={setFriendIdentifier}
                />
              </div>
              <Button
                variant="primary"
                style={{ padding: '0 14px', height: 40 }}
                disabled={friendBusy}
                onClick={() => void handleAddFriend()}
              >
                Add
              </Button>
            </div>
            {friends.length === 0 ? (
              <p style={{ margin: 0, fontSize: 13, color: '#737373' }}>No friends yet.</p>
            ) : (
              <ul className="friends-list">
                {friends.map((f) => (
                  <li key={f.id} className="friend-row">
                    <span>{f.name}</span>
                    <Button
                      variant="destroy"
                      style={{ padding: '0 10px', fontSize: 12 }}
                      disabled={friendBusy}
                      onClick={() => void handleRemoveFriend(f.id)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {!initialSettings?.mapsAPIKey ? (
            <div className="maps-key-cta">
              <div className="cta-title">How to add your own Google Maps API key</div>
              <p className="cta-description">
                Adding your own key allows you to play essentially unlimited games for free!
              </p>

              <Link href="/custom-key-instructions.pdf" passHref>
                <a target="_blank" rel="noopener noreferrer">
                  <Button className="cta-button" variant="solidGray">
                    View Instructions
                    <ArrowRightIcon />
                  </Button>
                </a>
              </Link>
            </div>
          ) : (
            <div className="custom-key-success-message">
              <div>Thank you for using your own maps key. People like you are helping keep this site free.</div>
              <div>For your key to take effect, you must refresh the page.</div>

              <Button onClick={() => setMapsAPIKey('')} style={{ padding: '0 12px', marginTop: '12px' }}>
                Reset Key
              </Button>
            </div>
          )}

          <button type="button" className="logout-btn" onClick={() => handleLogout()}>
            Log Out
          </button>
        </div>
      )}
    </>
  )
}

export default UserSettingsPanel
