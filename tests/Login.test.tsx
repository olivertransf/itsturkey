import LoginPage from '@pages/login'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '@redux/store'

jest.mock('next/router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}))

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  useSession: () => ({ data: null }),
}))

describe('should show login container', () => {
  it('render login container', async () => {
    render(
      <Provider store={store}>
        <LoginPage />
      </Provider>
    )
    const heading = screen.getByText('Welcome Back!')
    expect(heading).toBeInTheDocument()
  })
})
