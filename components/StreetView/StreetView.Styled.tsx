import styled, { css, keyframes } from 'styled-components'
import { PHONE_GUESS_MAP_MQ } from '@utils/constants/breakpoints'
import type { VisualRestrictions } from '@utils/constants/visualRestrictions'
import {
  buildStreetViewCssFilter,
  DEFAULT_VISUAL_INTENSITY,
  visualIntensityFactors,
} from '@utils/constants/visualRestrictions'

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
  0% { transform: translate(0, 0) scale(calc(1.08 + 0.14 * var(--sv-fx-motion, 1))); }
  25% { transform: translate(calc(12% * var(--sv-fx-motion, 1)), calc(-9% * var(--sv-fx-motion, 1))) scale(calc(1.1 + 0.18 * var(--sv-fx-motion, 1))); }
  50% { transform: translate(calc(-11% * var(--sv-fx-motion, 1)), calc(10% * var(--sv-fx-motion, 1))) scale(calc(1.12 + 0.2 * var(--sv-fx-motion, 1))); }
  75% { transform: translate(calc(9% * var(--sv-fx-motion, 1)), calc(7% * var(--sv-fx-motion, 1))) scale(calc(1.09 + 0.16 * var(--sv-fx-motion, 1))); }
  100% { transform: translate(0, 0) scale(calc(1.08 + 0.14 * var(--sv-fx-motion, 1))); }
`

const drunkSway = keyframes`
  0% { transform: rotate(calc(-4.5deg * var(--sv-fx-motion, 1))) translateX(calc(-3.5% * var(--sv-fx-motion, 1))) skewX(calc(-3deg * var(--sv-fx-motion, 1))); }
  50% { transform: rotate(calc(5deg * var(--sv-fx-motion, 1))) translateX(calc(4% * var(--sv-fx-motion, 1))) skewX(calc(3.5deg * var(--sv-fx-motion, 1))); }
  100% { transform: rotate(calc(-4.5deg * var(--sv-fx-motion, 1))) translateX(calc(-3.5% * var(--sv-fx-motion, 1))) skewX(calc(-3deg * var(--sv-fx-motion, 1))); }
`

const wobbleJelly = keyframes`
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(calc(1 + 0.08 * var(--sv-fx-motion, 1)), calc(1 - 0.1 * var(--sv-fx-motion, 1))) rotate(calc(-2.4deg * var(--sv-fx-motion, 1))); }
  50% { transform: scale(calc(1 - 0.08 * var(--sv-fx-motion, 1)), calc(1 + 0.1 * var(--sv-fx-motion, 1))) rotate(calc(2.6deg * var(--sv-fx-motion, 1))); }
  75% { transform: scale(calc(1 + 0.06 * var(--sv-fx-motion, 1)), calc(1 - 0.06 * var(--sv-fx-motion, 1))) rotate(calc(-1.6deg * var(--sv-fx-motion, 1))); }
`

const zigzagSkew = keyframes`
  0%, 100% { transform: skewX(calc(-14deg * var(--sv-fx-motion, 1))) skewY(calc(3deg * var(--sv-fx-motion, 1))); }
  50% { transform: skewX(calc(14deg * var(--sv-fx-motion, 1))) skewY(calc(-3deg * var(--sv-fx-motion, 1))); }
`

const noiseScroll = keyframes`
  0% { transform: translate(0, 0); }
  100% { transform: translate(-10%, -10%); }
`

const bubblePulse = keyframes`
  0%, 100% { clip-path: ellipse(calc(38% / var(--sv-fx-motion, 1)) calc(38% / var(--sv-fx-motion, 1)) at 50% 50%); }
  50% { clip-path: ellipse(calc(28% / var(--sv-fx-motion, 1)) calc(48% / var(--sv-fx-motion, 1)) at 50% 50%); }
