import Link from 'next/link'
import { FC } from 'react'
import { MapRowTile } from '@components/MapRowTile'
import { Avatar, FlexGroup } from '@components/system'
import { ChartBarIcon } from '@heroicons/react/outline'
import { LightningBoltIcon } from '@heroicons/react/solid'
import { MapLeaderboardType, UserGameHistoryType } from '@types'
import { formatLargeNumber, formatRoundTime } from '@utils/helpers'
import { StyledLeaderboardItem } from './'

type Props = {
  finishPlace: number
  row: MapLeaderboardType | UserGameHistoryType
  removeResults?: boolean
}

const LeaderboardItem: FC<Props> = ({ finishPlace, row, removeResults }) => {
  const LAST_PLACE = 6

  if (typeof row === 'object' && 'mapId' in row) {
    return (
      <StyledLeaderboardItem highlight={false} removeResults={removeResults}>
        <div className="userSection">
          <span className="userPlace">{`#${finishPlace}`}</span>
          <div className="userInfo">
            <MapRowTile mapId={String(row.mapId)} name={row.mapName} />

            <Link href={`/map/${row.mapId}`} className="username-wrapper">
              <span className="username">{row.mapName}</span>
            </Link>
          </div>
        </div>

        <div className="resultsSection">
          {typeof row.totalPoints !== 'undefined' && (
            <span className="totalPoints">{formatLargeNumber(row.totalPoints)} points</span>
          )}

          <FlexGroup gap={5}>
            {'playedAt' in row && row.playedAt && (
              <span className="playedAt">{new Date(row.playedAt).toLocaleString()}</span>
            )}

            {row.totalTime && <span className="totalTime">{formatRoundTime(row.totalTime)}</span>}

            {!removeResults && (
              <Link href={`/results/${row._id}`} className="results-link">
                <ChartBarIcon />
              </Link>
            )}
          </FlexGroup>
        </div>
      </StyledLeaderboardItem>
    )
  }

  return (
    <StyledLeaderboardItem highlight={!!row.highlight} removeResults={removeResults}>
      <div className="userSection">
        <span
          className="userPlace"
          style={{ opacity: finishPlace === LAST_PLACE && row.highlight ? 0 : 1 }}
        >{`#${finishPlace}`}</span>
        <div className="userInfo">
          <Avatar type="user" src={row.userAvatar.emoji} backgroundColor={row.userAvatar.color} />

          <Link href={`/user/${row.userId}`} className="username-wrapper">
            <span className="username">{row.userName}</span>
          </Link>
        </div>
      </div>

      <div className="resultsSection">
        {typeof row.totalPoints !== 'undefined' && (
          <span className="totalPoints">{formatLargeNumber(row.totalPoints)} points</span>
        )}

        {row.streak && (
          <div className="bestStreakWrapper">
            <LightningBoltIcon />
            <span className="bestStreak">{row.streak}</span>
          </div>
        )}
        <FlexGroup gap={5}>
          {row.totalTime && <span className="totalTime">{formatRoundTime(row.totalTime)}</span>}

          {!removeResults && (
            <Link href={`/results/${row.gameId}`} className="results-link">
              <ChartBarIcon />
            </Link>
          )}
        </FlexGroup>
      </div>
    </StyledLeaderboardItem>
  )
}

export default LeaderboardItem
