import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMilestones, getBroadcasts, getPortfolioSnapshots,
  savePortfolioSnapshot, getHoldings,
} from "@/lib/localStore";
import type { Milestone, Broadcast, PortfolioSnapshot, HoldingAsset } from "@/lib/types";
import { usePrices } from "@/hooks/usePrices";
import { usePortfolioHistory, CHART_RANGES, type ChartRange } from "@/hooks/usePortfolioHistory";
import { EquityCurve } from "@/components/EquityCurve";
import { Sparkline } from "@/components/Sparkline";
import { CycleClock } from "@/components/CycleClock";
import { getCycleConfig } from "@/lib/cycleConfig";
import { getCyclePhase } from "@/lib/cyclePhase";
import type { EquityPoint } from "@/lib/priceHistory";
import { formatUSD, formatPct, MILESTONE_PCTS } from "@/lib/utils";
import PortalLayout from "@/components/layout/PortalLayout";
import {
  TrendingUp, TrendingDown, RefreshCw, X, Radio, ArrowRight, Compass, Quote, Award, AlertTriangle,
} from "lucide-react";

const OBJECTIVE_LABELS: Record<string, string> = {
  generational_wealth: "Generational wealth",
  financial_freedom: "Financial freedom",
  retirement: "Retirement",
  major_purchase: "A specific goal",
  income: "Income & growth",
};
import { Link } from "wouter";
import { PieChart, Pie, Cell } from "recharts";

// ── Asset colours ─────────────────────────────────────────────────────────────
const ASSET_COLORS: Record<string, string> = {
  bitcoin:  "#F7931A",
  ethereum: "#627EEA",
  solana:   "#9945FF",
  binancecoin: "#F0B90B",
  cardano:  "#0D3063",
  ripple:   "#346AA9",
};
function assetColor(id: string, idx: number) {
  return ASSET_COLORS[id] ?? ["#10b981","#06b6d4","#f59e0b","#ec4899","#8b5cf6"][idx % 5];
}

// ── Snapshot fallback → equity points (used when live history is unavailable) ──
function snapshotsToCurve(snaps: PortfolioSnapshot[], range: ChartRange): EquityPoint[] {
  let chosen = snaps;
  if (range !== "ALL" && range !== "1Y") {
    const days = range === "24H" ? 2 : range === "1W" ? 7 : range === "1M" ? 31 : 90;
    const cutoff = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    const filtered = snaps.filter((s) => s.date >= cutoff);
    chosen = filtered.length >= 2 ? filtered : snaps.slice(-2);
  }
  return chosen.map((s) => ({ t: new Date(s.date).getTime(), value: s.value }));
}

