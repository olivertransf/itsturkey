import styled from 'styled-components'

const StyledHomePage = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  background-image: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.12), transparent);

  .main-content {
    max-width: var(--mainMaxWidth);
    width: 100%;
    padding: var(--space-page-y) var(--page-gutter);
    margin: 0 auto;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    padding-top: clamp(2rem, 10vh, 5.5rem);
    padding-bottom: clamp(2.5rem, 8vh, 5rem);

    @media (max-width: 500px) {
      padding: var(--space-page-y-mobile) var(--page-gutter);
      padding-top: clamp(1.75rem, 8vh, 4rem);
    }

    .home-stack {
      width: 100%;
      max-width: 1120px;
      margin-inline: auto;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: clamp(2rem, 4.5vw, 3rem);
    }

    .home-hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--stack-gap-sm);
      max-width: 36rem;
      margin-inline: auto;
      text-align: center;
    }

    .site-title {
      margin: 0;
      font-size: clamp(1.9rem, 5vw, 2.5rem);
      font-weight: 700;
      letter-spacing: -0.035em;
      line-height: 1.12;
      color: var(--text-primary);
    }

    .site-tagline {
      margin: 0;
      font-size: clamp(0.95rem, 2.4vw, 1.05rem);
      font-weight: 400;
      line-height: 1.45;
      color: var(--text-muted);
    }

    .home-section {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: var(--stack-gap-md);
    }

    .section-title {
      margin: 0;
      font-size: var(--label-upper-size);
      font-weight: 600;
      letter-spacing: var(--label-upper-tracking);
      text-transform: uppercase;
      color: var(--text-muted);
      text-align: left;
      width: 100%;
    }

    .card-grid {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 272px), 1fr));
      gap: var(--grid-gap-cards);
      align-items: stretch;
      justify-items: stretch;
    }

    .home-empty {
      width: 100%;
      max-width: 720px;
      margin-top: 1.25rem;
      padding: 18px 18px;
      border-radius: 14px;
      border: 1px solid var(--border-subtle);
      background: var(--bg-elevated);
      color: var(--text-muted);
      line-height: 1.55;
      font-size: 0.95rem;

      code {
        font-size: 0.85em;
        color: var(--text-primary);
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

  }
`

export default StyledHomePage
