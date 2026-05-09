import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMilestones, getBroadcasts, getPortfolioSnapshots,
  savePortfolioSnapshot, getHoldings,
} from "@/lib/localStore";
import type { Milestone, Broadcast, PortfolioSnapshot } from "@/lib/types";
import { usePrices } from "@/hooks/usePrices";
import { formatUSD, formatPct, MILESTONE_PCTS } from "@/lib/utils";
import PortalLayout from "@/components/layout/PortalLayout";
import { TrendingUp, TrendingDown, RefreshCw, Bitcoin, X, Radio, ArrowRight } from "lucide-react";
import { Link } from "wouter";

function StatCard({
  label, value, sub, valueColor,
}: { label: string; value: string; sub?: string; valueColor?: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
      <p className="text-xs text-[hsl(0_0%_45%)] uppercase tracking-wide mb-2">{label}</p>
      <p
        className="text-2xl font-semibold tracking-tight"
        style={{ color: valueColor ?? "white" }}
        data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-[hsl(0_0%_45%)] mt-1">{sub}</p>}
    </div>
  );
}

function Sparkline({ snapshots }: { snapshots: PortfolioSnapshot[] }) {
  const W = 280;
  const H = 56;
  if (snapshots.length === 1) {
    const midY = H / 2;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 56 }}>
        <line x1="0" y1={midY} x2={W} y2={midY} stroke="hsl(0 0% 25%)" strokeWidth="1.5" strokeDasharray="4 4" />
        <circle cx={W} cy={midY} r="3" fill="hsl(0 0% 40%)" />
      </svg>
    );
  }
  const values = snapshots.map((s) => s.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - ((v - min) / range) * H * 0.85 - H * 0.075;
    return `${x},${y}`;
  });
  const isUp = values[values.length - 1] >= values[0];
  const color = isUp ? "#10b981" : "#ef4444";
  const polyline = pts.join(" ");
  const last = pts[pts.length - 1].split(",");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 56 }}>
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
    </svg>
  );
}

