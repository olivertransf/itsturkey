import styled from 'styled-components'

const StyledHomePage = styled.div`
  min-height: 100vh;
  background: transparent;
  background-image:
    radial-gradient(ellipse 95% 58% at 50% -28%, rgba(167, 139, 250, 0.14), transparent 50%),
    radial-gradient(ellipse 70% 45% at 100% 0%, rgba(59, 130, 246, 0.09), transparent 42%);

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
      gap: clamp(1.35rem, 3vw, 2rem);
    }

    .home-auth-row {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
      width: 100%;
      flex-wrap: wrap;
    }

    .home-auth-profile {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
        text-underline-offset: 3px;
      }
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
      font-weight: 800;
      letter-spacing: -0.04em;
      line-height: 1.12;
      color: var(--text-primary);
      text-shadow: 0 0 48px rgba(167, 139, 250, 0.2);
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
      gap: var(--stack-gap-sm);
    }

    .home-section-hint {
      margin: -4px 0 8px;
      font-size: 12px;
      line-height: 1.45;
      color: var(--text-muted);
      max-width: 52rem;

      code {
        font-size: 0.85em;
        color: var(--text-primary);
      }
    }

    .home-equitable-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 10px;
      width: 100%;
      align-items: stretch;
    }

    .home-equitable-status {
      margin: 0;
      font-size: 12.5px;
      line-height: 1.45;
      color: var(--text-muted);

      code {
        font-size: 0.85em;
        color: var(--text-primary);
      }

      &--error {
        color: #fca5a5;
      }
    }

    .section-title {
      margin: 0;
      font-size: var(--label-upper-size);
      font-weight: 700;
      letter-spacing: var(--label-upper-tracking);
      text-transform: uppercase;
      color: #c4b5fd;
      text-align: left;
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;

      &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, rgba(167, 139, 250, 0.35), transparent);
        min-width: 24px;
      }
    }

    .card-grid {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
      gap: 12px;
      align-items: stretch;
      justify-items: stretch;
    }

    .home-geo-cta-row {
      width: 100%;
      display: flex;
      justify-content: center;
      margin-top: 14px;
    }

    .home-geo-cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px 28px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: -0.02em;
      text-decoration: none;
      color: #fff;
      background: linear-gradient(135deg, #6366f1 0%, #7c3aed 55%, #4f46e5 100%);
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.12) inset,
        0 12px 32px rgba(79, 70, 229, 0.35);
      transition:
        transform 0.12s ease,
        box-shadow 0.12s ease,
        filter 0.12s ease;

      &:hover {
        filter: brightness(1.06);
        transform: translateY(-1px);
        box-shadow:
          0 0 0 1px rgba(255, 255, 255, 0.16) inset,
          0 16px 40px rgba(79, 70, 229, 0.42);
      }

      &:active {
        transform: translateY(0);
      }
    }

    .home-geo-cta--secondary {
      background: var(--bg-elevated);
      color: var(--text-primary);
      box-shadow: 0 0 0 1px var(--border-subtle) inset;
      font-weight: 600;
      font-size: 14px;
      padding: 10px 22px;

      &:hover {
        filter: none;
        background: ${({ theme }) => theme.color.gray[800]};
        box-shadow: 0 0 0 1px rgba(167, 139, 250, 0.35) inset;
      }
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
