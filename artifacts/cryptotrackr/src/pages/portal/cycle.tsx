import { useMemo, useEffect, useState } from "react";
import { Link } from "wouter";
import PortalLayout from "@/components/layout/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getHoldings, getPriceAlerts, addPriceAlert, deletePriceAlert, triggerPriceAlert } from "@/lib/localStore";
import { usePrices } from "@/hooks/usePrices";
import { useFearGreed, fearGreedStatus, fearGreedDetail } from "@/hooks/useFearGreed";
import { getCycleConfig, isoToLocalDate, type CycleConfig } from "@/lib/cycleConfig";
import { formatUSD, getMilestoneTier } from "@/lib/utils";
import type { PriceAlert } from "@/lib/types";
import {
  BEAR_SCENARIOS,
  BOTTOM_SIGNALS,
  DCA_SCHEDULE,
  KEY_DATES,
  getCurrentCyclePhase,
  getDaysUntil,
  getDaysSince,
} from "@/lib/cycleData";
import {
  Activity, TrendingDown, Calendar, CheckCircle2, Circle,
  Zap, Shield, Clock, Info, Bell, BellOff, Plus, X, Gauge,
} from "lucide-react";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
      {children}
    </div>
  );
}

// ── Cycle Phase Indicator ──────────────────────────────────────────────────

const HALVING_PHASES = [
  { id: 1, label: "Accumulation",  desc: "Post-bear bottom. Low prices, low attention. Smart money loads.", color: "#22c55e",  months: "0–6 months post-halving",   icon: "⬇", strategy: "Accumulate aggressively", sentiment: "Despair / Disbelief", next: "Early Bull" },
  { id: 2, label: "Early Bull",    desc: "Price recovers. Narratives build. Volume picks up gradually.",  color: "#84cc16",  months: "6–18 months",               icon: "↗", strategy: "Hold core, add on dips",  sentiment: "Hope / Optimism",     next: "Mid Bull" },
  { id: 3, label: "Mid Bull",      desc: "Mainstream interest. FOMO begins. Alts start outperforming.",  color: "#eab308",  months: "18–28 months",              icon: "↑", strategy: "Hold, let winners run",   sentiment: "Belief / Greed",      next: "Late Bull" },
  { id: 4, label: "Late Bull",     desc: "Euphoria. Parabolic price action. Everyone is a genius.",       color: "#f97316",  months: "28–36 months",              icon: "⬆", strategy: "Begin scaling out",       sentiment: "Euphoria",            next: "Distribution" },
  { id: 5, label: "Distribution",  desc: "Smart money exits. Volatility spikes. Top is being set.",      color: "#ef4444",  months: "36–40 months",              icon: "⚠", strategy: "Take profit / raise cash", sentiment: "Complacency",         next: "Bear Market" },
  { id: 6, label: "Bear Market",   desc: "Price corrects 70–80%+. Capitulation. Cycle resets.",          color: "#6b7280",  months: "40–48 months",              icon: "↓", strategy: "Hold cash, wait to accumulate", sentiment: "Fear / Capitulation", next: "Accumulation" },
];

const HALVING_DATE = new Date("2024-04-19T00:00:00Z");

