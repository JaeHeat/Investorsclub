import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getHoldings } from "@/lib/localStore";
import { usePrices } from "@/hooks/usePrices";
import { formatUSD } from "@/lib/utils";
import { getPortfolioPlan, CYCLE_SCENARIOS, calculateProjection } from "@/lib/portfolioPlans";
import PortalLayout from "@/components/layout/PortalLayout";
import { RefreshCw, TrendingUp, Info } from "lucide-react";

export default function DcaPage() {
  const { user, clientProfile } = useAuth();
  const [monthly, setMonthly] = useState(500);
  const [months, setMonths] = useState(18);

  useEffect(() => {
    document.title = "DCA Planner — CryptoTrackr";
    return () => { document.title = "CryptoTrackr"; };
  }, []);

  const holdings = useMemo(() => (user ? getHoldings(user.id) : []), [user]);
  const allCoinIds = useMemo(() => [...new Set(holdings.map((h) => h.coingecko_id))], [holdings]);
  const { prices } = usePrices(allCoinIds);

  const totalLive = useMemo(() => {
    return holdings.reduce((s, h) => {
      const p = prices[h.coingecko_id];
      return p ? s + h.amount * p : s;
    }, 0);
  }, [holdings, prices]);

  const risk = clientProfile?.risk_tolerance ?? "moderate";
  const initialValue = clientProfile?.initial_portfolio_value ?? 0;
  const plan = useMemo(() => getPortfolioPlan(risk, initialValue), [risk, initialValue]);
  const base = totalLive > 0 ? totalLive : initialValue;

  const totalDca = monthly * months;
  const dcaCompoundFactor = 0.5;

  const projections = useMemo(() => {
    if (base <= 0) return null;
    return CYCLE_SCENARIOS.map((s) => {
      const baseProjection = calculateProjection(base, plan, s);
      const dcaProjection = totalDca * s.multipliers.BTC * dcaCompoundFactor;
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

      {/* Controls */}
      <div
        className="rounded-2xl p-5 mb-6 space-y-5"
        style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
      >
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-white">Monthly contribution</label>
            <span className="text-sm font-bold" style={{ color: "#F7931A" }}>{formatUSD(monthly)}</span>
          </div>
          <input
            type="range"
            min={100}
            max={5000}
            step={100}
            value={monthly}
            onChange={(e) => setMonthly(Number(e.target.value))}
            className="w-full accent-[#F7931A]"
          />
          <div className="flex justify-between text-[10px] text-[hsl(0_0%_35%)] mt-1">
            <span>$100</span>
            <span>$5,000</span>
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
          <div className="rounded-2xl p-6 text-center" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
            <p className="text-sm text-[hsl(0_0%_40%)]">Loading portfolio data...</p>
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
