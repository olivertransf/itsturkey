import styled from 'styled-components'

const StyledHomePage = styled.div`
  min-height: 100%;
  background-color: var(--bg-primary);
  background-image: var(--bg-pattern);

  .home-hero {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: clamp(8rem, 22vh, 14rem);
    padding: clamp(3rem, 10vh, 6rem) var(--page-gutter) clamp(2rem, 6vh, 4rem);
    box-sizing: border-box;
  }

  .home-hero-title {
    margin: 0;
    text-align: center;
    font-size: clamp(2.25rem, 6vw, 3.5rem);
    font-weight: 800;
    letter-spacing: var(--tracking-display);
    line-height: 1;
    color: var(--text-primary);
  }

  .main-content {
    width: 100%;
    max-width: none;
    margin: 0;
    box-sizing: border-box;
    display: flex;
    justify-content: stretch;
    padding: var(--space-3) var(--page-gutter) var(--pad-page-y-bottom);

    @media (max-width: 600px) {
      padding: var(--space-3) var(--page-gutter) var(--pad-page-y-bottom);
    }
  }

  .home-shell {
    width: 100%;
    max-width: none;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-6);
  }

  .home-body {
    width: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-4);
    align-items: stretch;
  }

  .home-shell--with-friends .home-body {
    grid-template-columns: minmax(0, 1fr) minmax(280px, 320px);

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
    }
  }

  .home-shell--with-friends .home-body {
    grid-template-columns: minmax(0, 1fr) minmax(280px, 320px);

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
    }
  }

  .home-main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-6);
  }

  .home-play-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
    padding: 16px;

    @media (max-width: 800px) {
      grid-template-columns: 1fr;
    }
  }

  .home-maps-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 16px;

    @media (max-width: 800px) {
      grid-template-columns: 1fr;
    }
  }

  .home-maps-grid .home-row-card {
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
    gap: var(--space-4);
    min-height: 132px;
    padding: 18px;
    border-radius: var(--radius-lg);
    background: var(--bg-elevated);
    border: var(--border-default);
    box-shadow: none;

    &:hover {
      border-color: var(--border-strong);
      background: var(--control-fill);
    }
  }

  .home-maps-grid .home-row-letter,
  .home-maps-grid .home-row-flag {
    display: none;
  }

  .home-maps-grid .home-row-title {
    white-space: normal;
    font-size: var(--font-title);
  }

  .home-maps-grid .home-row-actions {
    justify-content: flex-end;
    margin-top: auto;
  }

  .home-friends-rail {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    align-self: stretch;
    min-height: 0;

    > *:last-child {
      flex: 1 1 auto;
    }

    @media (max-width: 960px) {
      order: -1;
      align-self: stretch;

      > *:last-child {
        flex: 0 1 auto;
      }
    }
  }

  .home-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-3);
  }

  .home-panel {
    width: 100%;
    border-radius: var(--radius-xl);
    border: var(--border-default);
    background: var(--bg-card);
    overflow: hidden;
  }

  .home-panel-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-3);
    padding: 14px 18px;
    border-bottom: 1px solid var(--divider-line);
  }

  .home-panel-title {
    margin: 0;
    font-size: var(--font-compact);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-subtle);
  }

  .home-panel-link {
    font-size: var(--font-compact);
    font-weight: 600;
    color: var(--text-muted);
    text-decoration: none;

    &:hover {
      color: var(--text-primary);
    }
  }

  .home-panel-body {
    display: flex;
    flex-direction: column;
  }

  .mode-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .home-empty-quiet {
    margin: 0;
    padding: var(--space-4);
    font-size: var(--font-meta);
    color: var(--text-muted);
  }

  .home-equitable-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-3);
    width: 100%;
    align-items: stretch;
  }

  .home-equitable-status {
    margin: 0;
    font-size: var(--font-meta);
    line-height: 1.45;
    color: var(--text-muted);

    &--error {
      color: var(--danger);
    }
  }

  .section-title {
    margin: 0;
    font-size: var(--font-title);
    font-weight: 700;
    letter-spacing: var(--tracking-title);
    text-transform: none;
    color: var(--text-primary);
    text-align: left;
    width: 100%;
    line-height: 1.15;

    &::after {
      content: none;
    }
  }

  .card-grid {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .home-geo-cta-row {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    margin-top: 0;
  }

  .home-geo-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: var(--control-height-md);
    padding: 0 var(--space-4);
    border-radius: var(--radius-md);
    font-size: var(--font-body);
    font-weight: 700;
    letter-spacing: -0.02em;
    text-decoration: none;
    color: var(--white);
    background: var(--accent-primary);

    &:hover {
      background: var(--accent-primary-hover);
    }
  }

  .home-footer {
    width: 100%;
    max-width: none;
    margin-inline: 0;
    margin-top: var(--space-4);
    padding-top: var(--space-6);
    border-top: 1px solid var(--border-subtle);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--stack-gap-md);
    text-align: left;
  }

  .home-footer-note {
    margin: 0;
    font-size: var(--font-meta);
    line-height: 1.55;
    color: var(--text-muted);

    a {
      color: var(--text-primary);
      text-decoration: underline;
      text-underline-offset: 3px;
      text-decoration-color: rgba(255, 255, 255, 0.25);

      &:hover {
        text-decoration-color: rgba(255, 255, 255, 0.45);
      }
    }
  }
`

export default StyledHomePage
