import styled from 'styled-components'

const StyledHomeMapTile = styled.div`
  min-width: 0;

  .home-map-tile {
    --tile-accent: #2f7fff;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-3);
    min-height: 112px;
    padding: var(--space-3);
    box-sizing: border-box;
    border-radius: var(--radius-lg);
    border: 1px solid color-mix(in srgb, var(--tile-accent) 32%, var(--border-subtle));
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--tile-accent) 20%, var(--bg-elevated)) 0%,
      var(--bg-elevated) 72%
    );
    text-decoration: none;
    color: inherit;
    transition: border-color var(--duration-fast) var(--ease), background var(--duration-fast) var(--ease);

    &:hover {
      border-color: color-mix(in srgb, var(--tile-accent) 55%, var(--border-strong));
    }
  }

  .home-map-tile-swatch {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: var(--text-primary);
    background: color-mix(in srgb, var(--tile-accent) 28%, var(--control-fill));
    user-select: none;
  }

  .home-map-tile-swatch--flag {
    font-size: 22px;
    background: transparent;
  }

  .home-map-tile-name {
    font-size: var(--font-meta);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.3;
    color: var(--text-primary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`

export default StyledHomeMapTile
