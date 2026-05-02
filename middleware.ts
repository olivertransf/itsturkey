import { NextRequest, NextResponse } from 'next/server'

const SITE_PASSWORD_COOKIE = 'site_password_unlocked'
const SITE_PASSWORD_PAGE = '/site-password'
const PUBLIC_FILE = /\.(.*)$/

const getTokenInput = () => process.env.SITE_PASSWORD as string

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

const getExpectedToken = async () => {
  const data = new TextEncoder().encode(getTokenInput())
  const hash = await crypto.subtle.digest('SHA-256', data)

  return toHex(hash)
}

export async function middleware(req: NextRequest) {
  if (!process.env.SITE_PASSWORD) {
    return NextResponse.next()
  }

  const { pathname, search } = req.nextUrl
  const isAllowedPath =
    pathname === SITE_PASSWORD_PAGE ||
    pathname === '/api/site-password' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    PUBLIC_FILE.test(pathname)

  if (isAllowedPath) {
    return NextResponse.next()
  }

  const expectedToken = await getExpectedToken()
  const providedToken = req.cookies.get(SITE_PASSWORD_COOKIE)

  if (providedToken === expectedToken) {
    return NextResponse.next()
  }

  const url = req.nextUrl.clone()
  url.pathname = SITE_PASSWORD_PAGE
  url.searchParams.set('from', `${pathname}${search}`)

  return NextResponse.redirect(url)
}
