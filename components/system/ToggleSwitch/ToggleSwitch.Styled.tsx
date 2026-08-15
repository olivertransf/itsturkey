import styled from 'styled-components'

type StyledProps = {
  activeColor?: string
  inActiveColor?: string
  circleColor?: string
  $disabled?: boolean
}

const StyledToggleSwitch = styled.div<StyledProps>`
  .switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 24px;

    input {
      opacity: 0;
      width: 0;
      height: 0;
    }
  }

  .slider {
    position: absolute;
    cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
    opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({ inActiveColor }) => inActiveColor ?? 'var(--control-fill-hover)'};
    transition: background-color var(--duration) var(--ease);
    border-radius: var(--radius-pill);

    :before {
      position: absolute;
      content: '';
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: ${({ circleColor }) => circleColor ?? 'var(--white)'};
      transition: transform var(--duration) var(--ease);
      border-radius: 50%;
      box-shadow: var(--shadow-sm);
    }
  }

  input:checked + .slider {
    background-color: ${({ activeColor }) => activeColor ?? 'var(--accent-primary)'};
  }

  input:focus-visible + .slider {
    outline: var(--focus-ring);
    outline-offset: 2px;
  }

  input:checked + .slider:before {
    transform: translateX(16px);
  }
`

export default StyledToggleSwitch
