import styled from 'styled-components'

const StyledLayout = styled.div`
  .app-layout {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100vh;
    height: 100dvh;
    position: relative;
  }

  .appBody {
    display: flex;
    flex: 1;
    min-height: 0;
    width: 100%;
    overflow: hidden;
  }

  .ban-message {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: max(20px, env(safe-area-inset-bottom, 0px));
    padding: 20px;
    border-radius: var(--radius-lg);
    background-color: var(--danger-fill);
    z-index: var(--z-toast);
    border: 1px solid var(--border-strong);
    text-align: center;
    font-weight: 400;
    width: fit-content;
    max-width: calc(100vw - 32px);

    p {
      margin-top: 4px;
      font-size: 15px;
      color: var(--danger);
    }
  }

  main {
    width: 100% !important;
    height: 100%;
    max-height: 100%;
    position: relative;
    overflow: hidden auto;
    background-color: var(--bg-primary);
    background-image: var(--bg-pattern);
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
      height: auto;
      min-height: 100vh;
      min-height: 100dvh;
      overflow: unset;
      padding: 0;
      box-sizing: border-box;
    }

    .appBody {
      overflow: visible;
      flex: 1 1 auto;
      min-height: 0;
    }

    main {
      height: auto;
      min-height: 0;
      overflow: unset;
    }
  }
`

export default StyledLayout
