import { HALVING_CYCLES } from "./cycleData";

// "Did following the cycle plan beat buy-and-hold?" — the proof for a HNW
// client. We pair each cycle's peak with the NEXT cycle's bear bottom and ask:
// if you'd sold most of your stack near the top and rebought near the bottom,
// how much MORE Bitcoin would you hold than someone who just held?
//
// Deliberately conservative so it's defensible: you don't nail the exact top or
// bottom — you sell within 15% of the peak and rebuy within 20% of the bottom,
// and only 80% of the stack (keeping a core 20% that never sells).

const SELL_PCT = 0.8;
const KEEP_PCT = 1 - SELL_PCT;
const SELL_HAIRCUT = 0.85; // realised sale ~15% below the absolute top
const BUY_HAIRCUT = 1.2; // re-entry ~20% above the absolute bottom

export interface BacktestCycle {
  key: string;
  label: string; // "2021 top → 2022 bottom"
  peak: number;
  bottom: number;
  sellPrice: number;
  buyPrice: number;
  stackMultiple: number; // BTC held after the round-trip vs. 1.0 for buy-and-hold
  drawdownAvoidedPct: number; // peak→bottom drop the sold portion sidestepped
  projected: boolean;
}

function yearOf(dateStr: string | null): string {
  return dateStr ? String(new Date(dateStr).getFullYear()) : "—";
}

export function runCycleBacktest(): BacktestCycle[] {
  const out: BacktestCycle[] = [];
  for (let i = 0; i < HALVING_CYCLES.length - 1; i++) {
    const a = HALVING_CYCLES[i];
    const b = HALVING_CYCLES[i + 1];
    if (a.cyclePeak == null || !b.bearBottom) continue;
    const peak = a.cyclePeak;
    const bottom = b.bearBottom;
    if (bottom >= peak) continue; // only real top→bottom round-trips
    const sellPrice = peak * SELL_HAIRCUT;
    const buyPrice = bottom * BUY_HAIRCUT;
    const stackMultiple = KEEP_PCT + SELL_PCT * (sellPrice / buyPrice);
    out.push({
      key: `${i}`,
      label: `${yearOf(a.cyclePeakDate)} top → ${yearOf(b.bearBottomDate)} bottom`,
      peak,
      bottom,
      sellPrice,
      buyPrice,
      stackMultiple,
      drawdownAvoidedPct: ((bottom - peak) / peak) * 100,
      projected: Boolean(a.projected || b.projected),
    });
  }
  return out;
}

export const BACKTEST_ASSUMPTIONS = {
  sellPct: SELL_PCT,
  sellHaircut: SELL_HAIRCUT,
  buyHaircut: BUY_HAIRCUT,
};
