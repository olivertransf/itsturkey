import styled from 'styled-components'

const StyledLayout = styled.div`
  .app-layout {
    overflow: hidden;
    height: 100vh;
    position: relative;
  }

  .appBody {
    display: flex;
    width: 100%;
    overflow: hidden;
  }

  .ban-message {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 20px;
    padding: 20px;
    border-radius: 20px;
    background-color: #14073a;
    background-color: #7f1d1d;
    background-color: #450a0a;
    z-index: 99999;
    border: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;
    font-weight: 400;
    width: fit-content;

    p {
      margin-top: 4px;
      font-size: 15px;
      color: #fca5a5;
      color: #fecaca;
    }
  }

  main {
    width: 100% !important;
    height: 100vh;
    max-height: 100%;
    position: relative;
    overflow: hidden auto;
    background-image: radial-gradient(ellipse 90% 55% at 50% -35%, rgba(124, 58, 237, 0.06), transparent 48%);
    background-attachment: local;
  }

  .mainContent {
    max-width: var(--mainMaxWidth);
    width: 100%;
    padding: 3.5rem;
    margin: 0 auto;
    height: 100%;

    @media (max-width: 600px) {
      padding: 1rem;
    }
  }

  @media (max-width: 600px) {
    .app-layout {
      width: 100%;
      height: unset;
      overflow: unset;
      padding: 0;
      box-sizing: border-box;
    }

    main {
      height: auto;
      min-height: 100vh;
      overflow: unset;
    }
  }
`

export default StyledLayout
