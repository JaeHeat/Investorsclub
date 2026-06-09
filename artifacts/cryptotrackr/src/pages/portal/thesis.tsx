import { useEffect, useMemo } from "react";
import { Link } from "wouter";
import PortalLayout from "@/components/layout/PortalLayout";
import { CycleClock } from "@/components/CycleClock";
import { usePrices } from "@/hooks/usePrices";
import { getCycleConfig } from "@/lib/cycleConfig";
import { getCyclePhase, CYCLE_PHASES } from "@/lib/cyclePhase";
import { HALVING_CYCLES } from "@/lib/cycleData";
import { runCycleBacktest, BACKTEST_ASSUMPTIONS } from "@/lib/cycleBacktest";
import { formatUSD } from "@/lib/utils";
import { Activity, CheckCircle2, TrendingUp, ShieldCheck, ArrowRight, Info, Repeat } from "lucide-react";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
      {children}
    </div>
  );
}

function fmtPrice(v: number): string {
  if (v >= 1000) return `$${(v / 1000).toFixed(v >= 100000 ? 0 : 1)}K`;
  return `$${v.toLocaleString()}`;
}

export default function ThesisPage() {
  useEffect(() => {
    document.title = "The 4-Year Cycle — Bitcoin Daily";
    return () => { document.title = "Bitcoin Daily"; };
  }, []);

  const { prices } = usePrices(["bitcoin"]);
  const cfg = useMemo(() => getCycleConfig(), []);
  const btcPrice = prices["bitcoin"] ?? null;
  const drawdown = btcPrice ? ((btcPrice - cfg.peakPrice) / cfg.peakPrice) * 100 : null;
  const phase = getCyclePhase(drawdown, {
    peakTime: new Date(cfg.peakDateISO).getTime(),
    buyZoneTime: new Date(cfg.buyZoneDateISO).getTime(),
  });

  // Completed cycles (real peaks) for the proof table
  const completed = HALVING_CYCLES.filter((c) => !c.projected && c.cyclePeak != null);
  const maxPeak = Math.max(...completed.map((c) => c.cyclePeak ?? 0));

  const backtest = useMemo(() => runCycleBacktest(), []);
  const proven = backtest.filter((b) => !b.projected);
  const avgStack = proven.length ? proven.reduce((s, b) => s + b.stackMultiple, 0) / proven.length : 0;

  return (
    <PortalLayout>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Repeat className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">The 4-Year Cycle</h1>
        </div>
        <p className="text-sm text-[hsl(0_0%_50%)] leading-relaxed max-w-2xl">
          Every four years, Bitcoin's supply issuance is cut in half. That supply shock has driven the same
          rhythm four times running — accumulate, bull run, euphoric peak, bear market, repeat. We position you
          for each phase instead of guessing.
        </p>
      </div>

      {/* Hero: clock + current position + action */}
      <Card className="mb-5">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="shrink-0">
            <CycleClock phaseId={phase.id} size={184} />
          </div>
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <p className="text-[10px] uppercase tracking-wide text-[hsl(0_0%_45%)] mb-1">We are here</p>
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: phase.color }} />
              <h2 className="text-xl font-bold text-white">{phase.label}</h2>
            </div>
            <p className="text-sm text-[hsl(0_0%_55%)] leading-relaxed mb-3">{phase.desc}</p>
            <div className="rounded-xl p-3.5" style={{ background: `${phase.color}10`, border: `1px solid ${phase.color}28` }}>
              <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: phase.color }}>Your move now</p>
              <p className="text-sm text-white leading-relaxed">{phase.action}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* The proof */}
      <Card className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4" style={{ color: "#22c55e" }} />
          <h2 className="text-sm font-semibold text-white">The proof — {completed.length} cycles, {completed.length} new all-time highs</h2>
        </div>
        <p className="text-xs text-[hsl(0_0%_45%)] mb-4">
          Every halving has been followed by a new all-time high — and every bear bottom has printed higher than the last. Higher highs and higher lows, every single cycle.
        </p>

        {/* Higher-highs bar visual */}
        <div className="flex items-end gap-3 h-28 mb-2">
          {completed.map((c) => (
            <div key={c.id} className="flex-1 flex flex-col items-center justify-end h-full">
              <span className="text-[10px] font-semibold text-white mb-1">{fmtPrice(c.cyclePeak ?? 0)}</span>
              <div className="w-full rounded-t" style={{ height: `${Math.max(6, ((c.cyclePeak ?? 0) / maxPeak) * 100)}%`, background: "linear-gradient(180deg, #F7931A, rgba(247,147,26,0.3))" }} />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mb-4">
          {completed.map((c) => (
            <p key={c.id} className="flex-1 text-center text-[10px] text-[hsl(0_0%_42%)]">{new Date(c.cyclePeakDate ?? c.halvingDate).getFullYear()}</p>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-[hsl(0_0%_38%)] uppercase tracking-wide">
                <th className="text-left pb-2 font-medium">Cycle</th>
                <th className="text-right pb-2 font-medium">Bear bottom</th>
                <th className="text-right pb-2 font-medium">Cycle peak</th>
                <th className="text-right pb-2 font-medium">Gain</th>
                <th className="text-right pb-2 font-medium">vs prior peak</th>
              </tr>
            </thead>
            <tbody>
              {completed.map((c) => (
                <tr key={c.id} className="border-t" style={{ borderColor: "hsl(0 0% 11%)" }}>
                  <td className="py-2.5 pr-3">
                    <span className="text-white font-medium">{c.halvingLabel}</span>
                  </td>
                  <td className="py-2.5 text-right text-[hsl(0_0%_60%)]">{fmtPrice(c.bearBottom)}</td>
                  <td className="py-2.5 text-right font-semibold" style={{ color: "#F7931A" }}>{fmtPrice(c.cyclePeak ?? 0)}</td>
                  <td className="py-2.5 text-right text-green-400">{c.gainFromBottom ? `+${c.gainFromBottom.toLocaleString()}%` : "—"}</td>
                  <td className="py-2.5 text-right text-[hsl(0_0%_60%)]">{c.peakOverPeak ? `${c.peakOverPeak}×` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Plan vs Hold backtest */}
      {proven.length > 0 && (
        <Card className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4" style={{ color: "#F7931A" }} />
            <h2 className="text-sm font-semibold text-white">Why follow the plan? It beats just holding.</h2>
          </div>
          <p className="text-xs text-[hsl(0_0%_45%)] mb-4 leading-relaxed">
            Selling most of your stack near each top and rebuying near the bottom would have <span className="text-white font-semibold">multiplied your Bitcoin</span> through every past bear — while a buy-and-hold investor ended each bear with the same coins they started with.
          </p>

          <div className="rounded-xl p-4 mb-4 text-center" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <p className="text-[10px] uppercase tracking-wide text-[hsl(0_0%_45%)] mb-1">Average across {proven.length} past cycles</p>
            <p className="text-3xl font-bold" style={{ color: "#22c55e" }}>{avgStack.toFixed(1)}× more Bitcoin</p>
            <p className="text-[11px] text-[hsl(0_0%_45%)] mt-1">vs. holding through the bear</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {proven.map((b) => (
              <div key={b.key} className="rounded-xl p-3.5" style={{ background: "hsl(0 0% 9%)", border: "1px solid hsl(0 0% 13%)" }}>
                <p className="text-xs font-semibold text-white mb-1.5">{b.label}</p>
                <p className="text-2xl font-bold" style={{ color: "#22c55e" }}>{b.stackMultiple.toFixed(1)}×</p>
                <p className="text-[10px] text-[hsl(0_0%_42%)] mt-1.5 leading-relaxed">
                  Sold ≈{fmtPrice(b.sellPrice)} · rebought ≈{fmtPrice(b.buyPrice)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 px-3 py-2 rounded-lg flex items-start gap-2" style={{ background: "hsl(0 0% 9%)" }}>
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[hsl(0_0%_35%)]" />
            <p className="text-[10px] text-[hsl(0_0%_42%)] leading-relaxed">
              Deliberately conservative: assumes you sell {Math.round(BACKTEST_ASSUMPTIONS.sellPct * 100)}% of your stack within {Math.round((1 - BACKTEST_ASSUMPTIONS.sellHaircut) * 100)}% of the top and rebuy within {Math.round((BACKTEST_ASSUMPTIONS.buyHaircut - 1) * 100)}% of the bottom — not perfect timing. Past cycles don't guarantee future results.
            </p>
          </div>
        </Card>
      )}

      {/* The four phases */}
      <Card className="mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4" style={{ color: "#F7931A" }} />
          <h2 className="text-sm font-semibold text-white">The phases — and what you do in each</h2>
        </div>
        <div className="space-y-2">
          {CYCLE_PHASES.map((p) => {
            const isNow = p.id === phase.id;
            return (
              <div key={p.id} className="flex items-start gap-3 rounded-xl p-3" style={{ background: isNow ? `${p.color}10` : "hsl(0 0% 9%)", border: `1px solid ${isNow ? `${p.color}33` : "hsl(0 0% 12%)"}` }}>
                <span className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ background: p.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{p.label}</p>
                    {isNow && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: p.color, color: "#000" }}>NOW</span>}
                  </div>
                  <p className="text-xs text-[hsl(0_0%_50%)] mt-0.5 leading-relaxed">{p.action}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* What it means for you */}
      <Card>
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4" style={{ color: "#22c55e" }} />
          <h2 className="text-sm font-semibold text-white">What this means for you</h2>
        </div>
        <p className="text-sm text-[hsl(0_0%_55%)] leading-relaxed mb-4">
          You don't need to predict anything — you follow the cycle. Your plan tells you how much to deploy, when,
          and when to take profit. We handle the timing signals; you stay positioned.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/portal/plan" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: "#F7931A", color: "#0A0A0A" }}>
            View your plan <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link href="/portal/dca" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: "hsl(0 0% 11%)", color: "white", border: "1px solid hsl(0 0% 16%)" }}>
            Your DCA cadence
          </Link>
          <Link href="/portal/forecast" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: "hsl(0 0% 11%)", color: "white", border: "1px solid hsl(0 0% 16%)" }}>
            Probability forecast
          </Link>
          <Link href="/portal/cycle" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: "hsl(0 0% 11%)", color: "white", border: "1px solid hsl(0 0% 16%)" }}>
            Live cycle signals
          </Link>
        </div>
      </Card>
    </PortalLayout>
  );
}
