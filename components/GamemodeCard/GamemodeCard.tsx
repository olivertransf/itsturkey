import Link from 'next/link'
import { FC } from 'react'
import { Button } from '@components/system'
import { StyledGamemodeCard } from './'

type Props = {
  title: string
  titleColor: string
  description: string
  buttonText: string
  href?: string
}

const GamemodeCard: FC<Props> = ({ title, titleColor, description, buttonText, href }) => {
  return (
    <StyledGamemodeCard titleColor={titleColor}>
      <div className="gamemode-details">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      {href && (
        <Link href={href}>
          <Button variant="primary">{buttonText}</Button>
        </Link>
      )}

      {!href && (
        <Button variant="primary">{buttonText}</Button>
      )}
    </StyledGamemodeCard>
  )
}

export default GamemodeCard
