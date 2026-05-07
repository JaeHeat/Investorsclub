import { useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getHoldings } from "@/lib/localStore";
import { usePrices } from "@/hooks/usePrices";
import { formatUSD } from "@/lib/utils";
import { getPortfolioPlan, ASSET_CONFIG } from "@/lib/portfolioPlans";
import {
  DCA_SCHEDULE,
  DCA_BOOSTERS,
  getCurrentCyclePhase,
  getDaysUntil,
} from "@/lib/cycleData";
import PortalLayout from "@/components/layout/PortalLayout";
import { TrendingUp, Calendar, Zap, Shield, Clock, Info, AlertTriangle } from "lucide-react";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
      {children}
    </div>
  );
}

const ENTRY_PHASES = [
  {
    id: 1,
    label: "Phase 1 — Wait",
    dateRange: "Now → Oct 2026",
    action: "Hold cash/stablecoins. Do not buy yet. Watch for bottom signals.",
    status: "active" as const,
    color: "#F7931A",
    note: "Buying too early means riding the full drawdown. The buy zone is ~Oct 2026.",
  },
  {
    id: 2,
    label: "Phase 2 — Front-load (40%)",
    dateRange: "Oct 2026 → Jan 2027",
    action: "Deploy 40% of your dry powder into BTC first. Largest allocation, lowest prices.",
    status: "upcoming" as const,
    color: "#10b981",
    note: "First 3 months of the DCA window. BTC only (up to 20% ETH if conviction is high).",
  },
  {
    id: 3,
    label: "Phase 3 — Core stack (30%)",
    dateRange: "Jan 2027 → Apr 2027",
    action: "Deploy another 30% into BTC/ETH. Price may be higher — that's fine.",
    status: "upcoming" as const,
    color: "#10b981",
    note: "Diversify into ETH once BTC is trending up on the weekly chart.",
  },
  {
    id: 4,
    label: "Phase 4 — Secondary (20%)",
    dateRange: "Apr 2027 → Jul 2027",
    action: "Add SOL exposure. Selectively enter top-25 alt positions.",
    status: "upcoming" as const,
    color: "#6b7280",
    note: "Alts only after BTC/ETH positions are sized. Stick to your plan's alt list.",
  },
  {
    id: 5,
    label: "Phase 5 — Tail (10%)",
    dateRange: "Jul 2027 → Apr 2028",
    action: "Reserve this 10% for major dips or adding to best performers before the halving.",
    status: "upcoming" as const,
    color: "#6b7280",
    note: "Don't force this allocation. Keep dry powder for volatility events.",
  },
];

const ASSET_ENTRY_ORDER = [
  {
    rank: 1,
    asset: "Bitcoin (BTC)",
    color: ASSET_CONFIG.BTC.color,
    timing: "Months 1–6",
    note: "Core position. Front-load here. Every other allocation waits for BTC to trend up weekly.",
    targetPct: "60–80% of entry capital",
  },
  {
    rank: 2,
    asset: "Ethereum (ETH)",
    color: ASSET_CONFIG.ETH.color,
    timing: "Months 3–9",
    note: "Second priority. Once BTC reclaims the 20-week MA and weekly candles are green.",
    targetPct: "15–25% of entry capital",
  },
  {
    rank: 3,
    asset: "Solana (SOL)",
    color: ASSET_CONFIG.SOL.color,
    timing: "Months 6–12",
    note: "Third priority. High-beta to ETH. Only enter once ETH is showing relative strength.",
    targetPct: "5–15% of entry capital",
  },
  {
    rank: 4,
    asset: "Top-25 Alts",
    color: ASSET_CONFIG.ALTS.color,
    timing: "Months 9–18",
    note: "Last to enter, first to exit. Only your plan's curated list. No leverage, no rank 51+.",
    targetPct: "Per plan allocation",
  },
];

