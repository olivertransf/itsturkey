import styled, { css, keyframes } from 'styled-components'
import { PHONE_GUESS_MAP_MQ } from '@utils/constants/breakpoints'
import type { VisualRestrictions } from '@utils/constants/visualRestrictions'
import { buildStreetViewCssFilter } from '@utils/constants/visualRestrictions'

type StyledProps = {
  showMap?: boolean
  $fx?: VisualRestrictions
}

const hueCycle = keyframes`
  from { --sv-hue: 0deg; }
  to { --sv-hue: 360deg; }
`

const blinkFade = keyframes`
  0%, 42% { opacity: 0; }
  50%, 92% { opacity: 1; }
  100% { opacity: 0; }
`

const spinYaw = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const wanderDrift = keyframes`
  0% { transform: translate(0, 0) scale(1.22); }
  25% { transform: translate(12%, -9%) scale(1.28); }
  50% { transform: translate(-11%, 10%) scale(1.3); }
  75% { transform: translate(9%, 7%) scale(1.25); }
  100% { transform: translate(0, 0) scale(1.22); }
`

const drunkSway = keyframes`
  0% { transform: rotate(-4.5deg) translateX(-3.5%) skewX(-3deg); }
  50% { transform: rotate(5deg) translateX(4%) skewX(3.5deg); }
  100% { transform: rotate(-4.5deg) translateX(-3.5%) skewX(-3deg); }
`

const wobbleJelly = keyframes`
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.08, 0.9) rotate(-2.4deg); }
  50% { transform: scale(0.92, 1.1) rotate(2.6deg); }
  75% { transform: scale(1.06, 0.94) rotate(-1.6deg); }
`

const zigzagSkew = keyframes`
  0%, 100% { transform: skewX(-14deg) skewY(3deg); }
  50% { transform: skewX(14deg) skewY(-3deg); }
`

const noiseScroll = keyframes`
  0% { transform: translate(0, 0); }
  100% { transform: translate(-10%, -10%); }
`

const bubblePulse = keyframes`
  0%, 100% { clip-path: ellipse(38% 38% at 50% 50%); }
  50% { clip-path: ellipse(28% 48% at 50% 50%); }
`

const fxStaticTransforms = (fx: VisualRestrictions) => {
  const parts: string[] = []
  if (fx.upsideDown) parts.push('rotate(180deg)')
  if (fx.mirror) parts.push('scaleX(-1)')
  if (fx.stretch) parts.push('scaleX(1.9) scaleY(0.55)')
  return parts.join(' ')
}

const layerFill = css`
  position: absolute;
  inset: 0;
  z-index: 0;
  transform-origin: center center;
`

const inactiveLayer = css`
  display: contents;
`

