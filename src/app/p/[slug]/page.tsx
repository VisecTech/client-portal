import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Chrome } from '../../chrome';
import { call } from '@/lib/flyleaf';
import { day, HEALTH, loadView, STAGE } from '@/lib/load';
import { contactId, visitor } from '@/lib/session';

export const dynamic = 'force-dynamic';

async function signOff(slug: string, milestoneId: string, formData: FormData) {
  'use server';
  const id = await contactId();
  if (!id) redirect('/login');
  if (formData.get('confirm') !== 'on') redirect(`/p/${slug}?e=confirm#m-${milestoneId}`);
  try {
    await call('signoff', { contact_id: id, milestone_id: milestoneId, ...(await visitor()) });
  } catch {
    redirect(`/p/${slug}?e=signoff`);
  }
  revalidatePath(`/p/${slug}`);
  redirect(`/p/${slug}?ok=signoff`);
}

async function sendRequest(slug: string, formData: FormData) {
  'use server';
  const id = await contactId();
  if (!id) redirect('/login');
  try {
    await call('request', {
      contact_id: id, project: slug,
      title: String(formData.get('title') ?? ''), body: String(formData.get('body') ?? ''), ...(await visitor()),
    });
  } catch {
    redirect(`/p/${slug}?e=request`);
  }
  redirect(`/p/${slug}?ok=request`);
}

const MSG: Record<string, string> = {
  signoff: 'Thanks, your sign-off is recorded and Paul has been told.',
  request: 'Thanks, Paul has your request and will get back to you.',
};
const ERR: Record<string, string> = {
  confirm: 'Please tick the box to confirm before signing off.',
  signoff: 'That milestone could not be signed off. It may already be done; refresh to check.',
  request: 'Your request could not be sent. Please say what you need in a few words and try again.',
};

export default async function ProjectPage({ params, searchParams }: {
  params: Promise<{ slug: string }>; searchParams: Promise<{ ok?: string; e?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const { contact, projects } = await loadView();
  const p = projects.find((x) => x.slug === slug);
  if (!p) notFound(); // not shared with this contact — indistinguishable from not existing

  return (
    <Chrome who={contact}>
      <Link href="/" className="link meta">← All projects</Link>
      <div className="stack" style={{ gap: 10, marginTop: 14 }}>
        <div className="row">
          <span className="pill">{STAGE[p.status] ?? p.status}</span>
          {p.health && <span className={`pill ${p.health}`}>{HEALTH[p.health]}</span>}
          {p.due_on && <span className="meta">Target {day(p.due_on)}</span>}
        </div>
        <h1>{p.name}</h1>
        {p.summary && <p className="muted" style={{ margin: 0, maxWidth: '65ch' }}>{p.summary}</p>}
      </div>

      {sp.ok && MSG[sp.ok] && <div className="notice" role="status" style={{ marginTop: 18 }}>{MSG[sp.ok]}</div>}
      {sp.e && ERR[sp.e] && <div className="notice" role="alert" style={{ marginTop: 18 }}>{ERR[sp.e]}</div>}

      <div className="split" style={{ marginTop: 28 }}>
        <section className="stack" style={{ gap: 14 }}>
          <h2>Updates</h2>
          {p.updates.length === 0 ? (
            <p className="muted">No updates yet.</p>
          ) : (
            <ol className="timeline">
              {p.updates.map((u) => (
                <li key={u.id}>
                  <div className="row"><span className="meta">{day(u.created_at)}</span>{u.health && <span className={`pill ${u.health}`}>{HEALTH[u.health]}</span>}</div>
                  <p>{u.body_md}</p>
                </li>
              ))}
            </ol>
          )}
        </section>

        <aside className="stack" style={{ gap: 24 }}>
          <section className="card stack" style={{ gap: 6 }}>
            <h2>Milestones</h2>
            {p.milestones.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>None set yet.</p>
            ) : (
              <ul className="ms">
                {p.milestones.map((m) => (
                  <li key={m.id} id={`m-${m.id}`}>
                    <div className="row" style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}>
                      <span className={`tick ${m.done ? 'done' : m.signed_off_at ? 'signed' : ''}`} aria-hidden="true" style={{ marginTop: 3 }} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div>{m.title}<span className="sr-only">{m.done ? ' (done)' : m.signed_off_at ? ' (signed off)' : ''}</span></div>
                        <div className="meta">
                          {m.due ? day(m.due) : ''}
                          {m.signed_off_at ? `${m.due ? ' · ' : ''}Signed off by ${m.signed_off_name}, ${day(m.signed_off_at)}` : ''}
                        </div>
                        {m.needs_signoff && !m.signed_off_at && contact.can_approve && (
                          <form action={signOff.bind(null, p.slug, m.id)} className="stack" style={{ gap: 8, marginTop: 10 }}>
                            <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.875rem' }}>
                              <input type="checkbox" name="confirm" style={{ width: 'auto', marginTop: 3 }} />
                              <span>I&apos;m happy with this and approve it on behalf of {contact.client}.</span>
                            </label>
                            <button type="submit" className="btn" style={{ alignSelf: 'flex-start' }}>Sign off</button>
                          </form>
                        )}
                        {m.needs_signoff && !m.signed_off_at && !contact.can_approve && (
                          <div className="meta">Waiting for sign-off from {contact.client}</div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {contact.can_request && (
            <section className="card">
              <form action={sendRequest.bind(null, p.slug)} className="stack">
                <h2>Ask for something</h2>
                <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>A change, a question, or something not working. It goes straight to Paul.</p>
                <label className="field" htmlFor="req-title">In a few words
                  <input id="req-title" name="title" required minLength={3} maxLength={140} placeholder="e.g. Update our opening hours" />
                </label>
                <label className="field" htmlFor="req-body">Details (optional)
                  <textarea id="req-body" name="body" rows={5} maxLength={5000} />
                </label>
                <button type="submit" className="btn" style={{ alignSelf: 'flex-start' }}>Send to Paul</button>
              </form>
            </section>
          )}
        </aside>
      </div>
    </Chrome>
  );
}
