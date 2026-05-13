// ── Cycle Data & Math ────────────────────────────────────────────────────────
// All historical data and forward projections based on Bitcoin's halving cycle.
// Sources: @bitcoin.daily guides, Bitwise analysis, on-chain data.

export interface HalvingCycle {
  id: number;
  halvingDate: string;
  halvingLabel: string;
  rewardChange: string;
  bearBottom: number;
  bearBottomDate: string;
  cyclePeak: number | null;
  cyclePeakDate: string | null;
  daysToPeak: number | null;
  gainFromBottom: number | null;
  drawdownPct: number | null;
  peakOverPeak: number | null;
  projected: boolean;
}

export const HALVING_CYCLES: HalvingCycle[] = [
  {
    id: 1,
    halvingDate: "2012-11-28",
    halvingLabel: "2012 Halving",
    rewardChange: "50 → 25 BTC",
    bearBottom: 2,
    bearBottomDate: "2011-11-01",
    cyclePeak: 1163,
    cyclePeakDate: "2013-11-30",
    daysToPeak: 370,
    gainFromBottom: 54900,
    drawdownPct: -93,
    peakOverPeak: null,
    projected: false,
  },
  {
    id: 2,
    halvingDate: "2016-07-09",
    halvingLabel: "2016 Halving",
    rewardChange: "25 → 12.5 BTC",
    bearBottom: 150,
    bearBottomDate: "2015-01-14",
    cyclePeak: 19891,
    cyclePeakDate: "2017-12-17",
    daysToPeak: 518,
    gainFromBottom: 13000,
    drawdownPct: -86,
    peakOverPeak: 17.1,
    projected: false,
  },
  {
    id: 3,
    halvingDate: "2020-05-11",
    halvingLabel: "2020 Halving",
    rewardChange: "12.5 → 6.25 BTC",
    bearBottom: 3100,
    bearBottomDate: "2018-12-15",
    cyclePeak: 69000,
    cyclePeakDate: "2021-11-10",
    daysToPeak: 550,
    gainFromBottom: 2125,
    drawdownPct: -77,
    peakOverPeak: 3.47,
    projected: false,
  },
  {
    id: 4,
    halvingDate: "2024-04-20",
    halvingLabel: "2024 Halving",
    rewardChange: "6.25 → 3.125 BTC",
    bearBottom: 15500,
    bearBottomDate: "2022-11-21",
    cyclePeak: 126272,
    cyclePeakDate: "2025-10-06",
    daysToPeak: 535,
    gainFromBottom: 713,
    drawdownPct: null, // bear in progress
    peakOverPeak: 1.83,
    projected: false,
  },
  {
    id: 5,
    halvingDate: "2028-04-01",
    halvingLabel: "2028 Halving (proj.)",
    rewardChange: "3.125 → 1.5625 BTC",
    bearBottom: 42000, // midpoint of $38K-$50K range
    bearBottomDate: "2026-10-01",
    cyclePeak: 250000, // midpoint of $200K-$300K
    cyclePeakDate: "2029-09-15",
    daysToPeak: 532,
    gainFromBottom: Math.round(((250000 / 42000) - 1) * 100),
    drawdownPct: -60, // projected 2026 drawdown from $126K
    peakOverPeak: 1.98,
    projected: true,
  },
  {
    id: 6,
    halvingDate: "2032-04-01",
    halvingLabel: "2032 Halving (proj.)",
    rewardChange: "1.5625 → 0.78125 BTC",
    bearBottom: 100000,
    bearBottomDate: "2030-10-01",
    cyclePeak: 500000,
    cyclePeakDate: "2033-09-15",
    daysToPeak: 532,
    gainFromBottom: 400,
    drawdownPct: -57,
    peakOverPeak: 2.0,
    projected: true,
  },
  {
    id: 7,
    halvingDate: "2036-04-01",
    halvingLabel: "2036 Halving (proj.)",
    rewardChange: "0.78125 → 0.390625 BTC",
    bearBottom: 200000,
    bearBottomDate: "2034-10-01",
    cyclePeak: 1000000,
    cyclePeakDate: "2037-09-15",
    daysToPeak: 532,
    gainFromBottom: 400,
    drawdownPct: -55,
    peakOverPeak: 2.0,
    projected: true,
  },
];

// ── Current Cycle Constants ───────────────────────────────────────────────────

export const CURRENT_HALVING_DATE = new Date("2024-04-20");
export const CURRENT_CYCLE_PEAK = 126272;
export const CURRENT_CYCLE_PEAK_DATE = new Date("2025-10-06");
export const NEXT_HALVING_DATE = new Date("2028-04-01");

