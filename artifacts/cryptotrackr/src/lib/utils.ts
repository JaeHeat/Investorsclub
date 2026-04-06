import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatBTC(value: number): string {
  return `${value.toFixed(4)} BTC`;
}

export function formatPct(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

// ── Milestone matrix ──────────────────────────────────────────────────────
//
// Two axes: portfolio size tier × risk tolerance.
//
//  Starter   < $100K   — entry tier; all risk modes can reach high upside
//  Core     $100K–$500K — primary client base
//  Premium  $500K–$1M  — capital preservation becomes the priority
//  Elite      > $1M    — even aggressive is capped at 4x
//
// Bonus %  = percentage of the gain at that milestone paid as a performance fee.
// Larger portfolio → lower bonus % (absolute dollars are already substantial).

export interface MilestoneTier {
  pcts: [number, number, number, number, number];       // 5 return targets in %
  bonusPcts: [number, number, number, number, number];  // performance fee % per target
  portfolioLabel: string;   // e.g. "Core"
  riskLabel: string;        // e.g. "Moderate"
  maxReturnLabel: string;   // e.g. "7x"
}

type RiskKey = "conservative" | "moderate" | "aggressive";
type SizeKey = "starter" | "core" | "premium" | "elite";

const MATRIX: Record<SizeKey, Record<RiskKey, MilestoneTier>> = {
  starter: {
    conservative: {
      pcts:       [50, 100, 200, 400, 600],
      bonusPcts:  [ 1,   2,   3,   4,   5],
      portfolioLabel: "Starter", riskLabel: "Conservative", maxReturnLabel: "7x",
    },
    moderate: {
      pcts:       [100, 200, 400, 700, 1000],
      bonusPcts:  [  1,   2,   3,   4,    5],
      portfolioLabel: "Starter", riskLabel: "Moderate", maxReturnLabel: "11x",
    },
    aggressive: {
      pcts:       [150, 300, 500, 750, 1000],
      bonusPcts:  [  1,   2,   3,   4,    5],
      portfolioLabel: "Starter", riskLabel: "Aggressive", maxReturnLabel: "11x",
    },
  },
  core: {
    conservative: {
      pcts:       [25, 50, 100, 200, 300],
      bonusPcts:  [ 1,  2,   3,   4,   5],
      portfolioLabel: "Core", riskLabel: "Conservative", maxReturnLabel: "4x",
    },
    moderate: {
      pcts:       [50, 100, 200, 400, 600],
      bonusPcts:  [ 1,   2,   3,   4,   5],
      portfolioLabel: "Core", riskLabel: "Moderate", maxReturnLabel: "7x",
    },
    aggressive: {
      pcts:       [100, 200, 400, 700, 900],
      bonusPcts:  [  1,   2,   3,   4,   5],
      portfolioLabel: "Core", riskLabel: "Aggressive", maxReturnLabel: "10x",
    },
  },
  premium: {
    conservative: {
      pcts:       [15, 25, 50, 100, 150],
      bonusPcts:  [ 1,  2,  3,   4,   5],
      portfolioLabel: "Premium", riskLabel: "Conservative", maxReturnLabel: "2.5x",
    },
    moderate: {
      pcts:       [25, 50, 100, 200, 300],
      bonusPcts:  [ 1,  2,   3,   4,   5],
      portfolioLabel: "Premium", riskLabel: "Moderate", maxReturnLabel: "4x",
    },
    aggressive: {
      pcts:       [50, 100, 200, 400, 600],
      bonusPcts:  [ 1,   2,   3,   4,   5],
      portfolioLabel: "Premium", riskLabel: "Aggressive", maxReturnLabel: "7x",
    },
  },
  elite: {
    conservative: {
      pcts:       [10, 20, 50, 75, 100],
      bonusPcts:  [ 1,  2,  3,  4,   5],
      portfolioLabel: "Elite", riskLabel: "Conservative", maxReturnLabel: "2x",
    },
    moderate: {
      pcts:       [15, 25, 50, 100, 150],
      bonusPcts:  [ 1,  2,  3,   4,   5],
      portfolioLabel: "Elite", riskLabel: "Moderate", maxReturnLabel: "2.5x",
    },
    aggressive: {
      pcts:       [25, 50, 100, 200, 300],
      bonusPcts:  [ 1,  2,   3,   4,   5],
      portfolioLabel: "Elite", riskLabel: "Aggressive", maxReturnLabel: "4x",
    },
  },
};

function sizeKey(portfolioValue: number): SizeKey {
  if (portfolioValue < 100_000) return "starter";
  if (portfolioValue < 500_000) return "core";
  if (portfolioValue < 1_000_000) return "premium";
  return "elite";
}

function riskKey(risk: string | null | undefined): RiskKey {
  if (risk === "conservative" || risk === "aggressive") return risk;
  return "moderate";
}

export function getMilestoneTier(
  risk: string | null | undefined,
  portfolioValue: number
): MilestoneTier {
  return MATRIX[sizeKey(portfolioValue)][riskKey(risk)];
}

// Kept for backward-compat call sites that still pass (milestonePct, portfolioValue).
// New code should call getMilestoneTier and index into bonusPcts directly.
export function getBonusPct(milestonePct: number, portfolioValue: number): number {
  const tier = MATRIX[sizeKey(portfolioValue)]["moderate"];
  const idx = tier.pcts.indexOf(milestonePct as never);
  return idx >= 0 ? tier.bonusPcts[idx] : 5;
}

export function getPortfolioTier(value: number): string {
  if (value < 100_000) return "Starter";
  if (value < 500_000) return "Core";
  if (value < 1_000_000) return "Premium";
  return "Elite";
}

// Legacy — prefer getMilestoneTier().pcts
export const MILESTONE_PCTS = [25, 50, 100, 150, 200];
