import { useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getHoldings } from "@/lib/localStore";
import { usePrices } from "@/hooks/usePrices";
import { formatUSD } from "@/lib/utils";
import { EXIT_TRANCHES, getExitPlan, ASSET_CONFIG } from "@/lib/portfolioPlans";
import { getCurrentCyclePhase } from "@/lib/cycleData";
import PortalLayout from "@/components/layout/PortalLayout";
import { TrendingDown, Shield, AlertTriangle, CheckCircle2, Clock, Zap } from "lucide-react";

const URGENCY_CONFIG: Record<string, { color: string; bg: string; icon: typeof Shield; label: string }> = {
  hold:   { color: "#10b981", bg: "rgba(16,185,129,0.07)",  icon: CheckCircle2,   label: "Hold" },
  watch:  { color: "#F7931A", bg: "rgba(247,147,26,0.07)",  icon: Clock,          label: "Watch" },
  reduce: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  icon: AlertTriangle,  label: "Reduce" },
  exit:   { color: "#ef4444", bg: "rgba(239,68,68,0.08)",   icon: Zap,            label: "Exit" },
};

export default function ExitStrategyPage() {
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Exit Strategy — CryptoTrackr";
    return () => { document.title = "CryptoTrackr"; };
  }, []);

  const holdings = useMemo(() => (user ? getHoldings(user.id) : []), [user]);

  const allCoinIds = useMemo(
    () => [...new Set(holdings.map((h) => h.coingecko_id))],
    [holdings]
  );
  const { prices } = usePrices(allCoinIds);

  const liveValues = useMemo(() => {
    const map: Record<string, number> = {};
    for (const h of holdings) {
      const price = prices[h.coingecko_id];
      if (price) map[h.coingecko_id] = h.amount * price;
    }
    return map;
  }, [holdings, prices]);

  const btcValue   = liveValues["bitcoin"]  ?? 0;
  const ethValue   = liveValues["ethereum"] ?? 0;
  const solValue   = liveValues["solana"]   ?? 0;
  const altsValue  = Object.entries(liveValues)
    .filter(([id]) => !["bitcoin", "ethereum", "solana"].includes(id))
    .reduce((s, [, v]) => s + v, 0);
  const totalValue = btcValue + ethValue + solValue + altsValue;

  const currentPhase = useMemo(() => getCurrentCyclePhase(), []);

  const currentPhaseNumericId = currentPhase.id === "bear" ? 6 : (currentPhase.id as number);

  const plan = useMemo(
    () => getExitPlan({ btcValue, ethValue, solValue, altsValue }, currentPhaseNumericId),
    [btcValue, ethValue, solValue, altsValue, currentPhaseNumericId]
  );

  const totalExitValue = plan.reduce((s, t) => s + t.totalSellUsd, 0);

  return (
    <PortalLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <TrendingDown className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">Exit Strategy</h1>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}
          >
            6-Phase Plan
          </span>
        </div>
        <p className="text-sm text-[hsl(0_0%_42%)]">
          Staged sell schedule across all 6 cycle phases. Amounts are based on your live portfolio.
        </p>
      </div>

      {/* Current phase banner */}
      <div
        className="rounded-2xl p-4 mb-6 flex items-center justify-between gap-4"
        style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 14%)" }}
      >
        <div>
          <p className="text-xs text-[hsl(0_0%_40%)] uppercase tracking-wide mb-1">Current Phase</p>
          <p className="text-base font-semibold text-white">{currentPhase.name}</p>
          <p className="text-xs text-[hsl(0_0%_45%)] mt-0.5">{currentPhase.description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-[hsl(0_0%_40%)] mb-1">Portfolio value</p>
          <p className="text-base font-bold" style={{ color: "#F7931A" }}>{totalValue > 0 ? formatUSD(totalValue) : "—"}</p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "BTC to exit", value: formatUSD(plan.reduce((s, t) => s + t.btcSellUsd, 0)), color: ASSET_CONFIG.BTC.color },
          { label: "ETH to exit", value: formatUSD(plan.reduce((s, t) => s + t.ethSellUsd, 0)), color: ASSET_CONFIG.ETH.color },
          { label: "SOL to exit", value: formatUSD(plan.reduce((s, t) => s + t.solSellUsd, 0)), color: ASSET_CONFIG.SOL.color },
          { label: "Alts to exit", value: formatUSD(plan.reduce((s, t) => s + t.altsSellUsd, 0)), color: ASSET_CONFIG.ALTS.color },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl p-3"
            style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
          >
            <p className="text-[10px] text-[hsl(0_0%_40%)] uppercase tracking-wide mb-1">{label}</p>
            <p className="text-sm font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Phase rows */}
      <div className="space-y-3">
        {plan.map((t) => {
          const cfg = URGENCY_CONFIG[t.urgency];
          const UrgencyIcon = cfg.icon;
          const isCurrent = t.phaseId === currentPhaseNumericId;
          const isPast = t.phaseId < currentPhaseNumericId;

          return (
            <div
              key={t.phaseId}
              className="rounded-2xl overflow-hidden"
              style={{
                border: isCurrent ? `1px solid ${cfg.color}` : "1px solid hsl(0 0% 13%)",
                background: isCurrent ? cfg.bg : "hsl(0 0% 7%)",
                opacity: isPast ? 0.5 : 1,
              }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{ background: isCurrent ? cfg.color : "hsl(0 0% 14%)", color: isCurrent ? "#000" : "hsl(0 0% 50%)" }}
                    >
                      {t.phaseId}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{t.phaseLabel}</p>
                      {isCurrent && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: cfg.color, color: "#000" }}>
                          CURRENT PHASE
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <UrgencyIcon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                    <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                  </div>
                </div>

                <p className="text-xs text-[hsl(0_0%_52%)] mb-3 leading-relaxed">{t.action}</p>

                {t.totalSellUsd > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: "BTC", value: t.btcSellUsd, pct: t.btcSellPct, color: ASSET_CONFIG.BTC.color },
                      { label: "ETH", value: t.ethSellUsd, pct: t.ethSellPct, color: ASSET_CONFIG.ETH.color },
                      { label: "SOL", value: t.solSellUsd, pct: t.solSellPct, color: ASSET_CONFIG.SOL.color },
                      { label: "Alts", value: t.altsSellUsd, pct: t.altsSellPct, color: ASSET_CONFIG.ALTS.color },
                    ].filter((a) => a.pct > 0).map(({ label, value, pct, color }) => (
                      <div
                        key={label}
                        className="rounded-lg px-2 py-1.5"
                        style={{ background: "hsl(0 0% 10%)" }}
                      >
                        <p className="text-[10px] font-semibold" style={{ color }}>{label} — {pct}%</p>
                        <p className="text-xs font-bold text-white">{formatUSD(value)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {t.totalSellUsd > 0 && (
                  <div className="mt-2 pt-2 flex justify-between items-center" style={{ borderTop: "1px solid hsl(0 0% 12%)" }}>
                    <p className="text-[10px] text-[hsl(0_0%_40%)]">Total this phase</p>
                    <p className="text-xs font-bold text-white">{formatUSD(t.totalSellUsd)}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="mt-6 rounded-xl px-4 py-3 flex items-start gap-2"
        style={{ background: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 13%)" }}
      >
        <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[hsl(0_0%_35%)]" />
        <p className="text-[10px] text-[hsl(0_0%_38%)] leading-relaxed">
          Exit amounts are calculated from your current live portfolio value of {totalValue > 0 ? formatUSD(totalValue) : "—"}. Percentages represent portion of each asset class to sell at that phase, not cumulative. Adjust your actual exit based on market conditions and your personal tax situation.
        </p>
      </div>
    </PortalLayout>
  );
}
