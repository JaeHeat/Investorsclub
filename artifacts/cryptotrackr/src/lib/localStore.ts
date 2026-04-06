import type { ClientProfile, Milestone, RoadmapItem, Report } from "./types";

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

const SEED_KEY = "cryptotrackr-seeded-v1";

function seedIfEmpty() {
  if (localStorage.getItem(SEED_KEY)) return;

  // Demo client profile
  const profiles: ClientProfile[] = [
    {
      user_id: "client-1",
      full_name: "Alex Rivera",
      country: "United States",
      timezone: "America/New_York",
      btc_holdings: 0.85,
      avg_cost_basis: 28000,
      investment_goal: "cycle_top_exit",
      risk_tolerance: "moderate",
      time_horizon: "2_3_years",
      notes: "Looking to exit near the cycle top and re-enter in the bear market.",
      onboarding_completed: true,
      initial_portfolio_value: 23800,
      high_water_mark: 23800,
    },
  ];

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
      title: "Personal Target: Begin scaling out at $90K",
      content:
        "Given your moderate risk profile and cycle top exit strategy, we recommend beginning to scale out 20–25% of your position around the $90K level, with additional tranches at $100K and $110K.",
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
  ];

  write("ct-profiles", profiles);
  write("ct-roadmap", roadmapItems);
  write("ct-reports", reports);
  write("ct-milestones", [] as Milestone[]);
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
    bonus_amount: milestone.bonus_amount ?? null,
    bonus_pct: milestone.bonus_pct ?? null,
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
