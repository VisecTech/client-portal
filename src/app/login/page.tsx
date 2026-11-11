import { redirect } from 'next/navigation';
import { Chrome } from '../chrome';
import { call } from '@/lib/flyleaf';
import { contactId, visitor } from '@/lib/session';

export const dynamic = 'force-dynamic';

async function requestLink(formData: FormData) {
  'use server';
  const email = String(formData.get('email') ?? '').trim().slice(0, 320);
  if (email) {
    // Same answer whether or not the address is known — see Flyleaf's portal.ts.
    try { await call('request_link', { email, ...(await visitor()) }); } catch { /* shown the same page either way */ }
  }
  redirect('/login?sent=1');
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ sent?: string; e?: string }> }) {
  if (await contactId()) redirect('/');
  const sp = await searchParams;
  return (
    <Chrome>
      <div className="narrow stack" style={{ margin: '24px auto 0', gap: 20 }}>
        <p className="eyebrow">Client portal</p>
        <h1>Sign in to follow your project</h1>
        {sp.sent ? (
          <div className="notice" role="status">
            If that address has access, we&apos;ve emailed it a sign-in link. It works once, for 15 minutes.
            Nothing arrived? Check your spam folder, or ask Paul to confirm the address we have for you.
          </div>
        ) : (
          <p className="muted">Enter the email address we have for you and we&apos;ll send you a one-time sign-in link. No password needed.</p>
        )}
        {sp.e === 'link' && <div className="notice" role="alert">That link has expired or was already used. Ask for a new one below.</div>}
        {sp.e === 'ended' && <div className="notice" role="alert">Your access to this portal has changed, so you&apos;ve been signed out. If that&apos;s unexpected, ask Paul.</div>}
        <form action={requestLink} className="stack">
          <label className="field" htmlFor="email">Email address
            <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@yourbusiness.com.au" />
          </label>
          <button type="submit" className="btn">Email me a sign-in link</button>
        </form>
      </div>
    </Chrome>
  );
}
