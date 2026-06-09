import { useEffect } from "react";
import PortalLayout from "@/components/layout/PortalLayout";
import { MONTH_STATS, QUARTER_STATS, bestMonth, worstMonth, currentMonthStat } from "@/lib/seasonality";
import { CalendarDays, TrendingUp, TrendingDown, Info } from "lucide-react";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
      {children}
    </div>
  );
}

function cellColor(pct: number): string {
  if (pct >= 0) {
    const a = Math.min(0.85, 0.12 + pct / 45);
    return `rgba(34,197,94,${a})`;
  }
  const a = Math.min(0.85, 0.12 + Math.abs(pct) / 14);
  return `rgba(239,68,68,${a})`;
}

export default function SeasonalityPage() {
  useEffect(() => {
    document.title = "Seasonality — Bitcoin Daily";
    return () => { document.title = "Bitcoin Daily"; };
  }, []);

  const nowMonth = new Date().getMonth(); // 0-indexed
  const current = currentMonthStat(nowMonth);
  const best = bestMonth();
  const worst = worstMonth();
  const maxQ = Math.max(...QUARTER_STATS.map((q) => q.avgReturnPct));

  return (
    <PortalLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <CalendarDays className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">Bitcoin Seasonality</h1>
        </div>
        <p className="text-sm text-[hsl(0_0%_42%)]">
          How Bitcoin has historically performed across the calendar — long-run averages (2013–2024), not predictions.
        </p>
      </div>

      {/* This month callout */}
      <Card className="mb-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: cellColor(current.avgReturnPct) }}>
            {current.avgReturnPct >= 0 ? <TrendingUp className="w-5 h-5 text-white" /> : <TrendingDown className="w-5 h-5 text-white" />}
          </div>
          <div className="flex-1">
            <p className="text-sm text-[hsl(0_0%_50%)]">We're in <span className="text-white font-semibold">{current.name}</span></p>
            <p className="text-lg font-semibold text-white mt-0.5">
              Historically {current.avgReturnPct >= 0 ? "+" : ""}{current.avgReturnPct}% on average
              <span className="text-sm font-normal text-[hsl(0_0%_45%)] ml-2">· positive {Math.round(current.winRate * 100)}% of years</span>
            </p>
            <p className="text-xs text-[hsl(0_0%_42%)] mt-1.5 leading-relaxed">
              {current.avgReturnPct >= 8
                ? "A historically strong month — momentum tends to favour holders here."
                : current.avgReturnPct <= -2
                  ? "A historically soft month — these have often been favourable accumulation windows."
                  : "A historically mixed month — no strong seasonal edge either way."}
            </p>
          </div>
        </div>
      </Card>

      {/* Monthly heatmap */}
      <Card className="mb-5">
        <h2 className="text-sm font-semibold text-white mb-1">Average return by month</h2>
        <p className="text-xs text-[hsl(0_0%_42%)] mb-4">Greener = historically stronger. Your accumulation plan leans into the soft months and trims into the strong ones.</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {MONTH_STATS.map((m) => {
            const isNow = m.month === nowMonth + 1;
            return (
              <div
                key={m.month}
                className="rounded-xl p-3 text-center relative"
                style={{ background: cellColor(m.avgReturnPct), border: isNow ? "1.5px solid #F7931A" : "1px solid hsl(0 0% 14%)" }}
                data-testid={`season-${m.short.toLowerCase()}`}
              >
                {isNow && <span className="absolute top-1 right-1 text-[7px] font-bold px-1 rounded" style={{ background: "#F7931A", color: "#000" }}>NOW</span>}
                <p className="text-[11px] font-semibold text-white">{m.short}</p>
                <p className="text-sm font-bold text-white mt-0.5">{m.avgReturnPct >= 0 ? "+" : ""}{m.avgReturnPct}%</p>
                <p className="text-[9px] text-white/70 mt-0.5">{Math.round(m.winRate * 100)}% win</p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-[hsl(0_0%_50%)]">
            <TrendingUp className="w-3.5 h-3.5 text-green-500" /> Best: <span className="text-white font-medium">{best.name} +{best.avgReturnPct}%</span>
          </span>
          <span className="flex items-center gap-1.5 text-[hsl(0_0%_50%)]">
            <TrendingDown className="w-3.5 h-3.5 text-red-400" /> Worst: <span className="text-white font-medium">{worst.name} {worst.avgReturnPct}%</span>
          </span>
        </div>
      </Card>

      {/* Quarterly */}
      <Card className="mb-5">
        <h2 className="text-sm font-semibold text-white mb-4">Average return by quarter</h2>
        <div className="space-y-3">
          {QUARTER_STATS.map((q) => (
            <div key={q.quarter}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-white font-medium">{q.quarter} <span className="text-[hsl(0_0%_40%)] font-normal ml-1">{q.months}</span></span>
                <span className="font-semibold" style={{ color: q.avgReturnPct >= 20 ? "#22c55e" : q.avgReturnPct >= 5 ? "#F7931A" : "hsl(0 0% 55%)" }}>
                  +{q.avgReturnPct}%
                </span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "hsl(0 0% 12%)" }}>
                <div className="h-full rounded-full" style={{ width: `${Math.max(4, (q.avgReturnPct / maxQ) * 100)}%`, background: q.avgReturnPct >= 20 ? "#22c55e" : "#F7931A" }} />
              </div>
              <p className="text-[10px] text-[hsl(0_0%_38%)] mt-1">{q.note}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="rounded-xl px-4 py-3 flex items-start gap-2" style={{ background: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 13%)" }}>
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[hsl(0_0%_35%)]" />
        <p className="text-[10px] text-[hsl(0_0%_38%)] leading-relaxed">
          Seasonal averages summarise the past and can be skewed by a few outlier years (e.g. the 2017 and 2020 Q4 runs). They describe tendencies, not guarantees — cycle position matters more than the calendar.
        </p>
      </div>
    </PortalLayout>
  );
}
