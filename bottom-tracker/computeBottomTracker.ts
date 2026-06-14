// computeBottomTracker.ts
// Pure, dependency-free. The ONLY live input is the current BTC spot price.
// All the cycle math is frozen constants from a one-time causal power-law fit
// (Bitcoin power law: price = A * t^n, fit causally on daily history; n = 5.674).
// Verified: computeBottomTracker(64908, Date.UTC(2026,5,14)) -> spring -0.80.
//
// REFRESH: POWER_LAW + TOP drift slowly. Re-baseline the 6 numbers in POWER_LAW/TOP
// roughly quarterly (Jae supplies updated values from the Python fit). Everything else
// (genesis, halving, the three past cycle turns + their springs) is fixed history.

export interface Scenario { key: string; label: string; z: number; price: number; passed: boolean; prob: number; }
export interface BottomTrackerState {
  asOf: string; price: number; source: string; peak: number; drawdownPct: number;
  clockDays: number; daysSinceTop: number; spring: number; fairValue: number;
  topDate: string; bottomWindow: [string, string]; bottomCenter: string;
  daysToCenter: number; inWindow: boolean;
  pastBottomSprings: Record<string, number>; topSprings: number[];
  scenarios: Scenario[]; blendedBottom: number; bottomRange: [number, number]; state: string;
}

const DAY = 86_400_000;
const GENESIS = Date.UTC(2009, 0, 3);          // Bitcoin block 0
const HALVING = Date.UTC(2024, 3, 20);         // 4th halving
const TOP = { ms: Date.UTC(2025, 9, 6), price: 124_824 };   // this cycle's top
const POWER_LAW = { n: 5.674, lnA: -37.892, mu: -0.184, sd: 0.674 };  // causal fit (refresh ~quarterly)
const BOT_DAYS = [364, 366, 406];              // validated days from top -> bottom (3 past cycles)
const PAST_BOTTOM_SPRINGS: Record<string, number> = { "2015": -1.46, "2018": -0.61, "2022": -1.17 };
const TOP_SPRINGS = [2.85, 2.69, 1.29, 0.43];  // dying top amplitude (2013/2017/2021/2025)
const SCEN = [
  { key: "shallow", label: "2018-like (shallow)", z: -0.61, weight: 0.22 },
  { key: "mean",    label: "Mean of past bottoms", z: -1.08, weight: 0.40 },
  { key: "deep",    label: "2015-like (deep)",     z: -1.46, weight: 0.24 },
  { key: "shock",   label: "Overshoot / shock",    z: -1.90, weight: 0.14 },
];

const tDays = (ms: number) => (ms - GENESIS) / DAY;
const plLog = (ms: number) => POWER_LAW.lnA + POWER_LAW.n * Math.log(tDays(ms));
const fair = (ms: number) => Math.exp(plLog(ms));
const priceAtZ = (ms: number, z: number) => Math.exp(plLog(ms) + z * POWER_LAW.sd + POWER_LAW.mu);
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export function computeBottomTracker(price: number, nowMs: number = Date.now(), source = "live"): BottomTrackerState {
  const spring = (Math.log(price) - plLog(nowMs) - POWER_LAW.mu) / POWER_LAW.sd;
  const winLo = TOP.ms + Math.min(...BOT_DAYS) * DAY;
  const winHi = TOP.ms + Math.max(...BOT_DAYS) * DAY;
  const center = TOP.ms + Math.round(BOT_DAYS.reduce((a, b) => a + b, 0) / BOT_DAYS.length) * DAY;

  const priced = SCEN.map(s => {
    const p = priceAtZ(center, s.z);
    return { ...s, price: Math.round(p), passed: p > price * 1.02 };  // a bottom can't print above where we already are
  });
  const liveW = priced.filter(s => !s.passed).reduce((a, s) => a + s.weight, 0) || 1;
  const scenarios: Scenario[] = priced.map(s => ({
    key: s.key, label: s.label, z: s.z, price: s.price, passed: s.passed,
    prob: s.passed ? 0 : Math.round((s.weight / liveW) * 1000) / 1000,
  }));
  const active = scenarios.filter(s => !s.passed);
  const blended = Math.round(scenarios.reduce((a, s) => a + s.price * s.prob, 0));
  const springs = Object.values(PAST_BOTTOM_SPRINGS);
  const mean = springs.reduce((a, b) => a + b, 0) / springs.length;
  const state = spring > Math.max(...springs)
    ? "still descending — not yet as stretched as any past bottom"
    : spring > mean ? "entering the historical bottom-spring zone" : "deep in the historical bottom-spring zone";

  return {
    asOf: iso(nowMs), price: Math.round(price), source, peak: TOP.price,
    drawdownPct: Math.round((price / TOP.price - 1) * 1000) / 10,
    clockDays: Math.round((nowMs - HALVING) / DAY), daysSinceTop: Math.round((nowMs - TOP.ms) / DAY),
    spring: Math.round(spring * 100) / 100, fairValue: Math.round(fair(nowMs)), topDate: iso(TOP.ms),
    bottomWindow: [iso(winLo), iso(winHi)], bottomCenter: iso(center),
    daysToCenter: Math.round((center - nowMs) / DAY), inWindow: nowMs >= winLo && nowMs <= winHi,
    pastBottomSprings: PAST_BOTTOM_SPRINGS, topSprings: TOP_SPRINGS,
    scenarios, blendedBottom: blended,
    bottomRange: [Math.min(...active.map(s => s.price)), Math.max(...active.map(s => s.price))],
    state,
  };
}
