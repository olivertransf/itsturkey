import Link from 'next/link'
import { FC } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { MapRowTile } from '@components/MapRowTile'
import { Spinner } from '@components/system'
import { UserGameHistoryType } from '@types'
import { formatShortTimeAgo } from '@utils/dateHelpers'
import { formatLargeNumber, formatRoundTime } from '@utils/helpers'
import styled from 'styled-components'

type Props = {
  games: UserGameHistoryType[]
  hasMore: boolean
  loadMore: () => void
}

const Root = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`

const Row = styled.li`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 14px;
  min-height: 56px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--divider-line);

  &:last-child {
    border-bottom: 0;
  }

  &:hover {
    background: var(--bg-elevated);
  }
`

const Main = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`

const Copy = styled.div`
  min-width: 0;

  .map-name {
    display: block;
    font-size: 15px;
    font-weight: 650;
    color: var(--text-primary);
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover {
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }

  .meta {
    margin-top: 3px;
    font-size: 12px;
    color: var(--text-muted);
  }
`

const Side = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
  font-size: 13px;
  color: var(--text-muted);

  .pts {
    font-weight: 700;
    color: var(--text-primary);
    font-variant-numeric: tabular-nums;
  }

  a {
    font-weight: 650;
    color: var(--palette-accent);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }
`

const GameHistoryList: FC<Props> = ({ games, hasMore, loadMore }) => {
  return (
    <InfiniteScroll
      dataLength={games.length}
      next={loadMore}
      hasMore={hasMore}
      loader={
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
          <Spinner size={22} />
        </div>
      }
    >
      <Root>
        {games.map((game) => {
          const isStreak = game.mode === 'streak'
          const score = isStreak
            ? `${game.streak ?? 0} countries`
            : `${formatLargeNumber(game.totalPoints)} pts`
          const when = game.playedAt ? formatShortTimeAgo(new Date(game.playedAt)) : ''
          const resultsId = game.gameId || game._id
          return (
            <Row key={String(game._id)}>
              <Main>
                <MapRowTile mapId={String(game.mapId)} name={game.mapName} />
                <Copy>
                  <Link href={`/map/${encodeURIComponent(String(game.mapId))}`} className="map-name">
                    {game.mapName}
                  </Link>
                  <div className="meta">
                    {isStreak ? 'Streak' : 'Standard'}
                    {when ? ` · ${when}` : ''}
                  </div>
                </Copy>
              </Main>
              <Side>
                <span className="pts">{score}</span>
                {game.totalTime ? <span>{formatRoundTime(game.totalTime)}</span> : null}
                <Link href={`/results/${resultsId}`}>Results</Link>
              </Side>
            </Row>
          )
        })}
      </Root>
    </InfiniteScroll>
  )
}

export default GameHistoryList
