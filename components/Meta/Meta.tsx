import NextHead from 'next/head'
import { FC } from 'react'
import { SITE_NAME } from '@utils/constants/site'

type Props = {
  title?: string
  description?: string
  ogUrl?: string
  ogImage?: string
}

const Meta: FC<Props> = ({ title, description, ogUrl, ogImage }) => {
  const defaultTitle = SITE_NAME
  const defaultDescription = 'A geography guessing game.'
  const defaultOGURL =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    (typeof process.env.VERCEL_URL === 'string' && process.env.VERCEL_URL.length > 0
      ? `https://${process.env.VERCEL_URL}`
      : '')
  const defaultOGImage = '/og-image.png'
  const resolvedOgUrl = ogUrl || defaultOGURL

  return (
    <NextHead>
      <meta charSet="utf-8" />
      <title>{title || defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#0e0e0e" />

      <link rel="icon" href="/favicon.ico" sizes="32x32" />
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />

      {resolvedOgUrl ? <meta property="og:url" content={resolvedOgUrl} /> : null}
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={ogImage || defaultOGImage} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={description || defaultDescription} />

      <meta name="twitter:image" content={ogImage || defaultOGImage} />
      {resolvedOgUrl ? <meta name="twitter:url" content={resolvedOgUrl} /> : null}
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
    </NextHead>
  )
}

export default Meta
