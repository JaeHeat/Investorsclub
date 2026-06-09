import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { getHoldings } from "@/lib/localStore";
import { usePrices } from "@/hooks/usePrices";
import { getPortfolioPlan } from "@/lib/portfolioPlans";
import { runForecast } from "@/lib/forecast";
import { ForecastFan } from "@/components/ForecastFan";
import { formatUSD } from "@/lib/utils";
import PortalLayout from "@/components/layout/PortalLayout";
import { Sparkles, Target, ShieldAlert, TrendingUp, Info } from "lucide-react";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
      {children}
    </div>
  );
}

function compact(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1000)}K`;
  return `$${Math.round(v)}`;
}

const GOAL_TABS = [
  { key: "goal_conservative", label: "Conservative", accent: "#10b981" },
  { key: "goal_moderate", label: "Target", accent: "#F7931A" },
  { key: "goal_moonshot", label: "Moonshot", accent: "#a855f7" },
] as const;

export default function ForecastPage() {
  const { user, clientProfile } = useAuth();
  const [goalKey, setGoalKey] = useState<(typeof GOAL_TABS)[number]["key"]>("goal_moderate");

  useEffect(() => {
    document.title = "Probability Forecast — Bitcoin Daily";
    return () => { document.title = "Bitcoin Daily"; };
  }, []);

  const holdings = useMemo(() => (user ? getHoldings(user.id) : []), [user]);
  const coinIds = useMemo(() => [...new Set(["bitcoin", ...holdings.map((h) => h.coingecko_id)])], [holdings]);
  const { prices } = usePrices(coinIds);

  const liveValue = useMemo(
    () => holdings.reduce((s, h) => { const p = prices[h.coingecko_id] ?? h.manual_price; return p ? s + h.amount * p : s; }, 0),
    [holdings, prices]
  );

  const risk = clientProfile?.risk_tolerance ?? "moderate";
  const initialValue = clientProfile?.initial_portfolio_value ?? 0;
  const base = liveValue > 0 ? liveValue : initialValue;
  const plan = useMemo(() => getPortfolioPlan(risk, initialValue), [risk, initialValue]);

  const goalValue = parseFloat(String(clientProfile?.[goalKey] ?? "")) || 0;

  const result = useMemo(
    () => runForecast({ currentValue: base, plan, goalValue, seed: Math.round(base + goalValue + (goalKey.length * 1000)) }),
    [base, plan, goalValue, goalKey]
  );

  if (base <= 0) {
    return (
      <PortalLayout>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-5 h-5" style={{ color: "#F7931A" }} />
            <h1 className="text-2xl font-semibold text-white">Probability Forecast</h1>
          </div>
        </div>
        <Card className="text-center py-10">
          <Sparkles className="w-8 h-8 mx-auto mb-3 text-[hsl(0_0%_25%)]" />
          <p className="text-sm font-semibold text-[hsl(0_0%_45%)]">Add your portfolio to run a forecast</p>
          <p className="text-xs text-[hsl(0_0%_35%)] mt-1.5 mb-4">We simulate thousands of cycle outcomes from your current holdings.</p>
          <Link href="/portal/settings" className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}>
            Go to Settings
          </Link>
        </Card>
      </PortalLayout>
    );
  }

  const prob = result ? Math.round(result.goalProbability * 100) : 0;
  const probColor = prob >= 66 ? "#22c55e" : prob >= 33 ? "#F7931A" : "#ef4444";
  const maxCount = result ? Math.max(...result.histogram.map((b) => b.count), 1) : 1;
  const lo = result ? result.histogram[0].binStart : 0;
  const hi = result ? result.histogram[result.histogram.length - 1].binEnd : 1;
  const xFor = (v: number) => `${Math.min(100, Math.max(0, ((v - lo) / (hi - lo)) * 100))}%`;

  return (
    <PortalLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">Probability Forecast</h1>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}>
            {result?.sims.toLocaleString()} simulations
          </span>
        </div>
        <p className="text-sm text-[hsl(0_0%_42%)]">
          Thousands of simulated next-cycle outcomes from your <span className="text-white">{compact(base)}</span> portfolio and <span className="text-white capitalize">{risk}</span> allocation.
        </p>
      </div>

      {/* Goal selector */}
      <div className="flex gap-2 mb-5">
        {GOAL_TABS.map((t) => {
          const v = parseFloat(String(clientProfile?.[t.key] ?? "")) || 0;
          const active = goalKey === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setGoalKey(t.key)}
              data-testid={`forecast-goal-${t.label.toLowerCase()}`}
              className="flex-1 rounded-xl p-3 text-center transition-all"
              style={{ background: active ? `${t.accent}14` : "hsl(0 0% 8%)", border: `1px solid ${active ? t.accent : "hsl(0 0% 14%)"}` }}
            >
              <p className="text-[11px] font-medium" style={{ color: active ? t.accent : "hsl(0 0% 55%)" }}>{t.label}</p>
              <p className="text-sm font-bold text-white mt-0.5">{v > 0 ? compact(v) : "—"}</p>
            </button>
          );
        })}
      </div>

      {/* Headline probability */}
      <Card className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4" style={{ color: "#F7931A" }} />
          <h2 className="text-sm font-semibold text-white">Probability of reaching your goal</h2>
        </div>
        {goalValue > 0 ? (
          <>
            <div className="flex items-end gap-3 mb-3">
              <p className="text-5xl font-bold leading-none" style={{ color: probColor }}>{prob}%</p>
              <p className="text-sm text-[hsl(0_0%_50%)] mb-1">chance of hitting <span className="text-white font-semibold">{compact(goalValue)}</span> at the next cycle peak</p>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "hsl(0 0% 12%)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${prob}%`, background: probColor }} />
            </div>
            <p className="text-xs text-[hsl(0_0%_42%)] mt-3 leading-relaxed">
              {prob >= 66
                ? "Your goal is well within reach across most simulated cycles. Staying the course is the edge."
                : prob >= 33
                  ? "Your goal is achievable but not guaranteed — contributions during the buy window meaningfully move this number."
                  : "This goal is a stretch for your current size. Adding during the bottom window, or extending your horizon, raises the odds."}
            </p>
          </>
        ) : (
          <p className="text-sm text-[hsl(0_0%_45%)]">Set this goal in <Link href="/portal/settings" className="underline" style={{ color: "#F7931A" }}>Settings</Link> to see its probability.</p>
        )}
      </Card>

      {/* Projection cone (Monte Carlo fan) */}
      {result && (
        <Card className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4" style={{ color: "#F7931A" }} />
            <h2 className="text-sm font-semibold text-white">Projected path to the next peak</h2>
          </div>
          <p className="text-xs text-[hsl(0_0%_42%)] mb-3">
            The shaded band is the 10th–90th percentile range; the line is the median across {result.sims.toLocaleString()} simulations.
          </p>
          <ForecastFan fan={result.fan} goalValue={goalValue} horizonMonths={result.horizonMonths} />
        </Card>
      )}

      {/* Outcome bands */}
      {result && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Worst case", sub: "10th percentile", value: result.p10, color: "#ef4444", icon: ShieldAlert },
            { label: "Expected", sub: "Median outcome", value: result.median, color: "#F7931A", icon: Target },
            { label: "Best case", sub: "90th percentile", value: result.p90, color: "#22c55e", icon: TrendingUp },
          ].map((b) => (
            <Card key={b.label}>
              <b.icon className="w-4 h-4 mb-2" style={{ color: b.color }} />
              <p className="text-[10px] text-[hsl(0_0%_42%)] uppercase tracking-wide">{b.label}</p>
              <p className="text-lg font-bold text-white mt-0.5">{compact(b.value)}</p>
              <p className="text-[10px] text-[hsl(0_0%_38%)] mt-0.5">{b.sub} · {(b.value / base).toFixed(1)}x</p>
            </Card>
          ))}
        </div>
      )}

      {/* Distribution histogram */}
      {result && (
        <Card className="mb-5">
          <h2 className="text-sm font-semibold text-white mb-1">Distribution of outcomes</h2>
          <p className="text-xs text-[hsl(0_0%_42%)] mb-5">Each bar is the share of simulated cycles landing in that value range.</p>
          <div className="relative h-44">
            {/* goal marker */}
            {goalValue > lo && goalValue < hi && (
              <div className="absolute top-0 bottom-6 z-10" style={{ left: xFor(goalValue) }}>
                <div className="w-px h-full" style={{ background: "#fff", opacity: 0.5 }} />
                <span className="absolute -top-0.5 left-1 text-[9px] font-semibold whitespace-nowrap" style={{ color: "#fff" }}>Goal {compact(goalValue)}</span>
              </div>
            )}
            {/* median marker */}
            <div className="absolute top-0 bottom-6 z-10" style={{ left: xFor(result.median) }}>
              <div className="w-px h-full" style={{ background: "#F7931A", opacity: 0.6 }} />
            </div>
            <div className="absolute inset-x-0 bottom-6 top-0 flex items-end gap-[2px]">
              {result.histogram.map((b, i) => {
                const beyondGoal = goalValue > 0 && b.binStart >= goalValue;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t"
                    style={{ height: `${(b.count / maxCount) * 100}%`, minHeight: b.count > 0 ? 2 : 0, background: beyondGoal ? "#22c55e" : "rgba(247,147,26,0.55)" }}
                    title={`${compact(b.binStart)}–${compact(b.binEnd)}: ${b.count}`}
                  />
                );
              })}
            </div>
            {/* axis */}
            <div className="absolute inset-x-0 bottom-0 flex justify-between text-[9px] text-[hsl(0_0%_40%)]">
              <span>{compact(lo)}</span>
              <span>{compact((lo + hi) / 2)}</span>
              <span>{compact(hi)}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-[hsl(0_0%_45%)]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(247,147,26,0.55)" }} /> Below goal</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#22c55e" }} /> At / above goal</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-px" style={{ background: "#F7931A" }} /> Median</span>
          </div>
        </Card>
      )}

      <div className="rounded-xl px-4 py-3 flex items-start gap-2" style={{ background: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 13%)" }}>
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[hsl(0_0%_35%)]" />
        <p className="text-[10px] text-[hsl(0_0%_38%)] leading-relaxed">
          A Monte Carlo model drawing per-asset cycle multiples from historical-style distributions with a shared market factor. It illustrates a range of outcomes — it is not a prediction, and assumes you hold your target allocation through the cycle.
        </p>
      </div>
    </PortalLayout>
  );
}
