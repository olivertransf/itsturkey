type UserGameHistory = {
  _id: string
  mapId: string
  mapName: string
  mapAvatar: string
  gameId: string
  totalPoints: number
  totalTime: number
  playedAt?: string
}

export default UserGameHistory
