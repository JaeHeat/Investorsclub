export type UserRole = "admin" | "client";

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
  bonus_amount: number | null;
  bonus_pct: number | null;
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
