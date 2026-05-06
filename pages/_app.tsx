import '@styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import { ReactElement } from 'react'
import { Toaster } from 'react-hot-toast'
import { Provider as RedudxProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ThemeProvider } from 'styled-components'
import { Layout } from '@components/layout'
import { Meta } from '@components/Meta'
import DuelInviteNotifier from '@components/duel/DuelInviteNotifier'
import SessionSync from '@components/SessionSync'
import { persistor, store } from '@redux/store'
import { PageType } from '@types'
import { theme } from '@utils/theme'

import type { AppProps } from 'next/app'
type AppPropsWithLayout = AppProps & {
  Component: PageType
}

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout = (page: ReactElement) => (Component.noLayout ? page : <Layout>{page}</Layout>)

  return (
    <>
      <Meta />
      <SessionProvider>
        <RedudxProvider store={store}>
          <PersistGate persistor={persistor}>
            <ThemeProvider theme={theme}>
              <SessionSync />
              <DuelInviteNotifier />
              {getLayout(<Component {...pageProps} />)}

              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: 'var(--background3)',
                    color: 'var(--color2)',
                  },
                }}
              />
            </ThemeProvider>
          </PersistGate>
        </RedudxProvider>
      </SessionProvider>
    </>
  )
}

export default App