// Key strategy dates
export const KEY_DATES = [
  {
    label: "4th Halving",
    date: new Date("2024-04-20"),
    action: "Supply cut in half",
    status: "done" as const,
  },
  {
    label: "Cycle Peak / Sell Signal",
    date: new Date("2025-10-06"),
    action: "Sell all BTC — move to cash/stables",
    status: "done" as const,
  },
  {
    label: "Cash Phase",
    date: new Date("2025-10-06"),
    dateTo: new Date("2026-10-01"),
    action: "Hold cash, watch for signals",
    status: "active" as const,
  },
  {
    label: "Buy Zone Opens",
    date: new Date("2026-10-01"),
    action: "DCA into BTC — H + 30 months",
    status: "upcoming" as const,
  },
  {
    label: "5th Halving (proj.)",
    date: new Date("2028-04-01"),
    action: "Next supply shock — hold through",
    status: "upcoming" as const,
  },
  {
    label: "Sell Window (proj.)",
    date: new Date("2029-09-15"),
    dateTo: new Date("2029-10-31"),
    action: "Exit positions — H + 18 months",
    status: "upcoming" as const,
  },
];

// ── Bear Market Scenarios ─────────────────────────────────────────────────────

export const BEAR_SCENARIOS = [
  {
    label: "Already Bottomed",
    drawdownPct: -53,
    price: 59000,
    targetDate: "Floor set · Q4 2025",
    basis: "BTC found support at ~$59K — prior cycle ATH zone, re-accumulation underway",
    color: "#06b6d4",
    probability: 40,
    confirmed: true,
  },
  {
    label: "Conservative",
    drawdownPct: -60,
    price: Math.round(CURRENT_CYCLE_PEAK * 0.40),
    targetDate: "Q2 2026",
    basis: "Institutional support holds — StanChart model",
    color: "#22c55e",
    probability: 25,
    confirmed: false,
  },
  {
    label: "Base Case",
    drawdownPct: -67,
    price: Math.round(CURRENT_CYCLE_PEAK * 0.33),
    targetDate: "Q4 2026",
    basis: "Midpoint of historical trend — fits H+30mo timing",
    color: "#F7931A",
    probability: 50,
    confirmed: false,
  },
  {
    label: "Aggressive",
    drawdownPct: -72,
    price: Math.round(CURRENT_CYCLE_PEAK * 0.28),
    targetDate: "Q4 2026",
    basis: "Closer to 2022 pattern (-77%) — macro headwinds",
    color: "#ef4444",
    probability: 25,
    confirmed: false,
  },
];

// ── 6-Phase Cycle Framework ───────────────────────────────────────────────────

export interface CyclePhase {
  id: number;
  name: string;
  shortName: string;
  description: string;
  action: string;
  signal: string;
  duration: string;
  example2024: string;
}

export const CYCLE_PHASES: CyclePhase[] = [
  {
    id: 1,
    name: "Pre-Halving Accumulation",
    shortName: "Accumulation",
    description: "Quiet bear market bottom. Media declares Bitcoin dead. Survivors load up.",
    action: "DCA aggressively. Ignore noise. Build the position.",
    signal: "Maximum pessimism. Low volume. Friends stop asking about crypto.",
    duration: "~511–518 days",
    example2024: "Nov 2022 → Jan 2024 · $15.5K → $30K",
  },
  {
    id: 2,
    name: "Pre-Halving Rally",
    shortName: "Pre-Halving Rally",
    description: "Halving narrative builds 60–90 days before. FOMO enters. Volume picks up.",
    action: "Ride it — don't chase. Partial profits on extended moves.",
    signal: "Halving countdown everywhere. Retail enters. Price accelerates.",
    duration: "35–182 days",
    example2024: "Jan 2024 → Mar 2024 · $25K → $73K (+192% ETF-fueled)",
  },
  {
    id: 3,
    name: "Pre-Halving Pullback",
    shortName: "Pullback",
    description: '"Sell the news" correction. Shakes out tourists. Phase 5 hasn\'t started.',
    action: "Don't panic. This is the shakeout. Accumulators hold.",
    signal: '"Halving was priced in" narrative. Fear spikes. Tourists sell.',
    duration: "14–42 days",
    example2024: "Mar 2024 → May 2024 · -23% ($73K → $56K)",
  },
  {
    id: 4,
    name: "Post-Halving Accumulation",
    shortName: "Post-Halving Acc.",
    description: "Bitcoin goes quiet after the halving. Sideways grind. Supply shock hasn't priced in yet.",
    action: "Hold. Accumulate dips. Wait. The parabolic move is loading.",
    signal: "Boredom. Low engagement. 'Is the bull market over?' sentiment.",
    duration: "~147–170 days",
    example2024: "May 2024 → Sep 2024 · $56K–$72K range",
  },
  {
    id: 5,
    name: "Post-Halving Rally",
    shortName: "Bull Run",
    description: "The parabolic run. Supply shock manifests. Life-changing returns — diminishing each cycle.",
    action: "Ride with a plan. Take profits in tranches. Set exit targets before euphoria.",
    signal: "Euphoria. Mainstream coverage. Uber driver asks about Bitcoin.",
    duration: "364–550 days",
    example2024: "Sep 2024 → Oct 2025 · $56K → $126K (+125%)",
  },
  {
    id: 6,
    name: "Bear Market",
    shortName: "Bear Market",
    description: "Post-peak drawdown. Trap rallies fool retail. Capital preserves to buy the next bottom.",
    action: "Move to cash/stables. Do NOT add long-term positions during trap rallies. Map buy levels.",
    signal: "'Crypto is dead' headlines. ETF outflows. Miner capitulation. Sustained fear.",
    duration: "~12 months",
    example2024: "Oct 2025 → ~Oct 2026 · $126K → projected $38K–$50K (-65% to -72%)",
  },
];

