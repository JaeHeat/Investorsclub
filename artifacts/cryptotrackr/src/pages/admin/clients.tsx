import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import {
  getHoldings,
  getMilestones,
  upsertMilestone,
  getRoadmapItems,
  getAllReports,
  addRoadmapItem,
  addReport,
  deleteReport,
  deleteRoadmapItem,
  getLastActive,
  getReadReports,
  getTradeJournal,
} from "@/lib/localStore";
import { loadClientsFromServer } from "@/lib/profileApi";
import type { ClientProfile, HoldingAsset, Milestone, RoadmapItem, Report } from "@/lib/types";
import { formatUSD, getMilestoneTier, getPortfolioTier } from "@/lib/utils";
import AdminLayout from "@/components/layout/AdminLayout";
import { usePrices } from "@/hooks/usePrices";
import DonutChart from "@/components/DonutChart";
import {
  ChevronRight, Check, Loader2, X, Plus, Trash2,
  TrendingUp, TrendingDown, Target, BarChart2, RefreshCw, Pencil,
} from "lucide-react";

const ASSET_COLORS: Record<string, string> = {
  bitcoin:  "#F7931A",
  ethereum: "#627EEA",
  solana:   "#9945FF",
  cardano:  "#0033AD",
  ripple:   "#00AAE4",
  dogecoin: "#C2A633",
};
const FALLBACK_COLORS = ["#22c55e", "#06b6d4", "#ec4899", "#f97316", "#a855f7", "#14b8a6"];
function assetColor(id: string, index: number) {
  return ASSET_COLORS[id] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

const BTC_SCENARIOS = [60000, 75000, 90000, 100000, 120000, 150000, 200000];

// ── Helpers ────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="w-full max-w-lg rounded-2xl" style={{ background: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 15%)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid hsl(0 0% 12%)" }}>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-[hsl(0_0%_40%)] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function StatTile({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
      <p className="text-xs text-[hsl(0_0%_40%)] uppercase tracking-wide mb-1.5">{label}</p>
      <p className="text-xl font-semibold" style={{ color: color ?? "white" }}>{value}</p>
      {sub && <p className="text-xs text-[hsl(0_0%_40%)] mt-1">{sub}</p>}
    </div>
  );
}

// ── Edit Client Modal ───────────────────────────────────────────────────────

