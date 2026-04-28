import { useMemo } from "react";
import PortalLayout from "@/components/layout/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getHoldings } from "@/lib/localStore";
import { usePrices } from "@/hooks/usePrices";
import { formatUSD, getMilestoneTier } from "@/lib/utils";
import {
  BEAR_SCENARIOS,
  BOTTOM_SIGNALS,
  DCA_SCHEDULE,
  KEY_DATES,
  CURRENT_CYCLE_PEAK,
  CURRENT_CYCLE_PEAK_DATE,
  getCurrentCyclePhase,
  getDaysUntil,
  getDaysSince,
} from "@/lib/cycleData";
import {
  Activity, TrendingDown, Calendar, CheckCircle2, Circle,
  Zap, Shield, Clock, Info,
} from "lucide-react";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
      {children}
    </div>
  );
}

export default function CyclePage() {
  const { user, clientProfile } = useAuth();
  const holdings = useMemo(() => getHoldings(user?.id ?? ""), [user?.id]);
  const coinIds = useMemo(() => holdings.map((h) => h.coingecko_id), [holdings]);
  const { prices } = usePrices(["bitcoin", ...coinIds]);

  const btcPrice = prices["bitcoin"] ?? null;
  const currentPhase = useMemo(() => getCurrentCyclePhase(), []);

  const drawdownFromPeak = btcPrice
    ? ((btcPrice - CURRENT_CYCLE_PEAK) / CURRENT_CYCLE_PEAK) * 100
    : null;

  const daysSincePeak = getDaysSince(CURRENT_CYCLE_PEAK_DATE);
  const daysUntilBuyZone = getDaysUntil(new Date("2026-10-01"));
  const cashPhasePct = Math.min(100, Math.round((daysSincePeak / 365) * 100));

  // Personalised projection using their portfolio + tier
  const initialValue = clientProfile?.initial_portfolio_value ?? 0;
  const tier = getMilestoneTier(clientProfile?.risk_tolerance ?? "moderate", initialValue);
  const btcHolding = holdings.find((h) => h.coingecko_id === "bitcoin");

  return (
    <PortalLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">Cycle Outlook</h1>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
            {currentPhase.label}
          </span>
        </div>
        <p className="text-sm text-[hsl(0_0%_42%)]">
          Forward projections based on 4 cycles of halving data. Not vibes — history.
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
          <p className="text-lg font-semibold text-white">~{daysUntilBuyZone}d</p>
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
                <span style={{ color: "#F7931A" }}>Buy zone: ~{daysUntilBuyZone} days</span>
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

      {/* ── Bear Market Scenarios ─────────────────────────────────────────── */}
      <Card className="mb-5">
        <div className="flex items-center gap-2 mb-5">
          <TrendingDown className="w-4 h-4" style={{ color: "#F7931A" }} />
          <h2 className="text-sm font-semibold text-white">Bear Market Floor Scenarios</h2>
        </div>
        <div className="space-y-3">
          {BEAR_SCENARIOS.map((s) => {
            const btcHoldingValue = btcHolding && btcPrice
              ? btcHolding.amount * s.price
              : null;
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
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide"
                          style={{ background: "rgba(6,182,212,0.15)", color: "#06b6d4" }}
                        >
                          Floor confirmed
                        </span>
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
                    <div
                      className="h-1 rounded-full"
                      style={{ width: `${s.probability}%`, background: s.color }}
                    />
                  </div>
                  <p className="text-[10px] text-[hsl(0_0%_32%)] mt-1">
                    {s.confirmed
                      ? `${s.probability}% probability · ${s.targetDate}`
                      : `${s.probability}% probability estimate · ${s.targetDate}`}
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
            <div key={idx} className="flex gap-3 pb-4 relative">
              <div className="flex flex-col items-center">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10"
                  style={{
                    background: kd.status === "done"
                      ? "rgba(34,197,94,0.15)"
                      : kd.status === "active"
                        ? "rgba(247,147,26,0.15)"
                        : "hsl(0 0% 12%)",
                  }}
                >
                  {kd.status === "done"
                    ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#22c55e" }} />
                    : kd.status === "active"
                      ? <Zap className="w-3.5 h-3.5" style={{ color: "#F7931A" }} />
                      : <Circle className="w-3.5 h-3.5 text-[hsl(0_0%_30%)]" />}
                </div>
                {idx < KEY_DATES.length - 1 && (
                  <div className="w-px flex-1 mt-1" style={{ background: "hsl(0 0% 13%)" }} />
                )}
              </div>
              <div className="flex-1 pt-0.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-white">{kd.label}</p>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                    style={{
                      background: kd.status === "done"
                        ? "rgba(34,197,94,0.1)"
                        : kd.status === "active"
                          ? "rgba(247,147,26,0.1)"
                          : "hsl(0 0% 11%)",
                      color: kd.status === "done"
                        ? "#22c55e"
                        : kd.status === "active"
                          ? "#F7931A"
                          : "hsl(0 0% 40%)",
                    }}
                  >
                    {kd.status === "done" ? "Done" : kd.status === "active" ? "Now" : "Upcoming"}
                  </span>
                </div>
                <p className="text-xs text-[hsl(0_0%_42%)] mt-0.5">{kd.action}</p>
                <p className="text-[11px] text-[hsl(0_0%_30%)] mt-0.5">
                  {kd.date.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  {"dateTo" in kd && kd.dateTo
                    ? ` → ${kd.dateTo.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                    : ""}
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
          <p className="text-xs font-semibold text-white mb-2">What to buy (based on 3-cycle bear bottom analysis)</p>
          <div className="space-y-1.5 text-[11px] text-[hsl(0_0%_42%)]">
            <p>First 6 months: 100% BTC (up to 20% ETH)</p>
            <p>Next 6–12 months: diversify 20–30% into top-25 alts once BTC trends up weekly</p>
            <p style={{ color: "#ef4444" }}>Skip ranks 51–100. No leverage.</p>
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

      {/* ── Diminishing Returns + Long Range ─────────────────────────────── */}
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
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: "hsl(0 0% 9%)", borderLeft: `2px solid ${row.done ? "#F7931A" : "hsl(0 0% 18%)"}` }}
            >
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
          The traders who collect $1M Bitcoin aren't the ones with the strongest conviction today — they're the ones
          with a framework robust enough to survive three separate moments where every signal says sell.
        </div>
      </Card>
    </PortalLayout>
  );
}
