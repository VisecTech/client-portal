import { createHmac, timingSafeEqual } from 'crypto';
import { cookies, headers } from 'next/headers';

// The portal keeps NO user data: a signed cookie naming the contact, nothing
// else. Who they are and what they may see is asked of Flyleaf on every page,
// so switching a contact off in Flyleaf locks them out on their next click.
const COOKIE = '__Host-up_portal';
const AGE = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET is required');
  return s;
}
const sign = (p: string) => createHmac('sha256', secret()).update(p).digest('base64url');

export async function startSession(contactId: string) {
  const payload = `${contactId}.${Date.now() + AGE * 1000}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: AGE,
  });
}

/**
 * ⚠ Not cookies().delete(): a __Host- cookie is only accepted with Secure + Path=/,
 *   and delete() sends neither, so the browser IGNORED it and "Sign out" left the
 *   visitor signed in (caught in the browser test, 2026-11-11). Overwrite with the
 *   same attributes and an immediate expiry instead.
 */
export async function endSession() {
  (await cookies()).set(COOKIE, '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 });
}

export async function contactId(): Promise<string | null> {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return null;
  const i = v.lastIndexOf('.');
  if (i < 0) return null;
  const payload = v.slice(0, i), sig = v.slice(i + 1), want = sign(payload);
  if (sig.length !== want.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return null;
  const [id, exp] = payload.split('.');
  if (!id || !(Number(exp) > Date.now())) return null;
  return id;
}

/** The visitor as nginx saw them (X-Real-IP is SET by nginx), for Flyleaf's audit log. */
export async function visitor() {
  const h = await headers();
  return { client_ip: h.get('x-real-ip') ?? null, client_ua: h.get('user-agent') ?? null };
}
