# Domain cutover — healthos.live → ontor.ai (staged)

*Staged 2026-07-15. Do NOT run the marketing cutover or change DNS until the mobile-safety rules below are satisfied.*

## 🚨 Mobile-safety constraint (read first)

The **mobile app hardcodes `https://healthos.live/api/v1`** (`mobile_app/lib/main.dart:34`) and `https://healthos.live/api/waitlist` (`signup_service.dart:37`). These are baked into every installed test-user build. Therefore:

- **`healthos.live` and its `/api/*` routes MUST keep working indefinitely** — at least until every test user is on a new build that points elsewhere. **Do not retire, park, or repoint `healthos.live` away from the API host.**
- The domain move is **additive, not a replacement**: `ontor.ai` becomes the *public brand* while `healthos.live` keeps serving the API for existing installs.
- **Never 301-redirect `healthos.live/api/*`** to ontor.ai unless the mobile app already sends the right paths there. Redirect only the marketing pages.

## Step 0 — Confirm the actual host (do before any DNS)

The site has live serverless API routes (`app/api/v1/*`, MongoDB, S3) → it is **not** plain GitHub Pages. It's almost certainly **Vercel**. Confirm in the Vercel dashboard which project serves `healthos.live`. **Ignore the GitHub-Pages A-record IPs** unless you verify Pages is actually the host. The `public/CNAME` + `out/` are likely stale.

## Step 1 — Point ontor.ai at the SAME host as an additional domain

On the host (Vercel): **Project → Settings → Domains → Add `ontor.ai`** (and `www.ontor.ai`). Vercel shows the exact DNS records to add in GoDaddy (usually an `A @ 76.76.21.21` and/or a `CNAME www → cname.vercel-dns.com` — **use whatever the dashboard tells you**, not guesses). Keep `healthos.live` attached to the same project. Now both domains serve the same app + API.

## Step 2 — Set the primary/redirect behavior (marketing only)

- Make `ontor.ai` the primary domain for marketing pages.
- Redirect `healthos.live` **pages** → `ontor.ai`, but **exclude `/api/*`** so mobile keeps working (Vercel: a redirect rule that skips `/api`, or simply leave healthos.live un-redirected and just add ontor.ai as an alias).

## Step 3 — Run the frontend marketing rebrand

Once ontor.ai serves the site (green cert): from `healthos-frontend/`:

```bash
bash scripts/domain-cutover.sh   # healthos.live → ontor.ai in metadata, canonical, OG, sitemap, llms.txt, CNAME, email, robots
git diff                          # review
npm run build                     # sanity check
git add -A && git commit -m "Domain cutover: healthos.live → ontor.ai" && git push
```

Note: this also flips the email addresses (`hello@ / sabber@`) to `@ontor.ai` — only do it once ontor.ai email is set up.

## Step 4 — Mobile migration (separate, careful, NON-breaking)

- In a **future mobile build**, change the `--dart-define` default to `https://ontor.ai/api/v1` (or a dedicated `https://api.ontor.ai/api/v1`). New installs use the new endpoint.
- **Keep `healthos.live/api/*` alive for old installs** until analytics show ~zero traffic from the old endpoint. Only then consider sunsetting it.
- Optionally add server-side support so both domains serve `/api` (simplest back-compat).

## Summary

| Thing | Action | When |
|---|---|---|
| ontor.ai DNS | add per host dashboard (likely Vercel), as **additional** domain | after Step 0 |
| healthos.live | **keep serving /api/*** (mobile depends on it) | indefinitely |
| Marketing pages | redirect healthos.live → ontor.ai (not /api) | Step 2 |
| Frontend code | `bash scripts/domain-cutover.sh` | Step 3 |
| Email | flip to @ontor.ai | when email live |
| Mobile app | new build → ontor.ai endpoint, keep old working | later, non-breaking |
