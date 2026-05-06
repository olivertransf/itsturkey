import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@redux/hook'
import { updateGuessMapSize } from '@redux/slices'
import {
  GUESS_MAP_HOVER_UNIFORM_SCALE,
  GUESS_MAP_VMIN_MULTIPLIER,
  getGuessMapIdleSize,
} from '@utils/helpers/getGuessMapSize'

type UseGuessMapOptions = {
  idleScale?: number
}

const useGuessMap = ({ idleScale = 1 }: UseGuessMapOptions = {}) => {
  const user = useAppSelector((state) => state.user)
  const m = GUESS_MAP_VMIN_MULTIPLIER
  const idle0 = getGuessMapIdleSize(user.guessMapSize as number)
  const hov = GUESS_MAP_HOVER_UNIFORM_SCALE
  const idleBaseline = {
    width: idle0.width * idleScale * m,
    height: idle0.height * idleScale * m,
  }

  const [mapHeight, setMapHeight] = useState(idleBaseline.height)
  const [mapWidth, setMapWidth] = useState(idleBaseline.width)
  const [hovering, setHovering] = useState(false)
  const [isPinned, setIsPinned] = useState(false)

  const hoverDelay = useRef<any>()

  const dispatch = useAppDispatch()

  useEffect(() => {
    const idle = getGuessMapIdleSize(user.guessMapSize as number)
    const s = hovering || isPinned ? hov : 1

    setMapWidth(idle.width * idleScale * m * s)
    setMapHeight(idle.height * idleScale * m * s)
  }, [user.guessMapSize, hovering, isPinned, idleScale, m, hov])

  const handleMapHover = () => {
    clearTimeout(hoverDelay.current)
    setHovering(true)

    const idle = getGuessMapIdleSize(user.guessMapSize as number)
    setMapWidth(idle.width * idleScale * m * hov)
    setMapHeight(idle.height * idleScale * m * hov)
  }

  const handleMapLeave = () => {
    if (isPinned) return

    hoverDelay.current = setTimeout(() => {
      setHovering(false)
      const { width, height } = getGuessMapIdleSize(user.guessMapSize as number)
      setMapHeight(height * idleScale * m)
      setMapWidth(width * idleScale * m)
    }, 700)
  }

  const changeMapSize = (change: 'increase' | 'decrease') => {
    let newMapSize = 1

    if (change === 'increase' && (user.guessMapSize as number) < 4) {
      newMapSize = (user.guessMapSize as number) + 1
    } else if (change === 'decrease' && (user.guessMapSize as number) > 1) {
      newMapSize = (user.guessMapSize as number) - 1
    }

    const idle = getGuessMapIdleSize(newMapSize)
    const s = hovering || isPinned ? hov : 1

    setMapHeight(idle.height * idleScale * m * s)
    setMapWidth(idle.width * idleScale * m * s)

    dispatch(updateGuessMapSize({ guessMapSize: newMapSize }))
  }

  return {
    mapHeight,
    mapWidth,
    hovering,
    isPinned,
    setMapHeight,
    setMapWidth,
    setHovering,
    setIsPinned,
    handleMapHover,
    handleMapLeave,
    changeMapSize,
    resetGuessMapDimensions: () => {
      const idle = getGuessMapIdleSize(user.guessMapSize as number)
      const s = hovering || isPinned ? hov : 1

      setMapHeight(idle.height * idleScale * m * s)
      setMapWidth(idle.width * idleScale * m * s)
    },
  }
}

export default useGuessMap
