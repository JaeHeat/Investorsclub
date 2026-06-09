import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { getHoldings } from "@/lib/localStore";
import { usePrices } from "@/hooks/usePrices";
import { useFearGreed } from "@/hooks/useFearGreed";
import { getCycleConfig } from "@/lib/cycleConfig";
import { getDcaSchedule, getBoosters } from "@/lib/dcaPlan";
import { formatUSD } from "@/lib/utils";
import { getPortfolioPlan, CYCLE_SCENARIOS, calculateProjection } from "@/lib/portfolioPlans";
import PortalLayout from "@/components/layout/PortalLayout";
import { RefreshCw, Info, Gauge, Zap, TrendingDown } from "lucide-react";

const MIN_MONTHLY = 100;
const MAX_MONTHLY = 50000;

export default function DcaPage() {
  const { user, clientProfile } = useAuth();
  const [monthly, setMonthly] = useState(500);
  const [months, setMonths] = useState(18);
  const [monthlyInput, setMonthlyInput] = useState("500");

  useEffect(() => {
    document.title = "DCA Planner — Bitcoin Daily";
    return () => { document.title = "Bitcoin Daily"; };
  }, []);

  const holdings = useMemo(() => (user ? getHoldings(user.id) : []), [user]);
  const allCoinIds = useMemo(
    () => [...new Set(["bitcoin", ...holdings.map((h) => h.coingecko_id)])],
    [holdings]
  );
  const { prices } = usePrices(allCoinIds);
  const { data: fng } = useFearGreed();

  const totalLive = useMemo(() => {
    return holdings.reduce((s, h) => {
      const p = prices[h.coingecko_id] ?? h.manual_price;
      return p ? s + h.amount * p : s;
    }, 0);
  }, [holdings, prices]);

  const risk = clientProfile?.risk_tolerance ?? "moderate";
  const initialValue = clientProfile?.initial_portfolio_value ?? 0;
  const plan = useMemo(() => getPortfolioPlan(risk, initialValue), [risk, initialValue]);
  const base = totalLive > 0 ? totalLive : initialValue;

  // Risk-based pacing + live dip-boosters
  const schedule = useMemo(() => getDcaSchedule(risk), [risk]);
  const cycleConfig = useMemo(() => getCycleConfig(), []);
  const btcPrice = prices["bitcoin"] ?? null;
  const drawdownPct = btcPrice ? ((btcPrice - cycleConfig.peakPrice) / cycleConfig.peakPrice) * 100 : null;
  const { boosters, totalBoostPct } = useMemo(
    () => getBoosters({ fearGreed: fng?.value ?? null, drawdownPct, risk }),
    [fng?.value, drawdownPct, risk]
  );

  // Personalize the planner defaults from the client's saved budget + risk pace.
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (initialized || !clientProfile) return;
    if (clientProfile.monthly_dca_budget) {
      setMonthly(clientProfile.monthly_dca_budget);
      setMonthlyInput(String(clientProfile.monthly_dca_budget));
    }
    setMonths(getDcaSchedule(clientProfile.risk_tolerance).windowMonths);
    setInitialized(true);
  }, [clientProfile, initialized]);

  const totalDca = monthly * months;
  // Higher risk front-loads into the bottom → more time in market → a higher
  // effective compounding factor on contributions.
  const dcaCompoundFactor = risk === "aggressive" ? 0.6 : risk === "conservative" ? 0.4 : 0.5;

  const projections = useMemo(() => {
    if (base <= 0) return null;
    return CYCLE_SCENARIOS.map((s) => {
      const baseProjection = calculateProjection(base, plan, s);
      const dcaProjection = totalDca * s.multipliers.btc * dcaCompoundFactor;
      return {
        scenario: s,
        noAdd: baseProjection,
        withAdd: baseProjection + dcaProjection,
        dcaGain: dcaProjection,
        improvement: totalDca > 0 ? dcaProjection / totalDca : 0,
      };
    });
  }, [base, plan, totalDca]);

  const maxWithAdd = projections ? projections[projections.length - 1].withAdd : 1;

  function handleSliderChange(val: number) {
    setMonthly(val);
    setMonthlyInput(String(val));
  }

  function handleInputChange(raw: string) {
    setMonthlyInput(raw);
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= MIN_MONTHLY && n <= MAX_MONTHLY) {
      setMonthly(n);
    }
  }

  function handleInputBlur() {
    const n = parseInt(monthlyInput, 10);
    if (isNaN(n) || n < MIN_MONTHLY) {
      setMonthly(MIN_MONTHLY);
      setMonthlyInput(String(MIN_MONTHLY));
    } else if (n > MAX_MONTHLY) {
      setMonthly(MAX_MONTHLY);
      setMonthlyInput(String(MAX_MONTHLY));
    } else {
      setMonthly(n);
      setMonthlyInput(String(n));
    }
  }

  return (
    <PortalLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <RefreshCw className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">DCA Planner</h1>
        </div>
        <p className="text-sm text-[hsl(0_0%_42%)]">
          See how regular contributions compound your cycle projections.
        </p>
      </div>

      {/* Risk-based accumulation cadence + live dip-boosters */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
        <div className="flex items-center gap-2 mb-1">
          <Gauge className="w-4 h-4" style={{ color: "#F7931A" }} />
          <h2 className="text-sm font-semibold text-white">Your accumulation cadence</h2>
          <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}>
            {risk}
          </span>
        </div>
        <p className="text-xs text-[hsl(0_0%_45%)] mb-4">{schedule.pace}</p>

        {/* Front-loading curve */}
        <div className="flex items-end gap-1.5 h-20 mb-1.5">
          {schedule.tranches.map((t) => (
            <div key={t.label} className="flex-1 flex flex-col items-center justify-end h-full">
              <span className="text-[10px] font-semibold mb-1" style={{ color: "#F7931A" }}>{t.pct}%</span>
              <div className="w-full rounded-t" style={{ height: `${t.pct * 1.4}%`, minHeight: 6, background: "linear-gradient(180deg, #F7931A, rgba(247,147,26,0.35))" }} />
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 mb-4">
          {schedule.tranches.map((t) => (
            <p key={t.label} className="flex-1 text-center text-[9px] text-[hsl(0_0%_42%)] leading-tight">{t.monthsLabel}</p>
          ))}
        </div>

        {/* Live dip-boosters */}
        <div className="rounded-xl p-3.5" style={{ background: "hsl(0 0% 9%)" }}>
          <div className="flex items-center gap-2 mb-2.5">
            <Zap className="w-3.5 h-3.5" style={{ color: totalBoostPct > 0 ? "#22c55e" : "hsl(0 0% 40%)" }} />
            <p className="text-xs font-semibold text-white">Live dip-boosters</p>
            <span className="ml-auto text-xs font-bold" style={{ color: totalBoostPct > 0 ? "#22c55e" : "hsl(0 0% 45%)" }}>
              {totalBoostPct > 0 ? `+${totalBoostPct}% this month` : "None active"}
            </span>
          </div>
          <div className="space-y-1.5">
            {boosters.map((b) => (
              <div key={b.id} className="flex items-center gap-2 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: b.active ? "#22c55e" : "hsl(0 0% 25%)" }} />
                <span style={{ color: b.active ? "white" : "hsl(0 0% 45%)" }}>{b.label}</span>
                <span className="text-[hsl(0_0%_38%)] hidden sm:inline">— {b.detail}</span>
                {b.active && <span className="ml-auto font-semibold text-green-400">+{b.boostPct}%</span>}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[hsl(0_0%_32%)] mt-2.5 leading-relaxed flex items-start gap-1.5">
            <TrendingDown className="w-3 h-3 shrink-0 mt-0.5" />
            Boosters add to your monthly buy when fear and discounts spike — capped at +{schedule.boosterCapPct}% for your {risk} profile.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div
        className="rounded-2xl p-5 mb-6 space-y-5"
        style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white">Monthly contribution</label>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-[hsl(0_0%_45%)]">$</span>
              <input
                type="number"
                value={monthlyInput}
                onChange={(e) => handleInputChange(e.target.value)}
                onBlur={handleInputBlur}
                min={MIN_MONTHLY}
                max={MAX_MONTHLY}
                className="w-24 px-2 py-1 rounded-lg text-sm font-bold text-right outline-none"
                style={{
                  background: "hsl(0 0% 11%)",
                  border: "1px solid hsl(0 0% 18%)",
                  color: "#F7931A",
                }}
              />
            </div>
          </div>
          <input
            type="range"
            min={MIN_MONTHLY}
            max={MAX_MONTHLY}
            step={100}
            value={monthly}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full accent-[#F7931A]"
          />
          <div className="flex justify-between text-[10px] text-[hsl(0_0%_35%)] mt-1">
            <span>$100</span>
            <span>$50,000</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-white">DCA period</label>
            <span className="text-sm font-bold" style={{ color: "#F7931A" }}>{months} months</span>
          </div>
          <input
            type="range"
            min={3}
            max={36}
            step={1}
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="w-full accent-[#F7931A]"
          />
          <div className="flex justify-between text-[10px] text-[hsl(0_0%_35%)] mt-1">
            <span>3 mo</span>
            <span>36 mo</span>
          </div>
        </div>

        <div
          className="rounded-xl px-4 py-3 flex items-center justify-between"
          style={{ background: "hsl(0 0% 10%)" }}
        >
          <div>
            <p className="text-xs text-[hsl(0_0%_40%)]">Total invested via DCA</p>
            <p className="text-base font-bold text-white">{formatUSD(totalDca)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[hsl(0_0%_40%)]">Current portfolio base</p>
            <p className="text-base font-bold" style={{ color: "#F7931A" }}>{base > 0 ? formatUSD(base) : "—"}</p>
          </div>
        </div>
      </div>

      {/* Scenario projections */}
      <div className="space-y-3 mb-6">
        {projections === null && (
          <div className="rounded-2xl p-8 text-center" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
            <RefreshCw className="w-8 h-8 mx-auto mb-3 text-[hsl(0_0%_25%)]" />
            <p className="text-sm font-semibold text-[hsl(0_0%_45%)]">No portfolio data yet</p>
            <p className="text-xs text-[hsl(0_0%_35%)] mt-1.5 mb-4 leading-relaxed">
              Add your holdings and starting portfolio value in Settings to see personalised DCA projections.
            </p>
            <Link
              href="/portal/settings"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}
            >
              Go to Settings
            </Link>
          </div>
        )}
        {projections?.map(({ scenario, noAdd, withAdd, dcaGain, improvement }) => {
          const barWithAdd = (withAdd / maxWithAdd) * 100;
          const barNoAdd = (noAdd / maxWithAdd) * 100;

          return (
            <div
              key={scenario.key}
              className="rounded-2xl p-4"
              style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: scenario.color }} />
                <p className="text-sm font-semibold text-white">{scenario.label}</p>
                <p className="text-xs text-[hsl(0_0%_40%)] ml-auto">{scenario.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="rounded-xl p-3" style={{ background: "hsl(0 0% 10%)" }}>
                  <p className="text-[10px] text-[hsl(0_0%_40%)] mb-1">Without DCA</p>
                  <p className="text-sm font-bold text-white">{formatUSD(noAdd)}</p>
                  <p className="text-[10px] text-[hsl(0_0%_38%)]">{(noAdd / (base || 1)).toFixed(1)}x</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: `${scenario.color}10` }}>
                  <p className="text-[10px] mb-1" style={{ color: scenario.color }}>With DCA (+{formatUSD(totalDca)})</p>
                  <p className="text-sm font-bold text-white">{formatUSD(withAdd)}</p>
                  <p className="text-[10px]" style={{ color: scenario.color }}>+{formatUSD(dcaGain)} extra</p>
                </div>
              </div>

              {/* Stacked bar */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[hsl(0_0%_40%)] w-16 shrink-0">Base</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: "hsl(0 0% 12%)" }}>
                    <div className="h-full rounded-full" style={{ width: `${barNoAdd}%`, background: `${scenario.color}55` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-16 shrink-0" style={{ color: scenario.color }}>+ DCA</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: "hsl(0 0% 12%)" }}>
                    <div className="h-full rounded-full" style={{ width: `${barWithAdd}%`, background: scenario.color }} />
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-[hsl(0_0%_38%)] mt-2">
                Each dollar contributed generates an estimated {improvement.toFixed(1)}x under this scenario.
              </p>
            </div>
          );
        })}
      </div>

      <div
        className="rounded-xl px-4 py-3 flex items-start gap-2"
        style={{ background: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 13%)" }}
      >
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[hsl(0_0%_35%)]" />
        <p className="text-[10px] text-[hsl(0_0%_38%)] leading-relaxed">
          DCA projections assume contributions are deployed at an average of 50% of the cycle multiplier, since later contributions have less time to compound. Allocations follow your current plan ratios. Not financial advice.
        </p>
      </div>
    </PortalLayout>
  );
}
