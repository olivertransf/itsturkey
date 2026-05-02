import { ChangeEvent, FC, useEffect, useState } from 'react'
import { StyledToggleSwitch } from './'

type Props = {
  isActive: boolean
  setIsActive: (isActive: boolean) => void
  activeColor?: string
  inActiveColor?: string
  circleColor?: string
  disabled?: boolean
}

const ToggleSwitch: FC<Props> = ({
  activeColor,
  inActiveColor,
  circleColor,
  isActive,
  setIsActive,
  disabled,
}) => {
  const [active, setActive] = useState(isActive)

  useEffect(() => {
    setActive(isActive)
  }, [isActive])

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return

    const newVal = e.currentTarget.checked

    setActive(newVal)
    setIsActive(newVal)
  }

  return (
    <StyledToggleSwitch
      activeColor={activeColor}
      inActiveColor={inActiveColor}
      circleColor={circleColor}
      $disabled={!!disabled}
    >
      <label className="switch">
        <input type="checkbox" checked={active} disabled={disabled} onChange={(e) => onInputChange(e)} />
        <span className="slider"></span>
      </label>
    </StyledToggleSwitch>
  )
}

export default ToggleSwitch
