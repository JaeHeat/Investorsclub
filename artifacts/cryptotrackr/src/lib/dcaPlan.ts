// Risk-based DCA pacing. The higher the risk tolerance, the faster capital is
// deployed into the accumulation window (shorter window, more front-loaded,
// bigger dip-boosters). Conservative spreads contributions out to reduce
// timing risk; aggressive concentrates them near the bottom.

export type RiskTolerance = "conservative" | "moderate" | "aggressive";

export interface DcaTranche {
  label: string;
  monthsLabel: string;
  pct: number; // share of total budget deployed in this bucket (sums to 100)
}

export interface DcaSchedule {
  risk: RiskTolerance;
  windowMonths: number;
  tranches: DcaTranche[];
  boosterCapPct: number; // max extra % added to a monthly buy from boosters
  pace: string; // one-line plain-English description
}

function normalizeRisk(risk: string | null | undefined): RiskTolerance {
  if (risk === "conservative" || risk === "aggressive") return risk;
  return "moderate";
}

const SCHEDULES: Record<RiskTolerance, DcaSchedule> = {
  conservative: {
    risk: "conservative",
    windowMonths: 12,
    tranches: [
      { label: "Front", monthsLabel: "Months 1–3", pct: 28 },
      { label: "Core", monthsLabel: "Months 4–6", pct: 27 },
      { label: "Secondary", monthsLabel: "Months 7–9", pct: 25 },
      { label: "Tail", monthsLabel: "Months 10–12", pct: 20 },
    ],
    boosterCapPct: 25,
    pace: "Spread evenly over ~12 months. Lower timing risk, smoother entry.",
  },
  moderate: {
    risk: "moderate",
    windowMonths: 6,
    tranches: [
      { label: "Front", monthsLabel: "Months 1–2", pct: 40 },
      { label: "Core", monthsLabel: "Months 3–4", pct: 30 },
      { label: "Secondary", monthsLabel: "Month 5", pct: 20 },
      { label: "Tail", monthsLabel: "Month 6", pct: 10 },
    ],
    boosterCapPct: 50,
    pace: "Front-load over ~6 months. Balanced between timing and exposure.",
  },
  aggressive: {
    risk: "aggressive",
    windowMonths: 3,
    tranches: [
      { label: "Front", monthsLabel: "Weeks 1–3", pct: 55 },
      { label: "Core", monthsLabel: "Weeks 4–6", pct: 25 },
      { label: "Secondary", monthsLabel: "Weeks 7–9", pct: 12 },
      { label: "Tail", monthsLabel: "Weeks 10–12", pct: 8 },
    ],
    boosterCapPct: 75,
    pace: "Deploy fast over ~3 months, heavy in the first weeks. Maximum exposure to the recovery.",
  },
};

export function getDcaSchedule(risk: string | null | undefined): DcaSchedule {
  return SCHEDULES[normalizeRisk(risk)];
}

export interface Booster {
  id: string;
  label: string;
  detail: string;
  boostPct: number;
  active: boolean;
}

// Live dip-boosters: when the market is fearful or deeply discounted, add to
// the monthly buy (capped by the client's risk profile). Aggressive clients
// have a higher cap, so they lean into dips harder.
export function getBoosters(opts: {
  fearGreed?: number | null;
  drawdownPct?: number | null; // negative = below peak
  risk: string | null | undefined;
}): { boosters: Booster[]; totalBoostPct: number } {
  const cap = getDcaSchedule(opts.risk).boosterCapPct;
  const boosters: Booster[] = [
    {
      id: "fear",
      label: "Extreme Fear",
      detail: "Fear & Greed below 25",
      boostPct: 25,
      active: opts.fearGreed != null && opts.fearGreed < 25,
    },
    {
      id: "drawdown",
      label: "Deep discount",
      detail: "BTC 20%+ below the cycle peak",
      boostPct: 25,
      active: opts.drawdownPct != null && opts.drawdownPct <= -20,
    },
    {
      id: "capitulation",
      label: "Capitulation",
      detail: "Fear & Greed below 10 — peak conviction zone",
      boostPct: 25,
      active: opts.fearGreed != null && opts.fearGreed < 10,
    },
  ];
  const raw = boosters.filter((b) => b.active).reduce((s, b) => s + b.boostPct, 0);
  return { boosters, totalBoostPct: Math.min(cap, raw) };
}