const KNOWN_ASSETS = [
  { coingecko_id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { coingecko_id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { coingecko_id: "solana", symbol: "SOL", name: "Solana" },
];

function EditClientModal({
  client,
  currentHoldings,
  onClose,
  onSaved,
}: {
  client: ClientProfile;
  currentHoldings: HoldingAsset[];
  onClose: () => void;
  onSaved: (updated: ClientProfile, holdings: HoldingAsset[]) => void;
}) {
  const inputStyle = { background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 16%)", color: "white" as const };
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: client.full_name ?? "",
    initial_portfolio_value: client.initial_portfolio_value != null ? String(client.initial_portfolio_value) : "",
    risk_tolerance: client.risk_tolerance ?? "moderate",
    time_horizon: client.time_horizon ?? "long_term",
    investment_goal: client.investment_goal ?? "",
    goal_conservative: client.goal_conservative ?? "",
    goal_moderate: client.goal_moderate ?? "",
    goal_moonshot: client.goal_moonshot ?? "",
    country: client.country ?? "",
    discord_username: client.discord_username ?? "",
    notes: client.notes ?? "",
  });

  const [holdings, setHoldings] = useState<HoldingAsset[]>(
    currentHoldings.length > 0 ? currentHoldings : []
  );

  function addHolding() {
    setHoldings((prev) => [
      ...prev,
      { coingecko_id: "bitcoin", symbol: "BTC", name: "Bitcoin", amount: 0, avg_cost: 0 },
    ]);
  }

  function removeHolding(idx: number) {
    setHoldings((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateHolding(idx: number, field: keyof HoldingAsset, value: string | number) {
    setHoldings((prev) =>
      prev.map((h, i) => {
        if (i !== idx) return h;
        if (field === "coingecko_id") {
          const asset = KNOWN_ASSETS.find((a) => a.coingecko_id === value);
          return asset ? { ...h, coingecko_id: asset.coingecko_id, symbol: asset.symbol, name: asset.name } : h;
        }
        return { ...h, [field]: value };
      })
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const updatedProfile: Omit<ClientProfile, "user_id"> = {
        full_name: form.full_name || null,
        initial_portfolio_value: form.initial_portfolio_value ? parseFloat(form.initial_portfolio_value) : null,
        risk_tolerance: form.risk_tolerance || null,
        time_horizon: form.time_horizon || null,
        investment_goal: form.investment_goal || null,
        goal_conservative: form.goal_conservative || null,
        goal_moderate: form.goal_moderate || null,
        goal_moonshot: form.goal_moonshot || null,
        country: form.country || null,
        timezone: client.timezone,
        btc_holdings: null,
        avg_cost_basis: null,
        discord_username: form.discord_username || null,
        discord_role_claimed: client.discord_role_claimed,
        notes: form.notes || null,
        onboarding_completed: true,
        joined_at: client.joined_at,
        high_water_mark: client.high_water_mark,
      };

      const res = await fetch(`/api/clients/${client.user_id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ profile: updatedProfile, holdings }),
      });

      if (!res.ok) throw new Error("Failed to save");

      onSaved({ ...client, ...updatedProfile }, holdings);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
      <div className="w-full max-w-xl rounded-2xl overflow-hidden" style={{ background: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 15%)", maxHeight: "90vh", overflowY: "auto" }}>
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-10" style={{ background: "hsl(0 0% 8%)", borderBottom: "1px solid hsl(0 0% 12%)" }}>
          <h3 className="text-sm font-semibold text-white">Edit Client Profile</h3>
          <button onClick={onClose} className="text-[hsl(0_0%_40%)] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Basic info */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold text-[hsl(0_0%_40%)] uppercase tracking-wide">Basic Info</p>
            <div>
              <label className="block text-xs text-[hsl(0_0%_50%)] mb-1">Full Name</label>
              <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="e.g. Alex Rivera" className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[hsl(0_0%_50%)] mb-1">Country</label>
                <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="e.g. United States" className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs text-[hsl(0_0%_50%)] mb-1">Discord</label>
                <input type="text" value={form.discord_username} onChange={(e) => setForm({ ...form, discord_username: e.target.value })} placeholder="e.g. username" className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Portfolio */}
          <div className="space-y-3" style={{ borderTop: "1px solid hsl(0 0% 12%)", paddingTop: "1.25rem" }}>
            <p className="text-[11px] font-semibold text-[hsl(0_0%_40%)] uppercase tracking-wide">Portfolio</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[hsl(0_0%_50%)] mb-1">Initial Portfolio Value ($)</label>
                <input type="number" value={form.initial_portfolio_value} onChange={(e) => setForm({ ...form, initial_portfolio_value: e.target.value })} placeholder="e.g. 50000" className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs text-[hsl(0_0%_50%)] mb-1">Risk Tolerance</label>
                <select value={form.risk_tolerance} onChange={(e) => setForm({ ...form, risk_tolerance: e.target.value })} className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}>
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-[hsl(0_0%_50%)] mb-1">Time Horizon</label>
              <select value={form.time_horizon} onChange={(e) => setForm({ ...form, time_horizon: e.target.value })} className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}>
                <option value="short_term">Short Term (&lt; 1 year)</option>
                <option value="medium_term">Medium Term (1–3 years)</option>
                <option value="long_term">Long Term (3+ years)</option>
              </select>
            </div>
          </div>

          {/* Goals */}
          <div className="space-y-3" style={{ borderTop: "1px solid hsl(0 0% 12%)", paddingTop: "1.25rem" }}>
            <p className="text-[11px] font-semibold text-[hsl(0_0%_40%)] uppercase tracking-wide">Exit Goals ($)</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-[hsl(0_0%_50%)] mb-1">Conservative</label>
                <input type="number" value={form.goal_conservative} onChange={(e) => setForm({ ...form, goal_conservative: e.target.value })} placeholder="e.g. 100000" className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs text-[hsl(0_0%_50%)] mb-1">Target</label>
                <input type="number" value={form.goal_moderate} onChange={(e) => setForm({ ...form, goal_moderate: e.target.value })} placeholder="e.g. 250000" className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs text-[hsl(0_0%_50%)] mb-1">Moonshot</label>
                <input type="number" value={form.goal_moonshot} onChange={(e) => setForm({ ...form, goal_moonshot: e.target.value })} placeholder="e.g. 1000000" className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Holdings */}
          <div className="space-y-3" style={{ borderTop: "1px solid hsl(0 0% 12%)", paddingTop: "1.25rem" }}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-[hsl(0_0%_40%)] uppercase tracking-wide">Holdings</p>
              <button onClick={addHolding} className="text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1" style={{ background: "rgba(247,147,26,0.08)", color: "#F7931A" }}>
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            {holdings.length === 0 && (
              <p className="text-xs text-[hsl(0_0%_35%)]">No holdings added yet</p>
            )}
            {holdings.map((h, idx) => (
              <div key={idx} className="rounded-xl p-3 space-y-2" style={{ background: "hsl(0 0% 10%)" }}>
                <div className="flex items-center justify-between">
                  <select value={h.coingecko_id} onChange={(e) => updateHolding(idx, "coingecko_id", e.target.value)} className="px-2.5 py-1.5 rounded-lg text-xs outline-none" style={inputStyle}>
                    {KNOWN_ASSETS.map((a) => (
                      <option key={a.coingecko_id} value={a.coingecko_id}>{a.symbol} — {a.name}</option>
                    ))}
                  </select>
                  <button onClick={() => removeHolding(idx)} className="p-1 rounded hover:bg-red-500/10 text-[hsl(0_0%_35%)] hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-[hsl(0_0%_45%)] mb-1">Amount</label>
                    <input type="number" value={h.amount || ""} onChange={(e) => updateHolding(idx, "amount", parseFloat(e.target.value) || 0)} placeholder="0.00" className="w-full px-2.5 py-1.5 rounded-lg text-xs outline-none" style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[hsl(0_0%_45%)] mb-1">Avg Cost (USD)</label>
                    <input type="number" value={h.avg_cost || ""} onChange={(e) => updateHolding(idx, "avg_cost", parseFloat(e.target.value) || 0)} placeholder="0.00" className="w-full px-2.5 py-1.5 rounded-lg text-xs outline-none" style={inputStyle} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div style={{ borderTop: "1px solid hsl(0 0% 12%)", paddingTop: "1.25rem" }}>
            <label className="block text-xs text-[hsl(0_0%_50%)] mb-1">Internal Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Notes visible only to admin..." className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none" style={inputStyle} />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60" style={{ background: "#F7931A", color: "#0A0A0A" }}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : "Save Client Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Client Detail ──────────────────────────────────────────────────────────

function ClientDetail({ client, serverHoldings, onBack }: { client: ClientProfile; serverHoldings?: HoldingAsset[]; onBack: () => void }) {
  const holdings = useMemo(() => serverHoldings ?? getHoldings(client.user_id), [client.user_id, serverHoldings]);
  const coinIds = useMemo(() => holdings.map((h) => h.coingecko_id), [holdings]);
  const { prices, loading: pricesLoading } = usePrices(coinIds);

  const [milestones, setMilestones] = useState<Milestone[]>(() => getMilestones(client.user_id));
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>(() => getRoadmapItems(client.user_id));
  const [reports, setReports] = useState<Report[]>(() =>
    getAllReports().filter((r) => r.user_id === client.user_id || r.is_global)
  );

  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [roadmapForm, setRoadmapForm] = useState({ title: "", content: "" });
  const [reportForm, setReportForm] = useState({ title: "", content: "", is_global: false });

  // Portfolio maths
  const initialValue = client.initial_portfolio_value ?? 0;
  const tier = getPortfolioTier(initialValue);
  const milestoneTier = getMilestoneTier(client.risk_tolerance, initialValue);

  const assetRows = holdings.map((h, idx) => {
    const price = prices[h.coingecko_id] ?? null;
    const invested = h.amount * h.avg_cost;
    const currentValue = price !== null ? h.amount * price : null;
    const pnl = currentValue !== null ? currentValue - invested : null;
    const pnlPct = invested > 0 && pnl !== null ? (pnl / invested) * 100 : null;
    return { ...h, price, invested, currentValue, pnl, pnlPct, color: assetColor(h.coingecko_id, idx) };
  });

  const totalInvested = assetRows.reduce((s, r) => s + r.invested, 0);
  const totalCurrent = assetRows.every((r) => r.currentValue !== null)
    ? assetRows.reduce((s, r) => s + (r.currentValue ?? 0), 0)
    : null;
  const totalPnL = totalCurrent !== null ? totalCurrent - totalInvested : null;
  const totalReturnPct = totalInvested > 0 && totalPnL !== null ? (totalPnL / totalInvested) * 100 : null;
  const isPositive = totalPnL !== null && totalPnL >= 0;

  const donutSlices = assetRows.map((r) => ({
    label: `${r.symbol} — ${r.name}`,
    value: r.currentValue ?? r.invested,
    color: r.color,
  }));

  const btcHolding = holdings.find((h) => h.coingecko_id === "bitcoin");
  const btcPrice = prices["bitcoin"] ?? null;

  function saveRoadmapItem() {
    if (!roadmapForm.title || !roadmapForm.content) return;
    setSaving(true);
    addRoadmapItem({ user_id: client.user_id, title: roadmapForm.title, content: roadmapForm.content });
    setRoadmapItems(getRoadmapItems(client.user_id));
    setRoadmapForm({ title: "", content: "" });
    setShowRoadmapModal(false);
    setSaving(false);
  }

  function saveReport() {
    if (!reportForm.title || !reportForm.content) return;
    setSaving(true);
    addReport({
      user_id: reportForm.is_global ? null : client.user_id,
      title: reportForm.title,
      content: reportForm.content,
      is_global: reportForm.is_global,
    });
    setReports(getAllReports().filter((r) => r.user_id === client.user_id || r.is_global));
    setReportForm({ title: "", content: "", is_global: false });
    setShowReportModal(false);
    setSaving(false);
  }

  function handleDeleteRoadmapItem(id: string) {
    deleteRoadmapItem(id);
    setRoadmapItems(getRoadmapItems(client.user_id));
  }

  function handleDeleteReport(id: string) {
    deleteReport(id);
    setReports(getAllReports().filter((r) => r.user_id === client.user_id || r.is_global));
  }

  function markMilestone(pct: number) {
    setSaving(true);
    upsertMilestone({
      user_id: client.user_id,
      milestone_pct: pct,
      hit: true,
      hit_at: new Date().toISOString(),
    });
    setMilestones(getMilestones(client.user_id));
    setShowMilestoneModal(null);
    setSaving(false);
  }

  const inputStyle = { background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 16%)", color: "white" as const };

  return (
    <AdminLayout>
      <button
        onClick={onBack}
        className="text-xs text-[hsl(0_0%_45%)] hover:text-white flex items-center gap-1 mb-6 transition-colors"
        data-testid="button-back-clients"
      >
        ← Back to clients
      </button>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">{client.full_name || "Client"}</h1>
          <p className="text-sm text-[hsl(0_0%_40%)] mt-1">
            {client.country}{client.timezone ? ` · ${client.timezone}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pricesLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[hsl(0_0%_35%)]" />}
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}>
            {tier}
          </span>
        </div>
      </div>

      {/* ── ANALYTICS ──────────────────────────────────────────────────────── */}
      <div className="mb-4 rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(0 0% 13%)" }}>
        <div className="px-5 py-3.5 flex items-center gap-2" style={{ background: "hsl(0 0% 7%)", borderBottom: "1px solid hsl(0 0% 11%)" }}>
          <BarChart2 className="w-4 h-4" style={{ color: "#F7931A" }} />
          <h2 className="text-sm font-semibold text-white">Portfolio Analytics</h2>
          {!pricesLoading && (
            <span className="ml-auto text-xs text-[hsl(0_0%_40%)]">Live prices · refreshes every 60s</span>
          )}
        </div>

        <div className="p-5" style={{ background: "hsl(0 0% 6%)" }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <StatTile label="Portfolio Value" value={totalCurrent !== null ? formatUSD(totalCurrent) : "—"} sub={pricesLoading ? "Loading…" : undefined} color="#F7931A" />
            <StatTile label="Total Invested" value={formatUSD(totalInvested)} sub={`${holdings.length} assets`} />
            <StatTile label="Unrealized P&L" value={totalPnL !== null ? `${isPositive ? "+" : ""}${formatUSD(totalPnL)}` : "—"} sub={totalReturnPct !== null ? `${totalReturnPct >= 0 ? "+" : ""}${totalReturnPct.toFixed(2)}%` : undefined} color={totalPnL === null ? "white" : isPositive ? "#22c55e" : "#ef4444"} />
            <StatTile label="Total Return" value={totalReturnPct !== null ? `${totalReturnPct >= 0 ? "+" : ""}${totalReturnPct.toFixed(1)}%` : "—"} sub={isPositive ? "In profit" : "Below cost basis"} color={totalReturnPct === null ? "white" : totalReturnPct >= 0 ? "#22c55e" : "#ef4444"} />
          </div>

          {/* Donut + asset table */}
          <div className="grid lg:grid-cols-2 gap-5 mb-5">
            <div className="rounded-2xl p-5" style={{ background: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 12%)" }}>
              <p className="text-xs font-semibold text-[hsl(0_0%_45%)] uppercase tracking-wide mb-4">Allocation</p>
              {donutSlices.length > 0 ? <DonutChart slices={donutSlices} size={160} thickness={40} /> : <p className="text-sm text-[hsl(0_0%_35%)]">No holdings</p>}
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 12%)" }}>
              <div className="grid grid-cols-4 gap-2 px-4 py-2.5 text-[11px] text-[hsl(0_0%_35%)] uppercase tracking-wide" style={{ borderBottom: "1px solid hsl(0 0% 12%)" }}>
                <span className="col-span-2">Asset</span><span>Value</span><span>P&L</span>
              </div>
              {assetRows.map((row) => (
                <div key={row.coingecko_id} className="grid grid-cols-4 gap-2 px-4 py-3 items-center" style={{ borderBottom: "1px solid hsl(0 0% 9%)" }} data-testid={`asset-row-${row.coingecko_id}`}>
                  <div className="col-span-2 flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: row.color }} />
                    <div>
                      <p className="text-sm font-medium text-white leading-tight">{row.symbol}</p>
                      <p className="text-[11px] text-[hsl(0_0%_38%)]">{row.amount} · {formatUSD(row.avg_cost)} avg</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-white">{row.currentValue !== null ? formatUSD(row.currentValue) : "—"}</p>
                    {row.price && <p className="text-[11px] text-[hsl(0_0%_38%)]">{formatUSD(row.price)}</p>}
                  </div>
                  <div>
                    {row.pnl !== null ? (
                      <>
                        <p className="text-sm font-medium" style={{ color: row.pnl >= 0 ? "#22c55e" : "#ef4444" }}>{row.pnl >= 0 ? "+" : ""}{formatUSD(row.pnl)}</p>
                        <p className="text-[11px]" style={{ color: row.pnl >= 0 ? "#22c55e" : "#ef4444" }}>{row.pnlPct !== null ? `${row.pnlPct >= 0 ? "+" : ""}${row.pnlPct.toFixed(1)}%` : ""}</p>
                      </>
                    ) : <p className="text-sm text-[hsl(0_0%_35%)]">—</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* P&L bar */}
          {totalCurrent !== null && totalInvested > 0 && (
            <div className="mb-5 rounded-xl p-4 flex items-center gap-4" style={{ background: isPositive ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)", border: `1px solid ${isPositive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)"}` }}>
              {isPositive ? <TrendingUp className="w-5 h-5 shrink-0" style={{ color: "#22c55e" }} /> : <TrendingDown className="w-5 h-5 shrink-0" style={{ color: "#ef4444" }} />}
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: isPositive ? "#22c55e" : "#ef4444" }}>
                  Total {isPositive ? "gain" : "loss"} of {formatUSD(Math.abs(totalPnL!))} across all holdings
                </p>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(0 0% 14%)" }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.max(4, (totalCurrent / (totalInvested * 2)) * 100))}%`, background: isPositive ? "#22c55e" : "#ef4444" }} />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-[hsl(0_0%_40%)]">Invested</p>
                <p className="text-sm font-semibold text-white">{formatUSD(totalInvested)}</p>
              </div>
            </div>
          )}

          {/* BTC scenarios */}
          {btcHolding && (
            <div>
              <p className="text-xs font-semibold text-[hsl(0_0%_45%)] uppercase tracking-wide mb-3">
                BTC Position Scenarios — {btcHolding.amount} BTC at target prices
              </p>
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(0 0% 12%)" }}>
                <div className="grid grid-cols-4 gap-2 px-4 py-2 text-[11px] text-[hsl(0_0%_35%)] uppercase tracking-wide" style={{ background: "hsl(0 0% 8%)", borderBottom: "1px solid hsl(0 0% 12%)" }}>
                  <span>BTC Price</span><span>BTC Value</span><span>BTC P&L</span><span>Return</span>
                </div>
                {BTC_SCENARIOS.map((targetPrice) => {
                  const btcCost = btcHolding.amount * btcHolding.avg_cost;
                  const scenarioValue = btcHolding.amount * targetPrice;
                  const scenarioPnL = scenarioValue - btcCost;
                  const scenarioReturn = btcCost > 0 ? (scenarioPnL / btcCost) * 100 : 0;
                  const isCurrent = btcPrice ? Math.abs(targetPrice - btcPrice) < 5000 : false;
                  return (
                    <div key={targetPrice} className="grid grid-cols-4 gap-2 px-4 py-2.5 text-sm" style={{ background: isCurrent ? "rgba(247,147,26,0.06)" : "transparent", borderBottom: "1px solid hsl(0 0% 9%)", borderLeft: isCurrent ? "2px solid #F7931A" : "2px solid transparent" }}>
                      <span className="font-medium" style={{ color: isCurrent ? "#F7931A" : "hsl(0 0% 80%)" }}>{formatUSD(targetPrice)}{isCurrent && <span className="ml-1 text-[10px] opacity-70">now</span>}</span>
                      <span className="text-white">{formatUSD(scenarioValue)}</span>
                      <span style={{ color: scenarioPnL >= 0 ? "#22c55e" : "#ef4444" }}>{scenarioPnL >= 0 ? "+" : ""}{formatUSD(scenarioPnL)}</span>
                      <span style={{ color: scenarioReturn >= 0 ? "#22c55e" : "#ef4444" }}>{scenarioReturn >= 0 ? "+" : ""}{scenarioReturn.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MILESTONES + PROFILE ──────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* Profile */}
        <div className="rounded-2xl p-5" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          <h2 className="text-xs font-semibold text-[hsl(0_0%_50%)] uppercase tracking-wide mb-4">Client Profile</h2>
          <div className="space-y-2.5">
            {[
              { label: "Conservative goal", value: (() => {
                const g = client.goal_conservative;
                if (!g) return null;
                const n = parseFloat(g);
                return !isNaN(n) && n > 1000 ? (n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${Math.round(n / 1000)}K`) : null;
              })() },
              { label: "Target goal", value: (() => {
                const g = client.goal_moderate ?? client.investment_goal;
                if (!g) return null;
                const n = parseFloat(g);
                return !isNaN(n) && n > 1000 ? (n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${Math.round(n / 1000)}K`) : null;
              })() },
              { label: "Moonshot goal", value: (() => {
                const g = client.goal_moonshot;
                if (!g) return null;
                const n = parseFloat(g);
                return !isNaN(n) && n > 1000 ? (n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${Math.round(n / 1000)}K`) : null;
              })() },
              { label: "Risk Tolerance", value: client.risk_tolerance },
              { label: "Time Horizon", value: client.time_horizon?.replace(/_/g, " ") },
              { label: "Initial Portfolio Value", value: initialValue ? formatUSD(initialValue) : null },
              { label: "Discord", value: client.discord_username ? `@${client.discord_username}` : null },
              { label: "Last Active", value: (() => {
                const ts = getLastActive(client.user_id);
                if (!ts) return null;
                const d = new Date(ts);
                const diffMs = Date.now() - d.getTime();
                const diffDays = Math.floor(diffMs / 86400000);
                if (diffDays === 0) return "Today";
                if (diffDays === 1) return "Yesterday";
                if (diffDays < 7) return `${diffDays}d ago`;
                return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              })() },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-[hsl(0_0%_40%)]">{label}</span>
                <span className="text-white capitalize">{value || "—"}</span>
              </div>
            ))}
            {client.notes && (
              <div className="pt-2.5" style={{ borderTop: "1px solid hsl(0 0% 12%)" }}>
                <p className="text-xs text-[hsl(0_0%_40%)] mb-1">Notes</p>
                <p className="text-xs text-[hsl(0_0%_60%)] leading-relaxed">{client.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Milestones */}
        <div className="rounded-2xl p-5" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xs font-semibold text-[hsl(0_0%_50%)] uppercase tracking-wide">Milestones</h2>
              <p className="text-[11px] text-[hsl(0_0%_35%)] mt-0.5">
                {milestoneTier.portfolioLabel} · {milestoneTier.riskLabel}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(247,147,26,0.08)", color: "#F7931A" }}>
                Up to {milestoneTier.maxReturnLabel}
              </span>
              <Target className="w-3.5 h-3.5 text-[hsl(0_0%_35%)]" />
            </div>
          </div>
          <div className="space-y-3">
            {milestoneTier.pcts.map((pct) => {
              const record = milestones.find((m) => m.milestone_pct === pct);
              const isHit = record?.hit ?? false;
              const targetValue = initialValue * (1 + pct / 100);
              const progressPct = totalCurrent && targetValue
                ? Math.min(100, (totalCurrent / targetValue) * 100)
                : 0;
              return (
                <div key={pct} data-testid={`milestone-row-${pct}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: isHit ? "rgba(34,197,94,0.15)" : "hsl(0 0% 12%)" }}>
                        {isHit && <Check className="w-3 h-3" style={{ color: "#22c55e" }} />}
                      </div>
                      <span className="text-sm font-medium text-white">{pct}%</span>
                      <span className="text-xs text-[hsl(0_0%_40%)]">→ {initialValue ? formatUSD(targetValue) : "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isHit && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>Hit</span>
                      )}
                      {!isHit && (
                        <button onClick={() => setShowMilestoneModal(pct)} className="text-[11px] px-2 py-0.5 rounded-md" style={{ background: "rgba(247,147,26,0.08)", color: "#F7931A" }} data-testid={`mark-milestone-${pct}`}>
                          Mark
                        </button>
                      )}
                    </div>
                  </div>
                  {!isHit && (
                    <div className="h-1 rounded-full ml-7 overflow-hidden" style={{ background: "hsl(0 0% 12%)" }}>
                      <div className="h-1 rounded-full transition-all" style={{ width: `${progressPct}%`, background: progressPct >= 100 ? "#22c55e" : "#F7931A" }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── ROADMAP ───────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-[hsl(0_0%_50%)] uppercase tracking-wide">Roadmap Items</h2>
          <button onClick={() => setShowRoadmapModal(true)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background: "rgba(247,147,26,0.08)", color: "#F7931A" }} data-testid="button-add-roadmap">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        {roadmapItems.length === 0 ? (
          <p className="text-sm text-[hsl(0_0%_35%)]">No roadmap items yet</p>
        ) : (
          <div className="space-y-2">
            {roadmapItems.map((item) => (
              <div key={item.id} className="rounded-xl p-3.5" style={{ background: "hsl(0 0% 10%)" }}>
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-[hsl(0_0%_35%)]">{new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    <button
                      onClick={() => handleDeleteRoadmapItem(item.id)}
                      className="p-1 rounded hover:bg-red-500/10 text-[hsl(0_0%_35%)] hover:text-red-400 transition-colors"
                      title="Delete roadmap item"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[hsl(0_0%_45%)] leading-relaxed line-clamp-2">{item.content}</p>
                {!item.user_id && <span className="inline-block mt-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "rgba(247,147,26,0.08)", color: "#F7931A" }}>Global</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── REPORTS ───────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-[hsl(0_0%_50%)] uppercase tracking-wide">Reports</h2>
          <button onClick={() => setShowReportModal(true)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background: "rgba(247,147,26,0.08)", color: "#F7931A" }} data-testid="button-add-report">
            <Plus className="w-3 h-3" /> Publish
          </button>
        </div>
        {reports.length === 0 ? (
          <p className="text-sm text-[hsl(0_0%_35%)]">No reports yet</p>
        ) : (
          <div className="space-y-2">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between gap-3 py-2" style={{ borderBottom: "1px solid hsl(0 0% 10%)" }}>
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{report.title}</p>
                  {report.is_global && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded mt-0.5 inline-block" style={{ background: "rgba(247,147,26,0.08)", color: "#F7931A" }}>Global</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-[hsl(0_0%_40%)]">{new Date(report.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="p-1 rounded hover:bg-red-500/10 text-[hsl(0_0%_35%)] hover:text-red-400 transition-colors"
                    title="Delete report"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODALS ────────────────────────────────────────────────────────── */}
      {showRoadmapModal && (
        <Modal title="Add Roadmap Item" onClose={() => setShowRoadmapModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[hsl(0_0%_55%)] mb-1.5 uppercase tracking-wide">Title</label>
              <input type="text" value={roadmapForm.title} onChange={(e) => setRoadmapForm({ ...roadmapForm, title: e.target.value })} placeholder="e.g. Cycle Top Target" className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} data-testid="input-roadmap-title" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[hsl(0_0%_55%)] uppercase tracking-wide">Content</label>
                <span className="text-[11px] text-[hsl(0_0%_35%)]">{roadmapForm.content.length}/2000</span>
              </div>
              <textarea value={roadmapForm.content} onChange={(e) => setRoadmapForm({ ...roadmapForm, content: e.target.value })} placeholder="Cycle stage notes..." rows={4} maxLength={2000} className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none" style={inputStyle} data-testid="input-roadmap-content" />
            </div>
            <button onClick={saveRoadmapItem} disabled={saving} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60" style={{ background: "#F7931A", color: "#0A0A0A" }} data-testid="button-save-roadmap">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : "Save"}
            </button>
          </div>
        </Modal>
      )}

      {showReportModal && (
        <Modal title="Publish Report" onClose={() => setShowReportModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[hsl(0_0%_55%)] mb-1.5 uppercase tracking-wide">Title</label>
              <input type="text" value={reportForm.title} onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })} placeholder="e.g. April 2026 Update" className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} data-testid="input-report-title" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(0_0%_55%)] mb-1.5 uppercase tracking-wide">Content</label>
              <textarea value={reportForm.content} onChange={(e) => setReportForm({ ...reportForm, content: e.target.value })} placeholder="Monthly analysis..." rows={5} className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none" style={inputStyle} data-testid="input-report-content" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={reportForm.is_global} onChange={(e) => setReportForm({ ...reportForm, is_global: e.target.checked })} data-testid="checkbox-global" />
              <span className="text-sm text-[hsl(0_0%_65%)]">Send to all clients</span>
            </label>
            {reportForm.is_global && (
              <div className="rounded-lg px-3.5 py-2.5 flex items-start gap-2" style={{ background: "rgba(247,147,26,0.08)", border: "1px solid rgba(247,147,26,0.2)" }}>
                <span className="text-[#F7931A] text-xs mt-0.5">⚠</span>
                <p className="text-xs text-[hsl(0_0%_60%)] leading-relaxed">
                  This report will be visible to <span className="font-semibold text-[#F7931A]">all clients</span>, not just {client.full_name || "this client"}.
                </p>
              </div>
            )}
            <button onClick={saveReport} disabled={saving} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60" style={{ background: "#F7931A", color: "#0A0A0A" }} data-testid="button-save-report">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Publishing…</> : "Publish Report"}
            </button>
          </div>
        </Modal>
      )}

      {showMilestoneModal !== null && (
        <Modal title={`Mark ${showMilestoneModal}% Milestone`} onClose={() => setShowMilestoneModal(null)}>
          <div className="space-y-4">
            <div className="rounded-xl p-3.5" style={{ background: "hsl(0 0% 10%)" }}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[hsl(0_0%_50%)]">Milestone</span>
                <span className="text-white font-medium">{showMilestoneModal}% return on portfolio</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[hsl(0_0%_50%)]">Target portfolio value</span>
                <span className="text-white">{initialValue ? formatUSD(initialValue * (1 + showMilestoneModal / 100)) : "—"}</span>
              </div>
            </div>
            <button onClick={() => markMilestone(showMilestoneModal)} disabled={saving} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60" style={{ background: "#F7931A", color: "#0A0A0A" }} data-testid="button-confirm-milestone">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : "Mark as Hit"}
            </button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}

// ── Client List ────────────────────────────────────────────────────────────
export default function AdminClients() {
  const [location] = useLocation();
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [holdingsMap, setHoldingsMap] = useState<Map<string, HoldingAsset[]>>(new Map());
  const [clientsLoading, setClientsLoading] = useState(true);
  const [editingClient, setEditingClient] = useState<ClientProfile | null>(null);

  useEffect(() => {
    loadClientsFromServer().then((apiClients) => {
      const profiles: ClientProfile[] = apiClients.map((c) => ({
        user_id: c.id,
        full_name: c.profile?.full_name ?? ([c.firstName, c.lastName].filter(Boolean).join(" ") || null),
        country: c.profile?.country ?? null,
        timezone: c.profile?.timezone ?? null,
        btc_holdings: c.profile?.btc_holdings ?? null,
        avg_cost_basis: c.profile?.avg_cost_basis ?? null,
        investment_goal: c.profile?.investment_goal ?? null,
        goal_conservative: c.profile?.goal_conservative ?? null,
        goal_moderate: c.profile?.goal_moderate ?? null,
        goal_moonshot: c.profile?.goal_moonshot ?? null,
        risk_tolerance: c.profile?.risk_tolerance ?? null,
        time_horizon: c.profile?.time_horizon ?? null,
        notes: c.profile?.notes ?? null,
        discord_username: c.profile?.discord_username ?? null,
        discord_role_claimed: c.profile?.discord_role_claimed ?? false,
        onboarding_completed: c.profile?.onboarding_completed ?? false,
        initial_portfolio_value: c.profile?.initial_portfolio_value ?? null,
        high_water_mark: c.profile?.high_water_mark ?? null,
        joined_at: c.profile?.joined_at ?? c.createdAt ?? null,
      }));
      const map = new Map<string, HoldingAsset[]>(
        apiClients.map((c) => [c.id, c.holdings as HoldingAsset[]])
      );
      setClients(profiles);
      setHoldingsMap(map);
      setClientsLoading(false);
    });
  }, []);

  function handleClientSaved(updated: ClientProfile, holdings: HoldingAsset[]) {
    setClients((prev) => prev.map((c) => c.user_id === updated.user_id ? updated : c));
    setHoldingsMap((prev) => {
      const next = new Map(prev);
      next.set(updated.user_id, holdings);
      return next;
    });
    setEditingClient(null);
  }

  const [selected, setSelected] = useState<ClientProfile | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const clientId = params.get("client");
    if (clientId) {
      const match = clients.find((c) => c.user_id === clientId);
      if (match) setSelected(match);
    } else {
      setSelected(null);
    }
  }, [location, clients]);

  if (selected) {
    return (
      <ClientDetail
        client={selected}
        serverHoldings={holdingsMap.get(selected.user_id)}
        onBack={() => {
          setSelected(null);
          window.history.pushState({}, "", window.location.pathname);
        }}
      />
    );
  }

  // ── Health score computation ─────────────────────────────────────────────
  function computeHealthScore(client: ClientProfile, holdings: HoldingAsset[]): { score: number; label: string; color: string; breakdown: { label: string; pts: number; max: number }[] } {
    const breakdown: { label: string; pts: number; max: number }[] = [];

    // 1. Last active (max 25pts)
    const lastActive = getLastActive(client.user_id);
    const daysSince = lastActive ? Math.floor((Date.now() - new Date(lastActive).getTime()) / 86400000) : 999;
    const activePts = daysSince <= 1 ? 25 : daysSince <= 7 ? 18 : daysSince <= 30 ? 10 : 0;
    breakdown.push({ label: "Last active", pts: activePts, max: 25 });

    // 2. Holdings configured (max 20pts)
    const holdingsPts = holdings.length >= 2 ? 20 : holdings.length === 1 ? 10 : 0;
    breakdown.push({ label: "Holdings set up", pts: holdingsPts, max: 20 });

    // 3. Starting value set (max 15pts)
    const initPts = (client.initial_portfolio_value ?? 0) > 0 ? 15 : 0;
    breakdown.push({ label: "Starting value set", pts: initPts, max: 15 });

    // 4. Reports read (max 20pts)
    const allReports = getAllReports().filter((r) => r.is_global || r.user_id === client.user_id);
    const readSet = getReadReports(client.user_id);
    const readPct = allReports.length > 0 ? readSet.size / allReports.length : 0;
    const reportPts = Math.round(readPct * 20);
    breakdown.push({ label: "Reports read", pts: reportPts, max: 20 });

    // 5. Trade journal (max 10pts)
    const journal = getTradeJournal(client.user_id);
    const journalPts = journal.length >= 5 ? 10 : journal.length >= 1 ? 5 : 0;
    breakdown.push({ label: "Trade journal entries", pts: journalPts, max: 10 });

    // 6. Profile complete (max 10pts)
    const profileFields = [client.full_name, client.country, client.timezone, client.risk_tolerance, client.investment_goal];
    const filledFields = profileFields.filter(Boolean).length;
    const profilePts = Math.round((filledFields / profileFields.length) * 10);
    breakdown.push({ label: "Profile complete", pts: profilePts, max: 10 });

    const score = breakdown.reduce((s, b) => s + b.pts, 0);
    const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Low";
    const color = score >= 80 ? "#22c55e" : score >= 60 ? "#F7931A" : score >= 40 ? "#f59e0b" : "#ef4444";

    return { score, label, color, breakdown };
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Clients</h1>
        <p className="text-sm text-[hsl(0_0%_45%)] mt-1">Click any client to view their analytics</p>
      </div>

      {clientsLoading ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          <p className="text-sm text-[hsl(0_0%_40%)]">Loading clients…</p>
        </div>
      ) : clients.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          <p className="text-sm text-[hsl(0_0%_40%)]">No clients have signed up yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => {
            const portfolioTier = getPortfolioTier(client.initial_portfolio_value ?? 0);
            const milestoneTier = getMilestoneTier(client.risk_tolerance, client.initial_portfolio_value ?? 0);
            const holdings = holdingsMap.get(client.user_id) ?? [];
            const health = computeHealthScore(client, holdings);
            const lastActive = getLastActive(client.user_id);
            const daysSince = lastActive ? Math.floor((Date.now() - new Date(lastActive).getTime()) / 86400000) : null;
            return (
              <button
                key={client.user_id}
                onClick={() => setSelected(client)}
                className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-all hover:border-[hsl(0_0%_18%)]"
                style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
                data-testid={`client-card-${client.user_id}`}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold" style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}>
                  {client.full_name?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{client.full_name || "Unnamed"}</p>
                  <p className="text-xs text-[hsl(0_0%_40%)] mt-0.5">
                    {portfolioTier} · {milestoneTier.riskLabel}
                    {holdings.length > 0 && ` · ${holdings.map((h) => h.symbol).join(", ")}`}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingClient(client); }}
                  className="p-2 rounded-lg shrink-0 transition-colors hover:bg-[hsl(0_0%_14%)]"
                  title="Edit client profile"
                  data-testid={`edit-client-${client.user_id}`}
                >
                  <Pencil className="w-3.5 h-3.5 text-[hsl(0_0%_40%)]" />
                </button>

                {/* Health score */}
                <div className="shrink-0 flex flex-col items-center gap-1" title={`Health score breakdown:\n${health.breakdown.map((b) => `${b.label}: ${b.pts}/${b.max}`).join("\n")}`}>
                  <div className="relative w-10 h-10">
                    <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(0 0% 14%)" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="14" fill="none"
                        stroke={health.color}
                        strokeWidth="3"
                        strokeDasharray={`${(health.score / 100) * 87.96} 87.96`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color: health.color }}>
                      {health.score}
                    </span>
                  </div>
                  <span className="text-[9px] font-semibold" style={{ color: health.color }}>{health.label}</span>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-white">
                    {client.initial_portfolio_value ? formatUSD(client.initial_portfolio_value) : "—"}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: daysSince === null ? "hsl(0 0% 35%)" : daysSince <= 1 ? "#22c55e" : daysSince <= 7 ? "#F7931A" : "hsl(0 0% 40%)" }}>
                    {daysSince === null ? "Never active" : daysSince === 0 ? "Active today" : `${daysSince}d ago`}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[hsl(0_0%_30%)] shrink-0" />
              </button>
            );
          })}
        </div>
      )}
      {editingClient && (
        <EditClientModal
          client={editingClient}
          currentHoldings={holdingsMap.get(editingClient.user_id) ?? []}
          onClose={() => setEditingClient(null)}
          onSaved={handleClientSaved}
        />
      )}
    </AdminLayout>
  );
}
