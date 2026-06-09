// Single source of truth for "where are we in the 4-year cycle". Drives the
// dashboard "Today" hero, the cycle clock, and the thesis page. Phase is derived
// from the live drawdown from the cycle peak (dominant) and the halving clock.

export interface CyclePhase {
  id: number; // 1–6
  key: string;
  label: string;
  short: string;
  color: string;
  desc: string;
  action: string; // the one thing a client should do in this phase
  sentiment: string;
}

export const CYCLE_PHASES: CyclePhase[] = [
  {
    id: 1, key: "accumulation", label: "Accumulation", short: "Accumulate",
    color: "#22c55e",
    desc: "Post-bear bottom. Prices are low, attention is gone, smart money loads up.",
    action: "Accumulate aggressively — this is where wealth is built. DCA into BTC on your plan.",
    sentiment: "Despair → disbelief",
  },
  {
    id: 2, key: "early_bull", label: "Early Bull", short: "Early bull",
    color: "#84cc16",
    desc: "Price recovers off the lows. Narratives rebuild, volume returns gradually.",
    action: "Hold your core and add on dips. Let the trend establish itself.",
    sentiment: "Hope → optimism",
  },
  {
    id: 3, key: "mid_bull", label: "Mid Bull", short: "Mid bull",
    color: "#eab308",
    desc: "Mainstream interest returns. Momentum builds, alts begin to outperform.",
    action: "Hold and let winners run. Start mapping your exit levels.",
    sentiment: "Belief → greed",
  },
  {
    id: 4, key: "late_bull", label: "Late Bull", short: "Late bull",
    color: "#f97316",
    desc: "Euphoria. Parabolic price action — everyone is suddenly a genius.",
    action: "Begin scaling out into strength. Lock your exit targets before euphoria peaks.",
    sentiment: "Euphoria",
  },
  {
    id: 5, key: "distribution", label: "Distribution", short: "Distribute",
    color: "#ef4444",
    desc: "Smart money exits. Volatility spikes and the top is being set.",
    action: "Take profit and raise cash. The top is near — protect your gains.",
    sentiment: "Complacency → anxiety",
  },
  {
    id: 6, key: "bear", label: "Bear Market", short: "Bear / cash",
    color: "#6b7280",
    desc: "Post-peak drawdown of 70–80%+. Trap rallies fool the crowd; capital preserves.",
    action: "Hold cash, stay patient, and map your buy levels for the next bottom.",
    sentiment: "Fear → capitulation",
  },
];

export const HALVING_DATE = new Date("2024-04-19T00:00:00Z");

export function monthsSinceHalving(now: number = Date.now()): number {
  return (now - HALVING_DATE.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
}

// A live drawdown dominates (we're in a bear regardless of the calendar);
// otherwise fall back to the halving-clock mapping.
export function getPhaseId(drawdownPct: number | null, months: number): number {
  if (drawdownPct !== null) {
    if (drawdownPct <= -25) return 6; // 25%+ off the peak = bear
    if (drawdownPct <= -10) return 5; // rolling over off the top = distribution
  }
  if (months < 6) return 1;
  if (months < 18) return 2;
  if (months < 28) return 3;
  if (months < 36) return 4;
  if (months < 40) return 5;
  return 6;
}

export function getCyclePhase(
  drawdownPct: number | null,
  opts?: { now?: number; peakTime?: number; buyZoneTime?: number },
): CyclePhase {
  const now = opts?.now ?? Date.now();
  // No live price yet: if we're past the cycle peak but before the next buy
  // zone, we're in the bear — don't let the halving-clock say "mid bull".
  if (drawdownPct === null && opts?.peakTime != null && opts?.buyZoneTime != null) {
    if (now >= opts.peakTime && now < opts.buyZoneTime) {
      return CYCLE_PHASES.find((p) => p.id === 6) ?? CYCLE_PHASES[5];
    }
  }
  const id = getPhaseId(drawdownPct, monthsSinceHalving(now));
  return CYCLE_PHASES.find((p) => p.id === id) ?? CYCLE_PHASES[5];
}
