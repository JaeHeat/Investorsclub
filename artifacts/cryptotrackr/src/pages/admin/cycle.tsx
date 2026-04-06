import { useMemo } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { usePrices } from "@/hooks/usePrices";
import { formatUSD } from "@/lib/utils";
import {
  HALVING_CYCLES,
  BEAR_SCENARIOS,
  FIVE_PHASES,
  BOTTOM_SIGNALS,
  DCA_SCHEDULE,
  DCA_BOOSTERS,
  KEY_DATES,
  CURRENT_CYCLE_PEAK,
  CURRENT_CYCLE_PEAK_DATE,
  NEXT_HALVING_DATE,
  getCurrentCyclePhase,
  getDaysUntil,
  getDaysSince,
  formatDate,
} from "@/lib/cycleData";
import {
  Activity, TrendingDown, TrendingUp, Clock, Calendar,
  AlertTriangle, CheckCircle2, Circle, ChevronRight, Info,
  BarChart3, Zap, Shield, Target,
} from "lucide-react";

function SectionHeader({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(247,147,26,0.1)" }}>
        <Icon className="w-4 h-4" style={{ color: "#F7931A" }} />
      </div>
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {sub && <p className="text-xs text-[hsl(0_0%_42%)] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
      {children}
    </div>
  );
}

function Badge({ label, color = "#F7931A", bg }: { label: string; color?: string; bg?: string }) {
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ color, background: bg ?? `${color}18` }}>
      {label}
    </span>
  );
}

