import 'server-only';
import { redirect } from 'next/navigation';
import { call, type View } from './flyleaf';
import { contactId } from './session';

/**
 * Every page starts here: who is signed in, and what Flyleaf says they may see
 * RIGHT NOW. A contact switched off (or removed) in Flyleaf gets null, and is
 * sent through /logout on the spot.
 */
export async function loadView(): Promise<View> {
  const id = await contactId();
  if (!id) redirect('/login');
  const { view } = await call<{ view: View | null }>('view', { contact_id: id });
  // ⚠ A page cannot change cookies while rendering (Next throws → 500, caught in
  //   the browser test). The sign-out ROUTE clears the cookie, then shows login.
  if (!view) redirect('/logout?ended=1');
  return view;
}

export const HEALTH: Record<string, string> = { on_track: 'On track', at_risk: 'At risk', off_track: 'Needs attention' };
export const STAGE: Record<string, string> = { shaping: 'Planning', active: 'In progress', waiting: 'Waiting', done: 'Complete', parked: 'On hold' };
export const day = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Australia/Sydney' })
    .format(new Date(iso.length === 10 ? `${iso}T12:00:00+10:00` : iso.replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00'))) : '';
