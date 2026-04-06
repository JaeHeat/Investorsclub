import AdminLayout from "@/components/layout/AdminLayout";
import { getAllClientProfiles } from "@/lib/localStore";
import { getPortfolioPlan, getCuratedAlts, ASSET_CONFIG, ALT_CATEGORY_COLORS } from "@/lib/portfolioPlans";
import { PieChart, Shield, TrendingUp, Layers, Users, Info } from "lucide-react";

function AllocationBar({ btc, eth, sol, alts }: { btc: number; eth: number; sol: number; alts: number }) {
  const segments = [
    { pct: btc, color: ASSET_CONFIG.BTC.color },
    { pct: eth, color: ASSET_CONFIG.ETH.color },
    { pct: sol, color: ASSET_CONFIG.SOL.color },
    { pct: alts, color: ASSET_CONFIG.ALTS.color },
  ].filter((s) => s.pct > 0);

  return (
    <div className="flex h-2 rounded-full overflow-hidden gap-px">
      {segments.map((s, i) => (
        <div
          key={i}
          style={{ width: `${s.pct}%`, background: s.color, opacity: 0.85 }}
        />
      ))}
    </div>
  );
}

export default function AdminPlansPage() {
  const clients = getAllClientProfiles();

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <PieChart className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">Portfolio Plans</h1>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "hsl(0 0% 12%)", color: "hsl(0 0% 50%)" }}
          >
            {clients.length} client{clients.length !== 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-sm text-[hsl(0_0%_42%)]">
          Recommended allocation plans by portfolio tier and risk profile. No meme coins. Top 25 by market cap only.
        </p>
      </div>

      {clients.length === 0 ? (
        <div
          className="rounded-2xl p-12 flex flex-col items-center justify-center text-center"
          style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
        >
          <Users className="w-8 h-8 mb-3 text-[hsl(0_0%_25%)]" />
          <p className="text-sm text-[hsl(0_0%_40%)]">No clients yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => {
            const portfolioValue = client.initial_portfolio_value ?? 0;
            const plan = getPortfolioPlan(client.risk_tolerance, portfolioValue);
            const alts = getCuratedAlts(plan.numAlts);

            const riskColor =
              plan.risk === "Aggressive"
                ? "#ef4444"
                : plan.risk === "Conservative"
                ? "#10b981"
                : "#f59e0b";

            const tierColor =
              plan.tier === "Elite"
                ? "#a855f7"
                : plan.tier === "Premium"
                ? "#3b82f6"
                : plan.tier === "Core"
                ? "#F7931A"
                : "hsl(0 0% 55%)";

            return (
              <div
                key={client.user_id}
                className="rounded-2xl p-5"
                style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
              >
                {/* Client header */}
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-base font-semibold text-white">{client.full_name}</p>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: `${tierColor}18`, color: tierColor }}
                      >
                        {plan.tier}
                      </span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: `${riskColor}12`, color: riskColor }}
                      >
                        {plan.risk}
                      </span>
                    </div>
                    <p className="text-xs text-[hsl(0_0%_42%)]">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(portfolioValue)} initial investment
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-[hsl(0_0%_40%)]">Alt exposure</p>
                    <p className="text-sm font-semibold" style={{ color: plan.altsPct > 0 ? "#10b981" : "hsl(0 0% 40%)" }}>
                      {plan.altsPct > 0 ? `${plan.altsPct}%` : "None"}
                    </p>
                  </div>
                </div>

                {/* Allocation bar */}
                <div className="mb-3">
                  <AllocationBar
                    btc={plan.btcPct}
                    eth={plan.ethPct}
                    sol={plan.solPct}
                    alts={plan.altsPct}
                  />
                </div>

                {/* Allocation numbers */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { label: "BTC", pct: plan.btcPct, color: ASSET_CONFIG.BTC.color, icon: Shield },
                    { label: "ETH", pct: plan.ethPct, color: ASSET_CONFIG.ETH.color, icon: Layers },
                    { label: "SOL", pct: plan.solPct, color: ASSET_CONFIG.SOL.color, icon: TrendingUp },
                    { label: "Alts", pct: plan.altsPct, color: ASSET_CONFIG.ALTS.color, icon: PieChart },
                  ].map(({ label, pct, color, icon: Icon }) => (
                    <div
                      key={label}
                      className="rounded-xl p-3"
                      style={{ background: "hsl(0 0% 10%)" }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
                        <p className="text-[10px] text-[hsl(0_0%_45%)]">{label}</p>
                      </div>
                      <p className="text-sm font-bold" style={{ color: pct > 0 ? color : "hsl(0 0% 30%)" }}>
                        {pct}%
                      </p>
                    </div>
                  ))}
                </div>

                {/* Rationale */}
                <div
                  className="flex gap-2 mb-4 p-3 rounded-xl"
                  style={{ background: "hsl(0 0% 10%)" }}
                >
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[hsl(0_0%_35%)]" />
                  <p className="text-xs text-[hsl(0_0%_48%)] leading-relaxed">{plan.rationale}</p>
                </div>

                {/* Curated alts */}
                {alts.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(0_0%_35%)] mb-2">
                      Curated Alt Picks — {(plan.altsPct / plan.numAlts).toFixed(1)}% each
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {alts.map((alt) => {
                        const catColor = ALT_CATEGORY_COLORS[alt.category];
                        return (
                          <div
                            key={alt.symbol}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                            style={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 15%)" }}
                          >
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: catColor }} />
                            <span className="text-xs font-semibold text-white">{alt.symbol}</span>
                            <span className="text-[10px] text-[hsl(0_0%_40%)]">{alt.category}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {plan.altsPct === 0 && (
                  <p className="text-xs text-[hsl(0_0%_35%)] italic">
                    No alt allocation — foundation assets only at this tier and risk level.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Framework summary */}
      <div
        className="mt-6 rounded-2xl p-5"
        style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(0_0%_35%)] mb-4">
          Allocation Framework
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(0 0% 13%)" }}>
                <th className="text-left py-2 pr-4 text-[hsl(0_0%_38%)] font-semibold">Tier</th>
                <th className="text-left py-2 pr-4 text-[hsl(0_0%_38%)] font-semibold">Risk</th>
                <th className="text-right py-2 pr-4 font-semibold" style={{ color: ASSET_CONFIG.BTC.color }}>BTC</th>
                <th className="text-right py-2 pr-4 font-semibold" style={{ color: ASSET_CONFIG.ETH.color }}>ETH</th>
                <th className="text-right py-2 pr-4 font-semibold" style={{ color: ASSET_CONFIG.SOL.color }}>SOL</th>
                <th className="text-right py-2 font-semibold" style={{ color: ASSET_CONFIG.ALTS.color }}>Alts</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Starter", "Conservative", 55, 25, 10, 10],
                  ["Starter", "Moderate", 45, 25, 15, 15],
                  ["Starter", "Aggressive", 35, 25, 15, 25],
                  ["Core", "Conservative", 60, 25, 10, 5],
                  ["Core", "Moderate", 50, 25, 15, 10],
                  ["Core", "Aggressive", 40, 25, 15, 20],
                  ["Premium", "Conservative", 70, 20, 10, 0],
                  ["Premium", "Moderate", 60, 25, 10, 5],
                  ["Premium", "Aggressive", 50, 25, 15, 10],
                  ["Elite", "Conservative", 80, 15, 5, 0],
                  ["Elite", "Moderate", 70, 20, 5, 5],
                  ["Elite", "Aggressive", 60, 20, 10, 10],
                ] as [string, string, number, number, number, number][]
              ).map(([tier, risk, btc, eth, sol, alts], i) => (
                <tr
                  key={i}
                  style={{ borderBottom: "1px solid hsl(0 0% 10%)" }}
                >
                  <td className="py-2 pr-4 text-white font-medium">{tier}</td>
                  <td className="py-2 pr-4 text-[hsl(0_0%_50%)]">{risk}</td>
                  <td className="py-2 pr-4 text-right font-semibold" style={{ color: ASSET_CONFIG.BTC.color }}>{btc}%</td>
                  <td className="py-2 pr-4 text-right font-semibold" style={{ color: ASSET_CONFIG.ETH.color }}>{eth}%</td>
                  <td className="py-2 pr-4 text-right font-semibold" style={{ color: ASSET_CONFIG.SOL.color }}>{sol}%</td>
                  <td className="py-2 text-right font-semibold" style={{ color: alts > 0 ? ASSET_CONFIG.ALTS.color : "hsl(0 0% 30%)" }}>{alts}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
