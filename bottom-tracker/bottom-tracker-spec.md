# Bitcoin Cycle-Bottom Tracker — implementation brief (CryptoTrackr)

Hand this whole folder to the Replit agent. It implements a small live widget for the
portal with **no Python and no external math libraries** — the only live input is the
current BTC price; everything else is frozen constants + arithmetic.

Files in this folder:
- `computeBottomTracker.ts` — pure function, the whole model (copy as-is).
- `BottomTracker.tsx` — drop-in React widget that renders it (restyle to taste).
- this brief.

---

## 1. What it is / why

A dashboard tile that tells a member where Bitcoin is in its ~4-year cycle and where the
**cycle bottom** is likely to land. Two ideas drive it:

- **Satoshi Clock** — two coordinates: `CLOCK` = days since the last halving (where we are in
  the 4-year revolution) and `SPRING` = the causal **power-law deviation** (how stretched price
  is above/below its long-term `price = A·tⁿ` trend, as a z-score). Cycle tops and bottoms have
  landed at tight, repeatable CLOCK/SPRING coordinates (the clustering is statistically real —
  joint p ≈ 5×10⁻⁵ that it's chance).
- **Bottom scenarios** — past bottoms sat at SPRING −0.61 / −1.17 / −1.46. Project the power-law
  line forward to the bottom window and read off the price each SPRING implies. The blended,
  probability-weighted result is the headline bottom estimate.

It updates as the BTC price moves. Current read (2026-06-14, $64.9k): SPRING −0.80, **blended
expected bottom ≈ $51k**, timing centered **Oct 19 2026**.

---

## 2. What it renders

A single tile (see `BottomTracker.tsx`), top to bottom:
1. Header: live price + % from the cycle peak.
2. Three metric cards: **Clock** (days since halving), **Spring** (power-law z), **Bottom window** (days out).
3. A horizontal **timing bar**: now-marker, the top (red), and the bottom window (amber band).
4. **Bottom scenarios** — 4 rows (shallow / mean / deep / shock), each with the SPRING it assumes,
   the implied price, a probability bar, and the %. Scenarios already above the live price show
   "passed".
5. A one-line **read** + the required disclaimer.

---

## 3. Architecture (recommended: client-side)

The model is pure arithmetic, so the simplest correct design is **client-side**:

`BottomTracker.tsx` → `fetchBtcPrice()` → `computeBottomTracker(price)` → render.

No backend needed. (Alternative, if you prefer server-side: call `computeBottomTracker` in an
Express route `GET /api/bottom-tracker` and have the component fetch that JSON. Same function.)

---

## 4. The model (frozen constants + formulas)

All constants live at the top of `computeBottomTracker.ts`.

| Constant | Value | Meaning |
|---|---|---|
| `GENESIS` | 2009-01-03 | Bitcoin block 0 — `t` = days since this |
| `HALVING` | 2024-04-20 | 4th halving (the clock anchor) |
| `TOP` | 2025-10-06, $124,824 | this cycle's top |
| `POWER_LAW` | n=5.674, lnA=−37.892, mu=−0.184, sd=0.674 | causal fit `ln(price)=lnA+n·ln(t)`; residual mean/std |
| `BOT_DAYS` | [364, 366, 406] | validated days from top → bottom (3 past cycles) |
| `PAST_BOTTOM_SPRINGS` | 2015 −1.46, 2018 −0.61, 2022 −1.17 | SPRING at past bottoms |
| `TOP_SPRINGS` | 2.85, 2.69, 1.29, 0.43 | dying top amplitude (2025 is the weakest top ever) |
| `SCEN` | shallow −0.61, mean −1.08, deep −1.46, shock −1.90 (weights .22/.40/.24/.14) | bottom scenarios |

Formulas (with `t(ms) = (ms − GENESIS)/day`):
```
fairValue(d)      = exp(lnA + n·ln(t(d)))
spring(price, d)  = (ln(price) − (lnA + n·ln(t(d))) − mu) / sd
priceAtZ(d, z)    = exp(lnA + n·ln(t(d)) + z·sd + mu)
bottom window     = TOP + [min..max BOT_DAYS]      (= 2026-10-05 … 2026-11-16)
bottom center     = TOP + round(mean BOT_DAYS)     (= 2026-10-19)
scenario price    = priceAtZ(center, scenario.z)
   if scenario price > livePrice·1.02  → "passed" (weight 0; a bottom can't print above where we are)
   reweight remaining weights to sum 1 → prob;  blended = Σ price·prob
```
Sanity check (must hold): `computeBottomTracker(64908, Date.UTC(2026,5,14)).spring === -0.8`.

---

## 5. Live price source + CORS

`fetchBtcPrice()` defaults to CoinGecko `/simple/price?ids=bitcoin&vs_currencies=usd` (CORS-OK,
no key). **Prefer the portal's existing BTC price feed** if there is one. If the browser hits CORS
or rate limits, add a tiny cached Express route `GET /api/btc-price` and point `fetchBtcPrice` at it.
Refetch interval is 5 min (already wired).

---

## 6. Refresh policy

- **Price**: live, every load + every 5 min. Nothing to maintain.
- **Power-law constants** (`POWER_LAW`, and `TOP` if the top is ever revised): drift slowly. Jae
  re-baselines these ~quarterly from the Python fit and sends you 6 updated numbers — a one-line
  edit. **Everything else (genesis, halving, the three past turns + their springs) is fixed history.**
  No data pipeline, no DB, no cron required for a correct widget.

---

## 7. Server-side JSON contract (only if you choose the Express-endpoint option)

If you compute server-side, return this shape (snake_case shown; the TS function returns the same
fields in camelCase). Example payload for 2026-06-14:
```json
{
  "as_of": "2026-06-14", "price": 64908, "source": "live", "peak": 124824,
  "drawdown_pct": -48.0, "clock_days": 785, "days_since_top": 251, "spring": -0.8,
  "fair_value": 134133, "top_date": "2025-10-06",
  "bottom_window": ["2026-10-05", "2026-11-16"], "bottom_center": "2026-10-19", "days_to_center": 127,
  "past_bottom_springs": {"2015": -1.46, "2018": -0.61, "2022": -1.17},
  "top_springs": [2.85, 2.69, 1.29, 0.43],
  "scenarios": [
    {"label": "2018-like (shallow)", "spring": -0.61, "price": 82712, "passed": true,  "prob": 0.0},
    {"label": "mean of past bottoms", "spring": -1.08, "price": 60258, "passed": false, "prob": 0.513},
    {"label": "2015-like (deep)",     "spring": -1.46, "price": 46644, "passed": false, "prob": 0.308},
    {"label": "overshoot / shock",    "spring": -1.90, "price": 34676, "passed": false, "prob": 0.179}
  ],
  "blended_bottom": 51486, "bottom_range": [34676, 60258],
  "state": "entering the historical bottom-spring zone"
}
```

---

## 8. Disclaimers (must ship — non-negotiable)

Keep visible on the tile:
> n = 3 cycles → these are **scenario weights, not statistical probabilities**. Educational, **not
> financial advice**. Shows an as-of timestamp.

This is a model of a tiny sample; a macro shock or a structural break voids it. Do not present any
single number as a prediction.

---

## 9. Acceptance checklist

- [ ] Tile renders with a live price (verify `fetchBtcPrice` works in the portal, CORS handled).
- [ ] `computeBottomTracker(64908, Date.UTC(2026,5,14)).spring === -0.8` (unit test).
- [ ] "passed" scenarios (price above the live price) show greyed with no %.
- [ ] Probabilities of non-passed scenarios sum to 100%.
- [ ] All displayed numbers are rounded (no float artifacts).
- [ ] Disclaimer + as-of timestamp visible.
- [ ] Restyled to the portal theme (the provided colors are placeholders).
