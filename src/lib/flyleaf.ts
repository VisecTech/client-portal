// The portal's only source of data: Flyleaf's /api/portal over loopback.
// FLYLEAF_PORTAL_URL (http://127.0.0.1:3100/api/portal) + FLYLEAF_PORTAL_KEY.
// ⚠ Server-only. Never import from a client component.
import 'server-only';

export type Contact = { id: string; name: string; email: string; client: string; can_view: boolean; can_approve: boolean; can_request: boolean };
export type Milestone = { id: string; title: string; due: string | null; done: boolean; needs_signoff: boolean; signed_off_at: string | null; signed_off_name: string | null };
export type Update = { id: string; health: string | null; body_md: string; created_at: string };
export type Project = { slug: string; name: string; status: string; health: string | null; summary: string; due_on: string | null; milestones: Milestone[]; updates: Update[] };
export type View = { contact: Contact; projects: Project[] };

export async function call<T>(op: string, body: Record<string, unknown>): Promise<T> {
  const r = await fetch(process.env.FLYLEAF_PORTAL_URL ?? 'http://127.0.0.1:3100/api/portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.FLYLEAF_PORTAL_KEY ?? ''}` },
    body: JSON.stringify({ op, ...body }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  });
  const data = (await r.json().catch(() => ({}))) as T & { error?: string };
  if (!r.ok) throw new Error(data.error ?? 'Something went wrong. Please try again.');
  return data;
}
