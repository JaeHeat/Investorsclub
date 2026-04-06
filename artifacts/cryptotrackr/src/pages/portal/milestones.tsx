import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getMilestones } from "@/lib/localStore";
import type { Milestone } from "@/lib/types";
import { useBtcPrice } from "@/hooks/useBtcPrice";
import { formatUSD, getBonusPct, MILESTONE_PCTS } from "@/lib/utils";
import PortalLayout from "@/components/layout/PortalLayout";
import { Check, Lock, TrendingUp } from "lucide-react";

export default function MilestonesPage() {
  const { clientProfile, user } = useAuth();
  const { price } = useBtcPrice();
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    if (user) {
      setMilestones(getMilestones(user.id));
    }
  }, [user]);

  const initialValue = clientProfile?.initial_portfolio_value ?? 0;
  const btcHoldings = clientProfile?.btc_holdings ?? 0;
  const avgCostBasis = clientProfile?.avg_cost_basis ?? 0;
  const costBasisTotal = btcHoldings * avgCostBasis;
  const currentValue = price ? btcHoldings * price : null;
  const currentReturnPct = costBasisTotal > 0 && currentValue
    ? ((currentValue - costBasisTotal) / costBasisTotal) * 100
    : 0;

  function getMilestoneData(pct: number) {
    const record = milestones.find((m) => m.milestone_pct === pct);
    const targetValue = initialValue * (1 + pct / 100);
    const gainsAtMilestone = targetValue - initialValue;
    const bonusPct = getBonusPct(pct, initialValue);
    const bonusAmount = gainsAtMilestone * (bonusPct / 100);
    const isHit = record?.hit ?? currentReturnPct >= pct;
    const isNext = !isHit && MILESTONE_PCTS.filter((p) => {
      const r = milestones.find((m) => m.milestone_pct === p);
      return !(r?.hit ?? currentReturnPct >= p);
    })[0] === pct;

    return { record, targetValue, gainsAtMilestone, bonusPct, bonusAmount, isHit, isNext };
  }

  return (
    <PortalLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Milestones</h1>
        <p className="text-sm text-[hsl(0_0%_45%)] mt-1">Track your return milestones and bonus targets</p>
      </div>

      <div className="space-y-3">
        {MILESTONE_PCTS.map((pct) => {
          const { record, targetValue, bonusPct, bonusAmount, isHit, isNext } = getMilestoneData(pct);
          const progressPct = currentValue && targetValue
            ? Math.min(100, (currentValue / targetValue) * 100)
            : 0;

          return (
            <div
              key={pct}
              className="rounded-2xl p-5 transition-all"
              style={{
                background: isHit ? "rgba(34,197,94,0.05)" : isNext ? "rgba(247,147,26,0.05)" : "hsl(0 0% 7%)",
                border: `1px solid ${isHit ? "rgba(34,197,94,0.15)" : isNext ? "rgba(247,147,26,0.15)" : "hsl(0 0% 13%)"}`,
              }}
              data-testid={`milestone-${pct}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: isHit ? "rgba(34,197,94,0.15)" : isNext ? "rgba(247,147,26,0.12)" : "hsl(0 0% 11%)",
                    }}
                  >
                    {isHit ? (
                      <Check className="w-4 h-4" style={{ color: "#22c55e" }} />
                    ) : isNext ? (
                      <TrendingUp className="w-4 h-4" style={{ color: "#F7931A" }} />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-[hsl(0_0%_40%)]" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{pct}% Return</p>
                    <p className="text-xs text-[hsl(0_0%_45%)]">Target: {initialValue ? formatUSD(targetValue) : "—"}</p>
                  </div>
                </div>

                <div className="text-right">
                  {isHit && record?.bonus_amount ? (
                    <div>
                      <p className="text-xs text-[hsl(0_0%_45%)]">Bonus earned</p>
                      <p className="text-sm font-semibold" style={{ color: "#22c55e" }}>{formatUSD(record.bonus_amount)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-[hsl(0_0%_45%)]">Bonus at milestone</p>
                      <p className="text-sm font-semibold" style={{ color: isNext ? "#F7931A" : "hsl(0 0% 55%)" }}>
                        {bonusPct}% ({initialValue ? formatUSD(bonusAmount) : "—"})
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {isNext && (
                <div>
                  <div className="flex justify-between text-xs text-[hsl(0_0%_40%)] mb-1">
                    <span>Progress to {pct}% target</span>
                    <span>{progressPct.toFixed(0)}%</span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: "hsl(0 0% 13%)" }}>
                    <div
                      className="h-1 rounded-full"
                      style={{ width: `${progressPct}%`, background: "#F7931A" }}
                    />
                  </div>
                </div>
              )}

              {isHit && record?.hit_at && (
                <p className="text-xs text-[hsl(0_0%_40%)] mt-1">
                  Hit {new Date(record.hit_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </PortalLayout>
  );
}
