import { act, render } from '@testing-library/react'
import { useState } from 'react'
import { useVisibleInterval } from '@utils/useVisibleInterval'

const Probe = ({ onTick }: { onTick: () => void }) => {
  const [, setN] = useState(0)
  useVisibleInterval(() => {
    onTick()
    setN((n) => n + 1)
  }, 8000, true)
  return null
}

describe('useVisibleInterval', () => {
  const originalVisibility = document.visibilityState

  afterEach(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => originalVisibility,
    })
    jest.useRealTimers()
  })

  test('does not hammer when tick is an inline callback that setStates', () => {
    jest.useFakeTimers()
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    })

    const onTick = jest.fn()
    render(<Probe onTick={onTick} />)

    expect(onTick).toHaveBeenCalledTimes(1)

    act(() => {
      jest.advanceTimersByTime(100)
    })
    expect(onTick).toHaveBeenCalledTimes(1)

    act(() => {
      jest.advanceTimersByTime(8000)
    })
    expect(onTick).toHaveBeenCalledTimes(2)
  })
})
