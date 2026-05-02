import styled from 'styled-components'

const StyledHomePage = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);

  .main-content {
    max-width: var(--mainMaxWidth);
    width: 100%;
    padding: 40px;
    margin: 0 auto;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    padding-top: clamp(48px, 12vh, 120px);

    @media (max-width: 500px) {
      padding: 32px 16px 40px;
      padding-top: clamp(36px, 10vh, 100px);
    }

    .home-stack {
      width: 100%;
      max-width: 1200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: clamp(2rem, 5vw, 3rem);
    }

    .site-title {
      margin: 0;
      font-size: clamp(1.85rem, 5vw, 2.35rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.15;
      color: var(--text-primary);
      text-align: center;
    }

    .home-section {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .section-title {
      margin: 0;
      font-size: clamp(1.25rem, 3vw, 1.5rem);
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      text-align: center;
    }

    .card-grid {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 380px));
      gap: 1.5rem;
      justify-content: center;
    }

    .home-empty {
      width: 100%;
      max-width: 720px;
      margin-top: 1.25rem;
      padding: 20px 16px;
      border-radius: 12px;
      border: 1px solid var(--grey-400);
      background: var(--grey-100);
      color: var(--text-primary);
      line-height: 1.5;
    }
  }
`

export default StyledHomePage
