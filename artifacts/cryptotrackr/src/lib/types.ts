export type UserRole = "admin" | "client";

export interface HoldingAsset {
  coingecko_id: string;  // e.g. "bitcoin", "ethereum", "solana"
  symbol: string;        // e.g. "BTC", "ETH", "SOL"
  name: string;          // e.g. "Bitcoin", "Ethereum", "Solana"
  amount: number;        // quantity held
  avg_cost: number;      // average entry price in USD
  manual_price?: number; // current price override for custom coins without a CoinGecko ID
}

export interface ClientProfile {
  user_id: string;
  full_name: string | null;
  country: string | null;
  timezone: string | null;
  btc_holdings: number | null;
  avg_cost_basis: number | null;
  investment_goal: string | null;
  goal_conservative: string | null;
  goal_moderate: string | null;
  goal_moonshot: string | null;
  risk_tolerance: string | null;
  time_horizon: string | null;
  notes: string | null;
  discord_username: string | null;
  discord_role_claimed: boolean;
  onboarding_completed: boolean;
  initial_portfolio_value: number | null;
  high_water_mark: number | null;
  joined_at: string | null;
  experience_level: string | null;
  custody: string | null;
  monthly_dca_budget: number | null;
  // Deeper personalization (optional — collected in onboarding, editable in settings)
  primary_objective?: string | null; // generational_wealth | financial_freedom | retirement | major_purchase | income
  objective_detail?: string | null; // free-text "what this money is for"
  drawdown_reaction?: string | null; // buy_more | hold | trim | sell — behavioral risk
  liquidity_needs?: string | null; // none | within_1yr | 1_3yr | flexible
  team_note?: string | null; // a personal note set by the Bitcoin Daily team, shown on the client's dashboard
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

export interface TradeJournalEntry {
  id: string;
  user_id: string;
  date: string;           // ISO date string
  type: "buy" | "sell";
  asset_symbol: string;
  asset_name: string;
  amount: number;
  price: number;          // USD per unit at time of trade
  total_usd: number;
  notes: string;
  created_at: string;
}

export interface PriceAlert {
  id: string;
  user_id: string;
  coingecko_id: string;
  symbol: string;
  target_price: number;
  direction: "above" | "below"; // trigger when price goes above or below
  triggered: boolean;
  triggered_at: string | null;
  created_at: string;
}