const BTC_ENTRY_ZONES = [
  {
    label: "Conservative bottom",
    range: "$50K–$55K",
    drawdown: "-57% to -61% from ATH",
    action: "Begin DCA — start with 15–20% of your dry powder",
    color: "#06b6d4",
    probability: 35,
  },
  {
    label: "Base case bottom",
    range: "$38K–$45K",
    drawdown: "-64% to -70% from ATH",
    action: "Front-load DCA — this is the target zone",
    color: "#10b981",
    probability: 50,
  },
  {
    label: "Aggressive bottom",
    range: "$28K–$38K",
    drawdown: "-70% to -78% from ATH",
    action: "Maximum accumulation — if this prints, deploy aggressively",
    color: "#ef4444",
    probability: 15,
  },
];

export default function EntryStrategyPage() {
  const { user, clientProfile } = useAuth();

  useEffect(() => {
    document.title = "Entry Strategy — CryptoTrackr";
    return () => { document.title = "CryptoTrackr"; };
  }, []);

  const holdings = useMemo(() => (user ? getHoldings(user.id) : []), [user]);
  const allCoinIds = useMemo(() => [...new Set(holdings.map((h) => h.coingecko_id))], [holdings]);
  const { prices } = usePrices(["bitcoin", ...allCoinIds]);

  const btcPrice = prices["bitcoin"] ?? null;
  const currentPhase = useMemo(() => getCurrentCyclePhase(), []);
  const daysUntilBuyZone = getDaysUntil(new Date("2026-10-01"));

  const initialValue = clientProfile?.initial_portfolio_value ?? 0;
  const risk = clientProfile?.risk_tolerance ?? "moderate";
  const plan = useMemo(() => getPortfolioPlan(risk, initialValue), [risk, initialValue]);

  const livePortfolio = useMemo(() => {
    return holdings.reduce((s, h) => {
      const p = prices[h.coingecko_id];
      return p ? s + h.amount * p : s;
    }, 0);
  }, [holdings, prices]);

  const portfolioBase = livePortfolio > 0 ? livePortfolio : initialValue;

  return (
    <PortalLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">Entry Strategy</h1>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}
          >
            5-Phase Plan
          </span>
        </div>
        <p className="text-sm text-[hsl(0_0%_42%)]">
          Rules-based accumulation framework for the 2026–2028 buy window.
        </p>
      </div>

      {/* Current phase banner */}
      <div
        className="rounded-2xl p-4 mb-6 flex items-center justify-between gap-4"
        style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 14%)" }}
      >
        <div>
          <p className="text-xs text-[hsl(0_0%_40%)] uppercase tracking-wide mb-1">Current Phase</p>
          <p className="text-base font-semibold text-white">{currentPhase.label}</p>
          <p className="text-xs text-[hsl(0_0%_45%)] mt-0.5">{currentPhase.description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-[hsl(0_0%_40%)] mb-1">Buy zone opens in</p>
          <p className="text-base font-bold" style={{ color: "#F7931A" }}>~{daysUntilBuyZone}d</p>
          <p className="text-[11px] text-[hsl(0_0%_38%)]">~Oct 2026</p>
        </div>
      </div>

      {/* Bear market alert */}
      <div
        className="rounded-2xl p-4 mb-6 flex items-start gap-3"
        style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}
      >
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#ef4444]" />
        <div>
          <p className="text-sm font-semibold text-[#ef4444]">Not yet — wait for the buy zone</p>
          <p className="text-xs text-[hsl(0_0%_52%)] mt-0.5">
            Buying during an active bear market risks riding the full remaining drawdown.
            The accumulation window opens ~Oct 2026 (H+30 months). Patience here is the edge.
          </p>
        </div>
      </div>

      {/* Entry phases */}
      <Card className="mb-5">
        <div className="flex items-center gap-2 mb-5">
          <Calendar className="w-4 h-4" style={{ color: "#F7931A" }} />
          <h2 className="text-sm font-semibold text-white">Entry Timeline</h2>
        </div>
        <div className="space-y-3">
          {ENTRY_PHASES.map((phase) => {
            const isCurrent = phase.status === "active";
            return (
              <div
                key={phase.id}
                className="rounded-xl p-4"
                style={{
                  background: isCurrent ? "rgba(247,147,26,0.06)" : "hsl(0 0% 9%)",
                  border: isCurrent ? "1px solid rgba(247,147,26,0.25)" : "1px solid hsl(0 0% 14%)",
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{phase.label}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: phase.color }}>{phase.dateRange}</p>
                  </div>
                  {isCurrent && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0"
                      style={{ background: "rgba(247,147,26,0.15)", color: "#F7931A" }}
                    >
                      Now
                    </span>
                  )}
                </div>
                <p className="text-xs text-[hsl(0_0%_55%)] mb-1.5">{phase.action}</p>
                <p className="text-[11px] text-[hsl(0_0%_38%)] italic">{phase.note}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* DCA allocation */}
      <Card className="mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4" style={{ color: "#F7931A" }} />
          <h2 className="text-sm font-semibold text-white">DCA Allocation Schedule</h2>
        </div>
        <p className="text-xs text-[hsl(0_0%_42%)] mb-4 leading-relaxed">
          Front-load your entry. The biggest gains come from buying earliest in the accumulation window — when fear is highest and prices are lowest.
        </p>
        <div className="space-y-2.5 mb-4">
          {DCA_SCHEDULE.map((d) => (
            <div key={d.months} className="flex items-center gap-3">
              <div className="w-24 shrink-0">
                <p className="text-xs text-[hsl(0_0%_45%)]">{d.months}</p>
                <p className="text-[10px] text-[hsl(0_0%_30%)]">{d.label}</p>
              </div>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "hsl(0 0% 12%)" }}>
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${d.allocationPct}%`,
                    background: "#F7931A",
                    opacity: 0.4 + (d.allocationPct / 100) * 0.7,
                  }}
                />
              </div>
              <p className="text-sm font-semibold w-10 text-right" style={{ color: "#F7931A" }}>{d.allocationPct}%</p>
            </div>
          ))}
        </div>
        <div
          className="rounded-xl px-4 py-3 text-xs text-[hsl(0_0%_42%)] leading-relaxed"
          style={{ background: "hsl(0 0% 10%)" }}
        >
          Months shown are relative to the buy zone opening (~Oct 2026). Total DCA window: 18 months into the 5th halving.
        </div>
      </Card>

      {/* Entry triggers */}
      <Card className="mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4" style={{ color: "#F7931A" }} />
          <h2 className="text-sm font-semibold text-white">Entry Triggers — Add More When These Hit</h2>
        </div>
        <p className="text-xs text-[hsl(0_0%_42%)] mb-4">
          On top of your scheduled DCA, these signals let you boost your allocation at optimal moments.
        </p>
        <div className="space-y-2">
          {DCA_BOOSTERS.map((b) => (
            <div key={b.trigger} className="flex items-start justify-between gap-3 rounded-xl p-3.5" style={{ background: "hsl(0 0% 9%)" }}>
              <p className="text-xs text-[hsl(0_0%_55%)] leading-relaxed">{b.trigger}</p>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded shrink-0"
                style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}
              >
                {b.boost}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Asset entry order */}
      <Card className="mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4" style={{ color: "#F7931A" }} />
          <h2 className="text-sm font-semibold text-white">Asset Entry Order</h2>
        </div>
        <p className="text-xs text-[hsl(0_0%_42%)] mb-4">
          Buy in this sequence. Do not skip ahead. Each tier only unlocks after the previous one is trending up on the weekly chart.
        </p>
        <div className="space-y-3">
          {ASSET_ENTRY_ORDER.map((asset) => (
            <div
              key={asset.rank}
              className="rounded-xl p-4 flex items-start gap-4"
              style={{ background: "hsl(0 0% 9%)", borderLeft: `3px solid ${asset.color}` }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: `${asset.color}18`, color: asset.color }}
              >
                {asset.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-white">{asset.asset}</p>
                  <span className="text-[10px] font-medium shrink-0" style={{ color: asset.color }}>{asset.timing}</span>
                </div>
                <p className="text-[11px] text-[hsl(0_0%_42%)] leading-relaxed mb-1">{asset.note}</p>
                <p className="text-[10px] text-[hsl(0_0%_35%)]">Target: {asset.targetPct}</p>
              </div>
            </div>
          ))}
        </div>
        <div
          className="mt-4 rounded-xl px-4 py-3 text-xs leading-relaxed"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "#ef4444" }}
        >
          No leverage. No coins ranked 51+. No meme coins. Stick to your plan's curated list.
        </div>
      </Card>

      {/* BTC price entry zones */}
      <Card className="mb-5">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-4 h-4" style={{ color: "#F7931A" }} />
          <h2 className="text-sm font-semibold text-white">BTC Price Entry Zones</h2>
          {btcPrice && (
            <span className="ml-auto text-xs text-[hsl(0_0%_45%)]">
              Current: <span className="font-semibold text-white">{formatUSD(btcPrice)}</span>
            </span>
          )}
        </div>
        <div className="space-y-3">
          {BTC_ENTRY_ZONES.map((zone) => (
            <div
              key={zone.label}
              className="rounded-xl p-4"
              style={{
                background: "hsl(0 0% 9%)",
                borderLeft: `3px solid ${zone.color}`,
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="text-sm font-semibold text-white">{zone.label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: zone.color }}>{zone.drawdown}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-base font-bold" style={{ color: zone.color }}>{zone.range}</p>
                </div>
              </div>
              <p className="text-xs text-[hsl(0_0%_52%)] mb-2">{zone.action}</p>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "hsl(0 0% 14%)" }}>
                <div className="h-1 rounded-full" style={{ width: `${zone.probability}%`, background: zone.color }} />
              </div>
              <p className="text-[10px] text-[hsl(0_0%_32%)] mt-1">{zone.probability}% probability estimate</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Your plan context */}
      {portfolioBase > 0 && (
        <Card className="mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4" style={{ color: "#F7931A" }} />
            <h2 className="text-sm font-semibold text-white">Your Re-Entry Allocation ({plan.tier} · {plan.risk})</h2>
          </div>
          <p className="text-xs text-[hsl(0_0%_42%)] mb-4 leading-relaxed">
            Based on your portfolio size and risk profile, here is the target allocation to build toward during the accumulation window.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "BTC", pct: plan.btcPct, color: ASSET_CONFIG.BTC.color },
              { label: "ETH", pct: plan.ethPct, color: ASSET_CONFIG.ETH.color },
              { label: "SOL", pct: plan.solPct, color: ASSET_CONFIG.SOL.color },
              { label: "Top-25 Alts", pct: plan.altsPct, color: ASSET_CONFIG.ALTS.color },
            ].map(({ label, pct, color }) => (
              <div
                key={label}
                className="rounded-xl p-3 text-center"
                style={{ background: "hsl(0 0% 10%)", borderTop: `2px solid ${color}` }}
              >
                <p className="text-lg font-bold" style={{ color }}>{pct}%</p>
                <p className="text-[11px] text-[hsl(0_0%_45%)] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[hsl(0_0%_35%)] mt-3">{plan.bearPhaseNote}</p>
        </Card>
      )}

      <div
        className="rounded-xl px-4 py-3 flex items-start gap-2"
        style={{ background: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 13%)" }}
      >
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[hsl(0_0%_35%)]" />
        <p className="text-[10px] text-[hsl(0_0%_38%)] leading-relaxed">
          Price targets and timing are based on historical halving cycle analysis. BTC bear markets have historically bottomed 12–18 months after cycle peaks. The Oct 2026 buy zone aligns with the H+30 month pattern from 2018 and 2022 bottoms. Not financial advice. Past cycles do not guarantee future performance.
        </p>
      </div>
    </PortalLayout>
  );
}
