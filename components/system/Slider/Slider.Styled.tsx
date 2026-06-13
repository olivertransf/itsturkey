import styled from 'styled-components'

const StyledSlider = styled.div`
  --slider-track: rgba(255, 255, 255, 0.14);
  --slider-fill: var(--accent-primary, #2f7fff);
  --slider-thumb: #f4f4f5;
  --slider-thumb-ring: var(--accent-primary, #2f7fff);

  width: 100%;
  max-width: 100%;
  padding: 4px 0;
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
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.4),
      0 0 0 3px rgba(47, 127, 255, 0.28);
  }

  input[type='range']:focus-visible::-moz-range-thumb {
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.4),
      0 0 0 3px rgba(47, 127, 255, 0.28);
  }

  input[type='range']::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 999px;
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
    width: 16px;
    height: 16px;
    margin-top: -5px;
    border-radius: 50%;
    background: var(--slider-thumb);
    border: 2px solid var(--slider-thumb-ring);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    transition: transform 0.12s ease, box-shadow 0.12s ease;
  }

  input[type='range']:not(:disabled):hover::-webkit-slider-thumb {
    transform: scale(1.06);
  }

  input[type='range']::-moz-range-track {
    height: 6px;
    border-radius: 999px;
    background: var(--slider-track);
  }

  input[type='range']::-moz-range-progress {
    height: 6px;
    border-radius: 999px;
    background: var(--slider-fill);
  }

  input[type='range']::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--slider-thumb);
    border: 2px solid var(--slider-thumb-ring);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    box-sizing: border-box;
    transition: transform 0.12s ease, box-shadow 0.12s ease;
  }

  input[type='range']:not(:disabled):hover::-moz-range-thumb {
    transform: scale(1.06);
  }
`

export default StyledSlider
