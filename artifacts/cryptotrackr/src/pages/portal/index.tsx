import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMilestones, getBroadcasts, getPortfolioSnapshots,
  savePortfolioSnapshot, getHoldings,
} from "@/lib/localStore";
import type { Milestone, Broadcast, PortfolioSnapshot, HoldingAsset } from "@/lib/types";
import { usePrices } from "@/hooks/usePrices";
import { formatUSD, formatPct, MILESTONE_PCTS } from "@/lib/utils";
import PortalLayout from "@/components/layout/PortalLayout";
import {
  TrendingUp, TrendingDown, RefreshCw, Bitcoin, X, Radio, ArrowRight,
} from "lucide-react";
import { Link } from "wouter";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

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

// ── Time-range filter ─────────────────────────────────────────────────────────
type Range = "1M" | "3M" | "ALL";
function filterSnapshots(snaps: PortfolioSnapshot[], range: Range): PortfolioSnapshot[] {
  if (range === "ALL") return snaps;
  const days = range === "1M" ? 30 : 90;
  const cutoff = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const filtered = snaps.filter((s) => s.date >= cutoff);
  return filtered.length >= 2 ? filtered : snaps.slice(-2);
}

// ── Custom chart tooltip ──────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: { value: number }[]; label?: string;
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const date = label ? new Date(label).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
  return (
    <div
      className="rounded-xl px-3 py-2 text-sm shadow-xl"
      style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <p className="text-[hsl(0_0%_45%)] text-xs mb-0.5">{date}</p>
      <p className="text-white font-semibold">{formatUSD(val)}</p>
    </div>
  );
}

