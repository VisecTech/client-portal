import { NextResponse } from 'next/server';
import { endSession } from '@/lib/session';

export async function POST() {
  await endSession();
  return NextResponse.redirect(`${process.env.PORTAL_ORIGIN ?? 'https://portal.uplink.net.au'}/login`, 303);
}

/**
 * GET is used when Flyleaf says the session no longer has access (contact
 * switched off or removed): clear the cookie and show the login page. Logging
 * someone out is the only thing it can do, so it needs no CSRF protection.
 */
export async function GET() {
  await endSession();
  return NextResponse.redirect(`${process.env.PORTAL_ORIGIN ?? 'https://portal.uplink.net.au'}/login?e=ended`, 303);
}
