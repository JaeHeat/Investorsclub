# Altcoin Cycle Evidence — the data behind the allocation model

**Locked 2026-07-15.** Source of truth for every altcoin claim in the portal (plan rationales,
scenario multipliers, deck slides). All numbers are reproducible from the research repo
(`Tradingview AI/Altcoins/`): `pull_cohorts.py` (CoinMarketCap point-in-time snapshots),
`analyze_cohorts.py`, `slice_cohorts.py`, `corr_study.py`. Education, not financial advice.

---

## Study 1 — Buying the top 100 at every bear-market bottom (3 full cycles)

Survivorship-free: the literal point-in-time top-100 at each bottom (dead coins included),
matched by CMC id, each coin's BEST exit across its cycle's peak windows (alt-season week and
BTC-top week), missing at the top = total loss. Stables/wrapped excluded.

| Bought the bottom | 2015-01 | 2018-12 | 2022-11 |
|---|---|---|---|
| BTC itself | x91 | x20 | x7.6 |
| Alts that beat BTC | 31% | 16% | **6%** |
| Median alt | x16.4 | x7.4 | **x2.2** |
| Equal-weight top-100 basket vs BTC | 2.4x better | tie (1.08x) | **0.43x — lost badly** |
| Coins dead by the peak | 29% | 2% | 0% |

- The odds a given top-100 alt beats BTC from the bottom have HALVED every cycle: 31% -> 16% -> 6%.
- 2022->2025 winners (5 of 88): SOL x20.5, STX x12.3, OKB x11.1, XRP x8.2, FTM x7.8. ETH did x4.0.
- The median top-100 alt has returned roughly HALF of BTC in every cycle, in every slice.

## Study 2 — Slices (top 25, 11-25, baskets of 20/25, deep list)

| Slice basket vs BTC | 2015 | 2018 | 2022 |
|---|---|---|---|
| Top 25 | 3.18x | 1.67x | **0.57x** |
| Ranks 11-25 (the historical alpha band) | 4.62x | 2.12x | **0.59x** |
| Ranks 26-50 | 2.05x | 0.89x | 0.37x |
| Ranks 51-100 | ~2.5x (lottery-driven) | ~0.8x | 0.37x |

- **No slice beat BTC in all three cycles. In 2022->2025 every slice lost to BTC.**
- Top-25 10x rate: 76% -> 72% -> **4%** (one coin: SOL).
- Deep list (50+): never worth owning as a basket in any cycle; median ~0.2-0.3x BTC; 60% of
  ranks 76-100 literally died in the 2015 cohort.

## Study 3 — Winners do not repeat

Of every coin that beat BTC from a bottom, how many beat it again from the NEXT bottom?

- 2015 winners (29): 20 fell out of the top 100 entirely; **1 repeated** (DOGE).
- 2018 winners (15, incl. ETH/BNB/ADA/LINK): **0 repeated.** From the 2022 bottom they did
  DOGE x6.1, LINK x4.5, BNB x4.4, ETH x4.0 vs BTC x7.6.
- Combined base rate of "last cycle's winner wins again": **1 in 44 (~2%).**
- Direct implication: an ETH+SOL sleeve is a bet on winner-repeat, which has base rate ~2%.
  It can still be held for convexity, but it is not the expected case.

## Study 4 — Correlation (why alt baskets are not diversification)

11 largest alts, 7 years daily: median daily correlation to BTC 0.62, but it rises to
0.80-0.97 in EVERY crash (COVID 0.97, 2022 0.90, 2026 0.90). Median beta 1.08. From the 2025
peak: BTC -48% vs average alt -70%. A basket of alts is one leveraged BTC position.

## Structural context (altseason study, 2026-07-05)

BTC printed a new ATH in 2025 and only 4 of the top-17 legacy alts followed (ETH, BNB, SOL,
TRX) — first cycle ever with no altseason. Token count 440k (2021) -> 20M+ (2025) over a
near-flat alt money pool. The rotation that used to bail out alt bags is structurally impaired.

---

## What this means for the allocation model

**Supported by the data (keep):**
- BTC-dominant core in every tier. "BTC is the trade" (premium/elite conservative copy) is
  exactly what the data says.
- Concentrating the non-BTC sleeve in a few majors instead of spreading across 15+ names
  (correlation study: spreading adds nothing).
- Small, capped top-25 tail sized for total loss (lottery/convexity logic).
- Staged deployment into the pre-registered bottom window (Oct 5-19, 2026) rather than all-in.

**Contradicted by the data (copy fixed 2026-07-15):**
- "SOL and top-25 alts are historically positioned to outperform BTC" — true 2015/2018,
  false 2022->2025 (0.57x). Now framed as a tail bet, not the base case.
- "ETH and SOL historically outperform BTC percentage-wise in strong cycles" — ETH beat BTC
  in 2018->2021 and then did 0.53x BTC in 2022->2025; 0 of 15 prior winners repeated.
- Risk-tolerance inversion: more alts no longer means more expected return (last cycle it
  meant more volatility AND less return). Aggressive tiers are a bet on tails, and the copy
  now says so.

**PENDING FOUNDER DECISION (numbers that change client projections/allocations — staged, not applied):**

1. `CYCLE_SCENARIOS` multipliers currently assume alts outperform BTC in the BASE case
   (btc 3.5 / eth 5.0 / sol 7.0 / alts 5.0). Three cycles of data say the base (median) case
   is alts at ~0.5-0.6x of BTC's multiple; alt outperformance belongs in the OPTIMISTIC
   scenario only. Data-consistent proposal:
   - conservative: btc 2.5 / eth 1.5 / sol 1.8 / alts 1.3   (alts ~0.5-0.7x BTC, matches 2022->2025)
   - base:         btc 3.5 / eth 2.5 / sol 3.0 / alts 2.0   (alts ~0.6-0.85x BTC)
   - optimistic:   btc 5.0 / eth 8.0 / sol 12.0 / alts 8.0  (unchanged — the "altseason returns" tail)
2. `PLAN_MATRIX` BTC floors: data supports raising the aggressive-tier BTC floors ~10-15pts
   (e.g. starter aggressive 35% -> 45-50% BTC). Last cycle, sub-50% BTC mixes only matched
   holding BTC if SOL (1 coin of 88) was held at full weight.
3. Client decks (`client-decks/`) still show the old assumptions; rebuild after 1-2 are decided.

**Kill-condition for this framework** (watch in real time): BTC dominance breaks decisively
down AND breadth explodes (a real altseason). That would violate the 6%-beat-rate regime and
the alt share deserves a fresh look.
