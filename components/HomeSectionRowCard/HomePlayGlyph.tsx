import { FC } from 'react'

type Props = {
  className?: string
}

/** Solid play triangle for compact home row actions. */
const HomePlayGlyph: FC<Props> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width={16}
    height={16}
    aria-hidden
  >
    <path
      fillRule="evenodd"
      d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.713 1.295 2.574 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z"
      clipRule="evenodd"
    />
  </svg>
)

export default HomePlayGlyph
