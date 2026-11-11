import Link from 'next/link';
import { Chrome } from './chrome';
import { day, HEALTH, loadView, STAGE } from '@/lib/load';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { contact, projects } = await loadView();
  const first = contact.name.split(' ')[0];
  return (
    <Chrome who={contact}>
      <div className="stack" style={{ gap: 8 }}>
        <p className="eyebrow">{contact.client}</p>
        <h1>Hello {first}</h1>
        <p className="muted">Your projects with Uplink Web Services.</p>
      </div>
      {projects.length === 0 ? (
        <div className="card" style={{ marginTop: 24 }}>
          <p style={{ margin: 0 }}>There&apos;s nothing to show here yet. Paul will let you know when your project is ready to follow.</p>
        </div>
      ) : (
        <div className="grid" style={{ marginTop: 24 }}>
          {projects.map((p) => {
            const waiting = p.milestones.filter((m) => m.needs_signoff && !m.signed_off_at).length;
            const next = p.milestones.find((m) => !m.done);
            return (
              <Link key={p.slug} href={`/p/${p.slug}`} className="card projcard stack">
                <div className="row">
                  <span className="pill">{STAGE[p.status] ?? p.status}</span>
                  {p.health && <span className={`pill ${p.health}`}>{HEALTH[p.health]}</span>}
                  {waiting > 0 && contact.can_approve && <span className="pill wait">{waiting} to sign off</span>}
                </div>
                <h2>{p.name}</h2>
                {p.summary && <p className="muted" style={{ margin: 0 }}>{p.summary}</p>}
                <p className="meta" style={{ margin: 0 }}>
                  {next ? `Next: ${next.title}${next.due ? ` · ${day(next.due)}` : ''}` : p.updates[0] ? `Last update ${day(p.updates[0].created_at)}` : 'No updates yet'}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </Chrome>
  );
}