function monthsSinceHalving(): number {
  return (Date.now() - HALVING_DATE.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
}

// Derive the current cycle phase from real inputs rather than a hardcoded id:
// a deep live drawdown from the peak dominates (we're in a bear regardless of
// the calendar), otherwise fall back to the halving-clock mapping.
function getCurrentPhaseId(drawdownPct: number | null, months: number): number {
  if (drawdownPct !== null) {
    if (drawdownPct <= -25) return 6; // Bear Market
    if (drawdownPct <= -10) return 5; // Distribution / topping
  }
  if (months < 6) return 1;
  if (months < 18) return 2;
  if (months < 28) return 3;
  if (months < 36) return 4;
  if (months < 40) return 5;
  return 6;
}

function CyclePhaseIndicator({ drawdownPct }: { drawdownPct: number | null }) {
  const currentId = getCurrentPhaseId(drawdownPct, monthsSinceHalving());
  return (
    <Card className="mb-5">
      <div className="flex items-center gap-2 mb-5">
        <Gauge className="w-4 h-4" style={{ color: "#F7931A" }} />
        <h2 className="text-sm font-semibold text-white">Halving Cycle Phase Indicator</h2>
        <span className="ml-auto text-[10px] text-[hsl(0_0%_35%)]">2024 halving · Apr 2024 – ~2028</span>
      </div>

      {/* Phase rail — desktop horizontal, mobile stacked */}
      <div className="hidden sm:flex items-stretch gap-1 mb-5">
        {HALVING_PHASES.map((phase) => {
          const isCurrent = phase.id === currentId;
          const isPast = phase.id < currentId;
          return (
            <div
              key={phase.id}
              className="flex-1 rounded-xl px-2 py-2.5 text-center transition-all"
              style={{
                background: isCurrent ? `${phase.color}14` : isPast ? "hsl(0 0% 10%)" : "hsl(0 0% 8%)",
                border: isCurrent ? `1px solid ${phase.color}` : "1px solid hsl(0 0% 14%)",
                opacity: isPast ? 0.55 : 1,
              }}
            >
              <p className="text-base mb-1">{phase.icon}</p>
              <p className="text-[10px] font-bold leading-tight" style={{ color: isCurrent ? phase.color : "hsl(0 0% 50%)" }}>{phase.label}</p>
              {isCurrent && (
                <span className="inline-block mt-1 text-[8px] font-bold px-1 py-0.5 rounded" style={{ background: phase.color, color: "#000" }}>NOW</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: stacked list */}
      <div className="sm:hidden space-y-2 mb-5">
        {HALVING_PHASES.map((phase) => {
          const isCurrent = phase.id === currentId;
          const isPast = phase.id < currentId;
          return (
            <div
              key={phase.id}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{
                background: isCurrent ? `${phase.color}10` : "hsl(0 0% 9%)",
                border: isCurrent ? `1px solid ${phase.color}` : "1px solid hsl(0 0% 13%)",
                opacity: isPast ? 0.5 : 1,
              }}
            >
              <span className="text-lg w-6 text-center shrink-0">{phase.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: isCurrent ? phase.color : "hsl(0 0% 65%)" }}>{phase.label}</p>
                <p className="text-[10px] text-[hsl(0_0%_38%)] truncate">{phase.months}</p>
              </div>
              {isCurrent && <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: phase.color, color: "#000" }}>NOW</span>}
            </div>
          );
        })}
      </div>

      {/* Current phase detail */}
      {(() => {
        const phase = HALVING_PHASES.find((p) => p.id === currentId)!;
        return (
          <div className="rounded-xl p-4" style={{ background: `${phase.color}08`, border: `1px solid ${phase.color}30` }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{phase.icon}</span>
              <p className="text-sm font-semibold" style={{ color: phase.color }}>{phase.label}</p>
              <span className="text-[10px] text-[hsl(0_0%_40%)] ml-auto">{phase.months}</span>
            </div>
            <p className="text-xs text-[hsl(0_0%_50%)] leading-relaxed">{phase.desc}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[hsl(0_0%_42%)]">
              <span className="px-2 py-0.5 rounded" style={{ background: "hsl(0 0% 12%)" }}>Strategy: {phase.strategy}</span>
              <span className="px-2 py-0.5 rounded" style={{ background: "hsl(0 0% 12%)" }}>Sentiment: {phase.sentiment}</span>
              <span className="px-2 py-0.5 rounded" style={{ background: "hsl(0 0% 12%)" }}>Next: {phase.next}</span>
            </div>
          </div>
        );
      })()}
    </Card>
  );
}

// ── On-Chain Signals Panel ─────────────────────────────────────────────────

const ONCHAIN_SIGNALS = [
  {
    id: "mvrv",
    label: "MVRV-Z Score",
    value: "0.8",
    unit: "",
    current: 0.8,
    range: { min: -1, max: 7, low: -1, caution: 3, danger: 6 },
    status: "healthy" as const,
    interpretation: "Market value vs. realized value. Below 1.0 = accumulation zone. Above 7 = cycle top warning.",
    detail: "In accumulation territory (0.5–1.0). Historically signals deep value — 2018 and 2022 bear bottoms hit 0.1–0.4. Current reading: favourable long-term entry zone.",
  },
  {
    id: "nupl",
    label: "NUPL",
    value: "0.18",
    unit: "",
    current: 0.18,
    range: { min: -0.5, max: 1, low: 0, caution: 0.6, danger: 0.75 },
    status: "fear" as const,
    interpretation: "Net unrealised profit/loss. 0.75+ = Euphoria. 0–0.25 = Fear. Negative = Capitulation.",
    detail: "Fear phase (0–0.25). Most holders near break-even or slight loss. Previous bear bottoms hit 0.0 to -0.2 — historically a strong accumulation window.",
  },
  {
    id: "fear_greed",
    label: "Fear & Greed Index",
    value: "22",
    unit: "/100",
    current: 22,
    range: { min: 0, max: 100, low: 25, caution: 60, danger: 80 },
    status: "fear" as const,
    interpretation: "Extreme Fear (0–24) = potential buy zone. Greed (60–79) = caution. Extreme Greed (80+) = sell.",
    detail: "Extreme Fear territory. Historically, buying at Extreme Fear and selling at Extreme Greed outperforms all other timing strategies over 12+ months. Patience is the edge.",
  },
  {
    id: "puell",
    label: "Puell Multiple",
    value: "0.48",
    unit: "×",
    current: 0.48,
    range: { min: 0, max: 4, low: 0.5, caution: 2, danger: 4 },
    status: "healthy" as const,
    interpretation: "Miner revenue vs. 1-year average. Below 0.5 = miner capitulation / deep buy zone. Above 4 = cycle top.",
    detail: "Below 0.5 — miner capitulation zone. Historically one of the strongest buy signals in Bitcoin history. All previous bear bottoms saw Puell below 0.5 before reversing.",
  },
];

type SignalStatus = "healthy" | "caution" | "danger" | "fear";

const STATUS_COLORS: Record<SignalStatus, string> = {
  healthy: "#22c55e",
  caution: "#f59e0b",
  danger:  "#ef4444",
  fear:    "#F7931A",
};

const STATUS_LABELS: Record<SignalStatus, string> = {
  healthy: "Healthy",
  caution: "Caution",
  danger:  "Danger",
  fear:    "Fear",
};

function GaugeBar({ current, min, max, caution, danger }: { current: number; min: number; max: number; low: number; caution: number; danger: number }) {
  const pct = Math.min(100, Math.max(0, ((current - min) / (max - min)) * 100));
  const cautionPct = ((caution - min) / (max - min)) * 100;
  const dangerPct = ((danger - min) / (max - min)) * 100;
  const dotColor = pct < cautionPct ? "#22c55e" : pct < dangerPct ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative h-2 rounded-full mt-2" style={{ background: "hsl(0 0% 13%)" }}>
      {/* Zone markers */}
      <div className="absolute top-0 bottom-0 rounded-l-full" style={{ width: `${cautionPct}%`, background: "rgba(34,197,94,0.25)" }} />
      <div className="absolute top-0 bottom-0" style={{ left: `${cautionPct}%`, width: `${dangerPct - cautionPct}%`, background: "rgba(245,158,11,0.25)" }} />
      <div className="absolute top-0 bottom-0 rounded-r-full" style={{ left: `${dangerPct}%`, right: 0, background: "rgba(239,68,68,0.25)" }} />
      {/* Dot */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-[hsl(0,0%,7%)]"
        style={{ left: `calc(${pct}% - 7px)`, background: dotColor }}
      />
    </div>
  );
}

function OnChainSignalsPanel({ config }: { config: CycleConfig }) {
  const { data: fng, loading: fngLoading } = useFearGreed();

  // Fear & Greed is live; MVRV / NUPL / Puell come from the admin-editable
  // cycle config (no free real-time source for those).
  const signals = ONCHAIN_SIGNALS.map((sig) => {
    if (sig.id === "fear_greed") {
      if (!fng) return { ...sig, live: false };
      return {
        ...sig,
        value: String(fng.value),
        current: fng.value,
        status: fearGreedStatus(fng.value) as SignalStatus,
        detail: fearGreedDetail(fng.value),
        live: true,
      };
    }
    const reading = config.onchain[sig.id as "mvrv" | "nupl" | "puell"];
    if (reading) {
      return { ...sig, value: String(reading.value), current: reading.value, status: reading.status, live: false };
    }
    return { ...sig, live: false };
  });

  const manualUpdated = isoToLocalDate(config.updatedAtISO).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const updatedLabel = fng
    ? `F&G live · others updated ${manualUpdated}`
    : fngLoading
      ? "Fetching live Fear & Greed…"
      : `Updated ${manualUpdated} · indicative only`;

  return (
    <Card className="mb-5">
      <div className="flex items-center gap-2 mb-5">
        <Activity className="w-4 h-4" style={{ color: "#F7931A" }} />
        <h2 className="text-sm font-semibold text-white">On-Chain Signal Panel</h2>
        <span className="ml-auto text-[10px] text-[hsl(0_0%_35%)]">{updatedLabel}</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {signals.map((sig) => {
          const color = STATUS_COLORS[sig.status];
          return (
            <div
              key={sig.id}
              className="rounded-xl p-4"
              style={{ background: "hsl(0 0% 9%)", border: "1px solid hsl(0 0% 14%)" }}
              data-testid={`signal-${sig.id}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-[hsl(0_0%_55%)] uppercase tracking-wide">{sig.label}</p>
                  {sig.live && (
                    <span className="flex items-center gap-1 text-[8px] font-bold px-1 py-0.5 rounded uppercase" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>
                      <span className="w-1 h-1 rounded-full" style={{ background: "#22c55e" }} />Live
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${color}15`, color }}>
                  {STATUS_LABELS[sig.status]}
                </span>
              </div>
              <p className="text-2xl font-bold text-white mt-0.5">{sig.value}<span className="text-sm text-[hsl(0_0%_45%)] ml-1">{sig.unit}</span></p>
              <GaugeBar
                current={sig.current}
                min={sig.range.min}
                max={sig.range.max}
                low={sig.range.low}
                caution={sig.range.caution}
                danger={sig.range.danger}
              />
              <p className="text-[11px] text-[hsl(0_0%_42%)] mt-2 leading-relaxed">{sig.detail}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-4 px-3 py-2 rounded-lg text-[11px] text-[hsl(0_0%_35%)] leading-relaxed" style={{ background: "hsl(0 0% 9%)" }}>
        Fear &amp; Greed is live from alternative.me. MVRV-Z, NUPL and Puell are curated manually — for live on-chain data, reference Glassnode, LookIntoBitcoin, or CryptoQuant directly.
      </div>
    </Card>
  );
}

// ── Price Alerts Section ───────────────────────────────────────────────────

const ALERTABLE_ASSETS = [
  { coingecko_id: "bitcoin",  symbol: "BTC" },
  { coingecko_id: "ethereum", symbol: "ETH" },
  { coingecko_id: "solana",   symbol: "SOL" },
];

function PriceAlertsSection({ userId }: { userId: string }) {
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => getPriceAlerts(userId));
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ coingecko_id: "bitcoin", symbol: "BTC", target_price: "", direction: "above" as "above" | "below" });

  const coinIds = useMemo(() => ALERTABLE_ASSETS.map((a) => a.coingecko_id), []);
  const { prices } = usePrices(coinIds);

  // Check alerts against live prices
  useEffect(() => {
    let changed = false;
    const updatedAlerts = alerts.map((a) => {
      if (a.triggered) return a;
      const price = prices[a.coingecko_id];
      if (price == null) return a;
      const hit = a.direction === "above" ? price >= a.target_price : price <= a.target_price;
      if (hit) {
        triggerPriceAlert(a.id);
        changed = true;
        return { ...a, triggered: true, triggered_at: new Date().toISOString() };
      }
      return a;
    });
    if (changed) setAlerts(updatedAlerts);
  }, [prices, alerts]);

  function handleAdd() {
    const targetPrice = parseFloat(form.target_price);
    if (!form.target_price || isNaN(targetPrice)) return;
    addPriceAlert({
      user_id: userId,
      coingecko_id: form.coingecko_id,
      symbol: form.symbol,
      target_price: targetPrice,
      direction: form.direction,
    });
    setAlerts(getPriceAlerts(userId));
    setForm((f) => ({ ...f, target_price: "" }));
    setShowAdd(false);
  }

  function handleDelete(id: string) {
    deletePriceAlert(id);
    setAlerts(getPriceAlerts(userId));
  }

  const activeAlerts = alerts.filter((a) => !a.triggered);
  const triggeredAlerts = alerts.filter((a) => a.triggered);

  return (
    <Card className="mb-5">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-4 h-4" style={{ color: "#F7931A" }} />
        <h2 className="text-sm font-semibold text-white">Price Alerts</h2>
        {activeAlerts.length > 0 && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}>
            {activeAlerts.length} active
          </span>
        )}
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="ml-auto flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
          style={{ background: "rgba(247,147,26,0.08)", color: "#F7931A" }}
        >
          {showAdd ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showAdd ? "Cancel" : "Add alert"}
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 rounded-xl p-4 space-y-3" style={{ background: "hsl(0 0% 9%)", border: "1px solid hsl(0 0% 15%)" }}>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] text-[hsl(0_0%_40%)] mb-1">Asset</label>
              <select
                className="w-full px-2.5 py-2 rounded-lg text-xs text-white bg-[hsl(0,0%,12%)] border border-[hsl(0,0%,18%)] outline-none focus:border-[#F7931A]"
                value={form.coingecko_id}
                onChange={(e) => {
                  const asset = ALERTABLE_ASSETS.find((a) => a.coingecko_id === e.target.value)!;
                  setForm((f) => ({ ...f, coingecko_id: asset.coingecko_id, symbol: asset.symbol }));
                }}
              >
                {ALERTABLE_ASSETS.map((a) => <option key={a.coingecko_id} value={a.coingecko_id}>{a.symbol}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-[hsl(0_0%_40%)] mb-1">Direction</label>
              <select
                className="w-full px-2.5 py-2 rounded-lg text-xs text-white bg-[hsl(0,0%,12%)] border border-[hsl(0,0%,18%)] outline-none focus:border-[#F7931A]"
                value={form.direction}
                onChange={(e) => setForm((f) => ({ ...f, direction: e.target.value as "above" | "below" }))}
              >
                <option value="above">Goes above</option>
                <option value="below">Goes below</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-[hsl(0_0%_40%)] mb-1">Target price ($)</label>
              <input
                type="number"
                className="w-full px-2.5 py-2 rounded-lg text-xs text-white bg-[hsl(0,0%,12%)] border border-[hsl(0,0%,18%)] outline-none focus:border-[#F7931A]"
                value={form.target_price}
                onChange={(e) => setForm((f) => ({ ...f, target_price: e.target.value }))}
                placeholder={form.coingecko_id === "bitcoin" ? "100000" : "3000"}
                min={0}
              />
            </div>
          </div>
          {form.target_price && prices[form.coingecko_id] && (
            <p className="text-[11px] text-[hsl(0_0%_40%)]">
              Current {form.symbol}: {formatUSD(prices[form.coingecko_id]!)} ·
              Alert triggers when it goes {form.direction} {formatUSD(parseFloat(form.target_price))}
            </p>
          )}
          <button
            onClick={handleAdd}
            disabled={!form.target_price}
            className="w-full py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
            style={{ background: "#F7931A", color: "#000" }}
          >
            Set alert
          </button>
        </div>
      )}

      {alerts.length === 0 && !showAdd && (
        <div className="flex flex-col items-center py-6 text-center gap-2">
          <BellOff className="w-6 h-6 text-[hsl(0_0%_25%)]" />
          <p className="text-sm text-[hsl(0_0%_40%)]">No price alerts set</p>
          <p className="text-xs text-[hsl(0_0%_30%)]">Get notified when BTC, ETH, or SOL hit your target</p>
        </div>
      )}

      {activeAlerts.length > 0 && (
        <div className="space-y-2 mb-3">
          {activeAlerts.map((a) => {
            const current = prices[a.coingecko_id];
            const pctDiff = current ? ((a.target_price - current) / current) * 100 : null;
            return (
              <div key={a.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "hsl(0 0% 9%)", border: "1px solid hsl(0 0% 14%)" }}>
                <Bell className="w-3.5 h-3.5 shrink-0 text-[hsl(0_0%_40%)]" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white">
                    {a.symbol} {a.direction === "above" ? "≥" : "≤"} {formatUSD(a.target_price)}
                  </p>
                  {pctDiff !== null && (
                    <p className="text-[10px] text-[hsl(0_0%_38%)]">
                      {Math.abs(pctDiff).toFixed(1)}% {pctDiff > 0 ? "away (above)" : "away (below)"}
                    </p>
                  )}
                </div>
                <button onClick={() => handleDelete(a.id)} className="p-1 rounded text-[hsl(0_0%_30%)] hover:text-red-400 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {triggeredAlerts.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(0_0%_30%)] mb-2">Triggered</p>
          <div className="space-y-1.5">
            {triggeredAlerts.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl px-3 py-2 opacity-60" style={{ background: "hsl(0 0% 9%)" }}>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-green-500" />
                <p className="text-xs text-[hsl(0_0%_50%)] flex-1">
                  {a.symbol} {a.direction} {formatUSD(a.target_price)}
                </p>
                <button onClick={() => handleDelete(a.id)} className="p-1 rounded text-[hsl(0_0%_25%)] hover:text-red-400 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function CyclePage() {
  const { user, clientProfile } = useAuth();

  useEffect(() => {
    document.title = "Cycle Outlook — Bitcoin Daily";
    return () => { document.title = "Bitcoin Daily"; };
  }, []);

  const holdings = useMemo(() => getHoldings(user?.id ?? ""), [user?.id]);
  const coinIds = useMemo(() => holdings.map((h) => h.coingecko_id), [holdings]);
  const { prices } = usePrices(["bitcoin", ...coinIds]);

  const cycleConfig = useMemo(() => getCycleConfig(), []);
  const btcPrice = prices["bitcoin"] ?? null;
  const currentPhase = useMemo(() => getCurrentCyclePhase(), []);

  const drawdownFromPeak = btcPrice
    ? ((btcPrice - cycleConfig.peakPrice) / cycleConfig.peakPrice) * 100
    : null;

  const daysSincePeak = getDaysSince(new Date(cycleConfig.peakDateISO));
  const daysUntilBuyZone = getDaysUntil(new Date(cycleConfig.buyZoneDateISO));
  const cashPhasePct = Math.min(100, Math.round((daysSincePeak / 365) * 100));

  const initialValue = clientProfile?.initial_portfolio_value ?? 0;
  const tier = getMilestoneTier(clientProfile?.risk_tolerance ?? "moderate", initialValue);
  const btcHolding = holdings.find((h) => h.coingecko_id === "bitcoin");

  return (
    <PortalLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">Cycle Signals</h1>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
            {currentPhase.label}
          </span>
        </div>
        <p className="text-sm text-[hsl(0_0%_42%)]">
          Live on-chain signals, bear-market floors, key dates, and your accumulation playbook.{" "}
          <Link href="/portal/thesis" className="font-medium" style={{ color: "#F7931A" }}>Start with The 4-Year Cycle →</Link>
        </p>
      </div>

      {/* ── Where We Are ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Card>
          <p className="text-[11px] text-[hsl(0_0%_40%)] uppercase tracking-wide mb-1.5">BTC Price</p>
          <p className="text-lg font-semibold" style={{ color: "#F7931A" }}>{btcPrice ? formatUSD(btcPrice) : "—"}</p>
        </Card>
        <Card>
          <p className="text-[11px] text-[hsl(0_0%_40%)] uppercase tracking-wide mb-1.5">From Peak</p>
          <p className="text-lg font-semibold" style={{ color: "#ef4444" }}>
            {drawdownFromPeak !== null ? `${drawdownFromPeak.toFixed(1)}%` : "—"}
          </p>
        </Card>
        <Card>
          <p className="text-[11px] text-[hsl(0_0%_40%)] uppercase tracking-wide mb-1.5">Buy Zone In</p>
          <p className="text-lg font-semibold" style={{ color: daysUntilBuyZone <= 0 ? "#22c55e" : "white" }}>
            {daysUntilBuyZone <= 0 ? "Open!" : `~${daysUntilBuyZone}d`}
          </p>
          <p className="text-[11px] text-[hsl(0_0%_38%)] mt-1">~Oct 2026</p>
        </Card>
        <Card>
          <p className="text-[11px] text-[hsl(0_0%_40%)] uppercase tracking-wide mb-1.5">Next Peak (proj.)</p>
          <p className="text-lg font-semibold text-white">~$200K–$300K</p>
          <p className="text-[11px] text-[hsl(0_0%_38%)] mt-1">Q3–Q4 2029</p>
        </Card>
      </div>

      {/* ── Current Phase Banner ──────────────────────────────────────────── */}
      <Card className="mb-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(239,68,68,0.1)" }}>
            <TrendingDown className="w-5 h-5" style={{ color: "#ef4444" }} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">{currentPhase.label}</p>
            <p className="text-sm text-[hsl(0_0%_50%)] mt-0.5">{currentPhase.description}</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[hsl(0_0%_40%)]">Cash phase progress · {daysSincePeak} days in</span>
                <span style={{ color: daysUntilBuyZone <= 0 ? "#22c55e" : "#F7931A" }}>
                  {daysUntilBuyZone <= 0 ? "Buy zone: Open now!" : `Buy zone: ~${daysUntilBuyZone} days`}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(0 0% 12%)" }}>
                <div className="h-2 rounded-full" style={{ width: `${cashPhasePct}%`, background: "#ef4444" }} />
              </div>
            </div>
            <div className="mt-3 p-3 rounded-lg text-xs text-[hsl(0_0%_45%)] leading-relaxed" style={{ background: "hsl(0 0% 10%)" }}>
              Every previous -50%+ drawdown in Bitcoin history was followed by new all-time highs.
              The question isn't IF Bitcoin recovers. It's WHEN, and whether you survive.
            </div>
          </div>
        </div>
      </Card>

      {/* ── Cycle Phase Indicator (NEW) ───────────────────────────────────── */}
      <CyclePhaseIndicator drawdownPct={drawdownFromPeak} />

      {/* ── On-Chain Signal Panel (NEW) ───────────────────────────────────── */}
      <OnChainSignalsPanel config={cycleConfig} />

      {/* ── Price Alerts (NEW) ────────────────────────────────────────────── */}
      {user && <PriceAlertsSection userId={user.id} />}

      {/* ── Bear Market Scenarios ─────────────────────────────────────────── */}
      <Card className="mb-5">
        <div className="flex items-center gap-2 mb-5">
          <TrendingDown className="w-4 h-4" style={{ color: "#F7931A" }} />
          <h2 className="text-sm font-semibold text-white">Bear Market Floor Scenarios</h2>
        </div>
        <div className="space-y-3">
          {BEAR_SCENARIOS.map((s) => {
            const btcHoldingValue = btcHolding && btcPrice ? btcHolding.amount * s.price : null;
            const btcHoldingCost = btcHolding ? btcHolding.amount * btcHolding.avg_cost : null;
            const scenarioPnL = btcHoldingValue && btcHoldingCost ? btcHoldingValue - btcHoldingCost : null;
            return (
              <div
                key={s.label}
                className="rounded-xl p-4"
                style={{
                  background: s.confirmed ? "rgba(6,182,212,0.05)" : "hsl(0 0% 9%)",
                  borderLeft: `3px solid ${s.color}`,
                  border: s.confirmed ? `1px solid rgba(6,182,212,0.25)` : undefined,
                  borderLeftWidth: "3px",
                  borderLeftColor: s.color,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">{s.label}</p>
                      {s.confirmed && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide" style={{ background: "rgba(6,182,212,0.15)", color: "#06b6d4" }}>Floor confirmed</span>
                      )}
                    </div>
                    <p className="text-xs text-[hsl(0_0%_42%)] mt-0.5">{s.basis}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-semibold" style={{ color: s.color }}>{formatUSD(s.price)}</p>
                    <p className="text-[11px] text-[hsl(0_0%_40%)]">{s.drawdownPct}% from ATH</p>
                  </div>
                </div>
                {btcHolding && btcHoldingValue !== null && scenarioPnL !== null && (
                  <div className="mt-2.5 pt-2.5 flex items-center justify-between text-xs" style={{ borderTop: "1px solid hsl(0 0% 13%)" }}>
                    <span className="text-[hsl(0_0%_40%)]">Your BTC at this price</span>
                    <span style={{ color: scenarioPnL >= 0 ? "#22c55e" : "#ef4444" }}>
                      {formatUSD(btcHoldingValue)} ({scenarioPnL >= 0 ? "+" : ""}{formatUSD(scenarioPnL)})
                    </span>
                  </div>
                )}
                <div className="mt-2">
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "hsl(0 0% 14%)" }}>
                    <div className="h-1 rounded-full" style={{ width: `${s.probability}%`, background: s.color }} />
                  </div>
                  <p className="text-[10px] text-[hsl(0_0%_32%)] mt-1">
                    {s.confirmed ? `${s.probability}% probability · ${s.targetDate}` : `${s.probability}% probability estimate · ${s.targetDate}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Action Schedule ───────────────────────────────────────────────── */}
      <Card className="mb-5">
        <div className="flex items-center gap-2 mb-5">
          <Calendar className="w-4 h-4" style={{ color: "#F7931A" }} />
          <h2 className="text-sm font-semibold text-white">Your Action Schedule</h2>
        </div>
        <div className="space-y-0">
          {KEY_DATES.map((kd, idx) => (
            <div key={idx} className="flex gap-3 pb-4 relative rounded-xl" style={kd.status === "active" ? { background: "rgba(247,147,26,0.07)", outline: "1px solid rgba(247,147,26,0.18)" } : {}}>
              <div className="flex flex-col items-center">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10"
                  style={{
                    background: kd.status === "done" ? "rgba(34,197,94,0.15)" : kd.status === "active" ? "rgba(247,147,26,0.15)" : "hsl(0 0% 12%)",
                  }}
                >
                  {kd.status === "done" ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#22c55e" }} /> : kd.status === "active" ? <Zap className="w-3.5 h-3.5" style={{ color: "#F7931A" }} /> : <Circle className="w-3.5 h-3.5 text-[hsl(0_0%_30%)]" />}
                </div>
                {idx < KEY_DATES.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: "hsl(0 0% 13%)" }} />}
              </div>
              <div className="flex-1 pt-0.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-white">{kd.label}</p>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                    style={{
                      background: kd.status === "done" ? "rgba(34,197,94,0.1)" : kd.status === "active" ? "rgba(247,147,26,0.1)" : "hsl(0 0% 11%)",
                      color: kd.status === "done" ? "#22c55e" : kd.status === "active" ? "#F7931A" : "hsl(0 0% 40%)",
                    }}
                  >
                    {kd.status === "done" ? "Done" : kd.status === "active" ? "Now" : "Upcoming"}
                  </span>
                </div>
                <p className="text-xs text-[hsl(0_0%_42%)] mt-0.5">{kd.action}</p>
                <p className="text-[11px] text-[hsl(0_0%_30%)] mt-0.5">
                  {kd.date.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  {"dateTo" in kd && kd.dateTo ? ` → ${kd.dateTo.toLocaleDateString("en-US", { month: "short", year: "numeric" })}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── DCA Framework ────────────────────────────────────────────────── */}
      <Card className="mb-5">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-4 h-4" style={{ color: "#F7931A" }} />
          <h2 className="text-sm font-semibold text-white">Accumulation Playbook · Oct 2026 – Apr 2028</h2>
        </div>
        <p className="text-xs text-[hsl(0_0%_42%)] mb-4 leading-relaxed">
          You don't need the exact bottom. You need a rules-based system that puts you in position while everyone else is frozen.
          Front-load your sizing — biggest gains come from buying earliest.
        </p>
        <div className="space-y-2.5 mb-4">
          {DCA_SCHEDULE.map((d) => (
            <div key={d.months} className="flex items-center gap-3">
              <div className="w-24 shrink-0">
                <p className="text-xs text-[hsl(0_0%_45%)]">{d.months}</p>
                <p className="text-[10px] text-[hsl(0_0%_30%)]">{d.label}</p>
              </div>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "hsl(0 0% 12%)" }}>
                <div className="h-2 rounded-full" style={{ width: `${d.allocationPct}%`, background: "#F7931A", opacity: 0.5 + d.allocationPct / 100 }} />
              </div>
              <p className="text-sm font-semibold w-10 text-right" style={{ color: "#F7931A" }}>{d.allocationPct}%</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-3.5" style={{ background: "hsl(0 0% 9%)" }}>
          <p className="text-xs font-semibold text-white mb-2">What to buy — your 3-coin foundation (based on 3-cycle analysis)</p>
          <div className="space-y-1.5 text-[11px] text-[hsl(0_0%_42%)]">
            <p>Months 1–6: Front-load BTC (60–80%). Build ETH and SOL alongside — these 3 are your foundation.</p>
            <p>Months 6+: Rotate 15–25% into top-25 alts only once all 3 core positions are trending up on the weekly.</p>
            <p style={{ color: "#ef4444" }}>Skip ranks 51–100. No leverage. No meme coins.</p>
          </div>
        </div>
      </Card>

      {/* ── Bottom Signals ────────────────────────────────────────────────── */}
      <Card className="mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4" style={{ color: "#F7931A" }} />
          <h2 className="text-sm font-semibold text-white">How to Know the Bottom Is In</h2>
        </div>
        <p className="text-xs text-[hsl(0_0%_42%)] mb-4">
          Don't try to catch the exact bottom. Watch for this confluence — when 3+ align, that's your window.
        </p>
        <div className="space-y-2.5">
          {BOTTOM_SIGNALS.map((sig) => (
            <div key={sig.id} className="flex gap-3 p-3 rounded-xl" style={{ background: "hsl(0 0% 9%)" }}>
              <div className="w-4 h-4 rounded-full shrink-0 mt-0.5" style={{ background: "hsl(0 0% 14%)", border: "1px solid hsl(0 0% 20%)" }} />
              <div>
                <p className="text-sm font-medium text-white">{sig.label}</p>
                <p className="text-[11px] text-[hsl(0_0%_42%)] mt-0.5 leading-relaxed">{sig.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Long Game ─────────────────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Info className="w-4 h-4" style={{ color: "#F7931A" }} />
          <h2 className="text-sm font-semibold text-white">The Long Game — Road to $1M</h2>
        </div>
        <div className="space-y-3 mb-4">
          {[
            { halving: "Apr 2024", window: "Aug–Oct 2025", ath: "$126K", bottom: "$38K–$50K", done: true },
            { halving: "Apr 2028", window: "Aug–Oct 2029", ath: "$200K–$300K", bottom: "$80K–$120K", done: false },
            { halving: "Apr 2032", window: "Aug–Oct 2033", ath: "$400K–$600K", bottom: "$160K–$240K", done: false },
            { halving: "Apr 2036", window: "Aug–Oct 2037", ath: "$800K–$1.2M", bottom: "$320K–$500K", done: false },
          ].map((row, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "hsl(0 0% 9%)", borderLeft: `2px solid ${row.done ? "#F7931A" : "hsl(0 0% 18%)"}` }}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold" style={{ color: row.done ? "white" : "hsl(0 0% 50%)" }}>{row.ath}</p>
                  {row.done && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}>Current cycle</span>}
                </div>
                <p className="text-[11px] text-[hsl(0_0%_40%)]">{row.halving} halving · Peak {row.window}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[hsl(0_0%_35%)]">Bear bottom</p>
                <p className="text-xs font-medium text-[hsl(0_0%_50%)]">{row.bottom}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-3.5 text-xs text-[hsl(0_0%_42%)] leading-relaxed" style={{ background: "rgba(247,147,26,0.04)", border: "1px solid rgba(247,147,26,0.08)" }}>
          By 2033, the projected bear market bottom is higher than Bitcoin's all-time high from 2025.
          Think about what that means for anyone who accumulates during the 2026 bear at $38K–$50K.
        </div>
      </Card>
    </PortalLayout>
  );
}