// ── Diminishing returns bar chart ────────────────────────────────────────────
function ReturnsChart() {
  const data = [
    { label: "2013", gain: 54900, multiplier: null, projected: false },
    { label: "2017", gain: 13000, multiplier: 17.1, projected: false },
    { label: "2021", gain: 2125, multiplier: 3.47, projected: false },
    { label: "2025", gain: 713, multiplier: 1.83, projected: false },
    { label: "2029*", gain: 495, multiplier: 1.98, projected: true },
  ];
  const maxGain = Math.max(...data.map((d) => d.gain));

  return (
    <div className="space-y-3">
      {data.map((d) => {
        const width = Math.max(4, (d.gain / maxGain) * 100);
        return (
          <div key={d.label}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className={d.projected ? "text-[hsl(0_0%_40%)]" : "text-[hsl(0_0%_70%)]"}>
                {d.label} {d.projected && <span style={{ color: "#F7931A" }}>proj.</span>}
              </span>
              <div className="flex items-center gap-3">
                {d.multiplier && (
                  <span className="text-[hsl(0_0%_40%)]">{d.multiplier}x peak-over-peak</span>
                )}
                <span className="font-semibold" style={{ color: d.projected ? "hsl(0 0% 45%)" : "white" }}>
                  +{d.gain.toLocaleString()}%
                </span>
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(0 0% 12%)" }}>
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${width}%`,
                  background: d.projected
                    ? "hsl(0 0% 30%)"
                    : `linear-gradient(90deg, #F7931A ${100 - width}%, #FFB547)`,
                  opacity: d.projected ? 0.5 : 1,
                }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-[11px] text-[hsl(0_0%_32%)] mt-2">* Projected using declining multiplier trend</p>
    </div>
  );
}

// ── Phase timeline ───────────────────────────────────────────────────────────
function PhaseTimeline({ currentPhase }: { currentPhase: ReturnType<typeof getCurrentCyclePhase> }) {
  const phases = [
    { id: 1, name: "Accumulation", color: "#22c55e" },
    { id: 2, name: "Pre-Halving Rally", color: "#3b82f6" },
    { id: 3, name: "Pullback", color: "#f97316" },
    { id: 4, name: "Post-Halving Acc.", color: "#8b5cf6" },
    { id: 5, name: "Bull Run", color: "#F7931A" },
    { id: "bear", name: "Bear Market", color: "#ef4444" },
  ] as const;

  const activePhaseId = currentPhase.phase;

  return (
    <div className="flex items-stretch gap-0.5 rounded-xl overflow-hidden">
      {phases.map((p, idx) => {
        const isActive = p.id === activePhaseId;
        const isPast = typeof p.id === "number" && typeof activePhaseId === "number"
          ? p.id < activePhaseId
          : p.id !== "bear" && activePhaseId === "bear";
        const activePhaseName = phases.find((x) => x.id === activePhaseId)?.name;
        return (
          <div
            key={String(p.id)}
            className="flex-1 flex flex-col items-center py-2.5 px-1 text-center transition-all"
            style={{
              background: isActive
                ? `${p.color}20`
                : isPast ? "hsl(0 0% 9%)" : "hsl(0 0% 7%)",
              borderTop: isActive ? `2px solid ${p.color}` : "2px solid transparent",
              opacity: isPast ? 0.45 : 1,
            }}
          >
            <span className="text-[10px] font-semibold leading-tight" style={{ color: isActive ? p.color : "hsl(0 0% 40%)" }}>
              {p.name}
            </span>
            {isActive && (
              <span className="mt-1 text-[9px] px-1 py-0.5 rounded" style={{ background: `${p.color}25`, color: p.color }}>
                NOW
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function CycleIntelligence() {
  const { prices, loading: priceLoading } = usePrices(["bitcoin"]);
  const btcPrice = prices["bitcoin"] ?? null;
  const currentPhase = useMemo(() => getCurrentCyclePhase(), []);

  const drawdownFromPeak = btcPrice
    ? ((btcPrice - CURRENT_CYCLE_PEAK) / CURRENT_CYCLE_PEAK) * 100
    : null;

  const daysSincePeak = getDaysSince(CURRENT_CYCLE_PEAK_DATE);
  const daysUntilBuyZone = getDaysUntil(new Date("2026-10-01"));
  const daysUntilNextHalving = getDaysUntil(NEXT_HALVING_DATE);
  const cashPhasePct = Math.min(100, Math.round((daysSincePeak / 365) * 100));

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">Cycle Intelligence</h1>
          <Badge label={currentPhase.label} />
        </div>
        <p className="text-sm text-[hsl(0_0%_42%)]">
          Forward-looking projections built on 4 cycles of halving data — not vibes, not narratives. History.
        </p>
      </div>

      {/* ── Current Position Stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Card>
          <p className="text-[11px] text-[hsl(0_0%_40%)] uppercase tracking-wide mb-1.5">BTC Price</p>
          <p className="text-xl font-semibold" style={{ color: "#F7931A" }}>
            {btcPrice ? formatUSD(btcPrice) : "—"}
          </p>
          <p className="text-[11px] text-[hsl(0_0%_38%)] mt-1">Live · CoinGecko</p>
        </Card>
        <Card>
          <p className="text-[11px] text-[hsl(0_0%_40%)] uppercase tracking-wide mb-1.5">Down From Peak</p>
          <p className="text-xl font-semibold" style={{ color: drawdownFromPeak !== null && drawdownFromPeak > -60 ? "#f97316" : "#ef4444" }}>
            {drawdownFromPeak !== null ? `${drawdownFromPeak.toFixed(1)}%` : "—"}
          </p>
          <p className="text-[11px] text-[hsl(0_0%_38%)] mt-1">Peak: {formatUSD(CURRENT_CYCLE_PEAK)} · Oct 2025</p>
        </Card>
        <Card>
          <p className="text-[11px] text-[hsl(0_0%_40%)] uppercase tracking-wide mb-1.5">Days Since Peak</p>
          <p className="text-xl font-semibold text-white">{daysSincePeak}</p>
          <p className="text-[11px] text-[hsl(0_0%_38%)] mt-1">Buy zone in ~{daysUntilBuyZone} days</p>
        </Card>
        <Card>
          <p className="text-[11px] text-[hsl(0_0%_40%)] uppercase tracking-wide mb-1.5">Next Halving</p>
          <p className="text-xl font-semibold text-white">{daysUntilNextHalving}d</p>
          <p className="text-[11px] text-[hsl(0_0%_38%)] mt-1">~Apr 2028</p>
        </Card>
      </div>

      {/* ── Phase Timeline ─────────────────────────────────────────────────── */}
      <Card className="mb-5">
        <SectionHeader icon={Activity} title="Current Cycle Phase" sub="5-phase framework — confirmed across 3 consecutive cycles (2016, 2020, 2024)" />
        <PhaseTimeline currentPhase={currentPhase} />
        <div className="mt-4 rounded-xl p-4" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)" }}>
          <div className="flex items-start gap-3">
            <TrendingDown className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#ef4444" }} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{currentPhase.label}</p>
              <p className="text-xs text-[hsl(0_0%_50%)] mt-0.5">{currentPhase.description}</p>
              <div className="mt-3">
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-[hsl(0_0%_40%)]">Cash phase progress ({currentPhase.daysIn} days in)</span>
                  <span style={{ color: "#F7931A" }}>{currentPhase.nextMilestone}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(0 0% 14%)" }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${cashPhasePct}%`, background: "#ef4444" }} />
                </div>
                <p className="text-[11px] text-[hsl(0_0%_35%)] mt-1.5">
                  ~{daysUntilBuyZone} days until buy zone opens · Oct 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 2-col: Bear Scenarios + Key Dates ─────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Bear Market Scenarios */}
        <Card>
          <SectionHeader icon={TrendingDown} title="Bear Market Floor Scenarios" sub="Projecting the diminishing drawdown trend forward from $126K peak" />
          <div className="space-y-3">
            {BEAR_SCENARIOS.map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-3.5"
                style={{ background: "hsl(0 0% 9%)", border: `1px solid ${s.color}22` }}
                data-testid={`scenario-${s.label.toLowerCase().replace(" ", "-")}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="text-sm font-semibold text-white">{s.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-semibold" style={{ color: s.color }}>
                      {formatUSD(s.price)}
                    </p>
                    <p className="text-[11px] text-[hsl(0_0%_40%)]">{s.drawdownPct}% from peak</p>
                  </div>
                </div>
                <p className="text-[11px] text-[hsl(0_0%_42%)] ml-4">{s.basis}</p>
                <div className="flex items-center justify-between mt-2 ml-4">
                  <span className="text-[11px] text-[hsl(0_0%_38%)]">Target timing: {s.targetDate}</span>
                  <span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ background: `${s.color}15`, color: s.color }}>
                    {s.probability}% probability
                  </span>
                </div>
                {btcPrice && (
                  <div className="mt-2 ml-4">
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "hsl(0 0% 14%)" }}>
                      <div
                        className="h-1 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.max(2, ((btcPrice - s.price) / (CURRENT_CYCLE_PEAK - s.price)) * 100))}%`,
                          background: s.color,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-[hsl(0_0%_32%)] mt-1">
                      {btcPrice > s.price
                        ? `${formatUSD(btcPrice - s.price)} above this target`
                        : `${formatUSD(s.price - btcPrice)} below current price`}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Key Action Dates */}
        <Card>
          <SectionHeader icon={Calendar} title="Action Schedule" sub="The mechanical formula — H+18mo sell, H+30mo buy, 12mo cash" />
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
                <div className="flex-1 pt-0.5 pb-0">
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
                  <p className="text-[11px] text-[hsl(0_0%_42%)] mt-0.5">{kd.action}</p>
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
      </div>

      {/* ── Historical Cycle Table ─────────────────────────────────────────── */}
      <Card className="mb-5">
        <SectionHeader icon={BarChart3} title="Historical Cycle Data" sub="Every halving since 2012 — the data that drives the projections" />
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-[hsl(0_0%_35%)] uppercase tracking-wide">
                <th className="text-left pb-3 font-medium">Halving</th>
                <th className="text-right pb-3 font-medium">Bear Bottom</th>
                <th className="text-right pb-3 font-medium">Cycle Peak</th>
                <th className="text-right pb-3 font-medium">Gain</th>
                <th className="text-right pb-3 font-medium">Days to Peak</th>
                <th className="text-right pb-3 font-medium">Drawdown</th>
                <th className="text-right pb-3 font-medium">Peak Mult.</th>
              </tr>
            </thead>
            <tbody>
              {HALVING_CYCLES.map((c, idx) => (
                <tr
                  key={c.id}
                  className="border-t"
                  style={{ borderColor: "hsl(0 0% 10%)" }}
                  data-testid={`cycle-row-${c.id}`}
                >
                  <td className="py-3 pr-4">
                    <p className="font-medium" style={{ color: c.projected ? "hsl(0 0% 42%)" : "white" }}>
                      {c.halvingLabel}
                    </p>
                    <p className="text-[11px] text-[hsl(0_0%_35%)]">{c.rewardChange}</p>
                    {c.projected && <Badge label="Projected" color="hsl(0 0% 40%)" bg="hsl(0 0% 11%)" />}
                  </td>
                  <td className="py-3 text-right">
                    <p style={{ color: c.projected ? "hsl(0 0% 42%)" : "hsl(0 0% 75%)" }}>
                      {formatUSD(c.bearBottom)}
                    </p>
                    <p className="text-[11px] text-[hsl(0_0%_35%)]">{formatDate(c.bearBottomDate)}</p>
                  </td>
                  <td className="py-3 text-right">
                    {c.cyclePeak ? (
                      <>
                        <p className="font-semibold" style={{ color: c.projected ? "hsl(0 0% 55%)" : "#F7931A" }}>
                          {c.cyclePeak >= 1000 ? `$${(c.cyclePeak / 1000).toFixed(0)}K` : formatUSD(c.cyclePeak)}
                        </p>
                        <p className="text-[11px] text-[hsl(0_0%_35%)]">
                          {c.cyclePeakDate ? formatDate(c.cyclePeakDate) : ""}
                        </p>
                      </>
                    ) : <span className="text-[hsl(0_0%_30%)]">—</span>}
                  </td>
                  <td className="py-3 text-right">
                    <p className="font-medium" style={{ color: c.projected ? "hsl(0 0% 42%)" : "#22c55e" }}>
                      {c.gainFromBottom ? `+${c.gainFromBottom.toLocaleString()}%` : "—"}
                    </p>
                  </td>
                  <td className="py-3 text-right text-[hsl(0_0%_65%)]">
                    {c.daysToPeak ? `~${c.daysToPeak}d` : "—"}
                  </td>
                  <td className="py-3 text-right">
                    {c.drawdownPct ? (
                      <span style={{ color: c.id === 4 ? "#f97316" : "hsl(0 0% 55%)" }}>
                        {c.drawdownPct}%
                        {c.id === 4 && <span className="text-[10px] ml-1 text-[hsl(0_0%_40%)]">so far</span>}
                      </span>
                    ) : (
                      <span className="text-[hsl(0_0%_30%)]">In progress</span>
                    )}
                  </td>
                  <td className="py-3 text-right text-[hsl(0_0%_60%)]">
                    {c.peakOverPeak ? `${c.peakOverPeak}x` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── 2-col: Returns Chart + 5 Phases ───────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Diminishing returns */}
        <Card>
          <SectionHeader icon={TrendingDown} title="Diminishing Returns" sub="Each cycle produces smaller % gains — but each peak is still higher than the last" />
          <ReturnsChart />
          <div className="mt-4 p-3 rounded-xl text-xs text-[hsl(0_0%_42%)] leading-relaxed" style={{ background: "hsl(0 0% 9%)" }}>
            The era of 10x cycle returns is over. The era of consistent, compounding, multi-cycle wealth building is here.
            A 1.6x multiplier from $126K still produces a $200K+ top. The compounding effect across three more cycles is
            what makes $1M possible.
          </div>
        </Card>

        {/* 5-Phase detail */}
        <Card>
          <SectionHeader icon={Zap} title="The 5-Phase Framework" sub="Confirmed across 3 consecutive cycles — 2016, 2020, 2024" />
          <div className="space-y-3">
            {FIVE_PHASES.map((phase) => (
              <div key={phase.id} className="rounded-xl p-3" style={{ background: "hsl(0 0% 9%)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}>
                    Phase {phase.id}
                  </span>
                  <span className="text-sm font-semibold text-white">{phase.shortName}</span>
                  <span className="ml-auto text-[11px] text-[hsl(0_0%_35%)]">{phase.duration}</span>
                </div>
                <p className="text-[11px] text-[hsl(0_0%_42%)] mb-1.5">{phase.description}</p>
                <p className="text-[11px] text-[hsl(0_0%_32%)] italic">{phase.example2024}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Forward Projections ───────────────────────────────────────────── */}
      <Card className="mb-5">
        <SectionHeader icon={Target} title="Forward Projections to $1M" sub="Halving schedule × declining multiplier model — same timeline as Bitwise market-cap analysis" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-[hsl(0_0%_35%)] uppercase tracking-wide">
                <th className="text-left pb-3 font-medium">Halving</th>
                <th className="text-left pb-3 font-medium">Peak Window</th>
                <th className="text-right pb-3 font-medium">Projected ATH</th>
                <th className="text-right pb-3 font-medium">Bear Bottom (est.)</th>
                <th className="text-right pb-3 font-medium">Drawdown</th>
              </tr>
            </thead>
            <tbody>
              {[
                { halving: "Apr 2024", window: "Aug–Oct 2025", ath: "$126K (actual)", bottom: "$38K–$50K", dd: "~-65%", done: true },
                { halving: "Apr 2028", window: "Aug–Oct 2029", ath: "$200K–$300K", bottom: "$80K–$120K", dd: "~-57%", done: false },
                { halving: "Apr 2032", window: "Aug–Oct 2033", ath: "$400K–$600K", bottom: "$160K–$240K", dd: "~-55%", done: false },
                { halving: "Apr 2036", window: "Aug–Oct 2037", ath: "$800K–$1.2M", bottom: "$320K–$500K", dd: "~-52%", done: false },
              ].map((row, idx) => (
                <tr key={idx} className="border-t" style={{ borderColor: "hsl(0 0% 10%)" }}>
                  <td className="py-3 pr-4">
                    <p className={row.done ? "font-medium text-white" : "text-[hsl(0_0%_55%)]"}>{row.halving}</p>
                    {row.done && <Badge label="Current" />}
                  </td>
                  <td className="py-3 pr-4 text-[hsl(0_0%_60%)]">{row.window}</td>
                  <td className="py-3 text-right font-semibold" style={{ color: row.done ? "#F7931A" : "hsl(0 0% 50%)" }}>
                    {row.ath}
                  </td>
                  <td className="py-3 text-right text-[hsl(0_0%_50%)]">{row.bottom}</td>
                  <td className="py-3 text-right text-[hsl(0_0%_40%)]">{row.dd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-3.5 rounded-xl" style={{ background: "rgba(247,147,26,0.05)", border: "1px solid rgba(247,147,26,0.1)" }}>
          <p className="text-xs text-[hsl(0_0%_55%)] leading-relaxed">
            Two independent frameworks — Bitwise market cap math ($121T store-of-value market × 17% BTC share) and the halving cycle
            multiplier model — both converge on ~$1M Bitcoin around 2037. When unrelated methodologies arrive at the same answer,
            that's confirmation, not coincidence.
          </p>
        </div>
      </Card>

      {/* ── 2-col: Bottom Signals + DCA Framework ─────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Bottom confirmation signals */}
        <Card>
          <SectionHeader icon={AlertTriangle} title="Bottom Confirmation Signals" sub="Don't catch the exact bottom — wait for 3+ of these to align" />
          <div className="space-y-3">
            {BOTTOM_SIGNALS.map((sig) => (
              <div key={sig.id} className="flex gap-3 p-3 rounded-xl" style={{ background: "hsl(0 0% 9%)" }}>
                <div className="w-5 h-5 rounded-full shrink-0 mt-0.5" style={{ background: "hsl(0 0% 14%)", border: "1px solid hsl(0 0% 20%)" }} />
                <div>
                  <p className="text-sm font-medium text-white">{sig.label}</p>
                  <p className="text-[11px] text-[hsl(0_0%_40%)] mt-0.5 leading-relaxed">{sig.description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[hsl(0_0%_32%)] mt-3 leading-relaxed">
            No single signal confirms the bottom. When 3+ align simultaneously, that's the entry window.
          </p>
        </Card>

        {/* DCA framework */}
        <Card>
          <SectionHeader icon={Shield} title="DCA Allocation Framework" sub="Front-load sizing — biggest gains come from buying earliest in the buy zone" />
          <div className="space-y-2 mb-4">
            {DCA_SCHEDULE.map((d) => (
              <div key={d.months} className="flex items-center gap-3">
                <div className="w-28 shrink-0">
                  <p className="text-[11px] text-[hsl(0_0%_45%)]">{d.months}</p>
                </div>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "hsl(0 0% 12%)" }}>
                  <div className="h-2 rounded-full" style={{ width: `${d.allocationPct}%`, background: "#F7931A", opacity: 0.7 + (d.allocationPct / 200) }} />
                </div>
                <div className="w-12 text-right">
                  <p className="text-sm font-semibold" style={{ color: "#F7931A" }}>{d.allocationPct}%</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs font-semibold text-white mb-2">Booster triggers (optional layer)</p>
          <div className="space-y-1.5">
            {DCA_BOOSTERS.map((b, i) => (
              <div key={i} className="flex items-start justify-between gap-3 text-[11px]">
                <span className="text-[hsl(0_0%_42%)]">{b.trigger}</span>
                <span className="shrink-0 font-semibold" style={{ color: "#22c55e" }}>{b.boost}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[hsl(0_0%_35%)] mt-3 italic">
            Kill-switch: BTC closes +40% above 200-day MA → stop boosts, stick to base schedule.
          </p>
        </Card>
      </div>

      {/* ── 2022 Playbook / Bear Trap Pattern ─────────────────────────────── */}
      <Card>
        <SectionHeader icon={Info} title="The 2022 Playbook — 2026 Is Running the Same Script" sub="Bear markets crash in stages. Each trap rally convinces people the bottom is in." />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[hsl(0_0%_35%)] uppercase tracking-wide">
                <th className="text-left pb-3 font-medium pr-4">Phase</th>
                <th className="text-left pb-3 font-medium pr-4">2022</th>
                <th className="text-left pb-3 font-medium pr-4">2026</th>
                <th className="text-left pb-3 font-medium">Crowd Reaction</th>
              </tr>
            </thead>
            <tbody className="space-y-1">
              {[
                { phase: "Top", y22: "Nov 2021 · $69K", y26: "Oct 2025 · $126K", crowd: '"Going to $200K"', done: true },
                { phase: "First Crash", y22: "Dec–Jan · -40% → $42K", y26: "Nov–Dec 2025 · -30%+", crowd: '"Just a correction"', done: true },
                { phase: "Trap #1", y22: "Feb–Mar · +30% → $48K", y26: "Jan 2026 rally", crowd: '"Bull market is back"', done: true },
                { phase: "Second Crash", y22: "Apr–May · Luna → $26K", y26: "Feb–Mar 2026 drop", crowd: '"OK this might be real"', done: true },
                { phase: "Trap #2", y22: "Jun–Aug · +30% → $32K", y26: "Mar–Apr 2026?", crowd: '"Double bottom!"', done: false },
                { phase: "Final Crash", y22: "Sep–Nov · FTX → $15.5K", y26: "Q2–Q3 2026?", crowd: '"Crypto is dead"', done: false },
                { phase: "Bottom", y22: "Nov 2022 · $15.5K", y26: "Q4 2026 · ~$40K?", crowd: '"Never buying crypto again"', done: false },
              ].map((row, idx) => (
                <tr key={idx} className="border-t" style={{ borderColor: "hsl(0 0% 10%)" }}>
                  <td className="py-2.5 pr-4">
                    <span
                      className="font-semibold"
                      style={{ color: row.done ? "hsl(0 0% 55%)" : row.phase === "Bottom" ? "#22c55e" : "#F7931A" }}
                    >
                      {row.phase}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-[hsl(0_0%_42%)]">{row.y22}</td>
                  <td className="py-2.5 pr-4" style={{ color: row.done ? "hsl(0 0% 60%)" : "white" }}>
                    {row.y26}
                    {!row.done && <span className="ml-1 text-[10px] text-[hsl(0_0%_35%)]">proj.</span>}
                  </td>
                  <td className="py-2.5 text-[hsl(0_0%_35%)] italic">{row.crowd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 rounded-xl p-3.5 text-xs text-[hsl(0_0%_45%)] leading-relaxed" style={{ background: "hsl(0 0% 9%)" }}>
          "Different year. Same structure." — 2022 took 12 months peak to bottom ($69K → $15.5K, -77%). The same
          math puts this cycle's bottom in Q4 2026 at approximately -65% to -70% from the $126K ATH.
        </div>
      </Card>
    </AdminLayout>
  );
}
