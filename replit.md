# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### CryptoTrackr (`artifacts/cryptotrackr`)
A Bitcoin cycle consultation portal with:
- **Auth**: Replit OIDC via the `@workspace/api-server` backend (session stored server-side in PostgreSQL); the client reads the current user from `/api/auth/user` through `@workspace/replit-auth-web`. For local development without the backend, set `VITE_LOCAL_DEMO=admin|client` to bypass OIDC with a mock user.
- **Data**: Client profile/holdings sync to PostgreSQL via the API server, with a localStorage cache (`src/lib/localStore.ts`) that seeds demo data on first load and acts as the fallback when the backend is unreachable
- **Role routing**: `admin` → `/admin`, `client` → `/portal` (post-onboarding), new client → `/onboarding`
- **Client portal**: Portfolio overview (live BTC price from CoinGecko), milestone tracker, roadmap, monthly reports, notes
- **Admin dashboard**: Client list with AUM/returns/tier, per-client detail view, add roadmap items, publish reports, mark milestones hit
- **Milestone bonus logic**: Tiered by portfolio size (Under $100K → Tier 1, $100K-$500K → Tier 2, etc.)
- **Design**: Dark theme (#0A0A0A bg), Bitcoin orange (#F7931A) accent, Inter font
- **Key files**: `src/contexts/AuthContext.tsx` (auth context, wraps `@workspace/replit-auth-web`), `src/lib/localStore.ts` (localStorage data CRUD), `src/lib/profileApi.ts` (server sync + admin client list), `src/lib/types.ts` (shared types)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
