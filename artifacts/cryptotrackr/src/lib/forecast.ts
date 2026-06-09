import type { PortfolioPlan } from "./portfolioPlans";

// Monte Carlo cycle forecast. Simulates thousands of possible next-cycle peak
// outcomes for a portfolio, drawing per-asset cycle multiples from lognormal
// distributions that share a common "market regime" factor (so assets move
// together, like they really do). Produces a probability of hitting the
// client's goal plus a P10/P50/P90 outcome band.
//
// Deterministic: a seeded RNG means the same inputs always yield the same
// numbers, so the headline figure doesn't jitter on every re-render.

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randNormal(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

interface AssetParams {
  medMult: number; // median cycle multiple (~ base scenario)
  sigma: number; // dispersion
  beta: number; // sensitivity to the common market factor
}

// Medians anchored to the base CYCLE_SCENARIOS; higher-beta assets (alts/SOL)
// swing harder with the market regime.
const ASSET_PARAMS: Record<"btc" | "eth" | "sol" | "alts", AssetParams> = {
  btc: { medMult: 3.5, sigma: 0.42, beta: 1.0 },
  eth: { medMult: 5.0, sigma: 0.58, beta: 1.25 },
  sol: { medMult: 7.0, sigma: 0.78, beta: 1.5 },
  alts: { medMult: 5.0, sigma: 0.82, beta: 1.6 },
};

function sampleMult(p: AssetParams, zMarket: number, rng: () => number): number {
  const zIdio = randNormal(rng);
  const logMult = Math.log(p.medMult) + p.beta * (p.sigma * 0.7) * zMarket + p.sigma * 0.6 * zIdio;
  return Math.exp(logMult);
}

export interface HistogramBin {
  binStart: number;
  binEnd: number;
  count: number;
}

export interface FanPoint {
  m: number; // months from now
  low: number; // P10
  mid: number; // median
  high: number; // P90
}

export interface ForecastResult {
  sims: number;
  goalProbability: number; // 0–1
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
  worstCase: number; // p5
  bestCase: number; // p95
  histogram: HistogramBin[];
  fan: FanPoint[]; // projection cone from now → next cycle peak
  horizonMonths: number;
}

// Months from now to the projected next cycle peak (~H+18 from the next halving).
const FORECAST_HORIZON_MONTHS = 30;

export function runForecast(opts: {
  currentValue: number;
  plan: Pick<PortfolioPlan, "btcPct" | "ethPct" | "solPct" | "altsPct">;
  goalValue: number;
  sims?: number;
  seed?: number;
}): ForecastResult | null {
  const { currentValue, plan, goalValue } = opts;
  if (!(currentValue > 0)) return null;

  const sims = opts.sims ?? 3000;
  const seed = ((opts.seed ?? Math.round(currentValue + goalValue)) >>> 0) || 1;
  const rng = mulberry32(seed);

  const outcomes = new Array<number>(sims);
  for (let i = 0; i < sims; i++) {
    const zMarket = randNormal(rng);
    outcomes[i] =
      currentValue * (plan.btcPct / 100) * sampleMult(ASSET_PARAMS.btc, zMarket, rng) +
      currentValue * (plan.ethPct / 100) * sampleMult(ASSET_PARAMS.eth, zMarket, rng) +
      currentValue * (plan.solPct / 100) * sampleMult(ASSET_PARAMS.sol, zMarket, rng) +
      currentValue * (plan.altsPct / 100) * sampleMult(ASSET_PARAMS.alts, zMarket, rng);
  }
  outcomes.sort((a, b) => a - b);

  const pct = (p: number) => outcomes[Math.min(sims - 1, Math.max(0, Math.floor((p / 100) * sims)))];
  const goalHits = goalValue > 0 ? outcomes.filter((v) => v >= goalValue).length : 0;

  // Histogram across the central 1st–99th percentile range so a few extreme
  // tail draws don't flatten the bars.
  const lo = pct(1);
  const hi = pct(99);
  const bins = 24;
  const width = (hi - lo) / bins || 1;
  const histogram: HistogramBin[] = Array.from({ length: bins }, (_, i) => ({
    binStart: lo + i * width,
    binEnd: lo + (i + 1) * width,
    count: 0,
  }));
  for (const v of outcomes) {
    if (v < lo || v > hi) continue;
    const idx = Math.min(bins - 1, Math.floor((v - lo) / width));
    histogram[idx].count += 1;
  }

  const p10 = pct(10);
  const median = pct(50);
  const p90 = pct(90);

  // Projection cone: geometrically interpolate each percentile from today's
  // value to its terminal value. The band starts pinned at the current balance
  // (no uncertainty today) and fans out toward the cycle peak.
  const H = FORECAST_HORIZON_MONTHS;
  const fan: FanPoint[] = Array.from({ length: H + 1 }, (_, m) => {
    const f = m / H;
    return {
      m,
      low: currentValue * Math.pow(p10 / currentValue, f),
      mid: currentValue * Math.pow(median / currentValue, f),
      high: currentValue * Math.pow(p90 / currentValue, f),
    };
  });

  return {
    sims,
    goalProbability: goalValue > 0 ? goalHits / sims : 0,
    p10,
    p25: pct(25),
    median,
    p75: pct(75),
    p90,
    worstCase: pct(5),
    bestCase: pct(95),
    histogram,
    fan,
    horizonMonths: H,
  };
}