export default function PortalIndex() {
  const { clientProfile, user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

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
    document.title = "Portfolio — CryptoTrackr";
    return () => { document.title = "CryptoTrackr"; };
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

  // ── Multi-asset portfolio ───────────────────────────────────────────────────
  const holdings = useMemo(() => (user ? getHoldings(user.id) : []), [user]);
  const coinIds = useMemo(() => holdings.map((h) => h.coingecko_id), [holdings]);

  // Always include bitcoin so we can show its live price regardless of holdings
  const allCoinIds = useMemo(() => {
    return coinIds.includes("bitcoin") ? coinIds : ["bitcoin", ...coinIds];
  }, [coinIds]);

  const { prices, changes24h, loading: pricesLoading } = usePrices(allCoinIds);

  const totalCostBasis = useMemo(
    () => holdings.reduce((s, h) => s + h.amount * h.avg_cost, 0),
    [holdings]
  );

  const totalCurrentValue = useMemo(() => {
    if (holdings.length === 0) return null;
    const hasSomePrices = holdings.some((h) => prices[h.coingecko_id] != null);
    if (!hasSomePrices) return null;
    return holdings.reduce((s, h) => s + h.amount * (prices[h.coingecko_id] ?? h.avg_cost), 0);
  }, [holdings, prices]);

  const gainLoss = totalCurrentValue !== null ? totalCurrentValue - totalCostBasis : null;
  const returnPct = totalCostBasis > 0 && gainLoss !== null ? (gainLoss / totalCostBasis) * 100 : null;
  const isPositive = gainLoss !== null && gainLoss >= 0;
  const initialValue = clientProfile?.initial_portfolio_value ?? 0;
  const hasHoldings = holdings.length > 0;

  // BTC live price + 24h change
  const btcPrice = prices["bitcoin"] ?? null;
  const btcChange24h = changes24h["bitcoin"] ?? null;

  // ── Save daily snapshot using total portfolio value ─────────────────────────
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

  // Show all undismissed broadcasts — no time cutoff
  const visibleBroadcasts = useMemo(
    () => broadcasts.filter((b) => !dismissedIds.has(b.id)).slice(0, 3),
    [broadcasts, dismissedIds]
  );

  const portfolioChange =
    snapshots.length >= 2
      ? snapshots[snapshots.length - 1].value - snapshots[0].value
      : null;
  const portfolioChangePct =
    portfolioChange !== null && snapshots[0].value > 0
      ? (portfolioChange / snapshots[0].value) * 100
      : null;

  return (
    <PortalLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Portfolio Overview</h1>
        <p className="text-sm text-[hsl(0_0%_45%)] mt-1">
          Welcome back, {clientProfile?.full_name?.split(" ")[0] || "there"}
        </p>
      </div>

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

      {/* BTC price strip */}
      <div
        className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl w-fit"
        style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
        data-testid="btc-price-strip"
      >
        <Bitcoin className="w-4 h-4" style={{ color: "#F7931A" }} />
        {pricesLoading && !btcPrice ? (
          <span className="text-sm text-[hsl(0_0%_50%)] flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 animate-spin" /> Fetching price...
          </span>
        ) : (
          <span className="text-sm font-medium text-white">
            BTC <span style={{ color: "#F7931A" }}>{btcPrice ? formatUSD(btcPrice) : "—"}</span>
          </span>
        )}
        {btcChange24h !== null && (
          <span
            className="text-xs font-semibold"
            style={{ color: btcChange24h >= 0 ? "#10b981" : "#ef4444" }}
          >
            {btcChange24h >= 0 ? "+" : ""}{btcChange24h.toFixed(2)}%
          </span>
        )}
        <span className="text-xs text-[hsl(0_0%_35%)]">Live</span>
      </div>

      {/* Empty state — no holdings */}
      {!hasHoldings && (
        <div
          className="rounded-2xl p-10 mb-6 flex flex-col items-center text-center"
          style={{ background: "hsl(0 0% 7%)", border: "1px dashed hsl(0 0% 18%)" }}
        >
          <p className="text-sm font-semibold text-white mb-1">No holdings on record yet</p>
          <p className="text-xs text-[hsl(0_0%_45%)] mb-5 max-w-xs leading-relaxed">
            Add your assets in Settings to see live P&L, cycle projections, and milestone tracking.
          </p>
          <Link href="/portal/settings">
            <a
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: "#F7931A", color: "#0A0A0A" }}
            >
              Add holdings <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </Link>
        </div>
      )}

      {/* Stats grid */}
      {hasHoldings && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard
              label="Portfolio Value"
              value={
                totalCurrentValue != null
                  ? formatUSD(totalCurrentValue)
                  : pricesLoading
                  ? "Loading…"
                  : "—"
              }
              sub={`${holdings.length} asset${holdings.length !== 1 ? "s" : ""}`}
              valueColor="#F7931A"
            />
            <StatCard
              label="Total Invested"
              value={formatUSD(totalCostBasis)}
              sub="at cost basis"
            />
            <StatCard
              label="Total Return"
              value={returnPct !== null ? formatPct(returnPct) : "—"}
              sub={
                gainLoss !== null
                  ? `${isPositive ? "+" : ""}${formatUSD(gainLoss)}`
                  : undefined
              }
              valueColor={returnPct !== null ? (isPositive ? "#22c55e" : "#ef4444") : undefined}
            />
            <StatCard
              label="BTC Price"
              value={btcPrice ? formatUSD(btcPrice) : "—"}
              sub={
                btcChange24h !== null
                  ? `${btcChange24h >= 0 ? "+" : ""}${btcChange24h.toFixed(2)}% (24h)`
                  : "Live"
              }
              valueColor={
                btcChange24h !== null
                  ? (btcChange24h >= 0 ? "#22c55e" : "#ef4444")
                  : "#F7931A"
              }
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
                <p
                  className="text-sm font-medium"
                  style={{ color: isPositive ? "#22c55e" : "#ef4444" }}
                >
                  {formatPct(returnPct)} return across all holdings
                </p>
                <p className="text-xs text-[hsl(0_0%_45%)] mt-0.5">
                  {isPositive ? "Gain" : "Loss"} of {formatUSD(Math.abs(gainLoss!))} since your entry
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Portfolio history sparkline */}
      {snapshots.length >= 1 && (
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[hsl(0_0%_45%)] uppercase tracking-wide">
              Portfolio history ({snapshots.length} snapshot{snapshots.length !== 1 ? "s" : ""})
            </p>
            {portfolioChangePct !== null ? (
              <span
                className="text-xs font-semibold"
                style={{ color: portfolioChangePct >= 0 ? "#10b981" : "#ef4444" }}
              >
                {portfolioChangePct >= 0 ? "+" : ""}
                {portfolioChangePct.toFixed(1)}% over period
              </span>
            ) : (
              <span className="text-xs text-[hsl(0_0%_35%)]">First data point captured</span>
            )}
          </div>
          <Sparkline snapshots={snapshots} />
          <div className="flex justify-between text-[10px] text-[hsl(0_0%_30%)] mt-2">
            <span>{snapshots[0]?.date}</span>
            {snapshots.length > 1 && <span>{snapshots[snapshots.length - 1]?.date}</span>}
          </div>
        </div>
      )}

      {/* Next milestone */}
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
        </div>
      )}
    </PortalLayout>
  );
}
