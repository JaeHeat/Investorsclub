import { CURRENT_CYCLE_PEAK, CURRENT_CYCLE_PEAK_DATE } from "./cycleData";

export type SignalStatus = "healthy" | "caution" | "danger" | "fear";

export interface OnchainReading {
  value: number;
  status: SignalStatus;
}

// Admin-editable cycle parameters. These are the values that age as the cycle
// unfolds (peak price/date, the next buy-zone, and the manually-curated
// on-chain readings) — pulled out of hardcoded source so an admin can keep them
// current without a code deploy. Defaults mirror the cycleData.ts constants, so
// behaviour is unchanged until an admin edits them.
export interface CycleConfig {
  peakPrice: number;
  peakDateISO: string; // YYYY-MM-DD
  buyZoneDateISO: string; // YYYY-MM-DD
  onchain: {
    mvrv: OnchainReading;
    nupl: OnchainReading;
    puell: OnchainReading;
  };
  updatedAtISO: string; // YYYY-MM-DD, auto-stamped on save
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Parse a YYYY-MM-DD string as a LOCAL date (not UTC), so display formatting
// doesn't shift it a day backward in negative-UTC timezones.
export function isoToLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y || 1970, (m || 1) - 1, d || 1);
}

export const DEFAULT_CYCLE_CONFIG: CycleConfig = {
  peakPrice: CURRENT_CYCLE_PEAK,
  peakDateISO: isoDate(CURRENT_CYCLE_PEAK_DATE),
  buyZoneDateISO: "2026-10-01",
  onchain: {
    mvrv: { value: 0.8, status: "healthy" },
    nupl: { value: 0.18, status: "fear" },
    puell: { value: 0.48, status: "healthy" },
  },
  updatedAtISO: "2026-05-12",
};

const KEY = "ct-cycle-config";

export function getCycleConfig(): CycleConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_CYCLE_CONFIG;
    const parsed = JSON.parse(raw) as Partial<CycleConfig>;
    // Deep-merge over defaults so a partial/older stored shape can't break the UI.
    return {
      ...DEFAULT_CYCLE_CONFIG,
      ...parsed,
      onchain: { ...DEFAULT_CYCLE_CONFIG.onchain, ...(parsed.onchain ?? {}) },
    };
  } catch {
    return DEFAULT_CYCLE_CONFIG;
  }
}

export function setCycleConfig(cfg: CycleConfig): CycleConfig {
  const next: CycleConfig = { ...cfg, updatedAtISO: isoDate(new Date()) };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore quota/availability errors — caller keeps its in-memory copy
  }
  return next;
}
