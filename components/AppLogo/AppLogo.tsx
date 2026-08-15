import Link from 'next/link'
import { FC } from 'react'
import { SITE_NAME } from '@utils/constants/site'
import { StyledAppLogo } from './'

const AppLogo: FC = () => {
  return (
    <StyledAppLogo>
      <Link href="/" className="logo">
        <span className="wordmark">{SITE_NAME}</span>
      </Link>
    </StyledAppLogo>
  )
}

export default AppLogo