const StyledStreetView = styled.div<StyledProps>`
  height: 100%;
  width: 100%;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  --sv-hue: 0deg;
  ${({ $fx }) =>
    $fx?.hueShift
      ? css`
          animation: ${hueCycle} 3.5s linear infinite;
        `
      : ''}

  .streetview-pano {
    flex: 1;
    min-height: 0;
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
  }

  .streetview-fx-stack {
    ${layerFill}
  }

  .fx-layer-spin {
    ${({ $fx }) =>
      $fx?.spin
        ? css`
            ${layerFill}
            animation: ${spinYaw} 9s linear infinite;
          `
        : inactiveLayer}
  }

  .fx-layer-wander {
    ${({ $fx }) =>
      $fx?.wander
        ? css`
            ${layerFill}
            animation: ${wanderDrift} 5.5s ease-in-out infinite;
          `
        : inactiveLayer}
  }

  .fx-layer-drunk {
    ${({ $fx }) =>
      $fx?.drunk
        ? css`
            ${layerFill}
            animation: ${drunkSway} 1.5s ease-in-out infinite;
          `
        : inactiveLayer}
  }

  .fx-layer-wobble {
    ${({ $fx }) =>
      $fx?.wobble
        ? css`
            ${layerFill}
            animation: ${wobbleJelly} 0.7s ease-in-out infinite;
          `
        : inactiveLayer}
  }

  .fx-layer-zigzag {
    ${({ $fx }) =>
      $fx?.zigzag
        ? css`
            ${layerFill}
            animation: ${zigzagSkew} 0.95s ease-in-out infinite;
          `
        : inactiveLayer}
  }

  .fx-layer-bubble {
    ${({ $fx }) =>
      $fx?.bubble
        ? css`
            ${layerFill}
            animation: ${bubblePulse} 2.8s ease-in-out infinite;
          `
        : inactiveLayer}
  }

  /* Pixelate via SVG mosaic filter on this layer — do not resize the Google pano. */
  .fx-layer-pixelate {
    ${({ $fx }) => ($fx?.pixelate ? layerFill : inactiveLayer)}
  }

  .fx-layer-static {
    ${({ $fx }) => {
      if (!$fx) return inactiveLayer
      const filter = buildStreetViewCssFilter($fx)
      const staticT = fxStaticTransforms($fx)
      const needsLayer = Boolean(filter || staticT)
      if (!needsLayer) return inactiveLayer
      return css`
        ${layerFill}
        ${filter ? `filter: ${filter};` : ''}
        ${staticT ? `transform: ${staticT};` : ''}
      `
    }}
  }

  .streetview-fx-target {
    position: absolute;
    inset: 0;
    z-index: 0;
    transform-origin: center center;
  }

  .sv-pixelate-defs {
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .fx-blink-veil {
    display: ${({ $fx }) => ($fx?.blink ? 'block' : 'none')};
    position: absolute;
    inset: 0;
    z-index: 1;
    background: #000;
    pointer-events: none;
    animation: ${blinkFade} 1.6s ease-in-out infinite;
  }

  .fx-vignette-veil {
    display: ${({ $fx }) => ($fx?.vignette || $fx?.tunnel || $fx?.flashlight ? 'block' : 'none')};
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: ${({ $fx }) => {
      const layers: string[] = []
      if ($fx?.flashlight) {
        layers.push(
          'radial-gradient(circle 72px at 50% 48%, transparent 0 22%, rgba(0,0,0,0.75) 40%, #000 58%)'
        )
      }
      if ($fx?.tunnel) {
        layers.push(
          'radial-gradient(circle at 50% 50%, transparent 0 16%, rgba(0,0,0,0.7) 34%, #000 55%)'
        )
      }
      if ($fx?.vignette) {
        layers.push('radial-gradient(circle at 50% 50%, transparent 18%, rgba(0,0,0,0.55) 55%, #000 100%)')
      }
      return layers.length ? layers.join(', ') : 'none'
    }};
  }

  .fx-noise-veil {
    display: ${({ $fx }) => ($fx?.staticNoise ? 'block' : 'none')};
    position: absolute;
    inset: -20%;
    z-index: 1;
    pointer-events: none;
    opacity: 0.55;
    mix-blend-mode: overlay;
    background-image: repeating-radial-gradient(
        circle at 20% 30%,
        rgba(255, 255, 255, 0.55) 0 1.5px,
        transparent 1.5px 3px
      ),
      repeating-linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.45) 0 1px,
        transparent 1px 2px
      );
    animation: ${noiseScroll} 0.22s steps(2) infinite;
  }

  .streetview-interaction-block {
    position: absolute;
    inset: 0;
    z-index: 1;
    touch-action: none;
    cursor: default;
    user-select: none;
  }

  .toggle-map-button {
    display: none;

    @media ${PHONE_GUESS_MAP_MQ} {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--mediumPurple);
      border: 2px solid var(--color2);
      height: 72px;
      width: 72px;
      border-radius: 50%;
      position: absolute;
      bottom: max(28px, calc(16px + env(safe-area-inset-bottom, 0px)));
      right: max(12px, env(safe-area-inset-right, 0px));
      z-index: 2;
      -webkit-tap-highlight-color: transparent;

      svg {
        height: 36px;
        color: var(--color2);

        path {
          stroke-width: 1.5px;
        }
      }
    }
  }

  .country-tip-corner {
    position: absolute;
    right: 20px;
    bottom: 108px;
    z-index: 4;
    max-width: min(320px, calc(100vw - 40px));

    @media (max-width: 900px) {
      right: 14px;
      bottom: 96px;
      max-width: min(280px, calc(100vw - 24px));
    }

    @media ${PHONE_GUESS_MAP_MQ} {
      right: max(12px, env(safe-area-inset-right, 0px));
      bottom: max(112px, calc(96px + env(safe-area-inset-bottom, 0px)));
      max-width: min(280px, calc(100vw - 100px));
    }
  }

  .spectator-banner {
    position: absolute;
    top: max(12px, env(safe-area-inset-top, 0px));
    left: 50%;
    transform: translateX(-50%);
    z-index: 4;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(12, 14, 18, 0.78);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #fbbf24;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    pointer-events: none;
    white-space: nowrap;
    max-width: calc(100vw - 24px);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  a[href^="https://maps.google.com/maps"]
  {
    pointer-events: none;
  }
`

export default StyledStreetView
