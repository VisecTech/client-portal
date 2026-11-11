import { NextRequest, NextResponse } from 'next/server';

// Nonce-based CSP (as Flyleaf), plus headers a client-facing login page needs.
export function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data:`,
    `font-src 'self'`,
    `connect-src 'self'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `object-src 'none'`,
  ].join('; ');
  const h = new Headers(request.headers);
  h.set('x-nonce', nonce);
  h.set('content-security-policy', csp);
  const res = NextResponse.next({ request: { headers: h } });
  res.headers.set('content-security-policy', csp);
  res.headers.set('x-robots-tag', 'noindex, nofollow');
  res.headers.set('referrer-policy', 'same-origin');
  res.headers.set('x-content-type-options', 'nosniff');
  res.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
  return res;
}

export const config = { matcher: ['/((?!_next/static|_next/image|icon.svg).*)'] };
