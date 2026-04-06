import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import {
  getAllClientProfiles,
  getHoldings,
  getMilestones,
  upsertMilestone,
  getRoadmapItems,
  getAllReports,
  addRoadmapItem,
  addReport,
} from "@/lib/localStore";
import type { ClientProfile, HoldingAsset, Milestone, RoadmapItem, Report } from "@/lib/types";
import { formatUSD, getBonusPct, MILESTONE_PCTS, getPortfolioTier } from "@/lib/utils";
import AdminLayout from "@/components/layout/AdminLayout";
import { usePrices } from "@/hooks/usePrices";
import DonutChart from "@/components/DonutChart";
import {
  ChevronRight, Check, Loader2, X, Plus,
  TrendingUp, TrendingDown, Target, BarChart2, RefreshCw,
} from "lucide-react";

// Colour palette for assets (BTC and ETH have brand colours; others get generic)
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

// ── Small UI helpers ───────────────────────────────────────────────────────

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

// ── Client Analytics Detail ────────────────────────────────────────────────
function ClientDetail({ client, onBack }: { client: ClientProfile; onBack: () => void }) {
  const holdings = useMemo(() => getHoldings(client.user_id), [client.user_id]);
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
  const [milestoneForm, setMilestoneForm] = useState({ bonus_amount: "" });

  // ── Portfolio maths (multi-asset) ──────────────────────────────────────
  const initialValue = client.initial_portfolio_value ?? 0;
  const tier = getPortfolioTier(initialValue);

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

  // Donut slices — use current value if available, else invested
  const donutSlices = assetRows.map((r) => ({
    label: `${r.symbol} — ${r.name}`,
    value: r.currentValue ?? r.invested,
    color: r.color,
  }));

  // BTC scenarios (BTC-specific, clearly labelled)
  const BTC_SCENARIOS = [60000, 75000, 90000, 100000, 120000, 150000, 200000];
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

  function markMilestone(pct: number) {
    setSaving(true);
    const bonus = parseFloat(milestoneForm.bonus_amount) || null;
    const bonusPct = getBonusPct(pct, initialValue);
    upsertMilestone({
      user_id: client.user_id,
      milestone_pct: pct,
      hit: true,
      hit_at: new Date().toISOString(),
      bonus_amount: bonus,
      bonus_pct: bonusPct,
    });
    setMilestones(getMilestones(client.user_id));
    setMilestoneForm({ bonus_amount: "" });
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
          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <StatTile
              label="Portfolio Value"
              value={totalCurrent !== null ? formatUSD(totalCurrent) : "—"}
              sub={pricesLoading ? "Loading prices..." : undefined}
              color="#F7931A"
            />
            <StatTile
              label="Total Invested"
              value={formatUSD(totalInvested)}
              sub={`${holdings.length} assets`}
            />
            <StatTile
              label="Unrealized P&L"
              value={totalPnL !== null ? `${isPositive ? "+" : ""}${formatUSD(totalPnL)}` : "—"}
              sub={totalReturnPct !== null ? `${totalReturnPct >= 0 ? "+" : ""}${totalReturnPct.toFixed(2)}%` : undefined}
              color={totalPnL === null ? "white" : isPositive ? "#22c55e" : "#ef4444"}
            />
            <StatTile
              label="Total Return"
              value={totalReturnPct !== null ? `${totalReturnPct >= 0 ? "+" : ""}${totalReturnPct.toFixed(1)}%` : "—"}
              sub={isPositive ? "In profit" : "Below cost basis"}
              color={totalReturnPct === null ? "white" : totalReturnPct >= 0 ? "#22c55e" : "#ef4444"}
            />
          </div>

          {/* Donut chart + asset breakdown side-by-side */}
          <div className="grid lg:grid-cols-2 gap-5 mb-5">
            {/* Donut */}
            <div className="rounded-2xl p-5" style={{ background: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 12%)" }}>
              <p className="text-xs font-semibold text-[hsl(0_0%_45%)] uppercase tracking-wide mb-4">Allocation</p>
              {donutSlices.length > 0 ? (
                <DonutChart slices={donutSlices} size={160} thickness={40} />
              ) : (
                <p className="text-sm text-[hsl(0_0%_35%)]">No holdings recorded</p>
              )}
            </div>

            {/* Asset breakdown table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 12%)" }}>
              <div className="grid grid-cols-4 gap-2 px-4 py-2.5 text-[11px] text-[hsl(0_0%_35%)] uppercase tracking-wide" style={{ borderBottom: "1px solid hsl(0 0% 12%)" }}>
                <span className="col-span-2">Asset</span>
                <span>Value</span>
                <span>P&L</span>
              </div>
              {assetRows.map((row) => (
                <div
                  key={row.coingecko_id}
                  className="grid grid-cols-4 gap-2 px-4 py-3 items-center"
                  style={{ borderBottom: "1px solid hsl(0 0% 9%)" }}
                  data-testid={`asset-row-${row.coingecko_id}`}
                >
                  <div className="col-span-2 flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: row.color }} />
                    <div>
                      <p className="text-sm font-medium text-white leading-tight">{row.symbol}</p>
                      <p className="text-[11px] text-[hsl(0_0%_38%)]">{row.amount} units · {formatUSD(row.avg_cost)} avg</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-white">{row.currentValue !== null ? formatUSD(row.currentValue) : "—"}</p>
                    {row.price && <p className="text-[11px] text-[hsl(0_0%_38%)]">{formatUSD(row.price)}</p>}
                  </div>
                  <div>
                    {row.pnl !== null ? (
                      <>
                        <p className="text-sm font-medium" style={{ color: row.pnl >= 0 ? "#22c55e" : "#ef4444" }}>
                          {row.pnl >= 0 ? "+" : ""}{formatUSD(row.pnl)}
                        </p>
                        <p className="text-[11px]" style={{ color: row.pnl >= 0 ? "#22c55e" : "#ef4444" }}>
                          {row.pnlPct !== null ? `${row.pnlPct >= 0 ? "+" : ""}${row.pnlPct.toFixed(1)}%` : ""}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-[hsl(0_0%_35%)]">—</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overall P&L bar */}
          {totalCurrent !== null && totalInvested > 0 && (
            <div
              className="mb-5 rounded-xl p-4 flex items-center gap-4"
              style={{
                background: isPositive ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)",
                border: `1px solid ${isPositive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)"}`,
              }}
            >
              {isPositive ? (
                <TrendingUp className="w-5 h-5 shrink-0" style={{ color: "#22c55e" }} />
              ) : (
                <TrendingDown className="w-5 h-5 shrink-0" style={{ color: "#ef4444" }} />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: isPositive ? "#22c55e" : "#ef4444" }}>
                  Total {isPositive ? "gain" : "loss"} of {formatUSD(Math.abs(totalPnL!))} across all holdings
                </p>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(0 0% 14%)" }}>
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(4, (totalCurrent / (totalInvested * 2)) * 100))}%`,
                      background: isPositive ? "#22c55e" : "#ef4444",
                    }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-[hsl(0_0%_40%)]">Invested</p>
                <p className="text-sm font-semibold text-white">{formatUSD(totalInvested)}</p>
              </div>
            </div>
          )}

          {/* BTC scenarios — BTC position only */}
          {btcHolding && (
            <div>
              <p className="text-xs font-semibold text-[hsl(0_0%_45%)] uppercase tracking-wide mb-3">
                BTC Position Scenarios — {btcHolding.amount} BTC at target prices
              </p>
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(0 0% 12%)" }}>
                <div className="grid grid-cols-4 gap-2 px-4 py-2 text-[11px] text-[hsl(0_0%_35%)] uppercase tracking-wide" style={{ background: "hsl(0 0% 8%)", borderBottom: "1px solid hsl(0 0% 12%)" }}>
                  <span>BTC Price</span>
                  <span>BTC Value</span>
                  <span>BTC P&L</span>
                  <span>Return</span>
                </div>
                {BTC_SCENARIOS.map((targetPrice) => {
                  const btcCost = btcHolding.amount * btcHolding.avg_cost;
                  const scenarioValue = btcHolding.amount * targetPrice;
                  const scenarioPnL = scenarioValue - btcCost;
                  const scenarioReturn = btcCost > 0 ? (scenarioPnL / btcCost) * 100 : 0;
                  const isCurrent = btcPrice ? Math.abs(targetPrice - btcPrice) < 5000 : false;

                  return (
                    <div
                      key={targetPrice}
                      className="grid grid-cols-4 gap-2 px-4 py-2.5 text-sm"
                      style={{
                        background: isCurrent ? "rgba(247,147,26,0.06)" : "transparent",
                        borderBottom: "1px solid hsl(0 0% 9%)",
                        borderLeft: isCurrent ? "2px solid #F7931A" : "2px solid transparent",
                      }}
                    >
                      <span className="font-medium" style={{ color: isCurrent ? "#F7931A" : "hsl(0 0% 80%)" }}>
                        {formatUSD(targetPrice)}{isCurrent && <span className="ml-1 text-[10px] opacity-70">now</span>}
                      </span>
                      <span className="text-white">{formatUSD(scenarioValue)}</span>
                      <span style={{ color: scenarioPnL >= 0 ? "#22c55e" : "#ef4444" }}>
                        {scenarioPnL >= 0 ? "+" : ""}{formatUSD(scenarioPnL)}
                      </span>
                      <span style={{ color: scenarioReturn >= 0 ? "#22c55e" : "#ef4444" }}>
                        {scenarioReturn >= 0 ? "+" : ""}{scenarioReturn.toFixed(1)}%
                      </span>
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
              { label: "Investment Goal", value: client.investment_goal?.replace(/_/g, " ") },
              { label: "Risk Tolerance", value: client.risk_tolerance },
              { label: "Time Horizon", value: client.time_horizon?.replace(/_/g, " ") },
              { label: "Initial Portfolio Value", value: initialValue ? formatUSD(initialValue) : null },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-[hsl(0_0%_40%)]">{label}</span>
                <span className="text-white capitalize">{value || "—"}</span>
              </div>
            ))}
            {client.notes && (
              <div className="pt-2.5" style={{ borderTop: "1px solid hsl(0 0% 12%)" }}>
                <p className="text-xs text-[hsl(0_0%_40%)] mb-1">Notes from client</p>
                <p className="text-xs text-[hsl(0_0%_60%)] leading-relaxed">{client.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Milestones */}
        <div className="rounded-2xl p-5" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-semibold text-[hsl(0_0%_50%)] uppercase tracking-wide">Milestones</h2>
              <p className="text-[11px] text-[hsl(0_0%_35%)] mt-0.5">Based on total portfolio value</p>
            </div>
            <Target className="w-3.5 h-3.5 text-[hsl(0_0%_35%)]" />
          </div>
          <div className="space-y-3">
            {MILESTONE_PCTS.map((pct) => {
              const record = milestones.find((m) => m.milestone_pct === pct);
              const isHit = record?.hit ?? false;
              const targetValue = initialValue * (1 + pct / 100);
              const progressPct = totalCurrent && targetValue
                ? Math.min(100, (totalCurrent / targetValue) * 100)
                : 0;
              const bonusPct = getBonusPct(pct, initialValue);

              return (
                <div key={pct} data-testid={`milestone-row-${pct}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: isHit ? "rgba(34,197,94,0.15)" : "hsl(0 0% 12%)" }}
                      >
                        {isHit && <Check className="w-3 h-3" style={{ color: "#22c55e" }} />}
                      </div>
                      <span className="text-sm font-medium text-white">{pct}%</span>
                      <span className="text-xs text-[hsl(0_0%_40%)]">
                        → {initialValue ? formatUSD(targetValue) : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isHit && record?.bonus_amount ? (
                        <span className="text-xs font-medium" style={{ color: "#22c55e" }}>
                          +{formatUSD(record.bonus_amount)}
                        </span>
                      ) : (
                        <span className="text-xs text-[hsl(0_0%_40%)]">{bonusPct}% bonus</span>
                      )}
                      {!isHit && (
                        <button
                          onClick={() => setShowMilestoneModal(pct)}
                          className="text-[11px] px-2 py-0.5 rounded-md transition-colors"
                          style={{ background: "rgba(247,147,26,0.08)", color: "#F7931A" }}
                          data-testid={`mark-milestone-${pct}`}
                        >
                          Mark
                        </button>
                      )}
                    </div>
                  </div>
                  {!isHit && (
                    <div className="h-1 rounded-full ml-7 overflow-hidden" style={{ background: "hsl(0 0% 12%)" }}>
                      <div
                        className="h-1 rounded-full transition-all"
                        style={{ width: `${progressPct}%`, background: progressPct >= 100 ? "#22c55e" : "#F7931A" }}
                      />
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
          <button
            onClick={() => setShowRoadmapModal(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(247,147,26,0.08)", color: "#F7931A" }}
            data-testid="button-add-roadmap"
          >
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
                  <span className="text-[11px] text-[hsl(0_0%_35%)] shrink-0">
                    {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="text-xs text-[hsl(0_0%_45%)] leading-relaxed line-clamp-2">{item.content}</p>
                {!item.user_id && (
                  <span className="inline-block mt-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "rgba(247,147,26,0.08)", color: "#F7931A" }}>
                    Global
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── REPORTS ───────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-[hsl(0_0%_50%)] uppercase tracking-wide">Reports</h2>
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(247,147,26,0.08)", color: "#F7931A" }}
            data-testid="button-add-report"
          >
            <Plus className="w-3 h-3" /> Publish
          </button>
        </div>
        {reports.length === 0 ? (
          <p className="text-sm text-[hsl(0_0%_35%)]">No reports yet</p>
        ) : (
          <div className="space-y-2">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid hsl(0 0% 10%)" }}>
                <div>
                  <p className="text-sm text-white">{report.title}</p>
                  {report.is_global && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded mt-0.5 inline-block" style={{ background: "rgba(247,147,26,0.08)", color: "#F7931A" }}>
                      Global
                    </span>
                  )}
                </div>
                <span className="text-xs text-[hsl(0_0%_40%)] shrink-0">
                  {new Date(report.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
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
              <label className="block text-xs font-medium text-[hsl(0_0%_55%)] mb-1.5 uppercase tracking-wide">Content</label>
              <textarea value={roadmapForm.content} onChange={(e) => setRoadmapForm({ ...roadmapForm, content: e.target.value })} placeholder="Cycle stage notes..." rows={4} className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none" style={inputStyle} data-testid="input-roadmap-content" />
            </div>
            <button onClick={saveRoadmapItem} disabled={saving} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60" style={{ background: "#F7931A", color: "#0A0A0A" }} data-testid="button-save-roadmap">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : "Save"}
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
            <button onClick={saveReport} disabled={saving} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60" style={{ background: "#F7931A", color: "#0A0A0A" }} data-testid="button-save-report">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Publishing...</> : "Publish Report"}
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
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[hsl(0_0%_50%)]">Bonus rate</span>
                <span style={{ color: "#F7931A" }}>{getBonusPct(showMilestoneModal, initialValue)}% of gains</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[hsl(0_0%_50%)]">Target portfolio value</span>
                <span className="text-white">{initialValue ? formatUSD(initialValue * (1 + showMilestoneModal / 100)) : "—"}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(0_0%_55%)] mb-1.5 uppercase tracking-wide">Bonus Amount Paid (USD)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[hsl(0_0%_45%)]">$</span>
                <input type="number" value={milestoneForm.bonus_amount} onChange={(e) => setMilestoneForm({ bonus_amount: e.target.value })} placeholder="0" className="w-full pl-7 pr-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} data-testid="input-bonus-amount" />
              </div>
            </div>
            <button onClick={() => markMilestone(showMilestoneModal)} disabled={saving} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60" style={{ background: "#F7931A", color: "#0A0A0A" }} data-testid="button-confirm-milestone">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : "Mark as Hit"}
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
  const [clients] = useState<ClientProfile[]>(() => getAllClientProfiles());
  const [selected, setSelected] = useState<ClientProfile | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const clientId = params.get("client");
    if (clientId) return getAllClientProfiles().find((c) => c.user_id === clientId) ?? null;
    return null;
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const clientId = params.get("client");
    if (clientId) {
      const match = clients.find((c) => c.user_id === clientId);
      if (match) setSelected(match);
    } else {
      setSelected(null);
    }
  }, [location]);

  if (selected) {
    return (
      <ClientDetail
        client={selected}
        onBack={() => {
          setSelected(null);
          window.history.pushState({}, "", window.location.pathname);
        }}
      />
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Clients</h1>
        <p className="text-sm text-[hsl(0_0%_45%)] mt-1">Click any client to view their analytics</p>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          <p className="text-sm text-[hsl(0_0%_40%)]">No clients have completed onboarding yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => {
            const tier = getPortfolioTier(client.initial_portfolio_value ?? 0);
            const holdings = getHoldings(client.user_id);
            return (
              <button
                key={client.user_id}
                onClick={() => setSelected(client)}
                className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-all hover:border-[hsl(0_0%_18%)]"
                style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
                data-testid={`client-card-${client.user_id}`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold"
                  style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}
                >
                  {client.full_name?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{client.full_name || "Unnamed"}</p>
                  <p className="text-xs text-[hsl(0_0%_40%)] mt-0.5">
                    {client.country}{client.country ? " · " : ""}{tier}
                    {holdings.length > 0 && ` · ${holdings.map((h) => h.symbol).join(", ")}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-white">
                    {client.initial_portfolio_value ? formatUSD(client.initial_portfolio_value) : "—"}
                  </p>
                  <p className="text-xs text-[hsl(0_0%_40%)] mt-0.5">{holdings.length} asset{holdings.length !== 1 ? "s" : ""}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[hsl(0_0%_30%)] shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
