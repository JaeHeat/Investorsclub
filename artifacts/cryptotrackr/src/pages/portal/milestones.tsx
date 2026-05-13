import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getHoldings, getMilestones } from "@/lib/localStore";
import type { Milestone } from "@/lib/types";
import { usePrices } from "@/hooks/usePrices";
import { formatUSD, getMilestoneTier } from "@/lib/utils";
import PortalLayout from "@/components/layout/PortalLayout";
import { Check, Lock, TrendingUp, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export default function MilestonesPage() {
  const { clientProfile, user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    document.title = "Milestones — CryptoTrackr";
    return () => { document.title = "CryptoTrackr"; };
  }, []);

  useEffect(() => {
    if (user) setMilestones(getMilestones(user.id));
  }, [user]);

  const initialValue = clientProfile?.initial_portfolio_value ?? 0;
  const holdings = useMemo(
    () => (user ? getHoldings(user.id) : []),
    [user]
  );
  const coinIds = useMemo(() => holdings.map((h) => h.coingecko_id), [holdings]);
  const { prices } = usePrices(coinIds);

  const totalCurrent = useMemo(() => {
    if (holdings.length === 0) return null;
    const allPriced = holdings.every((h) => prices[h.coingecko_id] != null);
    if (!allPriced) return null;
    return holdings.reduce((s, h) => s + h.amount * (prices[h.coingecko_id] ?? h.manual_price ?? h.avg_cost), 0);
  }, [holdings, prices]);

  const tier = getMilestoneTier(clientProfile?.risk_tolerance, initialValue);

  function getMilestoneData(pct: number) {
    const record = milestones.find((m) => m.milestone_pct === pct);
    const targetValue = initialValue * (1 + pct / 100);
    const currentReturnPct = initialValue > 0 && totalCurrent
      ? ((totalCurrent - initialValue) / initialValue) * 100
      : 0;
    const isHit = record?.hit ?? currentReturnPct >= pct;
    const isNext = !isHit && tier.pcts.filter((p) => {
      const r = milestones.find((m) => m.milestone_pct === p);
      const hitByReturn = initialValue > 0 && totalCurrent
        ? ((totalCurrent - initialValue) / initialValue) * 100 >= p
        : false;
      return !(r?.hit ?? hitByReturn);
    })[0] === pct;
    return { record, targetValue, isHit, isNext };
  }

  return (
    <PortalLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">Milestones</h1>
        </div>
        <p className="text-sm text-[hsl(0_0%_45%)] mt-1">Your return targets measured from the day you joined</p>
      </div>

      {/* Tier badge */}
      <div className="mb-4 rounded-2xl p-4 flex items-center justify-between" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
        <div>
          <p className="text-xs text-[hsl(0_0%_40%)] uppercase tracking-wide mb-0.5">Your milestone plan</p>
          <p className="text-sm font-semibold text-white">{tier.portfolioLabel} · {tier.riskLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[hsl(0_0%_40%)] mb-0.5">Maximum target</p>
          <p className="text-sm font-semibold" style={{ color: "#F7931A" }}>{tier.maxReturnLabel} return</p>
        </div>
      </div>

      {/* Banner when initialValue is not set */}
      {initialValue === 0 && (
        <div
          className="mb-6 rounded-2xl p-4 flex items-start gap-3"
          style={{ background: "rgba(247,147,26,0.06)", border: "1px solid rgba(247,147,26,0.22)" }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#F7931A" }} />
          <div>
            <p className="text-sm font-semibold text-white">Set your starting value to unlock targets</p>
            <p className="text-xs text-[hsl(0_0%_50%)] mt-0.5 leading-relaxed">
              Add your starting portfolio value in{" "}
              <Link href="/portal/settings">
                <a className="underline underline-offset-2" style={{ color: "#F7931A" }}>Settings</a>
              </Link>{" "}
              to see personalised milestone targets and progress bars.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {tier.pcts.map((pct) => {
          const { record, targetValue, isHit, isNext } = getMilestoneData(pct);
          const progressPct = totalCurrent && targetValue
            ? Math.min(100, (totalCurrent / targetValue) * 100)
            : 0;

          return (
            <div
              key={pct}
              className="rounded-2xl p-5 transition-all"
              style={{
                background: isHit
                  ? "rgba(34,197,94,0.05)"
                  : isNext
                    ? "rgba(247,147,26,0.05)"
                    : "hsl(0 0% 7%)",
                border: `1px solid ${
                  isHit
                    ? "rgba(34,197,94,0.15)"
                    : isNext
                      ? "rgba(247,147,26,0.15)"
                      : "hsl(0 0% 13%)"
                }`,
              }}
              data-testid={`milestone-${pct}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: isHit
                      ? "rgba(34,197,94,0.15)"
                      : isNext
                        ? "rgba(247,147,26,0.12)"
                        : "hsl(0 0% 11%)",
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
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{pct}% Return</p>
                  <p className="text-xs text-[hsl(0_0%_45%)]">
                    Target: {initialValue ? formatUSD(targetValue) : "—"}
                  </p>
                </div>
                {isHit && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                    Hit
                  </span>
                )}
              </div>

              {isNext && (
                <div className="mt-3">
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

              {!isHit && !isNext && totalCurrent && targetValue && progressPct > 0 && (
                <div className="mt-3">
                  <div className="h-1 rounded-full" style={{ background: "hsl(0 0% 11%)" }}>
                    <div
                      className="h-1 rounded-full"
                      style={{ width: `${progressPct}%`, background: "hsl(0 0% 25%)" }}
                    />
                  </div>
                </div>
              )}

              {isHit && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-[hsl(0_0%_40%)] mb-1">
                    <span>Target reached</span>
                    <span className="font-semibold" style={{ color: "#22c55e" }}>100%</span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: "hsl(0 0% 13%)" }}>
                    <div className="h-1 rounded-full" style={{ width: "100%", background: "#22c55e" }} />
                  </div>
                  {record?.hit_at && (
                    <p className="text-xs text-[hsl(0_0%_40%)] mt-1.5">
                      Hit{" "}
                      {new Date(record.hit_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PortalLayout>
  );
}
