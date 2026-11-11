# Uplink client portal

portal.uplink.net.au — where a client contact follows their project, signs off milestones and sends requests.

- **No database, no user data.** A signed session cookie names the contact; everything else is asked of
  Flyleaf (`/api/portal`, loopback + key) on every page, and Flyleaf checks every permission.
- Paul manages contacts and permissions in Flyleaf → client page → Client portal. Nothing is shared by
  default: a project must be marked shared, an update ticked to share.
- Sign-in: one-time email link (Flyleaf mints, emails and redeems it; 15 min, single use). The emailed GET
  only shows a Continue button so mail scanners cannot burn the code.
- Deploy: `npm ci && npm run build`, `systemctl restart client-portal`. See `deploy/`.
