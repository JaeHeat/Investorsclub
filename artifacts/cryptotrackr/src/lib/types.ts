export type UserRole = "admin" | "client";

export interface HoldingAsset {
  coingecko_id: string;  // e.g. "bitcoin", "ethereum", "solana"
  symbol: string;        // e.g. "BTC", "ETH", "SOL"
  name: string;          // e.g. "Bitcoin", "Ethereum", "Solana"
  amount: number;        // quantity held
  avg_cost: number;      // average entry price in USD
}

export interface ClientProfile {
  user_id: string;
  full_name: string | null;
  country: string | null;
  timezone: string | null;
  btc_holdings: number | null;
  avg_cost_basis: number | null;
  investment_goal: string | null;
  risk_tolerance: string | null;
  time_horizon: string | null;
  notes: string | null;
  onboarding_completed: boolean;
  initial_portfolio_value: number | null;
  high_water_mark: number | null;
}

export interface Milestone {
  id: string;
  user_id: string;
  milestone_pct: number;
  hit: boolean;
  hit_at: string | null;
}

export interface RoadmapItem {
  id: string;
  user_id: string | null;
  title: string;
  content: string;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string | null;
  title: string;
  content: string;
  published_at: string;
  is_global: boolean;
}

export interface Broadcast {
  id: string;
  title: string;
  content: string;
  phase_tag: string | null;
  created_at: string;
}

export interface PortfolioSnapshot {
  date: string;
  value: number;
}

export interface WatchlistItem {
  coingecko_id: string;
  symbol: string;
  name: string;
  added_at: string;
}
