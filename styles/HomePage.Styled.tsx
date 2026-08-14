import styled from 'styled-components'

const StyledHomePage = styled.div`
  min-height: 100%;
  background-color: var(--bg-primary);

  .main-content {
    width: 100%;
    max-width: none;
    margin: 0;
    box-sizing: border-box;
    display: flex;
    justify-content: stretch;
    padding: var(--space-5) var(--page-gutter) var(--pad-page-y-bottom);

    @media (max-width: 600px) {
      padding: var(--space-4) var(--page-gutter) var(--pad-page-y-bottom);
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
    align-items: start;
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

  .home-friends-rail {
    min-width: 0;
    position: sticky;
    top: var(--space-5);
    align-self: start;
    max-height: calc(100vh - var(--space-8));
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
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
    gap: var(--space-3);
  }

  .mode-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .home-empty-quiet {
    margin: 0;
    font-size: var(--font-body);
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
