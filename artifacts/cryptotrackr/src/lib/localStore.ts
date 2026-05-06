import type { ClientProfile, HoldingAsset, Milestone, RoadmapItem, Report, Broadcast, PortfolioSnapshot, WatchlistItem } from "./types";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── Seed data on first load ────────────────────────────────────────────────

const SEED_KEY = "cryptotrackr-seeded-v5";

function seedIfEmpty() {
  if (localStorage.getItem(SEED_KEY)) return;

  // Demo client — Core tier ($100K–$500K), Moderate risk
  // BTC 1.8  @ $35,000 = $63,000
  // ETH 35   @ $1,800  = $63,000
  // SOL 250  @ $96     = $24,000
  // Total invested: $150,000
  const profiles: ClientProfile[] = [
    {
      user_id: "client-1",
      full_name: "Alex Rivera",
      country: "United States",
      timezone: "America/New_York",
      btc_holdings: 1.8,
      avg_cost_basis: 35000,
      investment_goal: "5x",
      risk_tolerance: "moderate",
      time_horizon: "2_3_years",
      notes: "Looking to exit near the cycle top and re-enter in the bear market. Comfortable with medium drawdowns but wants to protect the $150K base.",
      onboarding_completed: true,
      initial_portfolio_value: 150000,
      high_water_mark: 150000,
    },
  ];

  const holdings: Record<string, HoldingAsset[]> = {
    "client-1": [
      {
        coingecko_id: "bitcoin",
        symbol: "BTC",
        name: "Bitcoin",
        amount: 1.8,
        avg_cost: 35000,
      },
      {
        coingecko_id: "ethereum",
        symbol: "ETH",
        name: "Ethereum",
        amount: 35,
        avg_cost: 1800,
      },
      {
        coingecko_id: "solana",
        symbol: "SOL",
        name: "Solana",
        amount: 250,
        avg_cost: 96,
      },
    ],
  };

  const roadmapItems: RoadmapItem[] = [
    {
      id: uid(),
      user_id: null,
      title: "Cycle Top Watch Zone: $95K–$120K",
      content:
        "Based on on-chain indicators and historical cycle analysis, we're watching the $95K–$120K range as a potential cycle top. MVRV-Z and NUPL are approaching overheated territory. We'll issue alerts as we approach this zone.",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uid(),
      user_id: "client-1",
      title: "Personal Target: Begin scaling out at $90K BTC",
      content:
        "Given your moderate risk profile and cycle top exit strategy, we recommend beginning to scale out 20–25% of your BTC and ETH position around the $90K BTC level, with additional tranches at $100K and $110K.",
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const reports: Report[] = [
    {
      id: uid(),
      user_id: null,
      title: "March 2026 — Cycle Update",
      content:
        "Bitcoin has continued its bull market structure, with price holding above the 200-week moving average and on-chain accumulation remaining strong. The halving effect is now in full force, with miner revenues stabilizing after the initial compression.\n\nKey metrics to watch:\n- MVRV-Z Score: 2.1 (approaching caution territory at 3.0)\n- NUPL: 0.58 (Belief phase — historically precedes euphoria)\n- Exchange outflows remain elevated, suggesting continued accumulation\n\nOutlook: We remain in a healthy bull market. No signs of overheating yet. Continue holding per your strategy.",
      published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      is_global: true,
    },
    {
      id: uid(),
      user_id: null,
      title: "February 2026 — Market Structure Analysis",
      content:
        "February saw a significant consolidation phase following the January rally. BTC ranged between $72K–$86K, shaking out weak hands while long-term holders continued to accumulate.\n\nOn-chain highlights:\n- Long-term holder supply hit a new all-time high at 14.2M BTC\n- Funding rates normalized after the leverage flush in late January\n- Realized profit/loss ratio stabilized, indicating reduced sell pressure\n\nOutlook: Healthy consolidation. We expect a continuation of the bull market structure into Q2 2026.",
      published_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      is_global: true,
    },
  ];

  const broadcasts: Broadcast[] = [
    {
      id: uid(),
      title: "Cycle Update: BTC Consolidating — Alts Rotation Window Open",
      content:
        "Bitcoin has been consolidating in the $78K–$88K range for the past 3 weeks following the peak at $126K in October 2025. On-chain data shows long-term holders re-accumulating. This is historically a strong altcoin rotation window — Ethereum and SOL are showing relative strength. If you're underallocated to your target, this is the window to rebalance into alts at discounted prices.",
      phase_tag: "Bear Market Watch",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: uid(),
      title: "Action Required: Review Your Exit Strategy",
      content:
        "Given the current macro environment and BTC's position relative to the cycle peak, now is the time to review your exit strategy tranches. Log in to your Portfolio Plan and Exit Strategy pages to confirm your sell levels are set. We will be issuing alerts at key price levels as part of your cycle management service.",
      phase_tag: "Portfolio Action",
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const snapshots: Record<string, PortfolioSnapshot[]> = {
    "client-1": Array.from({ length: 12 }, (_, i) => {
      const daysAgo = (11 - i) * 7;
      const base = 142000;
      const growth = [0, 3200, 8100, 5400, 12600, 9800, 18400, 22000, 15300, 31000, 26000, 38000][i];
      return {
        date: new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10),
        value: base + growth,
      };
    }),
  };

  write("ct-profiles", profiles);
  write("ct-holdings", holdings);
  write("ct-roadmap", roadmapItems);
  write("ct-reports", reports);
  write("ct-milestones", [] as Milestone[]);
  write("ct-broadcasts", broadcasts);
  write("ct-snapshots", snapshots);
  write("ct-watchlist", {} as Record<string, WatchlistItem[]>);
  write("ct-bear-checklist", {} as Record<string, Record<string, boolean>>);
  localStorage.setItem(SEED_KEY, "1");
}

seedIfEmpty();

// ── Client Profiles ────────────────────────────────────────────────────────

export function getClientProfile(userId: string): ClientProfile | null {
  const all = read<ClientProfile[]>("ct-profiles", []);
  return all.find((p) => p.user_id === userId) ?? null;
}

export function getAllClientProfiles(): ClientProfile[] {
  return read<ClientProfile[]>("ct-profiles", []);
}

export function upsertClientProfile(profile: ClientProfile): ClientProfile {
  const all = read<ClientProfile[]>("ct-profiles", []);
  const idx = all.findIndex((p) => p.user_id === profile.user_id);
  if (idx >= 0) {
    all[idx] = profile;
  } else {
    all.push(profile);
  }
  write("ct-profiles", all);
  return profile;
}

// ── Holdings ───────────────────────────────────────────────────────────────

export function getHoldings(userId: string): HoldingAsset[] {
  const all = read<Record<string, HoldingAsset[]>>("ct-holdings", {});
  return all[userId] ?? [];
}

export function setHoldings(userId: string, holdings: HoldingAsset[]): void {
  const all = read<Record<string, HoldingAsset[]>>("ct-holdings", {});
  all[userId] = holdings;
  write("ct-holdings", all);
}

// ── Milestones ─────────────────────────────────────────────────────────────

export function getMilestones(userId: string): Milestone[] {
  const all = read<Milestone[]>("ct-milestones", []);
  return all.filter((m) => m.user_id === userId);
}

export function upsertMilestone(milestone: Partial<Milestone> & { user_id: string; milestone_pct: number }): Milestone {
  const all = read<Milestone[]>("ct-milestones", []);
  const idx = all.findIndex(
    (m) => m.user_id === milestone.user_id && m.milestone_pct === milestone.milestone_pct
  );
  const record: Milestone = {
    id: idx >= 0 ? all[idx].id : uid(),
    user_id: milestone.user_id,
    milestone_pct: milestone.milestone_pct,
    hit: milestone.hit ?? false,
    hit_at: milestone.hit_at ?? null,
  };
  if (idx >= 0) {
    all[idx] = record;
  } else {
    all.push(record);
  }
  write("ct-milestones", all);
  return record;
}

// ── Roadmap Items ──────────────────────────────────────────────────────────

export function getRoadmapItems(userId: string): RoadmapItem[] {
  const all = read<RoadmapItem[]>("ct-roadmap", []);
  return all.filter((r) => r.user_id === userId || r.user_id === null);
}

export function getAllRoadmapItems(): RoadmapItem[] {
  return read<RoadmapItem[]>("ct-roadmap", []);
}

export function addRoadmapItem(item: Omit<RoadmapItem, "id" | "created_at">): RoadmapItem {
  const all = read<RoadmapItem[]>("ct-roadmap", []);
  const record: RoadmapItem = {
    ...item,
    id: uid(),
    created_at: new Date().toISOString(),
  };
  all.unshift(record);
  write("ct-roadmap", all);
  return record;
}

// ── Reports ────────────────────────────────────────────────────────────────

export function getReports(userId: string): Report[] {
  const all = read<Report[]>("ct-reports", []);
  return all.filter((r) => r.user_id === userId || r.is_global);
}

export function getAllReports(): Report[] {
  return read<Report[]>("ct-reports", []);
}

export function addReport(report: Omit<Report, "id" | "published_at">): Report {
  const all = read<Report[]>("ct-reports", []);
  const record: Report = {
    ...report,
    id: uid(),
    published_at: new Date().toISOString(),
  };
  all.unshift(record);
  write("ct-reports", all);
  return record;
}

// ── Broadcasts ─────────────────────────────────────────────────────────────

export function getBroadcasts(): Broadcast[] {
  return read<Broadcast[]>("ct-broadcasts", []);
}

export function addBroadcast(b: Omit<Broadcast, "id" | "created_at">): Broadcast {
  const all = read<Broadcast[]>("ct-broadcasts", []);
  const record: Broadcast = { ...b, id: uid(), created_at: new Date().toISOString() };
  all.unshift(record);
  write("ct-broadcasts", all);
  return record;
}

export function deleteBroadcast(id: string): void {
  const all = read<Broadcast[]>("ct-broadcasts", []).filter((b) => b.id !== id);
  write("ct-broadcasts", all);
}

// ── Portfolio Snapshots ────────────────────────────────────────────────────

export function getPortfolioSnapshots(userId: string): PortfolioSnapshot[] {
  const all = read<Record<string, PortfolioSnapshot[]>>("ct-snapshots", {});
  return all[userId] ?? [];
}

export function savePortfolioSnapshot(userId: string, value: number): void {
  const all = read<Record<string, PortfolioSnapshot[]>>("ct-snapshots", {});
  const existing = all[userId] ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const withoutToday = existing.filter((s) => s.date !== today);
  const updated = [...withoutToday, { date: today, value }].slice(-52);
  all[userId] = updated;
  write("ct-snapshots", all);
}

// ── Watchlist ──────────────────────────────────────────────────────────────

export function getWatchlist(userId: string): WatchlistItem[] {
  const all = read<Record<string, WatchlistItem[]>>("ct-watchlist", {});
  return all[userId] ?? [];
}

export function addWatchlistItem(userId: string, item: Omit<WatchlistItem, "added_at">): WatchlistItem {
  const all = read<Record<string, WatchlistItem[]>>("ct-watchlist", {});
  const existing = all[userId] ?? [];
  if (existing.some((w) => w.coingecko_id === item.coingecko_id)) return existing.find((w) => w.coingecko_id === item.coingecko_id)!;
  const record: WatchlistItem = { ...item, added_at: new Date().toISOString() };
  all[userId] = [...existing, record];
  write("ct-watchlist", all);
  return record;
}

export function removeWatchlistItem(userId: string, coingecko_id: string): void {
  const all = read<Record<string, WatchlistItem[]>>("ct-watchlist", {});
  all[userId] = (all[userId] ?? []).filter((w) => w.coingecko_id !== coingecko_id);
  write("ct-watchlist", all);
}

// ── Bear Market Checklist ──────────────────────────────────────────────────

export function getBearChecklist(userId: string): Record<string, boolean> {
  const all = read<Record<string, Record<string, boolean>>>("ct-bear-checklist", {});
  return all[userId] ?? {};
}

export function setBearChecklistItem(userId: string, itemId: string, checked: boolean): void {
  const all = read<Record<string, Record<string, boolean>>>("ct-bear-checklist", {});
  all[userId] = { ...(all[userId] ?? {}), [itemId]: checked };
  write("ct-bear-checklist", all);
}

// ── Client Settings Update ─────────────────────────────────────────────────

export function updateClientSettings(
  userId: string,
  updates: Partial<Pick<ClientProfile,
    "risk_tolerance" | "investment_goal" | "initial_portfolio_value" |
    "full_name" | "timezone" | "country" | "btc_holdings" | "avg_cost_basis"
  >>
): void {
  const all = read<ClientProfile[]>("ct-profiles", []);
  const idx = all.findIndex((p) => p.user_id === userId);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates };
    write("ct-profiles", all);
  }
}

// ── Personal Notes ─────────────────────────────────────────────────────────

export function getPersonalNotes(userId: string): string {
  return localStorage.getItem(`ct-personal-notes-${userId}`) ?? "";
}

export function savePersonalNotes(userId: string, notes: string): void {
  localStorage.setItem(`ct-personal-notes-${userId}`, notes);
}
