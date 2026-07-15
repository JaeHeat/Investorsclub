# Handoff: Altcoin Cycle Data → Portal Updates

**For the agent working on the Investors Club site.** 2026-07-15.

New research landed: a survivorship-free, 3-cycle study of what actually happened to every
top-100 altcoin bought at each bear-market bottom (2015, 2018, 2022), plus correlation and
slice analyses. The canonical numbers live in **`research/ALTCOIN_CYCLE_EVIDENCE.md`** in this
repo — treat that file as the single source of truth for every altcoin claim on the site. Do
not source altcoin performance claims from anywhere else (not memory, not the web).

---

## 1. What already landed (commit `67c0b49`) — do not revert

- `research/ALTCOIN_CYCLE_EVIDENCE.md` — the evidence base (all numbers + staged proposals).
- `artifacts/cryptotrackr/src/lib/portfolioPlans.ts` — rationale copy aligned with the data
  (alt outperformance is now framed as a tail bet, not the base case). **Allocation
  percentages were NOT changed.** An evidence-base comment now sits above `PLAN_MATRIX`.
- `artifacts/cryptotrackr/src/pages/portal/plan.tsx` — ETH and SOL foundation-card copy made
  data-honest (ETH lagged BTC last cycle; SOL is the asymmetric bet, winners rarely repeat).
- Verified: `pnpm --filter cryptotrackr typecheck` clean; plan page renders with live prices.

## 2. The numbers you may cite (from the evidence file)

| Fact | Value |
|---|---|
| Top-100 alts that beat BTC from the bottom, by cycle | 31% (2015) → 16% (2018) → **6% (2022)** |
| Median top-100 alt vs BTC, every cycle, every slice | ~0.5x of BTC's multiple |
| Top-25 equal-weight basket vs BTC | 3.18x → 1.67x → **0.57x** |
| Top-25 coins that did ≥10x | 76% → 72% → **4%** (SOL only) |
| Winners that repeated from the next bottom | **1 of 44** (~2%); 0 of 15 from 2018→2022 |
| 2022→2025 winners (of 88) | SOL x20.5, STX x12.3, OKB x11.1, XRP x8.2, FTM x7.8 |
| ETH from the 2022 bottom | x4.0 vs BTC x7.6 |
| Avg alt correlation to BTC in crashes | 0.80–0.97 (calm ~0.68); avg alt −70% vs BTC −48% from the 2025 peak |
| Top-25 busts in 2018 and 2022 cohorts | zero (this existing site claim is CONFIRMED) |

## 3. Tasks

### Task A — GATED: update `CYCLE_SCENARIOS` multipliers ⚠️ requires founder's explicit go
File: `artifacts/cryptotrackr/src/lib/portfolioPlans.ts` (see the `!! PENDING REVISION` comment).

The current BASE scenario assumes alts outperform BTC (btc 3.5 / eth 5.0 / sol 7.0 / alts 5.0).
The data says the median case is alts at ~0.5–0.6x of BTC. Proposed replacement:

```ts
conservative: { btc: 2.5, eth: 1.5, sol: 1.8, alts: 1.3 }   // alts ~0.5-0.7x BTC (matches 2022->2025)
base:         { btc: 3.5, eth: 2.5, sol: 3.0, alts: 2.0 }   // alts ~0.6-0.85x BTC
optimistic:   { btc: 5.0, eth: 8.0, sol: 12.0, alts: 8.0 }  // unchanged: the "altseason returns" tail
```

Also update the three `description` strings to match (e.g. base becomes "Historical median —
BTC leads; alts capture 60-85% of BTC's move" and optimistic carries the alt-outperformance
language). Keep `calculateProjection` unchanged.
**Why gated:** this lowers projected outcomes for alt-heavy clients on the plan/forecast/EV
pages. The founder must approve before it ships.

### Task B — GATED: raise BTC floors on aggressive tiers ⚠️ requires founder's explicit go
File: same, `PLAN_MATRIX`. Data rationale: sub-50% BTC mixes only matched holding BTC last
cycle if SOL (1 coin of 88) was held at full weight. Proposal (only if founder approves,
he may adjust the exact numbers):
- starter.aggressive: btc 35 → 45–50 (take from altsPct)
- core.aggressive: btc 40 → 50 (take from altsPct)
- premium/elite: already BTC-dominant, no change proposed.
Do NOT touch conservative/moderate rows without instruction.

### Task C — SAFE, do now: keep copy consistent with the evidence file
- Anywhere the site claims alts/ETH/SOL "historically outperform BTC" as a base-case
  expectation, reframe per the evidence file (outperformance = optimistic/tail scenario).
  Already done in `portfolioPlans.ts` + `plan.tsx`; check `forecast.tsx`, `ev.tsx`,
  `thesis.tsx`, `bear.tsx`, onboarding, and the landing/sales-deck artifacts for stragglers.
- Do not weaken the existing disclaimers ("not financial advice", "past cycles don't
  guarantee future results"); they stay on every projection surface.

### Task D — after A/B are decided: rebuild the client decks
`client-decks/` (`build_amr_deck.js`, `build_sales_pdf.js`) still bake the old assumptions
into the PDFs/PPTX. Rebuild after the multiplier/floor decisions land so the decks and the
portal say the same thing.

## 4. QA checklist (run before calling any task done)
1. `pnpm --filter cryptotrackr typecheck` and `pnpm --filter cryptotrackr test` pass.
2. Plan page renders for every tier x risk combo (flip profile risk + portfolio value; the
   matrix is `getPortfolioPlan(risk, portfolioValue)` — sizes: <100K starter, <500K core,
   <1M premium, 1M+ elite).
3. Projections stay monotonic: conservative < base < optimistic for every allocation.
4. Every altcoin number shown on the site appears verbatim in
   `research/ALTCOIN_CYCLE_EVIDENCE.md` (no invented or remembered stats).
5. Nothing in Tasks A/B ships without the founder's written go in the task/PR description.

## 5. Hard rules
- Allocation percentages and scenario multipliers are the founder's policy: **propose, never
  self-approve.** Copy/text alignment (Task C) is fair game.
- No database work, no seeding, no OIDC changes in this handoff — it is content + model
  constants only.
- The kill-condition for the whole framework (from the evidence file): if BTC dominance
  breaks decisively down AND market breadth explodes (a real altseason), flag the founder to
  revisit rather than silently keeping the old numbers.
