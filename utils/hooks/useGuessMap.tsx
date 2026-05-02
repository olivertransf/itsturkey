import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@redux/hook'
import { updateGuessMapSize } from '@redux/slices'
import { getGuessMapExpandedSize, getGuessMapIdleSize } from '@utils/helpers/getGuessMapSize'

type UseGuessMapOptions = {
  idleScale?: number
}

const scaleBox = (box: { width: number; height: number }, scale: number) => ({
  width: box.width * scale,
  height: box.height * scale,
})

const useGuessMap = ({ idleScale = 1 }: UseGuessMapOptions = {}) => {
  const user = useAppSelector((state) => state.user)
  const idleBaseline = scaleBox(getGuessMapIdleSize(user.guessMapSize as number), idleScale)

  const [mapHeight, setMapHeight] = useState(idleBaseline.height)
  const [mapWidth, setMapWidth] = useState(idleBaseline.width)
  const [hovering, setHovering] = useState(false)
  const [isPinned, setIsPinned] = useState(false)

  const hoverDelay = useRef<any>()

  const dispatch = useAppDispatch()

  useEffect(() => {
    const expanded = getGuessMapExpandedSize(user.guessMapSize as number)
    const idle = getGuessMapIdleSize(user.guessMapSize as number)

    if (hovering || isPinned) {
      setMapWidth(expanded.width)
      setMapHeight(expanded.height)
      return
    }

    setMapWidth(idle.width * idleScale)
    setMapHeight(idle.height * idleScale)
  }, [user.guessMapSize, hovering, isPinned, idleScale])

  const handleMapHover = () => {
    clearTimeout(hoverDelay.current)
    setHovering(true)

    const { width, height } = getGuessMapExpandedSize(user.guessMapSize as number)
    setMapHeight(height)
    setMapWidth(width)
  }

  const handleMapLeave = () => {
    if (isPinned) return

    hoverDelay.current = setTimeout(() => {
      setHovering(false)
      const { width, height } = getGuessMapIdleSize(user.guessMapSize as number)
      setMapHeight(height * idleScale)
      setMapWidth(width * idleScale)
    }, 700)
  }

  const changeMapSize = (change: 'increase' | 'decrease') => {
    let newMapSize = 1

    if (change === 'increase' && (user.guessMapSize as number) < 4) {
      newMapSize = (user.guessMapSize as number) + 1
    } else if (change === 'decrease' && (user.guessMapSize as number) > 1) {
      newMapSize = (user.guessMapSize as number) - 1
    }

    const expanded = getGuessMapExpandedSize(newMapSize)
    const idle = getGuessMapIdleSize(newMapSize)

    if (hovering || isPinned) {
      setMapHeight(expanded.height)
      setMapWidth(expanded.width)
    } else {
      setMapHeight(idle.height * idleScale)
      setMapWidth(idle.width * idleScale)
    }

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
      const expanded = getGuessMapExpandedSize(user.guessMapSize as number)
      const idle = getGuessMapIdleSize(user.guessMapSize as number)

      if (hovering || isPinned) {
        setMapHeight(expanded.height)
        setMapWidth(expanded.width)
        return
      }

      setMapHeight(idle.height * idleScale)
      setMapWidth(idle.width * idleScale)
    },
  }
}

export default useGuessMap