// ── Holdings row ──────────────────────────────────────────────────────────────
function HoldingRow({
  holding, price, change24h, allocation, colorHex,
}: {
  holding: HoldingAsset;
  price: number | null;
  change24h: number | null;
  allocation: number;
  colorHex: string;
}) {
  const currentValue = price != null ? holding.amount * price : null;
  const costBasis = holding.amount * holding.avg_cost;
  const pnl = currentValue != null ? currentValue - costBasis : null;
  const pnlPct = pnl != null && costBasis > 0 ? (pnl / costBasis) * 100 : null;
  const isUp = pnl !== null && pnl >= 0;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors"
      style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 11%)" }}
    >
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

      {/* Prices + P&L */}
      <div className="flex-shrink-0 text-right min-w-[90px]">
        <p className="text-sm font-semibold text-white">
          {currentValue != null ? formatUSD(currentValue) : price != null ? formatUSD(price) : "—"}
        </p>
        <p
          className="text-xs font-medium mt-0.5"
          style={{ color: pnlPct === null ? "hsl(0 0% 40%)" : isUp ? "#22c55e" : "#ef4444" }}
        >
          {pnl != null && pnlPct != null
            ? `${isUp ? "+" : ""}${formatPct(pnlPct)}`
            : "—"}
        </p>
      </div>

      {/* 24h */}
      <div className="flex-shrink-0 text-right min-w-[60px] hidden sm:block">
        <p className="text-[10px] text-[hsl(0_0%_38%)] mb-0.5">24h</p>
        <p
          className="text-xs font-semibold"
          style={{ color: change24h == null ? "hsl(0 0% 40%)" : change24h >= 0 ? "#22c55e" : "#ef4444" }}
        >
          {change24h != null ? `${change24h >= 0 ? "+" : ""}${change24h.toFixed(2)}%` : "—"}
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
  const [range, setRange] = useState<Range>("ALL");

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

  const totalCurrentValue = useMemo(() => {
    if (holdings.length === 0) return null;
    const hasSomePrices = holdings.some((h) => prices[h.coingecko_id] != null);
    if (!hasSomePrices) return null;
    return holdings.reduce(
      (s, h) => s + h.amount * (prices[h.coingecko_id] ?? h.manual_price ?? h.avg_cost),
      0
    );
  }, [holdings, prices]);

  const gainLoss = totalCurrentValue !== null ? totalCurrentValue - totalCostBasis : null;
  const returnPct = totalCostBasis > 0 && gainLoss !== null ? (gainLoss / totalCostBasis) * 100 : null;
  const isPositive = gainLoss !== null && gainLoss >= 0;
  const initialValue = clientProfile?.initial_portfolio_value ?? 0;
  const hasHoldings = holdings.length > 0;

  const btcPrice = prices["bitcoin"] ?? null;
  const btcChange24h = changes24h["bitcoin"] ?? null;

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

  // Chart data
  const chartData = useMemo(
    () => filterSnapshots(snapshots, range).map((s) => ({ date: s.date, value: s.value })),
    [snapshots, range]
  );
  const chartUp =
    chartData.length >= 2
      ? chartData[chartData.length - 1].value >= chartData[0].value
      : true;
  const chartColor = chartUp ? "#22c55e" : "#ef4444";

  // Period change
  const periodChange =
    chartData.length >= 2
      ? chartData[chartData.length - 1].value - chartData[0].value
      : null;
  const periodChangePct =
    periodChange !== null && chartData[0].value > 0
      ? (periodChange / chartData[0].value) * 100
      : null;

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

  return (
    <PortalLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Portfolio</h1>
        <p className="text-sm text-[hsl(0_0%_45%)] mt-0.5">
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

      {hasHoldings && (
        <>
          {/* ── Hero value ─────────────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-6 mb-4"
            style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 11%)" }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs text-[hsl(0_0%_42%)] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Bitcoin className="w-3 h-3" style={{ color: "#F7931A" }} />
                  Total Portfolio Value
                  {pricesLoading && !totalCurrentValue && (
                    <RefreshCw className="w-3 h-3 animate-spin ml-1" style={{ color: "#F7931A" }} />
                  )}
                </p>
                <p
                  className="text-4xl font-bold tracking-tight"
                  style={{ color: "#F7931A" }}
                  data-testid="stat-portfolio-value"
                >
                  {totalCurrentValue != null
                    ? formatUSD(totalCurrentValue)
                    : pricesLoading
                    ? "Loading…"
                    : "—"}
                </p>
                <p className="text-xs text-[hsl(0_0%_40%)] mt-1.5">
                  {holdings.length} asset{holdings.length !== 1 ? "s" : ""} · Cost basis {formatUSD(totalCostBasis)}
                </p>
              </div>

              {returnPct !== null && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{
                    background: isPositive ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)",
                    border: `1px solid ${isPositive ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.18)"}`,
                  }}
                  data-testid="return-card"
                >
                  {isPositive ? (
                    <TrendingUp className="w-5 h-5" style={{ color: "#22c55e" }} />
                  ) : (
                    <TrendingDown className="w-5 h-5" style={{ color: "#ef4444" }} />
                  )}
                  <div>
                    <p
                      className="text-lg font-bold leading-none"
                      style={{ color: isPositive ? "#22c55e" : "#ef4444" }}
                    >
                      {isPositive ? "+" : ""}{formatPct(returnPct)}
                    </p>
                    <p className="text-xs text-[hsl(0_0%_45%)] mt-0.5">
                      {isPositive ? "+" : ""}{formatUSD(gainLoss!)} total return
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick stats row */}
            <div
              className="grid grid-cols-3 gap-px mt-5 rounded-xl overflow-hidden"
              style={{ border: "1px solid hsl(0 0% 11%)" }}
            >
              {[
                {
                  label: "Invested",
                  value: formatUSD(totalCostBasis),
                  sub: "total cost basis",
                },
                {
                  label: "Unrealised P&L",
                  value: gainLoss != null ? `${gainLoss >= 0 ? "+" : ""}${formatUSD(gainLoss)}` : "—",
                  sub: returnPct != null ? `${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(2)}%` : undefined,
                  valueColor: gainLoss != null ? (gainLoss >= 0 ? "#22c55e" : "#ef4444") : undefined,
                },
                {
                  label: "BTC Price",
                  value: btcPrice ? formatUSD(btcPrice) : "—",
                  sub: btcChange24h != null
                    ? `${btcChange24h >= 0 ? "+" : ""}${btcChange24h.toFixed(2)}% (24h)`
                    : "Live",
                  valueColor: btcChange24h != null
                    ? (btcChange24h >= 0 ? "#22c55e" : "#ef4444")
                    : "#F7931A",
                },
              ].map(({ label, value, sub, valueColor }) => (
                <div
                  key={label}
                  className="px-4 py-3"
                  style={{ background: "hsl(0 0% 9%)" }}
                >
                  <p className="text-[10px] text-[hsl(0_0%_38%)] uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-sm font-semibold" style={{ color: valueColor ?? "white" }}>
                    {value}
                  </p>
                  {sub && <p className="text-[10px] text-[hsl(0_0%_38%)] mt-0.5">{sub}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* ── Portfolio chart ─────────────────────────────────────────────── */}
          {snapshots.length >= 1 && (
            <div
              className="rounded-2xl p-5 mb-4"
              style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 11%)" }}
            >
              <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <div>
                  <p className="text-xs text-[hsl(0_0%_42%)] uppercase tracking-wide">Portfolio History</p>
                  {periodChangePct !== null && (
                    <p
                      className="text-sm font-semibold mt-0.5"
                      style={{ color: periodChangePct >= 0 ? "#22c55e" : "#ef4444" }}
                    >
                      {periodChangePct >= 0 ? "+" : ""}{periodChangePct.toFixed(2)}%
                      <span className="text-[hsl(0_0%_42%)] font-normal text-xs ml-1.5">this period</span>
                    </p>
                  )}
                </div>
                {/* Range picker */}
                <div
                  className="flex items-center rounded-lg p-0.5 gap-0.5"
                  style={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 14%)" }}
                >
                  {(["1M", "3M", "ALL"] as Range[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                      style={
                        range === r
                          ? { background: "hsl(0 0% 16%)", color: "white" }
                          : { color: "hsl(0 0% 42%)" }
                      }
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColor} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "hsl(0 0% 35%)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(d) =>
                      new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(0 0% 35%)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    width={42}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={chartColor}
                    strokeWidth={2}
                    fill="url(#portfolioGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: chartColor, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Holdings breakdown ──────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-5 mb-4"
            style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 11%)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[hsl(0_0%_42%)] uppercase tracking-wide">Holdings</p>
              <div className="flex items-center gap-4 text-[10px] text-[hsl(0_0%_35%)] hidden sm:flex">
                <span>Allocation</span>
                <span className="w-[90px] text-right">Value / Return</span>
                <span className="w-[60px] text-right">24h</span>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              {/* Holdings list */}
              <div className="flex-1 flex flex-col gap-2">
                {holdingsWithAlloc.map(({ holding, alloc, colorHex }) => (
                  <HoldingRow
                    key={holding.coingecko_id}
                    holding={holding}
                    price={prices[holding.coingecko_id] ?? holding.manual_price ?? null}
                    change24h={changes24h[holding.coingecko_id] ?? null}
                    allocation={alloc}
                    colorHex={colorHex}
                  />
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
                      ({isPositive ? "+" : ""}{formatPct(returnPct)})
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
