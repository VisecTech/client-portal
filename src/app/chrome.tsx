import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

/** Header + footer shared by every page. */
export function Chrome({ who, children }: { who?: { name: string; client: string } | null; children: React.ReactNode }) {
  return (
    <>
      <div className="wrap">
        <header className="top">
          <Link href="/" className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="" />
            <span>Uplink <span className="muted sub" style={{ fontWeight: 400 }}>client portal</span></span>
          </Link>
          <div className="who">
            {who && <span className="name">{who.name} · {who.client}</span>}
            <ThemeToggle />
            {who && (
              <form action="/logout" method="post">
                <button type="submit" className="btn ghost" style={{ padding: '8px 12px' }}>Sign out</button>
              </form>
            )}
          </div>
        </header>
      </div>
      <main className="wrap" style={{ paddingBlock: '32px 16px' }}>{children}</main>
      <div className="wrap">
        <footer className="foot">Uplink Web Services · Questions? Reply to any of our emails, or send a request from your project page.</footer>
      </div>
    </>
  );
}
