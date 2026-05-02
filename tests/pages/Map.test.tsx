import MapPage from '@pages/map/[id]'
import { render } from '@testing-library/react'

jest.mock('next/router', () => ({
  useRouter: () => ({
    query: {},
  }),
}))

test('should show map page', () => {
  render(<MapPage />)
})
