import Link from 'next/link'
import { FC } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/outline'
import StyledPageBackLink from './PageBackLink.Styled'

type Props = {
  href?: string
  label?: string
  /** Tighter spacing for navbars or dense headers */
  compact?: boolean
}

const PageBackLink: FC<Props> = ({ href = '/', label = 'Back to home', compact }) => {
  return (
    <StyledPageBackLink $compact={compact}>
      <Link href={href} className="page-back-link">
        <ArrowLeftIcon aria-hidden />
        {label}
      </Link>
    </StyledPageBackLink>
  )
}

export default PageBackLink
