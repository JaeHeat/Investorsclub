# Bitcoin Daily — Launch Handoff

This document is for the Replit agent (or any engineer) completing the **production launch**.
The front-end and client experience are built and verified; the items below require live
infrastructure (a database, OIDC, secrets) that can't be set up or tested locally.

---

## 0. Get the code — START HERE

**All work is committed and pushed to GitHub.** Nothing is left uncommitted on the author's machine.

- **Repo:** `https://github.com/JaeHeat/Investorsclub.git`
- **Branch with all the new work:** `feature/portal-launch-prep`
- **What's in it:** see the Changelog below (cycle thesis, Delta portfolio, analytics, onboarding, launch hardening, Coinbase price fallback, tests, ToS/Privacy, this handoff).

### Step 1 — pull the branch

**If this Replit workspace is already connected to the repo:**
```bash
git fetch origin
git checkout feature/portal-launch-prep
git pull origin feature/portal-launch-prep
```

**If you're starting fresh (no repo yet):**
```bash
git clone https://github.com/JaeHeat/Investorsclub.git
cd Investorsclub
git checkout feature/portal-launch-prep
```

### Step 2 — install dependencies
This is a **pnpm** workspace on **Node 24**:
```bash
corepack enable pnpm        # if pnpm isn't already available
pnpm install
```

### Step 3 — sanity check (should all pass)
```bash
pnpm run typecheck
pnpm --filter @workspace/cryptotrackr run test     # 15 money-math tests
```

### Step 4 — merge into `main` (when you're ready to make it the live branch)

**Easiest — via GitHub (recommended, gives a reviewable diff):**
1. Open: `https://github.com/JaeHeat/Investorsclub/pull/new/feature/portal-launch-prep`
2. Create the pull request, review, and **Merge**.
3. Then locally: `git checkout main && git pull origin main`

**Or via the command line:**
```bash
git checkout main
git pull origin main
git merge feature/portal-launch-prep
git push origin main
```

You can also just **do the launch work on `feature/portal-launch-prep` directly** and merge at the end —
either is fine. Once merged, continue with sections 1–6 below.

> Note: the only "build environment" change is in `pnpm-workspace.yaml` (re-enabled `win32-x64` native
> binaries so the repo also builds on Windows). It's harmless on Replit/Linux — those binaries are
> OS-gated and simply won't be installed.

---

## Context: what's already done

The client portal (`artifacts/cryptotrackr`), marketing site (`artifacts/landing`), sales deck,
and Express API (`artifacts/api-server`) are built. All money-math is unit-tested
(`pnpm --filter @workspace/cryptotrackr run test`, 15 tests). Everything typechecks and builds.

**Everything to date was verified in local-demo mode** via `VITE_LOCAL_DEMO=admin|client`, which
bypasses OIDC with a mock user and seeds demo data. In production that env var is **unset**, so:
- No demo data seeds (the "Alex Rivera" client, demo broadcasts/reports/roadmap). Clients start clean. ✅ already gated.
- Real auth runs via Replit OIDC against the API server + Postgres.

---

## Changelog — what shipped in this branch (`feature/portal-launch-prep`)

**4-Year cycle thesis (the product spine)**
- New flagship **"The 4-Year Cycle"** page (`pages/portal/thesis.tsx`) — thesis + live cycle position + **client-side historical proof** (every halving → new ATH, peak-over-peak) + **plan-vs-hold backtest** + phases-with-actions. Historical proof was previously admin-only.
- **CycleClock** signature visual (`components/CycleClock.tsx`) + single phase model (`lib/cyclePhase.ts`).
- **"Today / Your Next Move"** dashboard hero: live phase + the one action + buy-window countdown.
- **Phase-change alert** banner (in-app; server push is item 3 below).
- Admin-editable **cycle config** (`lib/cycleConfig.ts`, editor in `pages/admin/cycle.tsx`) + **live Fear & Greed** feed (`hooks/useFearGreed.ts`).
- Renamed "Cycle Outlook" → **"Cycle Signals"** (detail) and cross-linked with the thesis (overview).

**Delta-style portfolio**
- Reconstructed **equity curve** from price history with 24H/1W/1M/3M/1Y/ALL tabs (`lib/priceHistory.ts`, `hooks/usePortfolioHistory.ts`, `components/EquityCurve.tsx`); snapshot fallback.
- **Per-asset sparklines**, **best/worst performer** cards, 4-stat strip, big balance + period-change pill.
- **Per-coin detail pages** (`pages/portal/asset.tsx`, `/portal/asset/:id`) — price chart + your position.
- "Prices delayed" indicator; stopped blending cost-basis into current value.