// Backward-compat alias
export const FIVE_PHASES = CYCLE_PHASES;

// ── Bottom Confirmation Signals ───────────────────────────────────────────────

export const BOTTOM_SIGNALS = [
  {
    id: "ma50w",
    label: "50-Week MA Reclaim",
    description: "BTC drops well below then reclaims the 50-week MA. Bottom formed 15–30% below in 2018/2022.",
  },
  {
    id: "rsi",
    label: "Weekly RSI Below 30",
    description: "Deeply oversold on weekly chart. Only occurs at major cycle bottoms.",
  },
  {
    id: "volume",
    label: "Capitulation Volume Spike",
    description: "Final panic flush: high volume + sharp drop + immediate reversal.",
  },
  {
    id: "fear",
    label: "Fear & Greed Below 15 (sustained)",
    description: "Not one day — sustained extreme fear for 2+ weeks signals capitulation.",
  },
  {
    id: "miners",
    label: "Miner Capitulation",
    description: "Hash ribbons compress / invert. Weakest miners done selling.",
  },
];

// ── DCA Allocation Framework ──────────────────────────────────────────────────

export const DCA_SCHEDULE = [
  { months: "Months 1–3", allocationPct: 40, label: "Front-load" },
  { months: "Months 4–6", allocationPct: 30, label: "Core stack" },
  { months: "Months 7–9", allocationPct: 20, label: "Secondary" },
  { months: "Months 10–12", allocationPct: 10, label: "Tail" },
];

export const DCA_BOOSTERS = [
  { trigger: "BTC drops -20% from rolling 200-day high", boost: "+25%" },
  { trigger: "Fear & Greed Index below 25", boost: "+25%" },
  { trigger: "Macro spike (VIX > 25 or crypto vol spike)", boost: "+25%" },
  { trigger: "Maximum boost per month", boost: "+50% cap" },
];

// ── Utility functions ─────────────────────────────────────────────────────────

export function getDaysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function getDaysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function getCurrentCyclePhase(): {
  phase: "bear" | 1 | 2 | 3 | 4 | 5;
  id: number | "bear";
  name: string;
  label: string;
  description: string;
  daysIn: number;
  nextMilestone: string;
  daysToNext: number;
  progress: number; // 0–100
} {
  const now = Date.now();
  const peak = CURRENT_CYCLE_PEAK_DATE.getTime();
  const buyZone = new Date("2026-10-01").getTime();
  const nextHalving = NEXT_HALVING_DATE.getTime();

  if (now < peak) {
    return {
      phase: 5,
      id: 5,
      name: "Post-Halving Rally",
      label: "Post-Halving Rally",
      description: "Bitcoin in parabolic bull run phase.",
      daysIn: getDaysSince(CURRENT_HALVING_DATE),
      nextMilestone: "Cycle Peak",
      daysToNext: getDaysUntil(CURRENT_CYCLE_PEAK_DATE),
      progress: 90,
    };
  }
  if (now < buyZone) {
    const daysIn = getDaysSince(CURRENT_CYCLE_PEAK_DATE);
    const totalDuration = Math.round((buyZone - peak) / (1000 * 60 * 60 * 24));
    return {
      phase: "bear",
      id: "bear",
      name: "Bear Market",
      label: "Bear Market / Cash Phase",
      description: "Post-cycle drawdown. Hold cash. Watch for buy signals.",
      daysIn,
      nextMilestone: "Buy Zone Opens (~Oct 2026)",
      daysToNext: getDaysUntil(new Date("2026-10-01")),
      progress: Math.min(99, Math.round((daysIn / totalDuration) * 100)),
    };
  }
  if (now < nextHalving) {
    return {
      phase: 1,
      id: 1,
      name: "Pre-Halving Accumulation",
      label: "Pre-Halving Accumulation",
      description: "Bear market bottom — DCA window open. This is where wealth is built.",
      daysIn: getDaysSince(new Date("2026-10-01")),
      nextMilestone: "5th Halving (~Apr 2028)",
      daysToNext: getDaysUntil(NEXT_HALVING_DATE),
      progress: 10,
    };
  }
  return {
    phase: 5,
    id: 5,
    name: "Post-Halving Rally",
    label: "Post-Halving Rally",
    description: "Next cycle bull run in progress.",
    daysIn: getDaysSince(NEXT_HALVING_DATE),
    nextMilestone: "Cycle Peak (~Sep 2029)",
    daysToNext: getDaysUntil(new Date("2029-09-15")),
    progress: 50,
  };
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
