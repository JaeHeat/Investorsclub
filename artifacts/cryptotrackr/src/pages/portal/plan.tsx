import { useMemo, useEffect } from "react";
import PortalLayout from "@/components/layout/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getHoldings } from "@/lib/localStore";
import { usePrices } from "@/hooks/usePrices";
import { formatUSD } from "@/lib/utils";
import {
  getPortfolioPlan,
  getCuratedAlts,
  ASSET_CONFIG,
  ALT_CATEGORY_COLORS,
  CYCLE_SCENARIOS,
  INVESTMENT_GOALS,
  calculateProjection,
  assessGoal,
  getInvestmentGoal,
  type CuratedAlt,
} from "@/lib/portfolioPlans";
import { getCurrentCyclePhase } from "@/lib/cycleData";
import {
  PieChart, Layers, TrendingUp, Shield, Zap,
  AlertTriangle, Info, ChevronRight, Target,
} from "lucide-react";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(0_0%_38%)] mb-3">
      {children}
    </p>
  );
}

// ── Allocation Bar ────────────────────────────────────────────────────────────

interface AllocationSegment {
  label: string;
  pct: number;
  color: string;
}

function AllocationBar({ segments }: { segments: AllocationSegment[] }) {
  const nonZero = segments.filter((s) => s.pct > 0);
  return (
    <div className="overflow-hidden rounded-lg flex h-8" style={{ gap: "2px" }}>
      {nonZero.map((s, i) => (
        <div
          key={i}
          className="flex items-center justify-center text-[10px] font-bold text-white transition-all"
          style={{
            width: `${s.pct}%`,
            background: s.color,
            opacity: 0.92,
            borderRadius:
              i === 0 ? "6px 0 0 6px" : i === nonZero.length - 1 ? "0 6px 6px 0" : "0",
          }}
        >
          {s.pct >= 12 ? `${s.pct}%` : ""}
        </div>
      ))}
    </div>
  );
}