**Analytics & simulations**
- **Risk-based DCA pacing** (conservative 12mo / moderate 6mo / aggressive 3mo) + **live dip-boosters** (`lib/dcaPlan.ts`).
- **Monte Carlo probability forecast** + projection fan (`lib/forecast.ts`, `pages/portal/forecast.tsx`, `components/ForecastFan.tsx`).
- **Bitcoin seasonality** monthly heatmap + quarterly bars (`lib/seasonality.ts`, `pages/portal/seasonality.tsx`).

**Onboarding & personalization**
- Deeper onboarding (4 steps): added objective, drawdown-reaction (behavioral risk), liquidity timeline; new profile fields editable in Settings; experience/custody/DCA-budget now used.

**Brand, content, legal**
- Unified brand to **Bitcoin Daily**; real meta/OG description on landing; global disclaimer footer.
- **Terms of Service** + **Privacy Policy** (`pages/legal/`, public `/terms` `/privacy`) — educational-consultation framing.

**Launch hardening & reliability**
- **Demo seed gated** behind `VITE_LOCAL_DEMO` → production starts clean (no demo/other-client data).
- **CSRF** origin-check on mutations, **rate limiting** (login 20/min, global 300/min), tightened profile-PUT validation + 64kb body cap (`api-server/middlewares/`).
- **Keyless Coinbase price/history fallback** (client + server) for CoinGecko outages — no API key needed.
- Wired the previously-unused typed **api-client-react** into the auth path; server-side CoinGecko proxy + caching.
- **Code-split** the ~1MB bundle (lazy routes + vendor chunks); **vitest** + 15 money-math smoke tests.

**Bug fixes**
- Nested `<a>` (wouter v3) hydration errors; "++" double-plus percent formatting; admin empty-data fallback; deleted dead `localAuth.ts` (hardcoded creds); framer-motion `ease` typing; redundant profile-PUT spam.

> Full per-change detail is in the git history of this branch.

---

## 1. Stand up the backend and verify the real flow  **(P0 — blocker)**

The OIDC login → onboarding → approval → data-sync path has **never run against a real backend**.

**Steps:**
1. Provision PostgreSQL (Neon or Replit DB); set `DATABASE_URL`.
2. Push the schema: `pnpm --filter @workspace/db run push` (Drizzle; tables in `lib/db/src/schema`).
3. Set the env vars (see checklist below): `REPL_ID`, `ISSUER_URL`, `ADMIN_EMAILS` (or `ADMIN_REPLIT_USERNAME`), `ALLOWED_ORIGINS`, `COINGECKO_API_KEY`.
4. Build + run the API: `pnpm --filter @workspace/api-server run build && pnpm --filter @workspace/api-server run start` (needs `PORT`).
5. Build the client (`PORT`, `BASE_PATH` required by the vite config) and serve it on the **same origin** as the API, or set `VITE_API_BASE_URL` to the API origin.
6. **Verify end-to-end with a real account:**
   - First OIDC login → user is created as `pending` → lands on `/pending`.
   - Approve in `/admin/approvals` (you must be in `ADMIN_EMAILS`) → role becomes `client`.
   - Onboarding wizard saves → `PUT /api/clients/me/profile` persists profile + holdings.
   - Reload → profile/holdings load from server (`GET /api/clients/me/profile`).
   - Admin `/admin/clients` lists the real client.
   - Confirm **no** demo data appears and `VITE_LOCAL_DEMO` is unset.

---

## 2. Server-sync the admin-curated content  **(P0 — blocker for the admin to function)**

Today the admin's curation lives in **per-browser localStorage**, so admin edits do **not** reach
clients in production. Build DB-backed endpoints so they do. Mirror the existing
`artifacts/cryptotrackr/src/lib/profileApi.ts` pattern (load from server, fall back to localStorage).

