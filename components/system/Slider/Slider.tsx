import { CSSProperties, FC, InputHTMLAttributes } from 'react'
import { StyledSlider } from './'

type Props = {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'min' | 'max'>

const Slider: FC<Props> = ({ value, min, max, onChange, ...rest }) => {
  const span = max - min
  const progressPct = span <= 0 ? 0 : ((value - min) / span) * 100

  return (
    <StyledSlider style={{ '--slider-progress': `${progressPct}%` } as CSSProperties}>
      <input
        type="range"
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        value={value}
        {...rest}
      />
    </StyledSlider>
  )
}

export default Slider
