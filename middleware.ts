import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  // Site is always publicly viewable. Access control is enforced at gameplay endpoints instead.
  void req
  return NextResponse.next()
}