`

const fxStaticTransforms = (fx: VisualRestrictions, stretchFactor: number) => {
  const parts: string[] = []
  if (fx.upsideDown) parts.push('rotate(180deg)')
  if (fx.mirror) parts.push('scaleX(-1)')
  if (fx.stretch) {
    const x = (1.9 * stretchFactor).toFixed(2)
    const y = Math.max(0.2, 0.55 / stretchFactor).toFixed(2)
    parts.push(`scaleX(${x}) scaleY(${y})`)
  }
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

const occlusionLayers = (fx: VisualRestrictions | undefined) => {
  if (!fx) return 'none'
  const f = visualIntensityFactors(fx.intensity ?? DEFAULT_VISUAL_INTENSITY)
  const a = f.aperture
  const layers: string[] = []
  if (fx.flashlight) {
    const r = Math.max(14, Math.round(72 * a))
    const soft = Math.max(18, Math.round(22 * a))
    const mid = Math.max(28, Math.round(40 * a))
    const hard = Math.max(40, Math.round(58 * a))
    layers.push(
      `radial-gradient(circle ${r}px at 50% 48%, transparent 0 ${soft}%, rgba(0,0,0,0.8) ${mid}%, #000 ${hard}%)`
    )
  }
  if (fx.tunnel) {
    const hole = Math.max(4, Math.round(16 * a))
    const mid = Math.max(12, Math.round(34 * a))
    const edge = Math.max(22, Math.round(55 * a))
    layers.push(
      `radial-gradient(circle at 50% 50%, transparent 0 ${hole}%, rgba(0,0,0,0.78) ${mid}%, #000 ${edge}%)`
    )
  }
  if (fx.vignette) {
    const clear = Math.max(2, Math.round(18 * a))
    const mid = Math.max(20, Math.round(55 * a))
    layers.push(`radial-gradient(circle at 50% 50%, transparent ${clear}%, rgba(0,0,0,0.7) ${mid}%, #000 100%)`)
  }
  return layers.length ? layers.join(', ') : 'none'
}

const StyledStreetView = styled.div<StyledProps>`
  height: 100%;
  width: 100%;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  --sv-hue: 0deg;
  ${({ $fx }) => {
    const f = visualIntensityFactors($fx?.intensity ?? DEFAULT_VISUAL_INTENSITY)
    return css`
      --sv-fx-motion: ${f.motion};
      --sv-fx-speed: ${f.speed};
      --sv-fx-filter: ${f.filter};
      --sv-fx-noise: ${f.noise};
    `
  }}
  ${({ $fx }) =>
    $fx?.hueShift
      ? css`
          animation: ${hueCycle} calc(3.5s / var(--sv-fx-speed, 1)) linear infinite;
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
            animation: ${spinYaw} calc(9s / var(--sv-fx-speed, 1)) linear infinite;
          `
        : inactiveLayer}
  }

  .fx-layer-wander {
    ${({ $fx }) =>
      $fx?.wander
        ? css`
            ${layerFill}
            animation: ${wanderDrift} calc(5.5s / var(--sv-fx-speed, 1)) ease-in-out infinite;
          `
        : inactiveLayer}
  }

  .fx-layer-drunk {
    ${({ $fx }) =>
      $fx?.drunk
        ? css`
            ${layerFill}
            animation: ${drunkSway} calc(1.5s / var(--sv-fx-speed, 1)) ease-in-out infinite;
          `
        : inactiveLayer}
  }

  .fx-layer-wobble {
    ${({ $fx }) =>
      $fx?.wobble
        ? css`
            ${layerFill}
            animation: ${wobbleJelly} calc(0.7s / var(--sv-fx-speed, 1)) ease-in-out infinite;
          `
        : inactiveLayer}
  }

  .fx-layer-zigzag {
    ${({ $fx }) =>
      $fx?.zigzag
        ? css`
            ${layerFill}
            animation: ${zigzagSkew} calc(0.95s / var(--sv-fx-speed, 1)) ease-in-out infinite;
          `
        : inactiveLayer}
  }

  .fx-layer-bubble {
    ${({ $fx }) =>
      $fx?.bubble
        ? css`
            ${layerFill}
            animation: ${bubblePulse} calc(2.8s / var(--sv-fx-speed, 1)) ease-in-out infinite;
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
      const f = visualIntensityFactors($fx.intensity ?? DEFAULT_VISUAL_INTENSITY)
      const filter = buildStreetViewCssFilter($fx, f.intensity)
      const staticT = fxStaticTransforms($fx, f.stretch)
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
    animation: ${blinkFade} calc(1.6s / var(--sv-fx-speed, 1)) ease-in-out infinite;
  }

  .fx-vignette-veil {
    display: ${({ $fx }) => ($fx?.vignette || $fx?.tunnel || $fx?.flashlight ? 'block' : 'none')};
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: ${({ $fx }) => occlusionLayers($fx)};
  }

  .fx-noise-veil {
    display: ${({ $fx }) => ($fx?.staticNoise ? 'block' : 'none')};
    position: absolute;
    inset: -20%;
    z-index: 1;
    pointer-events: none;
    opacity: var(--sv-fx-noise, 0.55);
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
    animation: ${noiseScroll} calc(0.22s / var(--sv-fx-speed, 1)) steps(2) infinite;
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
      z-index: var(--z-hud);
      -webkit-tap-highlight-color: transparent;

      svg {
        height: var(--icon-lg);
        color: var(--text-primary);

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
    z-index: calc(var(--z-hud) + 1);
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
    z-index: calc(var(--z-hud) + 1);
    padding: 8px 14px;
    border-radius: 999px;
    background: var(--hud-surface);
    border: 1px solid var(--border-strong);
    color: var(--warning);
    font-size: var(--font-compact);
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
