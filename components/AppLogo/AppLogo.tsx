import Link from 'next/link'
import React, { FC } from 'react'
import { StyledAppLogo } from './'

const AppLogo: FC = () => {
  return (
    <StyledAppLogo>
      <Link href="/" className="logo-link">
        <a className="logo">
          <span className="wordmark">Play</span>
        </a>
      </Link>
    </StyledAppLogo>
  )
}

export default AppLogo
