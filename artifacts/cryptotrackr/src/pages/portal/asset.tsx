import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { getHoldings } from "@/lib/localStore";
import { usePrices } from "@/hooks/usePrices";
import { fetchCoinHistory, type EquityPoint } from "@/lib/priceHistory";
import { CHART_RANGES, type ChartRange } from "@/hooks/usePortfolioHistory";
import { EquityCurve } from "@/components/EquityCurve";
import { formatUSD, formatPct } from "@/lib/utils";
import PortalLayout from "@/components/layout/PortalLayout";
import { ChevronLeft, TrendingUp, TrendingDown } from "lucide-react";

const RANGE_DAYS: Record<ChartRange, number | "max"> = {
  "24H": 1, "1W": 7, "1M": 30, "3M": 90, "1Y": 365, ALL: "max",
};

const COLORS: Record<string, string> = {
  bitcoin: "#F7931A", ethereum: "#627EEA", solana: "#9945FF", binancecoin: "#F0B90B",
  cardano: "#0D3063", ripple: "#346AA9", "avalanche-2": "#E84142", chainlink: "#2A5ADA",
};
function colorFor(id: string) {
  return COLORS[id] ?? "#8b5cf6";
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 11%)" }}>
      {children}
    </div>
  );
}

export default function AssetPage() {
  const { user } = useAuth();
  const params = useParams();
  const id = (params.id as string) ?? "";
  const [range, setRange] = useState<ChartRange>("1M");
  const [series, setSeries] = useState<EquityPoint[]>([]);
  const [loadingHist, setLoadingHist] = useState(true);

  const holdings = useMemo(() => (user ? getHoldings(user.id) : []), [user]);
  const holding = holdings.find((h) => h.coingecko_id === id);
  const { prices, changes24h } = usePrices(id ? [id] : []);
  const price = prices[id] ?? holding?.manual_price ?? null;
  const change24h = changes24h[id] ?? null;
  const color = colorFor(id);

  useEffect(() => {
    document.title = `${holding?.name ?? "Asset"} — Bitcoin Daily`;
    return () => { document.title = "Bitcoin Daily"; };
  }, [holding?.name]);

  useEffect(() => {
    let cancelled = false;
    setLoadingHist(true);
    fetchCoinHistory(id, RANGE_DAYS[range]).then((pts) => {
      if (cancelled) return;
      setSeries(pts.map((p) => ({ t: p.t, value: p.price })));
      setLoadingHist(false);
    });
    return () => { cancelled = true; };
  }, [id, range]);

  const backLink = (
    <Link href="/portal" className="inline-flex items-center gap-1 text-sm mb-5 transition-colors" style={{ color: "hsl(0 0% 45%)" }}>
      <ChevronLeft className="w-4 h-4" /> Portfolio
    </Link>
  );

  if (!holding) {
    return (
      <PortalLayout>
        {backLink}
        <Card className="text-center py-10">
          <p className="text-sm text-[hsl(0_0%_45%)]">This asset isn't in your holdings.</p>
        </Card>
      </PortalLayout>
    );
  }

  const value = price != null ? holding.amount * price : null;
  const cost = holding.amount * holding.avg_cost;
  const pnl = value != null ? value - cost : null;
  const pnlPct = pnl != null && cost > 0 ? (pnl / cost) * 100 : null;
  const isUp = pnl != null && pnl >= 0;

  const curveUp = series.length >= 2 ? series[series.length - 1].value >= series[0].value : true;
  const curveColor = curveUp ? "#22c55e" : "#ef4444";
  const periodChange = series.length >= 2 ? series[series.length - 1].value - series[0].value : null;
  const periodPct = periodChange != null && series[0].value > 0 ? (periodChange / series[0].value) * 100 : null;

  return (
    <PortalLayout>
      {backLink}

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: `${color}1c`, color, border: `1px solid ${color}33` }}>
          {holding.symbol.slice(0, 3)}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-white leading-tight">{holding.name}</h1>
          <p className="text-xs text-[hsl(0_0%_45%)]">{holding.symbol}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-white">{price != null ? formatUSD(price) : "—"}</p>
          {change24h != null && (
            <p className="text-xs font-semibold" style={{ color: change24h >= 0 ? "#22c55e" : "#ef4444" }}>
              {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}% 24h
            </p>
          )}
        </div>
      </div>

      {/* Price chart */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-[hsl(0_0%_45%)] uppercase tracking-wide">{holding.symbol} price</p>
          {periodChange != null && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg"
              style={{ background: curveUp ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: curveUp ? "#22c55e" : "#ef4444" }}>
              {curveUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {periodPct != null && `${periodPct >= 0 ? "+" : ""}${periodPct.toFixed(2)}%`}
            </span>
          )}
        </div>
        <div className="-mx-1.5 mt-2">
          {series.length >= 2 ? (
            <EquityCurve data={series} color={curveColor} height={200} />
          ) : (
            <div className="h-[200px] flex items-center justify-center text-xs text-[hsl(0_0%_35%)]">
              {loadingHist ? "Loading price history…" : "Live chart unavailable for this asset."}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-1 mt-1">
          {CHART_RANGES.map((r) => (
            <button key={r} onClick={() => setRange(r)} data-testid={`asset-range-${r}`}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={range === r ? { background: "rgba(247,147,26,0.12)", color: "#F7931A" } : { color: "hsl(0 0% 42%)" }}>
              {r}
            </button>
          ))}
        </div>
      </Card>

      {/* Your position */}
      <Card>
        <p className="text-xs text-[hsl(0_0%_45%)] uppercase tracking-wide mb-4">Your position</p>
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-[10px] text-[hsl(0_0%_40%)] uppercase tracking-wide">Market value</p>
            <p className="text-2xl font-bold text-white">{value != null ? formatUSD(value) : "—"}</p>
          </div>
          {pnlPct != null && (
            <div className="text-right">
              <p className="text-[10px] text-[hsl(0_0%_40%)] uppercase tracking-wide">Total return</p>
              <p className="text-lg font-bold" style={{ color: isUp ? "#22c55e" : "#ef4444" }}>{formatPct(pnlPct)}</p>
              <p className="text-[11px]" style={{ color: isUp ? "#22c55e" : "#ef4444" }}>
                {isUp ? "+" : ""}{formatUSD(pnl!)}
              </p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Amount held", value: `${holding.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })} ${holding.symbol}` },
            { label: "Avg buy price", value: formatUSD(holding.avg_cost) },
            { label: "Cost basis", value: formatUSD(cost) },
            { label: "Current price", value: price != null ? formatUSD(price) : "—" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-3" style={{ background: "hsl(0 0% 9%)" }}>
              <p className="text-[10px] text-[hsl(0_0%_40%)] uppercase tracking-wide mb-0.5">{s.label}</p>
              <p className="text-sm font-semibold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </PortalLayout>
  );
}
