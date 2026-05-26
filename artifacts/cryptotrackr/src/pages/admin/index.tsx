import { useState, useEffect } from "react";
import { getMilestones } from "@/lib/localStore";
import { formatUSD, getPortfolioTier } from "@/lib/utils";
import AdminLayout from "@/components/layout/AdminLayout";
import { Users, TrendingUp, Target, DollarSign, LayoutDashboard, RefreshCw } from "lucide-react";
import { useBtcPrice } from "@/hooks/useBtcPrice";
import { useLocation } from "wouter";
import { loadClientsFromServer, type AdminClientData } from "@/lib/profileApi";
import type { ClientProfile, HoldingAsset } from "@/lib/types";

function SummaryCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(247,147,26,0.08)" }}>
          <Icon className="w-4 h-4" style={{ color: "#F7931A" }} />
        </div>
        <p className="text-xs text-[hsl(0_0%_45%)] uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-2xl font-semibold text-white" data-testid={`admin-stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>{value}</p>
    </div>
  );
}

function mapApiClients(apiClients: AdminClientData[]): { clients: ClientProfile[]; holdingsMap: Map<string, HoldingAsset[]> } {
  const clients: ClientProfile[] = apiClients.map((c) => ({
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
  const holdingsMap = new Map<string, HoldingAsset[]>(
    apiClients.map((c) => [c.id, c.holdings as HoldingAsset[]])
  );
  return { clients, holdingsMap };
}

export default function AdminDashboard() {
  const { price } = useBtcPrice();
  const [, navigate] = useLocation();
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [holdingsMap, setHoldingsMap] = useState<Map<string, HoldingAsset[]>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClientsFromServer().then((apiClients) => {
      const { clients: mapped, holdingsMap: hmap } = mapApiClients(apiClients);
      setClients(mapped);
      setHoldingsMap(hmap);
      setLoading(false);
    });
  }, []);

  const allMilestones = clients.flatMap((c) => getMilestones(c.user_id));
  const totalAUM = clients.reduce((sum, c) => sum + (c.initial_portfolio_value ?? 0), 0);
  const totalMilestonesHit = allMilestones.filter((m) => m.hit).length;
  const pendingTargets = allMilestones.filter((m) => !m.hit).length;

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <LayoutDashboard className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          {price && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full ml-1" style={{ background: "rgba(247,147,26,0.08)", color: "#F7931A", border: "1px solid rgba(247,147,26,0.2)" }}>
              BTC {formatUSD(price)}
            </span>
          )}
        </div>
        <p className="text-sm text-[hsl(0_0%_45%)] mt-1">Overview of all clients and activity</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <SummaryCard icon={Users} label="Total Clients" value={loading ? "—" : String(clients.length)} />
        <SummaryCard icon={DollarSign} label="Total AUM" value={loading ? "—" : formatUSD(totalAUM)} />
        <SummaryCard icon={Target} label="Milestones Hit" value={loading ? "—" : String(totalMilestonesHit)} />
        <SummaryCard icon={TrendingUp} label="Pending Targets" value={loading ? "—" : String(pendingTargets)} />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(0 0% 13%)" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ background: "hsl(0 0% 7%)", borderBottom: "1px solid hsl(0 0% 11%)" }}>
          <div>
            <h2 className="text-sm font-semibold text-white">All Clients</h2>
            <p className="text-xs text-[hsl(0_0%_40%)] mt-0.5">Click a row to view analytics</p>
          </div>
          {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[hsl(0_0%_35%)]" />}
        </div>

        {!loading && clients.length === 0 ? (
          <div className="p-12 text-center" style={{ background: "hsl(0 0% 6%)" }}>
            <p className="text-sm text-[hsl(0_0%_40%)]">No clients yet</p>
          </div>
        ) : (
          <div style={{ background: "hsl(0 0% 6%)" }}>
            <div
              className="grid grid-cols-5 gap-4 px-5 py-2.5 text-xs text-[hsl(0_0%_40%)] uppercase tracking-wide"
              style={{ borderBottom: "1px solid hsl(0 0% 10%)" }}
            >
              <span className="col-span-2">Name</span>
              <span title="Initial portfolio value at onboarding">Portfolio¹</span>
              <span title="BTC uses live price; other assets use cost basis">Return²</span>
              <span>Tier</span>
            </div>
            {loading
              ? Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-5 gap-4 px-5 py-3.5" style={{ borderBottom: "1px solid hsl(0 0% 9%)" }}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <div key={j} className={`h-4 rounded animate-pulse ${j === 0 ? "col-span-2" : ""}`} style={{ background: "hsl(0 0% 12%)" }} />
                    ))}
                  </div>
                ))
              : clients.map((client) => {
                  const clientHoldings = holdingsMap.get(client.user_id) ?? [];
                  const totalCost = clientHoldings.reduce((s, h) => s + h.amount * h.avg_cost, 0);

                  const approxCurrentValue = price && clientHoldings.length > 0
                    ? clientHoldings.reduce((s, h) => {
                        const assetPrice = h.coingecko_id === "bitcoin" ? price : h.avg_cost;
                        return s + h.amount * assetPrice;
                      }, 0)
                    : null;

                  const returnPct = totalCost > 0 && approxCurrentValue !== null
                    ? ((approxCurrentValue - totalCost) / totalCost) * 100
                    : null;

                  const displayValue = client.initial_portfolio_value
                    ? formatUSD(client.initial_portfolio_value)
                    : "—";

                  const tier = getPortfolioTier(client.initial_portfolio_value ?? 0);

                  return (
                    <button
                      key={client.user_id}
                      onClick={() => navigate(`/admin/clients?client=${client.user_id}`)}
                      className="w-full grid grid-cols-5 gap-4 px-5 py-3.5 text-left transition-colors hover:bg-[rgba(255,255,255,0.03)] cursor-pointer"
                      style={{ borderBottom: "1px solid hsl(0 0% 9%)" }}
                      data-testid={`admin-client-row-${client.user_id}`}
                    >
                      <span className="col-span-2 text-sm font-medium text-white truncate">{client.full_name || "—"}</span>
                      <span className="text-sm text-[hsl(0_0%_65%)]">{displayValue}</span>
                      <span
                        className={`text-sm font-medium ${returnPct !== null && returnPct >= 0 ? "text-green-400" : returnPct !== null ? "text-red-400" : "text-[hsl(0_0%_45%)]"}`}
                      >
                        {returnPct !== null
                          ? `${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(1)}%`
                          : clientHoldings.length === 0 ? "No data" : "—"}
                      </span>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit"
                        style={{ background: "rgba(247,147,26,0.08)", color: "#F7931A" }}
                      >
                        {tier}
                      </span>
                    </button>
                  );
                })}
          </div>
        )}
      </div>

      <div className="mt-4 px-1">
        <p className="text-[10px] text-[hsl(0_0%_30%)] leading-relaxed">
          ¹ Portfolio = initial value recorded at onboarding, not live value. &nbsp;² Return = BTC at live price; all other assets use cost basis as a proxy.
        </p>
      </div>
    </AdminLayout>
  );
}
