import { NextRequest, NextResponse } from 'next/server';
import { call, type Contact } from '@/lib/flyleaf';
import { startSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

const ORIGIN = () => process.env.PORTAL_ORIGIN ?? 'https://portal.uplink.net.au';

/**
 * The emailed link lands here. Flyleaf redeems the code (single use, 15 min,
 * one atomic update); only then is a session cookie set.
 * ⚠ GET because it is a link in an email. Mail scanners that pre-fetch links
 *   would burn the code, so the GET only shows a confirm button and the POST
 *   redeems it.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code') ?? '';
  const safe = /^[A-Za-z0-9_-]{20,100}$/.test(code) ? code : '';
  const html = `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sign in · Uplink client portal</title>
<style>body{margin:0;font:16px/1.5 system-ui,sans-serif;background:#faf8f5;color:#0f0f0f;display:grid;place-items:center;min-height:100vh;padding:16px}
@media (prefers-color-scheme:dark){body{background:#141110;color:#f4efe9}}
.c{max-width:26rem;text-align:center}button{font:600 1rem system-ui;padding:12px 18px;border-radius:10px;border:0;background:#991b1b;color:#faf8f5;cursor:pointer}</style></head>
<body><div class="c"><p>Signing you in to the Uplink client portal.</p>
<form method="post" action="/auth"><input type="hidden" name="code" value="${safe}"><button type="submit">Continue</button></form></div></body></html>`;
  return new NextResponse(safe ? html : 'Invalid link', {
    status: safe ? 200 : 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
  });
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const code = String(form.get('code') ?? '');
  let contact: Contact | null = null;
  try {
    ({ contact } = await call<{ contact: Contact | null }>('redeem', {
      code, client_ip: req.headers.get('x-real-ip'), client_ua: req.headers.get('user-agent'),
    }));
  } catch { contact = null; }
  if (!contact) return NextResponse.redirect(`${ORIGIN()}/login?e=link`, 303);
  await startSession(contact.id);
  return NextResponse.redirect(`${ORIGIN()}/`, 303);
}
