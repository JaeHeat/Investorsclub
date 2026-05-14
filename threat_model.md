# Threat Model

## Project Overview

This workspace is a pnpm/TypeScript monorepo with a small Express 5 API server (`artifacts/api-server`) and a React/Vite client portal (`artifacts/cryptotrackr`). The deployed production surface is a Bitcoin consulting portal where users authenticate through Replit OIDC, receive a role (`admin` or `client`), and then use the web UI to view or manage portfolio-related data. Although `replit.md` still mentions local demo auth, the current code uses server-side OIDC for identity and stores application data in browser `localStorage`.

## Assets

- **User accounts and sessions** — Replit OIDC identities, server session IDs (`sid`), refresh/access tokens stored in the session table, and role assignments in `users`.
- **Client financial data** — holdings, cost basis, milestone status, portfolio snapshots, reports, roadmap items, notes, watchlists, trade journals, and related profile fields such as country/timezone and investment goals.
- **Administrative content** — admin-visible client summaries, analytics inputs, broadcast messages, and per-client planning/report data.
- **Application secrets and infrastructure credentials** — `DATABASE_URL`, `REPL_ID`, optional `ISSUER_URL`, and any admin-role configuration such as `ADMIN_REPLIT_USERNAME`.

## Trust Boundaries

- **Browser to API** — the browser is untrusted; `/api/*` must authenticate and authorize requests without relying on client-side routing.
- **API to PostgreSQL** — the API has direct access to session and user records; compromise here exposes authentication state and role data.
- **Unauthenticated to authenticated/admin UI** — the React app presents different surfaces for public visitors, clients, and admins. Those boundaries matter even when data is rendered client-side.
- **Server to OIDC provider** — login, callback, logout, and token refresh trust the upstream identity provider and must not allow spoofed redirect origins or token confusion.
- **Production vs dev-only artifacts** — `artifacts/mockup-sandbox` is dev-only per platform assumptions and should normally be ignored unless proven production-reachable. `artifacts/sales-deck` is a low-sensitivity presentation artifact, not the main business application.

## Scan Anchors

- **Production entry points**: `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`, `artifacts/api-server/src/routes/*.ts`, `artifacts/cryptotrackr/src/App.tsx`.
- **Highest-risk code areas**: `artifacts/api-server/src/routes/auth.ts`, `artifacts/api-server/src/lib/auth.ts`, `artifacts/api-server/src/middlewares/authMiddleware.ts`, `artifacts/cryptotrackr/src/contexts/AuthContext.tsx`, `artifacts/cryptotrackr/src/lib/localStore.ts`, admin/client pages that consume `localStore`.
- **Public vs authenticated vs admin**: public login page at `/`; authenticated client routes under `/portal`; admin routes under `/admin`; server routes under `/api` currently expose health and auth only.
- **Usually dev-only**: `artifacts/mockup-sandbox/**`; build/validation scripts such as `artifacts/sales-deck/scripts/**` unless runtime reachability is demonstrated.

## Threat Categories

### Spoofing

The API is responsible for proving user identity through Replit OIDC and mapping that identity to a stable local role. Session identifiers must remain unpredictable, and every protected server endpoint must derive the acting user from server-side session state rather than trusting client-supplied role claims.

### Tampering

The client portal currently stores core business data in browser `localStorage`. Any security guarantee for portfolio data therefore depends on whether untrusted client-side state is treated as authoritative. The system must avoid trusting client-controlled storage for security decisions or for cross-user/shared-device separation.

### Information Disclosure

The most sensitive data in this project is financial-profile data and session state. The application must ensure that client portfolio records, notes, reports, and admin-curated data are not exposed to other users through browser storage, API responses, logs, or cross-origin message channels. Server logs must continue redacting cookies and authorization headers.

### Denial of Service

The exposed API surface is small, but auth endpoints still depend on upstream OIDC and database availability. The application should avoid unauthenticated resource exhaustion on login/token-exchange paths and avoid unbounded request handling where external services are involved.

### Elevation of Privilege

Admin-only capabilities in the portal are rendered by the frontend, while the server currently exposes only auth endpoints. If future business APIs are added, admin/client separation must be enforced server-side. The authentication flow must not let an attacker influence redirect origins, session handling, or role assignment in a way that upgrades privileges.