import { ObjectId } from 'mongodb'

type MultiSession = {
  _id?: ObjectId
  userId?: ObjectId
  anonymousId?: string
  mapId: string
  mapName?: string
  panelCount: 2 | 4 | 8
  totalRoundsPerPanel: number
  perGuessSeconds: number
  cooldownSeconds: number
  panelGameIds: ObjectId[]
  state: 'started' | 'finished'
  createdAt?: Date
  finishedAt?: Date
}

export default MultiSession
