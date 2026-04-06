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

export function getBonusPct(milestonePct: number, portfolioValue: number): number {
  const tiers: Record<number, [number, number, number, number]> = {
    25: [1, 0.75, 0.5, 0.25],
    50: [1.5, 1.25, 1, 0.75],
    100: [2.5, 2, 1.75, 1.5],
    150: [3.5, 3, 2.5, 2],
    200: [5, 4, 3.5, 3],
  };

  const row = tiers[milestonePct] || tiers[200];
  if (portfolioValue < 100_000) return row[0];
  if (portfolioValue < 500_000) return row[1];
  if (portfolioValue < 1_000_000) return row[2];
  return row[3];
}

export function getPortfolioTier(value: number): string {
  if (value < 100_000) return "Tier 1";
  if (value < 500_000) return "Tier 2";
  if (value < 1_000_000) return "Tier 3";
  return "Tier 4";
}

export const MILESTONE_PCTS = [25, 50, 100, 150, 200];
