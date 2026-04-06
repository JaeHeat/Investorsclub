import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getMilestones } from "@/lib/localStore";
import type { Milestone } from "@/lib/types";
import { useBtcPrice } from "@/hooks/useBtcPrice";
import { formatUSD, formatBTC, formatPct, getBonusPct, MILESTONE_PCTS } from "@/lib/utils";
import PortalLayout from "@/components/layout/PortalLayout";
import { TrendingUp, TrendingDown, RefreshCw, Bitcoin } from "lucide-react";

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
    >
      <p className="text-xs text-[hsl(0_0%_45%)] uppercase tracking-wide mb-2">{label}</p>
      <p
        className="text-2xl font-semibold tracking-tight"
        style={{ color: accent ? "#F7931A" : "white" }}
        data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-[hsl(0_0%_45%)] mt-1">{sub}</p>}
    </div>
  );
}

export default function PortalIndex() {
  const { clientProfile, user } = useAuth();
  const { price, loading: priceLoading } = useBtcPrice();
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    if (user) {
      setMilestones(getMilestones(user.id));
    }
  }, [user]);

  const btcHoldings = clientProfile?.btc_holdings ?? 0;
  const avgCostBasis = clientProfile?.avg_cost_basis ?? 0;
  const initialValue = clientProfile?.initial_portfolio_value ?? 0;
  const currentValue = price ? btcHoldings * price : null;
  const costBasisTotal = btcHoldings * avgCostBasis;
  const gainLoss = currentValue !== null ? currentValue - costBasisTotal : null;
  const returnPct = costBasisTotal > 0 && gainLoss !== null ? (gainLoss / costBasisTotal) * 100 : null;
  const isPositive = gainLoss !== null && gainLoss >= 0;

  const nextMilestone = MILESTONE_PCTS.find((pct) => {
    const milestone = milestones.find((m) => m.milestone_pct === pct);
    return !milestone?.hit;
  });
  const nextMilestoneValue = nextMilestone && initialValue
    ? initialValue * (1 + nextMilestone / 100)
    : null;

  return (
    <PortalLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Portfolio Overview</h1>
        <p className="text-sm text-[hsl(0_0%_45%)] mt-1">
          Welcome back, {clientProfile?.full_name?.split(" ")[0] || ""}
        </p>
      </div>

      <div
        className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl w-fit"
        style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
        data-testid="btc-price-strip"
      >
        <Bitcoin className="w-4 h-4" style={{ color: "#F7931A" }} />
        {priceLoading ? (
          <span className="text-sm text-[hsl(0_0%_50%)] flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 animate-spin" /> Fetching price...
          </span>
        ) : (
          <span className="text-sm font-medium text-white">
            BTC <span style={{ color: "#F7931A" }}>{price ? formatUSD(price) : "—"}</span>
          </span>
        )}
        <span className="text-xs text-[hsl(0_0%_35%)]">Live</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Current Value"
          value={currentValue ? formatUSD(currentValue) : "—"}
          sub={btcHoldings ? formatBTC(btcHoldings) : undefined}
          accent
        />
        <StatCard
          label="Cost Basis"
          value={formatUSD(costBasisTotal)}
          sub={`${formatUSD(avgCostBasis)} avg/BTC`}
        />
        <StatCard
          label="Total Return"
          value={returnPct !== null ? formatPct(returnPct) : "—"}
          sub={gainLoss !== null ? `${isPositive ? "+" : ""}${formatUSD(gainLoss)}` : undefined}
        />
        <StatCard
          label="P&L"
          value={gainLoss !== null ? formatUSD(Math.abs(gainLoss)) : "—"}
          sub={isPositive ? "Gain" : "Loss"}
        />
      </div>

      {returnPct !== null && (
        <div
          className="rounded-2xl p-5 mb-6 flex items-center gap-4"
          style={{
            background: isPositive ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)",
            border: `1px solid ${isPositive ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}`,
          }}
          data-testid="return-card"
        >
          {isPositive ? (
            <TrendingUp className="w-6 h-6 shrink-0" style={{ color: "#22c55e" }} />
          ) : (
            <TrendingDown className="w-6 h-6 shrink-0" style={{ color: "#ef4444" }} />
          )}
          <div>
            <p className="text-sm font-medium" style={{ color: isPositive ? "#22c55e" : "#ef4444" }}>
              {formatPct(returnPct)} return on investment
            </p>
            <p className="text-xs text-[hsl(0_0%_45%)] mt-0.5">
              {isPositive ? "Gain" : "Loss"} of {formatUSD(Math.abs(gainLoss!))} since your entry
            </p>
          </div>
        </div>
      )}

      {nextMilestone && nextMilestoneValue && (
        <div
          className="rounded-2xl p-5"
          style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
          data-testid="next-milestone-card"
        >
          <p className="text-xs text-[hsl(0_0%_45%)] uppercase tracking-wide mb-3">Next Milestone</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-white">{nextMilestone}% Return</p>
              <p className="text-sm text-[hsl(0_0%_50%)] mt-0.5">
                Target: {formatUSD(nextMilestoneValue)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[hsl(0_0%_45%)]">Bonus at this milestone</p>
              <p className="text-base font-semibold mt-0.5" style={{ color: "#F7931A" }}>
                {getBonusPct(nextMilestone, initialValue)}% of gains
              </p>
            </div>
          </div>
          {currentValue !== null && nextMilestoneValue && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-[hsl(0_0%_45%)] mb-1.5">
                <span>{formatUSD(currentValue)}</span>
                <span>{formatUSD(nextMilestoneValue)}</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: "hsl(0 0% 13%)" }}>
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (currentValue / nextMilestoneValue) * 100)}%`,
                    background: "#F7931A",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </PortalLayout>
  );
}
