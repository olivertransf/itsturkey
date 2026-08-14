import styled from 'styled-components'

const StyledSlider = styled.div`
  --slider-track: var(--control-fill-hover);
  --slider-fill: var(--accent-primary);
  --slider-thumb: var(--text-primary);
  --slider-thumb-ring: var(--accent-primary);

  width: 100%;
  max-width: 100%;
  padding: var(--space-1) 0;
  box-sizing: border-box;

  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 18px;
    margin: 0;
    background: transparent;
    cursor: pointer;
  }

  input[type='range']:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  input[type='range']:focus {
    outline: none;
  }

  input[type='range']:focus-visible::-webkit-slider-thumb {
    box-shadow: var(--shadow-sm), 0 0 0 3px var(--accent-muted);
  }

  input[type='range']:focus-visible::-moz-range-thumb {
    box-shadow: var(--shadow-sm), 0 0 0 3px var(--accent-muted);
  }

  input[type='range']::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: var(--radius-pill);
    background: linear-gradient(
      to right,
      var(--slider-fill) 0%,
      var(--slider-fill) var(--slider-progress, 0%),
      var(--slider-track) var(--slider-progress, 0%),
      var(--slider-track) 100%
    );
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: var(--icon-sm);
    height: var(--icon-sm);
    margin-top: -5px;
    border-radius: 50%;
    background: var(--slider-thumb);
    border: 2px solid var(--slider-thumb-ring);
    box-shadow: var(--shadow-sm);
    transition: transform var(--duration-fast) var(--ease), box-shadow var(--duration-fast) var(--ease);
  }

  input[type='range']:not(:disabled):hover::-webkit-slider-thumb {
    transform: scale(1.06);
  }

  input[type='range']::-moz-range-track {
    height: 6px;
    border-radius: var(--radius-pill);
    background: var(--slider-track);
  }

  input[type='range']::-moz-range-progress {
    height: 6px;
    border-radius: var(--radius-pill);
    background: var(--slider-fill);
  }

  input[type='range']::-moz-range-thumb {
    width: var(--icon-sm);
    height: var(--icon-sm);
    border-radius: 50%;
    background: var(--slider-thumb);
    border: 2px solid var(--slider-thumb-ring);
    box-shadow: var(--shadow-sm);
    box-sizing: border-box;
    transition: transform var(--duration-fast) var(--ease), box-shadow var(--duration-fast) var(--ease);
  }

  input[type='range']:not(:disabled):hover::-moz-range-thumb {
    transform: scale(1.06);
  }
`

export default StyledSlider
