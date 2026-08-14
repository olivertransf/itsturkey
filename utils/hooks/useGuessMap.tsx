import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@redux/hook'
import { updateGuessMapSize } from '@redux/slices'
import {
  GUESS_MAP_HOVER_UNIFORM_SCALE,
  GUESS_MAP_TABLET_EXPAND_UNIFORM_SCALE,
  GUESS_MAP_VMIN_MULTIPLIER,
  getGuessMapIdleSize,
} from '@utils/helpers/getGuessMapSize'
import useGuessMapChromeMode from '@utils/hooks/useGuessMapChromeMode'

type UseGuessMapOptions = {
  idleScale?: number
}

const useGuessMap = ({ idleScale = 1 }: UseGuessMapOptions = {}) => {
  const user = useAppSelector((state) => state.user)
  const chromeMode = useGuessMapChromeMode()
  const m = GUESS_MAP_VMIN_MULTIPLIER
  const expandScale =
    chromeMode === 'tabletTouch' ? GUESS_MAP_TABLET_EXPAND_UNIFORM_SCALE : GUESS_MAP_HOVER_UNIFORM_SCALE
  const idle0 = getGuessMapIdleSize(user.guessMapSize as number)
  const idleBaseline = {
    width: idle0.width * idleScale * m,
    height: idle0.height * idleScale * m,
  }

  const [mapHeight, setMapHeight] = useState(idleBaseline.height)
  const [mapWidth, setMapWidth] = useState(idleBaseline.width)
  const [hovering, setHovering] = useState(false)
  const [isPinned, setIsPinned] = useState(false)

  const hoverDelay = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dispatch = useAppDispatch()

  useEffect(() => {
    const idle = getGuessMapIdleSize(user.guessMapSize as number)
    const s = hovering || isPinned ? expandScale : 1

    setMapWidth(idle.width * idleScale * m * s)
    setMapHeight(idle.height * idleScale * m * s)
  }, [user.guessMapSize, hovering, isPinned, idleScale, m, expandScale])

  const handleMapHover = () => {
    if (hoverDelay.current != null) clearTimeout(hoverDelay.current)
    setHovering(true)

    const idle = getGuessMapIdleSize(user.guessMapSize as number)
    setMapWidth(idle.width * idleScale * m * expandScale)
    setMapHeight(idle.height * idleScale * m * expandScale)
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

  /** iPad: tap expands and pins so pan/pinch stay available without hover. */
  const expandAndPin = () => {
    if (hoverDelay.current != null) clearTimeout(hoverDelay.current)
    setHovering(true)
    setIsPinned(true)
    const idle = getGuessMapIdleSize(user.guessMapSize as number)
    setMapWidth(idle.width * idleScale * m * expandScale)
    setMapHeight(idle.height * idleScale * m * expandScale)
  }

  const changeMapSize = (change: 'increase' | 'decrease') => {
    let newMapSize = 1

    if (change === 'increase' && (user.guessMapSize as number) < 4) {
      newMapSize = (user.guessMapSize as number) + 1
    } else if (change === 'decrease' && (user.guessMapSize as number) > 1) {
      newMapSize = (user.guessMapSize as number) - 1
    }

    const idle = getGuessMapIdleSize(newMapSize)
    const s = hovering || isPinned ? expandScale : 1

    setMapHeight(idle.height * idleScale * m * s)
    setMapWidth(idle.width * idleScale * m * s)

    dispatch(updateGuessMapSize({ guessMapSize: newMapSize }))
  }

  return {
    mapHeight,
    mapWidth,
    hovering,
    isPinned,
    chromeMode,
    setMapHeight,
    setMapWidth,
    setHovering,
    setIsPinned,
    handleMapHover,
    handleMapLeave,
    expandAndPin,
    changeMapSize,
    resetGuessMapDimensions: () => {
      const idle = getGuessMapIdleSize(user.guessMapSize as number)
      const s = hovering || isPinned ? expandScale : 1

      setMapHeight(idle.height * idleScale * m * s)
      setMapWidth(idle.width * idleScale * m * s)
    },
  }
}

export default useGuessMap
