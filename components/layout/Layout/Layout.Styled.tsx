import styled from 'styled-components'

const StyledLayout = styled.div`
  .app-layout {
    overflow: hidden;
    height: 100vh;
    height: 100dvh;
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
    bottom: max(20px, env(safe-area-inset-bottom, 0px));
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
    max-width: calc(100vw - 32px);

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
    height: 100dvh;
    max-height: 100%;
    position: relative;
    overflow: hidden auto;
    background-color: var(--bg-primary);
    -webkit-overflow-scrolling: touch;
  }

  .mainContent {
    max-width: var(--mainMaxWidth);
    width: 100%;
    padding: var(--space-page-y) var(--space-page-x);
    margin: 0 auto;
    height: 100%;
    box-sizing: border-box;

    @media (max-width: 1024px) {
      padding: var(--space-page-y-mobile) var(--page-gutter);
    }
  }

  @media (max-width: 1024px) {
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
      min-height: 100dvh;
      overflow: unset;
    }
  }
`

export default StyledLayout
