import styled from 'styled-components'

const StyledHomePage = styled.div`
  min-height: 100vh;
  background-color: var(--bg-primary);

  .main-content {
    width: 100%;
    max-width: none;
    margin: 0;
    box-sizing: border-box;
    display: flex;
    justify-content: stretch;
    padding: var(--pad-page-y-lg) var(--page-gutter) var(--pad-page-y-bottom);

    @media (max-width: 600px) {
      padding: clamp(1.25rem, 6vh, 3rem) var(--page-gutter) var(--pad-page-y-bottom);
    }
  }

  .home-shell {
    width: 100%;
    max-width: none;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: clamp(1.35rem, 3vw, 2rem);
  }

  .home-topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    width: 100%;
  }

  .home-wordmark {
    font-size: var(--font-section);
    font-weight: 800;
    letter-spacing: var(--tracking-display);
    color: var(--text-primary);
    text-decoration: none;

    &:hover {
      color: var(--palette-accent);
    }
  }

  .home-topbar-end {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .home-online-jump {
    font-size: var(--font-meta);
    font-weight: 600;
    color: var(--text-muted);
    text-decoration: none;

    &:hover {
      color: var(--text-primary);
    }
  }

  .home-body {
    width: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: clamp(1.25rem, 2.5vw, 1.75rem);
    align-items: start;
  }

  .home-shell--with-friends .home-body {
    grid-template-columns: minmax(0, 1fr) minmax(260px, 300px);

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
    }
  }

  .home-main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: clamp(1.5rem, 3.2vw, 2.15rem);
  }

  .home-friends-rail {
    min-width: 0;
    position: sticky;
    top: var(--space-4);
    align-self: start;
    max-height: calc(100vh - var(--space-8));
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.16) transparent;

    @media (max-width: 960px) {
      position: static;
      max-height: none;
      overflow: visible;
      order: -1;
    }
  }

  .home-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--stack-gap-sm);
  }

  .mode-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
    gap: 14px;
  }

  .home-featured-map {
    margin-bottom: var(--space-2);
  }

  .home-empty-quiet {
    margin: 0;
    font-size: var(--font-meta);
    color: var(--text-muted);
  }

  .home-equitable-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 14px;
    width: 100%;
    align-items: stretch;
  }

  .home-equitable-status {
    margin: 0;
    font-size: var(--font-compact);
    line-height: 1.45;
    color: var(--text-muted);

    &--error {
      color: var(--danger);
    }
  }

  .section-title {
    margin: 0;
    font-size: var(--label-upper-size);
    font-weight: 700;
    letter-spacing: var(--label-upper-tracking);
    text-transform: uppercase;
    color: var(--palette-accent);
    text-align: left;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;

    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--divider-line);
      min-width: 24px;
    }
  }

  .card-grid {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
    gap: 14px;
    align-items: stretch;
    justify-items: stretch;
  }

  .home-geo-cta-row {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: var(--space-3);
  }

  .home-geo-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: var(--control-height-md);
    padding: 0 var(--space-6);
    border-radius: var(--radius-md);
    font-size: var(--font-body);
    font-weight: 600;
    letter-spacing: -0.01em;
    text-decoration: none;
    color: var(--white);
    background: var(--accent-primary);

    &:hover {
      background: var(--accent-primary-hover);
    }
  }

  .home-footer {
    width: 100%;
    max-width: 520px;
    margin-inline: auto;
    margin-top: var(--stack-gap-sm);
    padding-top: clamp(1.5rem, 3.5vw, 2rem);
    border-top: 1px solid var(--border-subtle);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--stack-gap-md);
    text-align: center;
  }

  .home-footer-note {
    margin: 0;
    font-size: 0.9rem;
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