| Content | Current (localStorage) | Needs |
|---|---|---|
| **Cycle config** (peak, dates, on-chain readings) | `lib/cycleConfig.ts` | one global row table; `GET /api/cycle-config` (public) + `PUT` (admin). Admin editor is `pages/admin/cycle.tsx → CycleConfigEditor`; client reads in `pages/portal/thesis.tsx`, `cycle.tsx`, `index.tsx`. |
| **Broadcasts** | `localStore.ts` ct-broadcasts | table (global + optional per-user); admin create/delete, client read. Shown on dashboard. |
| **Reports / Roadmap** | ct-reports / ct-roadmap | tables (global + per-user); admin create, client read. |
| **Team note (per client)** | `client_profiles.data.team_note` (already JSONB) | just add an admin UI to set it via existing `PUT /api/clients/:userId/profile`; client already renders it on the dashboard. |

Lower priority (client-owned, fine as localStorage but nicer server-side): watchlist, trade journal,
price alerts, milestones, bear checklist, portfolio snapshots.

---

## 3. Push notifications — "the product reaches out"  **(P1)**

The client already shows an **in-app banner** when the cycle phase shifts. For real outreach:
- A scheduled job (daily) computes the live phase (`lib/cyclePhase.ts → getCyclePhase`) from the BTC
  drawdown vs. the cycle config peak; on a phase change or when the buy-zone date arrives, send:
  - **Discord** webhook (a `discord-webhook` integration exists in the workspace), and/or
  - **Email** to clients.

---

## 4. Placeholders to replace  **(P1)**

- **Discord invite:** `artifacts/cryptotrackr/src/pages/onboarding.tsx` → `DISCORD_INVITE_URL` is still `https://discord.gg/your-invite-code`.
- **Social image:** both `index.html` files reference `/favicon.svg` for `og:image`. Add a real **1200×630 PNG** to each app's `public/` (or root) and update the `og:image` / `twitter:image` tags in `artifacts/landing/index.html` and `artifacts/cryptotrackr/index.html`.

---

## 5. Price-feed reliability  **(done — no key required)**

CoinGecko's free tier rate-limits under load, so there is now a **keyless fallback chain** that
works in dev and prod:
- **Client** (`lib/priceFeed.ts`, `lib/priceHistory.ts`): proxy → direct CoinGecko → **Coinbase** (`lib/priceFallback.ts`) → last-known.
- **Server proxy** (`routes/prices.ts`, `routes/history.ts`): CoinGecko (cached, serve-stale) → **Coinbase** (`lib/priceFallback.ts`).

Coinbase's public Exchange API needs no key, is CORS-enabled and US-reachable, and covers the major
coins (BNB and a few others aren't listed → those keep their last-known value). Verified live.

`COINGECKO_API_KEY` is **optional** — if you ever get one, set it to raise CoinGecko's limits
(`lib/coingecko.ts`), but it's not required.

---

## 6. Legal review  **(P1)**

Terms of Service and Privacy Policy are drafted at `/terms` and `/privacy`
(`artifacts/cryptotrackr/src/pages/legal/`), framed as an **educational consultation service — not
advice; opinions based on historical data**. **Have counsel review** the projection, forecast, and
"plan vs. hold" backtest claims for your jurisdiction, and fill in company name / governing law.

---

## Security (already in place — verify in prod)

- Session cookie: `HttpOnly` + `Secure` + `SameSite=Lax` (confirm HTTPS terminates correctly).
- CSRF: Origin/Referer check on all mutations (`middlewares/csrf.ts`) — set `ALLOWED_ORIGINS`.
- Rate limiting: `/api/login` 20/min, global 300/min (`middlewares/rateLimit.ts`).
- Profile PUT validation tightened (flat primitives, ≤40 keys, holdings to known shape, 64kb body cap).
- Admin endpoints gated by `requireAdmin`.

---

## Env var checklist (API server)

```
DATABASE_URL=postgres://...
PORT=...
REPL_ID=...                  # Replit OIDC client id
ISSUER_URL=https://replit.com/oidc   # default
ADMIN_EMAILS=you@example.com         # comma-sep; first-login admins
ALLOWED_ORIGINS=https://app.yourdomain.com   # for CSRF + CORS
COINGECKO_API_KEY=...                # OPTIONAL — Coinbase keyless fallback covers outages
```

Client build: `PORT`, `BASE_PATH` (vite config requires them); optional `VITE_API_BASE_URL` if the
API is on a different origin. **Do NOT set `VITE_LOCAL_DEMO` in production.**

## Final checks before launch
```
pnpm run typecheck
pnpm --filter @workspace/cryptotrackr run test
pnpm run build
```