function AllocationLegend({ segments }: { segments: AllocationSegment[] }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3">
      {segments.filter((s) => s.pct > 0).map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
          <span className="text-xs text-[hsl(0_0%_60%)]">
            {s.label} <span className="text-white font-semibold">{s.pct}%</span>
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Alt Card ─────────────────────────────────────────────────────────────────

function AltCard({ alt, equalPct }: { alt: CuratedAlt; equalPct: number }) {
  const catColor = ALT_CATEGORY_COLORS[alt.category];
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "hsl(0 0% 9%)", border: "1px solid hsl(0 0% 15%)" }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-white">{alt.symbol}</span>
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={{ background: `${catColor}18`, color: catColor }}
            >
              {alt.category}
            </span>
          </div>
          <p className="text-[11px] text-[hsl(0_0%_42%)]">{alt.name}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-white">{equalPct.toFixed(1)}%</p>
          <p className="text-[10px] text-[hsl(0_0%_40%)]">of portfolio</p>
        </div>
      </div>
      <p className="text-xs text-[hsl(0_0%_52%)] leading-relaxed">{alt.rationale}</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PlanPage() {
  const { user, clientProfile } = useAuth();

  useEffect(() => {
    document.title = "Portfolio Plan — CryptoTrackr";
    return () => { document.title = "CryptoTrackr"; };
  }, []);

  const holdings = useMemo(() => getHoldings(user?.id ?? ""), [user?.id]);

  const allCoinIds = useMemo(
    () => ["bitcoin", "ethereum", "solana", ...holdings.map((h) => h.coingecko_id)],
    [holdings]
  );
  const { prices } = usePrices(allCoinIds);

  const initialValue = clientProfile?.initial_portfolio_value ?? 0;
  const risk = clientProfile?.risk_tolerance ?? "moderate";
  const plan = useMemo(() => getPortfolioPlan(risk, initialValue), [risk, initialValue]);
  const alts = useMemo(() => getCuratedAlts(plan.numAlts), [plan.numAlts]);
  const currentPhase = useMemo(() => getCurrentCyclePhase(), []);

  // ── Current allocation from live prices ─────────────────────────────────────
  const liveValues = useMemo(() => {
    const map: Record<string, number> = {};
    for (const h of holdings) {
      const price = prices[h.coingecko_id];
      if (price) map[h.coingecko_id] = h.amount * price;
    }
    return map;
  }, [holdings, prices]);

  const totalLive = useMemo(
    () => Object.values(liveValues).reduce((a, b) => a + b, 0),
    [liveValues]
  );

  const currentBtcPct = totalLive > 0 ? Math.round(((liveValues["bitcoin"] ?? 0) / totalLive) * 100) : null;
  const currentEthPct = totalLive > 0 ? Math.round(((liveValues["ethereum"] ?? 0) / totalLive) * 100) : null;
  const currentSolPct = totalLive > 0 ? Math.round(((liveValues["solana"] ?? 0) / totalLive) * 100) : null;
  const currentAltsPct = totalLive > 0
    ? Math.max(0, 100 - (currentBtcPct ?? 0) - (currentEthPct ?? 0) - (currentSolPct ?? 0))
    : null;

  const targetSegments: AllocationSegment[] = [
    { label: "Bitcoin", pct: plan.btcPct, color: ASSET_CONFIG.BTC.color },
    { label: "Ethereum", pct: plan.ethPct, color: ASSET_CONFIG.ETH.color },
    { label: "Solana", pct: plan.solPct, color: ASSET_CONFIG.SOL.color },
    { label: "Top-25 Alts", pct: plan.altsPct, color: ASSET_CONFIG.ALTS.color },
  ];

  const currentSegments: AllocationSegment[] =
    currentBtcPct !== null
      ? [
          { label: "Bitcoin", pct: currentBtcPct, color: ASSET_CONFIG.BTC.color },
          { label: "Ethereum", pct: currentEthPct ?? 0, color: ASSET_CONFIG.ETH.color },
          { label: "Solana", pct: currentSolPct ?? 0, color: ASSET_CONFIG.SOL.color },
          { label: "Top-25 Alts", pct: currentAltsPct ?? 0, color: ASSET_CONFIG.ALTS.color },
        ]
      : [];

  // Per-alt equal weight within the alt bucket
  const altEqualPct = plan.numAlts > 0 ? plan.altsPct / plan.numAlts : 0;

  // Gap helpers
  function gap(current: number | null, target: number): string {
    if (current === null) return "—";
    const diff = target - current;
    if (Math.abs(diff) < 2) return "On target";
    return diff > 0 ? `+${diff}% needed` : `${diff}% over`;
  }
  function gapColor(current: number | null, target: number): string {
    if (current === null) return "hsl(0 0% 45%)";
    const diff = Math.abs(target - current);
    if (diff < 2) return "#10b981";
    if (diff < 8) return "#f59e0b";
    return "#ef4444";
  }

  const isBearPhase = currentPhase.phase === "bear";

  // ── Investment goal + cycle projections ─────────────────────────────────────
  const projectionBase = totalLive > 0 ? totalLive : initialValue;
  const goal = getInvestmentGoal(clientProfile?.investment_goal, projectionBase);

  const projectionValues = CYCLE_SCENARIOS.map((s) => ({
    scenario: s,
    value: calculateProjection(projectionBase, plan, s),
    multiple: calculateProjection(projectionBase, plan, s) / (projectionBase || 1),
  }));

  const goalAssessment = goal && projectionBase > 0
    ? assessGoal(projectionBase, plan, goal.multiple)
    : null;

  const projectionMax = projectionValues[projectionValues.length - 1].value;

  // ── Rebalancing Calculator ───────────────────────────────────────────────
  const btcPrice  = prices["bitcoin"]  ?? 0;
  const ethPrice  = prices["ethereum"] ?? 0;
  const solPrice  = prices["solana"]   ?? 0;

  // Use cost basis as fallback when live prices haven't loaded yet
  const costBasisValues = useMemo(() => {
    const map: Record<string, number> = {};
    for (const h of holdings) map[h.coingecko_id] = h.amount * h.avg_cost;
    return map;
  }, [holdings]);
  const costBasisTotal = useMemo(() => Object.values(costBasisValues).reduce((a, b) => a + b, 0), [costBasisValues]);

  const rebalanceBase = totalLive > 0 ? totalLive : costBasisTotal;
  const rebalanceLive = totalLive > 0 ? liveValues : costBasisValues;
  const rebalancePricesLive = totalLive > 0;

  const rebalanceItems = holdings.length > 0 && rebalanceBase > 0
    ? [
        {
          label: "Bitcoin",
          color: ASSET_CONFIG.BTC.color,
          targetPct: plan.btcPct,
          currentValue: rebalanceLive["bitcoin"] ?? 0,
          targetValue: rebalanceBase * plan.btcPct / 100,
          unitPrice: btcPrice,
          symbol: "BTC",
        },
        {
          label: "Ethereum",
          color: ASSET_CONFIG.ETH.color,
          targetPct: plan.ethPct,
          currentValue: rebalanceLive["ethereum"] ?? 0,
          targetValue: rebalanceBase * plan.ethPct / 100,
          unitPrice: ethPrice,
          symbol: "ETH",
        },
        {
          label: "Solana",
          color: ASSET_CONFIG.SOL.color,
          targetPct: plan.solPct,
          currentValue: rebalanceLive["solana"] ?? 0,
          targetValue: rebalanceBase * plan.solPct / 100,
          unitPrice: solPrice,
          symbol: "SOL",
        },
        {
          label: "Top-25 Alts",
          color: ASSET_CONFIG.ALTS.color,
          targetPct: plan.altsPct,
          currentValue: Object.entries(rebalanceLive)
            .filter(([id]) => !["bitcoin", "ethereum", "solana"].includes(id))
            .reduce((s, [, v]) => s + v, 0),
          targetValue: rebalanceBase * plan.altsPct / 100,
          unitPrice: 0,
          symbol: "",
        },
      ]
    : [];

  return (
    <PortalLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <PieChart className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">Portfolio Plan</h1>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}
          >
            {plan.tier}
          </span>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "hsl(0 0% 12%)", color: "hsl(0 0% 60%)" }}
          >
            {plan.risk}
          </span>
          {goal && (
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(247,147,26,0.08)", color: "#F7931A" }}
            >
              {goal.label}
            </span>
          )}
        </div>
        <p className="text-sm text-[hsl(0_0%_42%)]">
          Your recommended allocation based on portfolio size, risk profile, and 3-cycle data.
        </p>
      </div>

      <div className="space-y-4">

        {/* Bear phase warning */}
        {isBearPhase && (
          <div
            className="rounded-2xl p-4 flex gap-3"
            style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
            <div>
              <p className="text-sm font-semibold text-white mb-1">Bear Market Phase — Deploy Gradually</p>
              <p className="text-xs text-[hsl(0_0%_55%)] leading-relaxed">{plan.bearPhaseNote}</p>
            </div>
          </div>
        )}

        {/* Target Allocation */}
        <Card>
          <SectionLabel>Target Allocation</SectionLabel>
          <AllocationBar segments={targetSegments} />
          <AllocationLegend segments={targetSegments} />
          <div
            className="mt-4 pt-4 flex items-start gap-2"
            style={{ borderTop: "1px solid hsl(0 0% 12%)" }}
          >
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[hsl(0_0%_38%)]" />
            <p className="text-xs text-[hsl(0_0%_48%)] leading-relaxed">{plan.rationale}</p>
          </div>
        </Card>

        {/* Cycle Projections */}
        {projectionBase > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>Cycle Projections — 2026 to 2029</SectionLabel>
              {goal && goalAssessment && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full mb-3 shrink-0"
                  style={{ background: `${goalAssessment.messageColor}14`, color: goalAssessment.messageColor }}
                >
                  {goal.label}
                </span>
              )}
            </div>

            {/* Goal target line */}
            {goal && (
              <div
                className="rounded-xl p-3 mb-4 flex items-center justify-between gap-3"
                style={{ background: "hsl(0 0% 9%)", border: "1px solid hsl(0 0% 15%)" }}
              >
                <div className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 shrink-0" style={{ color: "#F7931A" }} />
                  <div>
                    <p className="text-xs font-semibold text-white">Your goal: {goal.label}</p>
                    <p className="text-[10px] text-[hsl(0_0%_42%)]">{goal.description}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-white">{formatUSD(projectionBase * goal.multiple)}</p>
                  <p className="text-[10px] text-[hsl(0_0%_40%)]">target value</p>
                </div>
              </div>
            )}

            {/* Scenario rows */}
            <div className="space-y-3">
              {projectionValues.map(({ scenario, value, multiple }) => {
                const barPct = Math.min(100, (value / projectionMax) * 100);
                const goalTargetValue = goal ? projectionBase * goal.multiple : null;
                const goalBarPct = goalTargetValue ? Math.min(100, (goalTargetValue / projectionMax) * 100) : null;
                const achievesGoal = goalTargetValue !== null && value >= goalTargetValue;

                return (
                  <div key={scenario.key} className="rounded-xl p-3" style={{ background: "hsl(0 0% 9%)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: scenario.color }} />
                        <p className="text-xs font-semibold text-white">{scenario.label}</p>
                        {achievesGoal && goal && (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: `${scenario.color}18`, color: scenario.color }}
                          >
                            Goal achieved
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">{formatUSD(value)}</p>
                        <p className="text-[10px] text-[hsl(0_0%_40%)]">{multiple.toFixed(1)}x</p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 rounded-full relative overflow-hidden" style={{ background: "hsl(0 0% 14%)" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${barPct}%`, background: scenario.color, opacity: 0.75 }}
                      />
                      {/* Goal marker line */}
                      {goalBarPct !== null && (
                        <div
                          className="absolute top-0 bottom-0 w-px"
                          style={{ left: `${goalBarPct}%`, background: "rgba(255,255,255,0.4)" }}
                        />
                      )}
                    </div>
                    <p className="text-[10px] text-[hsl(0_0%_38%)] mt-1.5">{scenario.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Assessment */}
            {goalAssessment && (
              <div
                className="mt-4 pt-4 flex items-start gap-2"
                style={{ borderTop: "1px solid hsl(0 0% 12%)" }}
              >
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: goalAssessment.messageColor }} />
                <p className="text-xs leading-relaxed" style={{ color: goalAssessment.messageColor }}>
                  {goalAssessment.message}
                </p>
              </div>
            )}

            <p className="text-[10px] text-[hsl(0_0%_30%)] mt-3 leading-relaxed">
              Projections are based on {formatUSD(projectionBase)} current portfolio value applying historical per-asset cycle multipliers. Not financial advice — past cycles don't guarantee future results.
            </p>
          </Card>
        )}

        {/* Current vs Target */}
        {currentSegments.length > 0 && (
          <Card>
            <SectionLabel>Current vs Target</SectionLabel>
            <div className="space-y-4">
              <div>
                <p className="text-[11px] text-[hsl(0_0%_40%)] mb-1.5">Current — {formatUSD(totalLive)}</p>
                <AllocationBar segments={currentSegments} />
              </div>
              <div>
                <p className="text-[11px] text-[hsl(0_0%_40%)] mb-1.5">Target</p>
                <AllocationBar segments={targetSegments} />
              </div>
              {/* Gap table */}
              <div
                className="grid grid-cols-4 gap-2 pt-3"
                style={{ borderTop: "1px solid hsl(0 0% 12%)" }}
              >
                {[
                  { label: "BTC", current: currentBtcPct, target: plan.btcPct, color: ASSET_CONFIG.BTC.color },
                  { label: "ETH", current: currentEthPct, target: plan.ethPct, color: ASSET_CONFIG.ETH.color },
                  { label: "SOL", current: currentSolPct, target: plan.solPct, color: ASSET_CONFIG.SOL.color },
                  { label: "Alts", current: currentAltsPct, target: plan.altsPct, color: ASSET_CONFIG.ALTS.color },
                ].map(({ label, current, target, color }) => (
                  <div key={label} className="rounded-xl p-3" style={{ background: "hsl(0 0% 9%)" }}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
                      <p className="text-[10px] font-semibold text-[hsl(0_0%_50%)]">{label}</p>
                    </div>
                    <p className="text-sm font-semibold text-white">{current !== null ? `${current}%` : "—"}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: gapColor(current, target) }}>
                      {gap(current, target)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Rebalancing Calculator */}
        {rebalanceItems.length > 0 && (
          <Card>
            <SectionLabel>Rebalancing Calculator</SectionLabel>
            <p className="text-xs text-[hsl(0_0%_42%)] mb-4">
              Exact amounts to buy or sell to reach your target allocation based on live prices.
            </p>
            <div className="space-y-2">
              {rebalanceItems.map((item) => {
                const delta = item.targetValue - item.currentValue;
                const absDelta = Math.abs(delta);
                const action = Math.abs(delta) < item.targetValue * 0.02 ? "on-target" : delta > 0 ? "buy" : "sell";
                const qty = item.unitPrice > 0 ? absDelta / item.unitPrice : null;
                const actionColor = action === "on-target" ? "#10b981" : action === "buy" ? "#22c55e" : "#ef4444";

                return (
                  <div
                    key={item.label}
                    className="rounded-xl p-3 flex items-center gap-3"
                    style={{ background: "hsl(0 0% 9%)" }}
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white">{item.label}</p>
                      <p className="text-[10px] text-[hsl(0_0%_40%)]">
                        {formatUSD(item.currentValue)} now → {formatUSD(item.targetValue)} target ({item.targetPct}%)
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold" style={{ color: actionColor }}>
                        {action === "on-target" ? "On target" : `${action === "buy" ? "+" : "−"}${formatUSD(absDelta)}`}
                      </p>
                      {qty !== null && action !== "on-target" && (
                        <p className="text-[10px] text-[hsl(0_0%_40%)]">
                          ≈ {qty.toFixed(qty > 10 ? 1 : 4)} {item.symbol}
                        </p>
                      )}
                      {action !== "on-target" && item.label === "Top-25 Alts" && (
                        <p className="text-[10px] text-[hsl(0_0%_38%)]">across {plan.numAlts} alts</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-[hsl(0_0%_30%)] mt-3 leading-relaxed">
              On-target = within 2% of allocation target. {rebalancePricesLive ? "Amounts use live CoinGecko prices." : "Live prices loading — showing cost-basis estimates."} Execute rebalancing in tranches during normal trading hours.
            </p>
          </Card>
        )}

        {/* Foundation Layer */}
        <Card>
          <SectionLabel>Foundation Layer — BTC / ETH / SOL</SectionLabel>
          <div className="space-y-3">
            {[
              {
                symbol: "BTC",
                name: "Bitcoin",
                pct: plan.btcPct,
                color: "#F7931A",
                icon: Shield,
                role: "Anchor",
                desc: "The foundation of every portfolio at every tier. Lowest volatility in crypto, strongest floor support, institutional ETF adoption. BTC cycling from a bear bottom to a cycle peak is the trade — everything else builds on top of it.",
              },
              {
                symbol: "ETH",
                name: "Ethereum",
                pct: plan.ethPct,
                color: "#627EEA",
                icon: Layers,
                role: "Secondary Upside",
                desc: "ETF-approved, foundational smart contract infrastructure across 4 cycles. Historically outperforms BTC on a percentage basis in strong cycle phases. The L2 ecosystem and institutional DeFi expansion are structural tailwinds.",
              },
              {
                symbol: "SOL",
                name: "Solana",
                pct: plan.solPct,
                color: "#9945FF",
                icon: TrendingUp,
                role: "Asymmetric Upside",
                desc: "Higher beta than ETH — more volatile, higher ceiling in strong cycles. Proven itself in the 2024 run. Institutional interest growing, Visa and Franklin Templeton on-chain. The upside layer of the foundation.",
              },
            ].map(({ symbol, name, pct, color, icon: Icon, role, desc }) => (
              <div
                key={symbol}
                className="rounded-xl p-4"
                style={{ background: "hsl(0 0% 9%)", border: "1px solid hsl(0 0% 15%)" }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${color}18` }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{symbol}</p>
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ background: `${color}18`, color }}
                        >
                          {role}
                        </span>
                      </div>
                      <p className="text-[11px] text-[hsl(0_0%_42%)]">{name}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold" style={{ color }}>{pct}%</p>
                    <p className="text-[10px] text-[hsl(0_0%_40%)]">of portfolio</p>
                  </div>
                </div>
                <p className="text-xs text-[hsl(0_0%_52%)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Curated Alts Layer */}
        {plan.altsPct > 0 && alts.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <SectionLabel>Top-25 Alt Layer — {plan.altsPct}% Total</SectionLabel>
              <div className="flex items-center gap-1.5 mb-3">
                <Zap className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
                <span className="text-[11px] text-[hsl(0_0%_45%)]">
                  {alts.length} picks · {altEqualPct.toFixed(1)}% each
                </span>
              </div>
            </div>
            <div
              className="rounded-xl p-3 mb-4 flex gap-2"
              style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}
            >
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#10b981" }} />
              <p className="text-xs text-[hsl(0_0%_55%)] leading-relaxed">
                All picks are from the top 25 by market cap — a tier that has had zero busts across both tracked cycles (2018–2021 and 2022–2025). No meme coins. No narrative plays. Equal weighting across the {alts.length} picks keeps no single alt position outsized.
              </p>
            </div>
            <div className="space-y-3">
              {alts.map((alt) => (
                <AltCard key={alt.symbol} alt={alt} equalPct={altEqualPct} />
              ))}
            </div>
          </Card>
        )}

        {/* No alts note for conservative high tiers */}
        {plan.altsPct === 0 && (
          <Card>
            <SectionLabel>Top-25 Alt Layer</SectionLabel>
            <div className="flex gap-3 items-start">
              <Shield className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#F7931A" }} />
              <div>
                <p className="text-sm font-semibold text-white mb-1">No Alt Allocation at This Tier</p>
                <p className="text-xs text-[hsl(0_0%_50%)] leading-relaxed">
                  At your portfolio size and risk profile, BTC and ETH cycling from bear bottom to peak already produces substantial returns without the additional volatility of alt exposure. The foundation layer is your trade.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Rules footer */}
        <Card>
          <SectionLabel>Portfolio Rules</SectionLabel>
          <div className="space-y-2.5">
            {[
              { icon: ChevronRight, text: "No meme coins. No narrative plays. No coins below top 25 by market cap." },
              { icon: ChevronRight, text: "Foundation (BTC + ETH + SOL) always makes up the dominant majority of the portfolio." },
              { icon: ChevronRight, text: "Alt allocations are equally weighted — no single alt becomes an outsized position." },
              { icon: ChevronRight, text: "As portfolio grows, the BTC floor rises and alt exposure decreases — capital preservation matters more at scale." },
              { icon: ChevronRight, text: "Cycle phase determines deployment speed — never deploy 100% at once during a bear market." },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-2">
                <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#F7931A" }} />
                <p className="text-xs text-[hsl(0_0%_55%)] leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </PortalLayout>
  );
}
