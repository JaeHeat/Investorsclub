import { useMemo } from "react";
import { getAllClientProfiles, getHoldings } from "@/lib/localStore";
import { getPortfolioPlan, INVESTMENT_GOALS, ASSET_CONFIG } from "@/lib/portfolioPlans";
import { formatUSD } from "@/lib/utils";
import AdminLayout from "@/components/layout/AdminLayout";
import { BarChart3, Users, TrendingUp, AlertCircle, DollarSign } from "lucide-react";

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
      <p className="text-xs text-[hsl(0_0%_40%)] uppercase tracking-wide mb-2">{label}</p>
      <p className="text-2xl font-semibold tracking-tight" style={{ color: color ?? "white" }}>{value}</p>
      {sub && <p className="text-xs text-[hsl(0_0%_42%)] mt-1">{sub}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const clients = useMemo(() => getAllClientProfiles(), []);

  const stats = useMemo(() => {
    const totalAUM = clients.reduce((s, c) => s + (c.initial_portfolio_value ?? 0), 0);
    const avgPortfolio = clients.length > 0 ? totalAUM / clients.length : 0;

    const goalDist: Record<string, number> = {};
    for (const c of clients) {
      const g = c.investment_goal ?? "unknown";
      goalDist[g] = (goalDist[g] ?? 0) + 1;
    }

    const riskDist: Record<string, number> = {};
    for (const c of clients) {
      const r = c.risk_tolerance ?? "unknown";
      riskDist[r] = (riskDist[r] ?? 0) + 1;
    }

    const needsRebalancing = clients.filter((c) => {
      const plan = getPortfolioPlan(c.risk_tolerance ?? "moderate", c.initial_portfolio_value ?? 0);
      const holdings = getHoldings(c.user_id);
      if (holdings.length === 0) return false;
      const btcAmt = holdings.find((h) => h.coingecko_id === "bitcoin")?.amount ?? 0;
      const totalCost = holdings.reduce((s, h) => s + h.amount * h.avg_cost, 0);
      const btcCost = btcAmt * (holdings.find((h) => h.coingecko_id === "bitcoin")?.avg_cost ?? 0);
      if (totalCost === 0) return false;
      const btcPct = (btcCost / totalCost) * 100;
      return Math.abs(btcPct - plan.btcPct) > 10;
    });

    const allBtcPcts = clients.map((c) => {
      const holdings = getHoldings(c.user_id);
      const totalCost = holdings.reduce((s, h) => s + h.amount * h.avg_cost, 0);
      const btcCost = holdings.reduce((s, h) => h.coingecko_id === "bitcoin" ? s + h.amount * h.avg_cost : s, 0);
      return totalCost > 0 ? (btcCost / totalCost) * 100 : 0;
    });
    const avgBtcPct = allBtcPcts.length > 0 ? allBtcPcts.reduce((a, b) => a + b, 0) / allBtcPcts.length : 0;

    return { totalAUM, avgPortfolio, goalDist, riskDist, needsRebalancing, avgBtcPct };
  }, [clients]);

  const goalOrder = ["2x", "5x", "10x", "25x"];
  const goalColors = ["#10b981", "#F7931A", "#a855f7", "#ef4444"];
  const riskOrder = ["conservative", "moderate", "aggressive"];
  const riskColors = ["#10b981", "#F7931A", "#ef4444"];

  const maxGoalCount = Math.max(...goalOrder.map((g) => stats.goalDist[g] ?? 0), 1);
  const maxRiskCount = Math.max(...riskOrder.map((r) => stats.riskDist[r] ?? 0), 1);

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">Client Analytics</h1>
        </div>
        <p className="text-sm text-[hsl(0_0%_42%)]">Aggregate intelligence across all clients.</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Total clients"
          value={String(clients.length)}
          sub="Active accounts"
          color="#F7931A"
        />
        <StatCard
          label="Total AUM"
          value={formatUSD(stats.totalAUM)}
          sub="Initial portfolio value"
        />
        <StatCard
          label="Avg portfolio"
          value={formatUSD(stats.avgPortfolio)}
          sub="Per client"
        />
        <StatCard
          label="Avg BTC allocation"
          value={`${stats.avgBtcPct.toFixed(0)}%`}
          sub="Across all clients"
          color="#F7931A"
        />
      </div>

      {/* Needs rebalancing */}
      {stats.needsRebalancing.length > 0 && (
        <div
          className="rounded-2xl p-4 mb-6 flex items-start gap-3"
          style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#f59e0b]" />
          <div>
            <p className="text-sm font-semibold text-[#f59e0b]">
              {stats.needsRebalancing.length} client{stats.needsRebalancing.length > 1 ? "s" : ""} may need rebalancing
            </p>
            <p className="text-xs text-[hsl(0_0%_48%)] mt-0.5">
              BTC allocation is more than 10% off from their plan target based on cost-basis estimates.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {stats.needsRebalancing.map((c) => (
                <span
                  key={c.user_id}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded"
                  style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}
                >
                  {c.full_name ?? c.user_id}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Goal distribution */}
        <div className="rounded-2xl p-5" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(0_0%_35%)] mb-4">Investment goal distribution</p>
          <div className="space-y-3">
            {goalOrder.map((g, i) => {
              const count = stats.goalDist[g] ?? 0;
              const pct = (count / (clients.length || 1)) * 100;
              const barPct = (count / maxGoalCount) * 100;
              const goalInfo = INVESTMENT_GOALS.find((ig) => ig.value === g);
              return (
                <div key={g}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white">{goalInfo?.label ?? g}</span>
                    <span className="text-xs text-[hsl(0_0%_45%)]">{count} client{count !== 1 ? "s" : ""} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "hsl(0 0% 13%)" }}>
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${barPct}%`, background: goalColors[i] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk distribution */}
        <div className="rounded-2xl p-5" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(0_0%_35%)] mb-4">Risk tolerance distribution</p>
          <div className="space-y-3">
            {riskOrder.map((r, i) => {
              const count = stats.riskDist[r] ?? 0;
              const pct = (count / (clients.length || 1)) * 100;
              const barPct = (count / maxRiskCount) * 100;
              return (
                <div key={r}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white capitalize">{r}</span>
                    <span className="text-xs text-[hsl(0_0%_45%)]">{count} client{count !== 1 ? "s" : ""} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "hsl(0 0% 13%)" }}>
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${barPct}%`, background: riskColors[i] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Per-client table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(0 0% 13%)" }}>
        <div className="px-4 py-3" style={{ background: "hsl(0 0% 8%)", borderBottom: "1px solid hsl(0 0% 13%)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(0_0%_35%)]">Client breakdown</p>
        </div>
        <div style={{ background: "hsl(0 0% 7%)" }}>
          {clients.map((c, idx) => {
            const plan = getPortfolioPlan(c.risk_tolerance ?? "moderate", c.initial_portfolio_value ?? 0);
            const goal = INVESTMENT_GOALS.find((g) => g.value === c.investment_goal);
            return (
              <div
                key={c.user_id}
                className="px-4 py-3 flex items-center gap-4 flex-wrap"
                style={{ borderTop: idx > 0 ? "1px solid hsl(0 0% 11%)" : undefined }}
              >
                <div className="flex-1 min-w-32">
                  <p className="text-sm font-semibold text-white">{c.full_name ?? "—"}</p>
                  <p className="text-[10px] text-[hsl(0_0%_40%)]">{c.country ?? "—"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white">{formatUSD(c.initial_portfolio_value ?? 0)}</p>
                  <p className="text-[10px] text-[hsl(0_0%_40%)]">portfolio</p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}>{plan.tier}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize" style={{ background: "hsl(0 0% 12%)", color: "hsl(0 0% 55%)" }}>{c.risk_tolerance}</span>
                  {goal && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7" }}>{goal.label}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
