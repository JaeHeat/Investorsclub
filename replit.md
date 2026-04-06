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
- **Auth**: Local auth — hardcoded credentials in `src/lib/localAuth.ts`, session stored in localStorage (no Supabase dependency)
  - Admin: `admin@cryptotrackr.com` / `admin123`
  - Client: `client@cryptotrackr.com` / `client123`
- **Data**: All data stored in localStorage via `src/lib/localStore.ts` — seeded with demo data on first load
- **Role routing**: `admin` → `/admin`, `client` → `/portal` (post-onboarding), new client → `/onboarding`
- **Client portal**: Portfolio overview (live BTC price from CoinGecko), milestone tracker, roadmap, monthly reports, notes
- **Admin dashboard**: Client list with AUM/returns/tier, per-client detail view, add roadmap items, publish reports, mark milestones hit
- **Milestone bonus logic**: Tiered by portfolio size (Under $100K → Tier 1, $100K-$500K → Tier 2, etc.)
- **Design**: Dark theme (#0A0A0A bg), Bitcoin orange (#F7931A) accent, Inter font
- **Key files**: `src/lib/localAuth.ts` (auth), `src/lib/localStore.ts` (data CRUD), `src/lib/types.ts` (shared types), `src/contexts/AuthContext.tsx` (auth context)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
