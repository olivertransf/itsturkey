import Link from 'next/link'
import { FC } from 'react'
import { MapRowTile } from '@components/MapRowTile'
import { Avatar } from '@components/system'
import { AnalyticsType } from '@types'
import { COUNTRY_STREAK_DETAILS, DAILY_CHALLENGE_DETAILS } from '@utils/constants/random'
import { formatMonthDayYearTime } from '@utils/dateHelpers'
import { StyledListItem } from './'

type Props = {
  title: string
  data: AnalyticsType
}

const ListItem: FC<Props> = ({ title, data }) => {
  const dataToShow = () => {
    if (title === 'New Users') {
      const userData = data.recentUsers

      return userData.map((user, idx) => (
        <div className="item-wrapper" key={idx}>
          <Link href={`/user/${user._id}`} className="item-details">
            <div className="item-avatar">
              <Avatar type="user" src={user.avatar.emoji} backgroundColor={user.avatar.color} />
            </div>
            <div className="item-text-wrapper">
              <span className="item-text-1">{user.name}</span>
              <span className="item-text-2">
                {user.gamesPlayed} Game{user.gamesPlayed !== 1 && 's'}
              </span>
            </div>
          </Link>

          <div className="item-created-date">
            <span>{formatMonthDayYearTime(user.createdAt)}</span>
          </div>
        </div>
      ))
    }

    if (title === 'Recent Games') {
      const gameData = data.recentGames

      return gameData.map((game, idx) => (
        <div className="item-wrapper" key={idx}>
          <Link href={`/results/${game._id}`} className="item-details">
            <div className="item-avatar">
              {game.mapDetails && (
                <MapRowTile
                  mapId={String(
                    game.mode === 'streak'
                      ? COUNTRY_STREAK_DETAILS._id
                      : game.isDailyChallenge
                        ? DAILY_CHALLENGE_DETAILS._id
                        : game.mapDetails?.[0]?._id ?? ''
                  )}
                  name={
                    game.mode === 'streak'
                      ? COUNTRY_STREAK_DETAILS.name
                      : game.isDailyChallenge
                        ? DAILY_CHALLENGE_DETAILS.name
                        : game.mapDetails?.[0]?.name ?? 'Map'
                  }
                />
              )}
            </div>
            <div className="item-text-wrapper">
              <span className="item-text-1">
                {game.mode === 'streak'
                  ? COUNTRY_STREAK_DETAILS.name
                  : game.isDailyChallenge
                  ? DAILY_CHALLENGE_DETAILS.name
                  : game.mapDetails?.[0]?.name}
              </span>
              <span className="item-text-2">{game.userDetails.name}</span>
            </div>
          </Link>

          <div className="item-created-date">
            <span>{formatMonthDayYearTime(game.createdAt)}</span>
          </div>
        </div>
      ))
    }

    if (title === 'New Users By Day') {
      const usersByDay = data.newUsersByDay

      return usersByDay.map((item, idx) => (
        <div key={idx} className="item-wrapper">
          <div className="item-details">
            <span>{item.count}</span>
          </div>

          <div className="item-created-date">
            <span>{item.date}</span>
          </div>
        </div>
      ))
    }

    if (title === 'Games Played By Day') {
      const gamesByDay = data.gamesPlayedByDay

      return gamesByDay.map((item, idx) => (
        <div key={idx} className="item-wrapper">
          <div className="item-details">
            <span>{item.count}</span>
          </div>

          <div className="item-created-date">
            <span>{item.date}</span>
          </div>
        </div>
      ))
    }
  }

  return (
    <StyledListItem>
      <div className="analytics-group-item">
        <div className="analytics-heading">
          <span className="analytics-heading-title">{title}</span>
        </div>
        <div className="analytics-data">{dataToShow()}</div>
      </div>
    </StyledListItem>
  )
}

export default ListItem