// ── Holdings row ──────────────────────────────────────────────────────────────
function HoldingRow({
  holding, price, change24h, allocation, colorHex, spark,
}: {
  holding: HoldingAsset;
  price: number | null;
  change24h: number | null;
  allocation: number;
  colorHex: string;
  spark?: number[];
}) {
  const currentValue = price != null ? holding.amount * price : null;
  const costBasis = holding.amount * holding.avg_cost;
  const pnl = currentValue != null ? currentValue - costBasis : null;
  const pnlPct = pnl != null && costBasis > 0 ? (pnl / costBasis) * 100 : null;
  const isUp = pnl !== null && pnl >= 0;
  const sparkUp = spark && spark.length >= 2 ? spark[spark.length - 1] >= spark[0] : true;
  const sparkColor = sparkUp ? "#22c55e" : "#ef4444";

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors cursor-pointer bg-[hsl(0_0%_7%)] border border-[hsl(0_0%_11%)] hover:bg-[hsl(0_0%_9%)] hover:border-[hsl(0_0%_18%)]">
      {/* Asset icon */}
      <div
        className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
        style={{ background: `${colorHex}18`, color: colorHex, border: `1px solid ${colorHex}30` }}
      >
        {holding.symbol.slice(0, 3)}
      </div>

      {/* Name + allocation bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold text-white">{holding.name}</span>
          <span className="text-xs text-[hsl(0_0%_40%)] flex-shrink-0">
            {holding.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} {holding.symbol}
          </span>
        </div>
        {/* Allocation bar */}
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full" style={{ background: "hsl(0 0% 13%)" }}>
            <div
              className="h-1 rounded-full transition-all duration-700"
              style={{ width: `${allocation}%`, background: colorHex }}
            />
          </div>
          <span className="text-[10px] text-[hsl(0_0%_38%)] w-8 text-right flex-shrink-0">
            {allocation.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Sparkline */}
      {spark && spark.length >= 2 && (
        <div className="flex-shrink-0 hidden sm:block">
          <Sparkline points={spark} color={sparkColor} />
        </div>
      )}

      {/* Value + P&L */}
      <div className="flex-shrink-0 text-right min-w-[92px]">
        <p className="text-sm font-semibold text-white">
          {currentValue != null ? formatUSD(currentValue) : price != null ? formatUSD(price) : "—"}
        </p>
        <p
          className="text-xs font-medium mt-0.5"
          style={{ color: pnlPct === null ? "hsl(0 0% 40%)" : isUp ? "#22c55e" : "#ef4444" }}
        >
          {pnl != null && pnlPct != null ? formatPct(pnlPct) : "—"}
          {change24h != null && (
            <span className="text-[hsl(0_0%_38%)] font-normal ml-1.5 hidden md:inline">
              · {change24h >= 0 ? "+" : ""}{change24h.toFixed(1)}% 24h
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PortalIndex() {
  const { clientProfile, user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [range, setRange] = useState<ChartRange>("1M");
  const [phaseChanged, setPhaseChanged] = useState<boolean>(false);

  function dismissBroadcast(id: string) {
    setDismissedIds((prev) => {
      const next = new Set([...prev, id]);
      if (user) {
        try { localStorage.setItem(`broadcast-dismissed-${user.id}`, JSON.stringify([...next])); } catch {}
      }
      return next;
    });
  }

  useEffect(() => {
    document.title = "Portfolio — Bitcoin Daily";
    return () => { document.title = "Bitcoin Daily"; };
  }, []);

  useEffect(() => {
    if (user) {
      setMilestones(getMilestones(user.id));
      setBroadcasts(getBroadcasts());
      setSnapshots(getPortfolioSnapshots(user.id));
      try {
        const raw = localStorage.getItem(`broadcast-dismissed-${user.id}`);
        if (raw) setDismissedIds(new Set(JSON.parse(raw)));
      } catch {}
    }
  }, [user]);

  const holdings = useMemo(() => (user ? getHoldings(user.id) : []), [user]);
  const coinIds = useMemo(() => holdings.map((h) => h.coingecko_id), [holdings]);
  const allCoinIds = useMemo(
    () => (coinIds.includes("bitcoin") ? coinIds : ["bitcoin", ...coinIds]),
    [coinIds]
  );

  const { prices, changes24h, loading: pricesLoading } = usePrices(allCoinIds);

  const totalCostBasis = useMemo(
    () => holdings.reduce((s, h) => s + h.amount * h.avg_cost, 0),
    [holdings]
  );

  // Only a live feed price or an explicit manual price counts as "current" —
  // never fall back to avg_cost (cost basis), which would silently distort the
  // live valuation during a price-feed outage.
  const pricedHoldings = useMemo(
    () => holdings.filter((h) => (prices[h.coingecko_id] ?? h.manual_price) != null),
    [holdings, prices]
  );

  const totalCurrentValue = useMemo(() => {
    if (pricedHoldings.length === 0) return null;
    return pricedHoldings.reduce(
      (s, h) => s + h.amount * (prices[h.coingecko_id] ?? h.manual_price)!,
      0
    );
  }, [pricedHoldings, prices]);

  // Compare against the cost basis of the same priced subset so gain/loss is
  // like-for-like even if a coin is temporarily unpriced.
  const pricedCostBasis = useMemo(
    () => pricedHoldings.reduce((s, h) => s + h.amount * h.avg_cost, 0),
    [pricedHoldings]
  );

  const gainLoss = totalCurrentValue !== null ? totalCurrentValue - pricedCostBasis : null;
  const returnPct = pricedCostBasis > 0 && gainLoss !== null ? (gainLoss / pricedCostBasis) * 100 : null;
  const isPositive = gainLoss !== null && gainLoss >= 0;
  const initialValue = clientProfile?.initial_portfolio_value ?? 0;
  const hasHoldings = holdings.length > 0;
  // Some holdings have no live price after the feed settled → values are stale/partial.
  const pricesDelayed = !pricesLoading && hasHoldings && pricedHoldings.length < holdings.length;

  const btcPrice = prices["bitcoin"] ?? null;
  const btcChange24h = changes24h["bitcoin"] ?? null;

  // Live cycle position → the one move for right now
  const cycleConfig = useMemo(() => getCycleConfig(), []);
  const cycleDrawdown = btcPrice ? ((btcPrice - cycleConfig.peakPrice) / cycleConfig.peakPrice) * 100 : null;
  const phase = useMemo(
    () => getCyclePhase(cycleDrawdown, {
      peakTime: new Date(cycleConfig.peakDateISO).getTime(),
      buyZoneTime: new Date(cycleConfig.buyZoneDateISO).getTime(),
    }),
    [cycleDrawdown, cycleConfig.peakDateISO, cycleConfig.buyZoneDateISO]
  );
  const daysToBuyZone = Math.ceil((new Date(cycleConfig.buyZoneDateISO).getTime() - Date.now()) / 86400000);

  // "The product reaches out": flag when the cycle phase has shifted since the
  // client last looked. Only act once the live price has settled so we don't
  // fire on the loading fallback. (Server-side email/Discord push is separate.)
  useEffect(() => {
    if (!user || cycleDrawdown === null) return;
    const key = `ct-phase-seen-${user.id}`;
    const prev = localStorage.getItem(key);
    if (prev && prev !== String(phase.id)) setPhaseChanged(true);
    localStorage.setItem(key, String(phase.id));
  }, [user, cycleDrawdown, phase.id]);

  useEffect(() => {
    if (user && totalCurrentValue !== null && totalCurrentValue > 0) {
      savePortfolioSnapshot(user.id, totalCurrentValue);
      setSnapshots(getPortfolioSnapshots(user.id));
    }
  }, [user, totalCurrentValue]);

  const nextMilestone = MILESTONE_PCTS.find((pct) => {
    const milestone = milestones.find((m) => m.milestone_pct === pct);
    return !milestone?.hit;
  });
  const nextMilestoneValue = nextMilestone && initialValue ? initialValue * (1 + nextMilestone / 100) : null;

  const visibleBroadcasts = useMemo(
    () => broadcasts.filter((b) => !dismissedIds.has(b.id)).slice(0, 3),
    [broadcasts, dismissedIds]
  );

  // Live reconstructed equity curve from each holding's price history; falls
  // back to saved portfolio snapshots when history is unavailable.
  const { points: historyPoints, perCoin, loading: historyLoading } = usePortfolioHistory(
    holdings, range, totalCurrentValue
  );
  const curve = useMemo<EquityPoint[]>(
    () => (historyPoints.length >= 2 ? historyPoints : snapshotsToCurve(snapshots, range)),
    [historyPoints, snapshots, range]
  );
  const curveUp = curve.length >= 2 ? curve[curve.length - 1].value >= curve[0].value : true;
  const curveColor = curveUp ? "#22c55e" : "#ef4444";
  const periodChange = curve.length >= 2 ? curve[curve.length - 1].value - curve[0].value : null;
  const periodChangePct =
    periodChange !== null && curve[0].value > 0 ? (periodChange / curve[0].value) * 100 : null;

  // Per-coin sparkline series (downsampled to ~32 points)
  const sparkById = useMemo(() => {
    const out: Record<string, number[]> = {};
    for (const [id, series] of Object.entries(perCoin)) {
      if (series.length < 2) continue;
      const step = Math.max(1, Math.floor(series.length / 32));
      out[id] = series.filter((_, i) => i % step === 0).map((p) => p.price);
    }
    return out;
  }, [perCoin]);

  // Holdings allocation %
  const holdingsWithAlloc = useMemo(() => {
    const total = totalCurrentValue ?? totalCostBasis;
    return holdings.map((h, i) => {
      const val = h.amount * (prices[h.coingecko_id] ?? h.manual_price ?? h.avg_cost);
      const alloc = total > 0 ? (val / total) * 100 : 0;
      return { holding: h, alloc, colorHex: assetColor(h.coingecko_id, i) };
    });
  }, [holdings, prices, totalCurrentValue, totalCostBasis]);

  // Donut data
  const donutData = useMemo(
    () => holdingsWithAlloc.map(({ holding, alloc, colorHex }) => ({
      name: holding.symbol, value: Math.round(alloc * 10) / 10, color: colorHex,
    })),
    [holdingsWithAlloc]
  );

  // Best / worst performer (all-time return)
  const performers = useMemo(() => {
    const withPnl = holdings
      .map((h, i) => {
        const price = prices[h.coingecko_id] ?? h.manual_price ?? null;
        const cost = h.amount * h.avg_cost;
        const cur = price != null ? h.amount * price : null;
        const pct = cur != null && cost > 0 ? ((cur - cost) / cost) * 100 : null;
        return pct == null ? null : { holding: h, pct, colorHex: assetColor(h.coingecko_id, i) };
      })
      .filter(Boolean) as { holding: HoldingAsset; pct: number; colorHex: string }[];
    if (withPnl.length < 2) return null;
    return {
      best: withPnl.reduce((a, b) => (b.pct > a.pct ? b : a)),
      worst: withPnl.reduce((a, b) => (b.pct < a.pct ? b : a)),
    };
  }, [holdings, prices]);

  return (
    <PortalLayout>
      <div className="mb-6">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl font-semibold text-white">Portfolio</h1>
          {pricesDelayed && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}
              title="Live prices unavailable for some assets — values shown exclude them and may be delayed."
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#f59e0b" }} />
              Prices delayed
            </span>
          )}
        </div>
        <p className="text-sm text-[hsl(0_0%_45%)] mt-0.5">
          Welcome back, {clientProfile?.full_name?.split(" ")[0] || "there"}
        </p>
      </div>

      {/* Today / your next move — the cycle position drives the one action */}
      <Link href="/portal/thesis" className="block mb-4">
        <div
          className="rounded-2xl p-5 flex items-center gap-5 transition-colors hover:border-[hsl(0_0%_20%)]"
          style={{ background: "linear-gradient(180deg, hsl(0 0% 8.5%), hsl(0 0% 6.5%))", border: "1px solid hsl(0 0% 12%)" }}
        >
          <div className="shrink-0">
            <CycleClock phaseId={phase.id} size={116} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-[hsl(0_0%_45%)] mb-1">Where we are · your next move</p>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: phase.color }} />
              <h2 className="text-lg font-semibold text-white">{phase.label}</h2>
            </div>
            <p className="text-sm text-[hsl(0_0%_60%)] leading-relaxed">{phase.action}</p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {daysToBuyZone > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}>
                  Buy window opens in ~{daysToBuyZone} days
                </span>
              )}
              <span className="text-xs font-medium text-[hsl(0_0%_42%)] inline-flex items-center gap-1">
                See the 4-year cycle &amp; the proof <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Phase-change alert — the product proactively flags a cycle shift */}
      {phaseChanged && (
        <div className="rounded-2xl p-4 mb-4 flex items-start gap-3" style={{ background: `${phase.color}12`, border: `1px solid ${phase.color}40` }}>
          <span className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ background: phase.color }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">The cycle has shifted to {phase.label}</p>
            <p className="text-xs text-[hsl(0_0%_55%)] mt-0.5 leading-relaxed">{phase.action}</p>
          </div>
          <button onClick={() => setPhaseChanged(false)} className="shrink-0 text-[hsl(0_0%_35%)] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Personal focus + note from the team */}
      {(clientProfile?.primary_objective || clientProfile?.team_note) && (
        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          {clientProfile?.primary_objective && (() => {
            const target = parseFloat(String(clientProfile.goal_moderate ?? clientProfile.investment_goal ?? "")) || 0;
            const towardValue = totalCurrentValue ?? (initialValue > 0 ? initialValue : null);
            const progress = towardValue && target > 0 ? Math.min(100, (towardValue / target) * 100) : null;
            return (
              <div className="rounded-2xl p-4" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Compass className="w-4 h-4" style={{ color: "#F7931A" }} />
                  <p className="text-xs uppercase tracking-wide text-[hsl(0_0%_45%)]">Your focus</p>
                </div>
                <p className="text-sm font-semibold text-white">{OBJECTIVE_LABELS[clientProfile.primary_objective] ?? "Your goal"}</p>
                {clientProfile.objective_detail && (
                  <p className="text-xs text-[hsl(0_0%_50%)] mt-0.5 italic">"{clientProfile.objective_detail}"</p>
                )}
                {progress !== null && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[hsl(0_0%_45%)]">Toward {formatUSD(target)} target</span>
                      <span className="font-semibold" style={{ color: "#F7931A" }}>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(0 0% 12%)" }}>
                      <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "#F7931A" }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
          {clientProfile?.team_note && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(247,147,26,0.05)", border: "1px solid rgba(247,147,26,0.18)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Quote className="w-4 h-4" style={{ color: "#F7931A" }} />
                <p className="text-xs uppercase tracking-wide text-[hsl(0_0%_45%)]">A note from your team</p>
              </div>
              <p className="text-sm text-[hsl(0_0%_72%)] leading-relaxed">{clientProfile.team_note}</p>
            </div>
          )}
        </div>
      )}

      {/* Broadcasts */}
      {visibleBroadcasts.map((b) => (
        <div
          key={b.id}
          className="rounded-2xl p-4 mb-4 flex items-start gap-3"
          style={{ background: "rgba(247,147,26,0.06)", border: "1px solid rgba(247,147,26,0.18)" }}
        >
          <Radio className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#F7931A" }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {b.phase_tag && (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: "rgba(247,147,26,0.12)", color: "#F7931A" }}
                >
                  {b.phase_tag}
                </span>
              )}
              <p className="text-sm font-semibold text-white">{b.title}</p>
            </div>
            <p className="text-xs text-[hsl(0_0%_50%)] leading-relaxed line-clamp-2">{b.content}</p>
          </div>
          <button
            onClick={() => dismissBroadcast(b.id)}
            className="shrink-0 text-[hsl(0_0%_35%)] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      {/* Empty state */}
      {!hasHoldings && (
        <div
          className="rounded-2xl p-10 mb-6 flex flex-col items-center text-center"
          style={{ background: "hsl(0 0% 7%)", border: "1px dashed hsl(0 0% 18%)" }}
        >
          <p className="text-sm font-semibold text-white mb-1">No holdings on record yet</p>
          <p className="text-xs text-[hsl(0_0%_45%)] mb-5 max-w-xs leading-relaxed">
            Add your assets in Settings to see live P&L, cycle projections, and milestone tracking.
          </p>
          <Link
            href="/portal/settings"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ background: "#F7931A", color: "#0A0A0A" }}
          >
            Add holdings <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {hasHoldings && (
        <>
          {/* ── Hero: balance + equity curve + range tabs (Delta-style) ─────── */}
          <div
            className="rounded-2xl p-5 sm:p-6 mb-4"
            style={{ background: "linear-gradient(180deg, hsl(0 0% 8.5%), hsl(0 0% 6.5%))", border: "1px solid hsl(0 0% 12%)" }}
          >
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs text-[hsl(0_0%_45%)] uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  Total balance
                  {(pricesLoading || historyLoading) && !totalCurrentValue && (
                    <RefreshCw className="w-3 h-3 animate-spin" style={{ color: "#F7931A" }} />
                  )}
                </p>
                <p className="text-4xl sm:text-5xl font-bold tracking-tight text-white" data-testid="stat-portfolio-value">
                  {totalCurrentValue != null ? formatUSD(totalCurrentValue) : pricesLoading ? "Loading…" : "—"}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {periodChange !== null ? (
                    <span
                      className="inline-flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-lg"
                      style={{ background: curveUp ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: curveUp ? "#22c55e" : "#ef4444" }}
                    >
                      {curveUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {curveUp ? "+" : ""}{formatUSD(periodChange)}
                      {periodChangePct !== null && ` (${periodChangePct >= 0 ? "+" : ""}${periodChangePct.toFixed(2)}%)`}
                    </span>
                  ) : (
                    <span className="text-xs text-[hsl(0_0%_42%)]">{holdings.length} asset{holdings.length !== 1 ? "s" : ""}</span>
                  )}
                  <span className="text-xs text-[hsl(0_0%_38%)]">
                    {range === "ALL" ? "all time" : range === "24H" ? "past 24h" : `past ${range}`}
                  </span>
                </div>
              </div>

              {returnPct !== null && (
                <div className="text-right">
                  <p className="text-[10px] text-[hsl(0_0%_42%)] uppercase tracking-wide">All-time return</p>
                  <p className="text-xl font-bold" style={{ color: isPositive ? "#22c55e" : "#ef4444" }} data-testid="return-card">{formatPct(returnPct)}</p>
                  <p className="text-[11px] text-[hsl(0_0%_45%)]">{isPositive ? "+" : ""}{formatUSD(gainLoss!)}</p>
                </div>
              )}
            </div>

            {/* Equity curve */}
            <div className="-mx-1.5 mt-4">
              {curve.length >= 2 ? (
                <EquityCurve data={curve} color={curveColor} height={210} />
              ) : (
                <div className="h-[200px] flex items-center justify-center text-xs text-[hsl(0_0%_35%)]">
                  Building your equity curve…
                </div>
              )}
            </div>

            {/* Range tabs */}
            <div className="flex items-center justify-center gap-1 mt-1">
              {CHART_RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  data-testid={`range-${r}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={range === r ? { background: "rgba(247,147,26,0.12)", color: "#F7931A" } : { color: "hsl(0 0% 42%)" }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* ── Stat strip ──────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Invested", value: formatUSD(totalCostBasis), sub: "cost basis" },
              {
                label: "Unrealised P&L",
                value: gainLoss != null ? `${gainLoss >= 0 ? "+" : ""}${formatUSD(gainLoss)}` : "—",
                sub: returnPct != null ? `${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(2)}%` : undefined,
                color: gainLoss != null ? (gainLoss >= 0 ? "#22c55e" : "#ef4444") : undefined,
              },
              { label: "Holdings", value: String(holdings.length), sub: holdings.length === 1 ? "asset" : "assets" },
              {
                label: "BTC",
                value: btcPrice ? formatUSD(btcPrice) : "—",
                sub: btcChange24h != null ? `${btcChange24h >= 0 ? "+" : ""}${btcChange24h.toFixed(1)}% 24h` : "live",
                color: btcChange24h != null ? (btcChange24h >= 0 ? "#22c55e" : "#ef4444") : "#F7931A",
              },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-4" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 11%)" }}>
                <p className="text-[10px] text-[hsl(0_0%_40%)] uppercase tracking-wide mb-1">{s.label}</p>
                <p className="text-base font-semibold" style={{ color: s.color ?? "white" }}>{s.value}</p>
                {s.sub && <p className="text-[10px] text-[hsl(0_0%_38%)] mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>

          {/* ── Best / worst performer ──────────────────────────────────────── */}
          {performers && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Best performer", p: performers.best, icon: Award },
                { label: "Needs attention", p: performers.worst, icon: AlertTriangle },
              ].map(({ label, p, icon: Icon }) => (
                <div key={label} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 11%)" }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: `${p.colorHex}18`, color: p.colorHex }}>
                    {p.holding.symbol.slice(0, 3)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-[hsl(0_0%_40%)] uppercase tracking-wide flex items-center gap-1">
                      <Icon className="w-3 h-3" style={{ color: p.pct >= 0 ? "#22c55e" : "#ef4444" }} />{label}
                    </p>
                    <p className="text-sm font-semibold text-white truncate">{p.holding.name}</p>
                  </div>
                  <p className="text-sm font-bold shrink-0" style={{ color: p.pct >= 0 ? "#22c55e" : "#ef4444" }}>{formatPct(p.pct)}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Holdings breakdown ──────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-5 mb-4"
            style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 11%)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[hsl(0_0%_42%)] uppercase tracking-wide">Holdings</p>
              <div className="flex items-center gap-6 text-[10px] text-[hsl(0_0%_35%)] hidden sm:flex">
                <span>Trend</span>
                <span className="w-[92px] text-right">Value / Return</span>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              {/* Holdings list */}
              <div className="flex-1 flex flex-col gap-2">
                {holdingsWithAlloc.map(({ holding, alloc, colorHex }) => (
                  <Link key={holding.coingecko_id} href={`/portal/asset/${holding.coingecko_id}`} className="block">
                    <HoldingRow
                      holding={holding}
                      price={prices[holding.coingecko_id] ?? holding.manual_price ?? null}
                      change24h={changes24h[holding.coingecko_id] ?? null}
                      allocation={alloc}
                      colorHex={colorHex}
                      spark={sparkById[holding.coingecko_id]}
                    />
                  </Link>
                ))}
              </div>

              {/* Allocation donut */}
              {donutData.length > 0 && (
                <div className="flex-shrink-0 hidden md:flex flex-col items-center">
                  <PieChart width={120} height={120}>
                    <Pie
                      data={donutData}
                      cx={55}
                      cy={55}
                      innerRadius={34}
                      outerRadius={52}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {donutData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                  <div className="flex flex-col gap-1 mt-1 w-full">
                    {donutData.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-[hsl(0_0%_45%)]">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span>{d.name}</span>
                        <span className="ml-auto text-[hsl(0_0%_55%)] font-medium">{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* P&L summary footer */}
            {gainLoss !== null && (
              <div
                className="mt-4 pt-4 flex items-center justify-between"
                style={{ borderTop: "1px solid hsl(0 0% 11%)" }}
              >
                <p className="text-xs text-[hsl(0_0%_40%)]">Total unrealised gain / loss</p>
                <p
                  className="text-sm font-semibold"
                  style={{ color: isPositive ? "#22c55e" : "#ef4444" }}
                >
                  {isPositive ? "+" : ""}{formatUSD(gainLoss)}
                  {returnPct !== null && (
                    <span className="text-xs font-normal ml-1.5 text-[hsl(0_0%_40%)]">
                      ({formatPct(returnPct)})
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* ── Next milestone ──────────────────────────────────────────────── */}
          {nextMilestone && nextMilestoneValue && (
            <div
              className="rounded-2xl p-5"
              style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 11%)" }}
              data-testid="next-milestone-card"
            >
              <p className="text-xs text-[hsl(0_0%_42%)] uppercase tracking-wide mb-3">Next Milestone</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{nextMilestone}% Return</p>
                  <p className="text-sm text-[hsl(0_0%_50%)] mt-0.5">Target: {formatUSD(nextMilestoneValue)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[hsl(0_0%_45%)]">Still needed</p>
                  <p className="text-base font-semibold mt-0.5" style={{ color: "#F7931A" }}>
                    {totalCurrentValue !== null && nextMilestoneValue
                      ? formatUSD(Math.max(0, nextMilestoneValue - totalCurrentValue))
                      : "—"}
                  </p>
                </div>
              </div>
              {totalCurrentValue !== null && nextMilestoneValue && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-[hsl(0_0%_45%)] mb-1.5">
                    <span>{formatUSD(totalCurrentValue)}</span>
                    <span>{formatUSD(nextMilestoneValue)}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "hsl(0 0% 13%)" }}>
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (totalCurrentValue / nextMilestoneValue) * 100)}%`,
                        background: "#F7931A",
                      }}
                    />
                  </div>
                </div>
              )}
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid hsl(0 0% 12%)" }}>
                <Link
                  href="/portal/milestones"
                  className="text-xs font-semibold flex items-center gap-1 transition-opacity hover:opacity-70"
                  style={{ color: "#F7931A" }}
                >
                  View all milestones <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </PortalLayout>
  );
}
