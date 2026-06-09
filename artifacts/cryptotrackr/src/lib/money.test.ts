import { describe, it, expect } from "vitest";
import { runForecast } from "@/lib/forecast";
import { runCycleBacktest } from "@/lib/cycleBacktest";
import { getDcaSchedule, getBoosters } from "@/lib/dcaPlan";
import { getPhaseId } from "@/lib/cyclePhase";
import { priceAt, buildGrid, buildEquityCurve } from "@/lib/priceHistory";
import { getPortfolioPlan } from "@/lib/portfolioPlans";
import { formatPct } from "@/lib/utils";

const PLAN = { btcPct: 50, ethPct: 25, solPct: 15, altsPct: 10 };

describe("forecast (Monte Carlo)", () => {
  it("returns ordered percentiles and a valid probability", () => {
    const r = runForecast({ currentValue: 100_000, plan: PLAN, goalValue: 300_000, seed: 42 })!;
    expect(r).not.toBeNull();
    expect(r.p10).toBeLessThanOrEqual(r.median);
    expect(r.median).toBeLessThanOrEqual(r.p90);
    expect(r.goalProbability).toBeGreaterThanOrEqual(0);
    expect(r.goalProbability).toBeLessThanOrEqual(1);
  });

  it("is deterministic for the same seed", () => {
    const a = runForecast({ currentValue: 100_000, plan: PLAN, goalValue: 300_000, seed: 7 })!;
    const b = runForecast({ currentValue: 100_000, plan: PLAN, goalValue: 300_000, seed: 7 })!;
    expect(a.median).toBe(b.median);
    expect(a.goalProbability).toBe(b.goalProbability);
  });

  it("a harder goal is never more likely", () => {
    const easy = runForecast({ currentValue: 100_000, plan: PLAN, goalValue: 200_000, seed: 5 })!;
    const hard = runForecast({ currentValue: 100_000, plan: PLAN, goalValue: 800_000, seed: 5 })!;
    expect(hard.goalProbability).toBeLessThanOrEqual(easy.goalProbability);
  });

  it("fan starts at today's value and ends at the median", () => {
    const r = runForecast({ currentValue: 100_000, plan: PLAN, goalValue: 300_000, seed: 9 })!;
    expect(r.fan[0].mid).toBeCloseTo(100_000, 0);
    expect(r.fan[r.fan.length - 1].mid).toBeCloseTo(r.median, 0);
  });

  it("returns null with no portfolio", () => {
    expect(runForecast({ currentValue: 0, plan: PLAN, goalValue: 100_000 })).toBeNull();
  });
});

describe("cycle backtest", () => {
  it("proven cycles grew the stack by selling high / buying low", () => {
    const proven = runCycleBacktest().filter((b) => !b.projected);
    expect(proven.length).toBeGreaterThanOrEqual(2);
    for (const b of proven) {
      expect(b.bottom).toBeLessThan(b.peak);
      expect(b.buyPrice).toBeLessThan(b.sellPrice);
      expect(b.stackMultiple).toBeGreaterThan(1);
    }
  });
});

describe("risk-based DCA", () => {
  it("each schedule front-loads to 100% over the right window", () => {
    const windows = { conservative: 12, moderate: 6, aggressive: 3 } as const;
    for (const risk of ["conservative", "moderate", "aggressive"] as const) {
      const s = getDcaSchedule(risk);
      expect(s.windowMonths).toBe(windows[risk]);
      const sum = s.tranches.reduce((t, x) => t + x.pct, 0);
      expect(sum).toBe(100);
    }
  });

  it("boosters never exceed the risk cap", () => {
    const cons = getBoosters({ fearGreed: 5, drawdownPct: -60, risk: "conservative" });
    expect(cons.totalBoostPct).toBeLessThanOrEqual(25);
    const aggr = getBoosters({ fearGreed: 5, drawdownPct: -60, risk: "aggressive" });
    expect(aggr.totalBoostPct).toBeGreaterThan(0);
    expect(aggr.totalBoostPct).toBeLessThanOrEqual(75);
    expect(getBoosters({ fearGreed: 70, drawdownPct: 5, risk: "moderate" }).totalBoostPct).toBe(0);
  });
});

describe("cycle phase", () => {
  it("deep drawdown reads as bear, mild as distribution", () => {
    expect(getPhaseId(-30, 25)).toBe(6);
    expect(getPhaseId(-15, 25)).toBe(5);
  });
  it("falls back to the halving clock without a drawdown", () => {
    expect(getPhaseId(null, 3)).toBe(1);
    expect(getPhaseId(null, 50)).toBe(6);
  });
});

describe("price history → equity curve", () => {
  it("priceAt does a step lookup", () => {
    const s = [{ t: 1, price: 10 }, { t: 5, price: 20 }];
    expect(priceAt(s, 3)).toBe(10);
    expect(priceAt(s, 6)).toBe(20);
    expect(priceAt(s, 0)).toBe(10);
  });
  it("buildGrid spans the history with the requested points", () => {
    const g = buildGrid({ a: [{ t: 0, price: 1 }, { t: 100, price: 2 }] }, 11);
    expect(g.length).toBe(11);
    expect(g[0]).toBe(0);
    expect(g[g.length - 1]).toBe(100);
  });
  it("buildEquityCurve sums amount × price per grid point", () => {
    const curve = buildEquityCurve(
      [{ coingecko_id: "a", amount: 2, avg_cost: 5 }],
      { a: [{ t: 0, price: 10 }, { t: 10, price: 20 }] },
      [0, 10],
    );
    expect(curve[0].value).toBe(20);
    expect(curve[1].value).toBe(40);
  });
});

describe("allocations & formatting", () => {
  it("portfolio plan allocations sum to 100%", () => {
    for (const risk of ["conservative", "moderate", "aggressive"]) {
      const p = getPortfolioPlan(risk, 250_000);
      expect(p.btcPct + p.ethPct + p.solPct + p.altsPct).toBe(100);
    }
  });
  it("formatPct keeps the sign", () => {
    expect(formatPct(5)).toBe("+5.00%");
    expect(formatPct(-3.2)).toBe("-3.20%");
  });
});
