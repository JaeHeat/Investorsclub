import { useMemo, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getHoldings, getTradeJournal } from "@/lib/localStore";
import { usePrices } from "@/hooks/usePrices";
import { formatUSD } from "@/lib/utils";
import PortalLayout from "@/components/layout/PortalLayout";
import { Calculator, Info, ChevronDown } from "lucide-react";

const TAX_BRACKETS_LT = [
  { min: 0,       max: 47025,   rate: 0,    label: "0%" },
  { min: 47025,   max: 518900,  rate: 15,   label: "15%" },
  { min: 518900,  max: Infinity, rate: 20,  label: "20%" },
];

const TAX_BRACKETS_ST = [
  { min: 0,       max: 11600,   rate: 10,   label: "10%" },
  { min: 11600,   max: 47150,   rate: 12,   label: "12%" },
  { min: 47150,   max: 100525,  rate: 22,   label: "22%" },
  { min: 100525,  max: 201050,  rate: 24,   label: "24%" },
  { min: 201050,  max: 383900,  rate: 32,   label: "32%" },
  { min: 383900,  max: 487450,  rate: 35,   label: "35%" },
  { min: 487450,  max: Infinity, rate: 37,  label: "37%" },
];

function getEffectiveTaxRate(gain: number, brackets: typeof TAX_BRACKETS_LT): number {
  if (gain <= 0) return 0;
  for (const b of brackets) {
    if (gain >= b.min && gain < b.max) return b.rate;
  }
  return 0;
}

function TaxBand({ label, rate, highlighted }: { label: string; rate: string; highlighted: boolean }) {
  return (
    <div
      className="flex justify-between items-center px-3 py-2 rounded-lg text-sm"
      style={{
        background: highlighted ? "rgba(247,147,26,0.08)" : "hsl(0 0% 9%)",
        border: highlighted ? "1px solid rgba(247,147,26,0.2)" : "1px solid transparent",
      }}
    >
      <span style={{ color: highlighted ? "#F7931A" : "hsl(0 0% 55%)" }}>{label}</span>
      <span className="font-semibold" style={{ color: highlighted ? "#F7931A" : "hsl(0 0% 65%)" }}>{rate}</span>
    </div>
  );
}

export default function TaxPage() {
  const { user } = useAuth();
  const [income, setIncome] = useState("");
  const [showBrackets, setShowBrackets] = useState(false);

  useEffect(() => {
    document.title = "Tax Estimator — CryptoTrackr";
    return () => { document.title = "CryptoTrackr"; };
  }, []);

  const holdings = useMemo(() => (user ? getHoldings(user.id) : []), [user]);
  const journalEntries = useMemo(() => (user ? getTradeJournal(user.id) : []), [user]);

  const coinIds = useMemo(() => holdings.map((h) => h.coingecko_id), [holdings]);
  const { prices, loading } = usePrices(coinIds.length ? coinIds : ["bitcoin"]);

  const annualIncome = parseFloat(income) || 0;

  // Per-asset gain/loss at current prices
  const assetRows = useMemo(() => {
    return holdings.map((h) => {
      const currentPrice = prices[h.coingecko_id] ?? h.avg_cost;
      const costBasis = h.amount * h.avg_cost;
      const currentValue = h.amount * currentPrice;
      const unrealizedGain = currentValue - costBasis;
      const gainPct = costBasis > 0 ? (unrealizedGain / costBasis) * 100 : 0;

      // Determine if long-term (assume all current holdings held >1yr as a simplification)
      const ltRate = getEffectiveTaxRate(Math.max(0, unrealizedGain + annualIncome * 0.3), TAX_BRACKETS_LT);
      const taxDue = unrealizedGain > 0 ? unrealizedGain * (ltRate / 100) : 0;

      return { ...h, currentPrice, costBasis, currentValue, unrealizedGain, gainPct, ltRate, taxDue };
    });
  }, [holdings, prices, annualIncome]);

  const totalUnrealizedGain = assetRows.reduce((s, r) => s + r.unrealizedGain, 0);
  const totalTaxDue = assetRows.reduce((s, r) => s + r.taxDue, 0);
  const totalCurrentValue = assetRows.reduce((s, r) => s + r.currentValue, 0);
  const totalCostBasis = assetRows.reduce((s, r) => s + r.costBasis, 0);

  // Realized gains from journal sells
  const realizedGain = useMemo(() => {
    return journalEntries
      .filter((e) => e.type === "sell")
      .reduce((s, e) => {
        const holding = holdings.find((h) => h.symbol === e.asset_symbol);
        if (!holding) return s;
        const costBasis = e.amount * holding.avg_cost;
        return s + (e.total_usd - costBasis);
      }, 0);
  }, [journalEntries, holdings]);

  const stRate = getEffectiveTaxRate(annualIncome + Math.max(0, realizedGain), TAX_BRACKETS_ST);
  const realizedTaxEstimate = realizedGain > 0 ? realizedGain * (stRate / 100) : 0;

  const effectiveLtRate = getEffectiveTaxRate(Math.max(0, totalUnrealizedGain), TAX_BRACKETS_LT);

  return (
    <PortalLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">Tax Estimator</h1>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "hsl(0 0% 12%)", color: "hsl(0 0% 55%)" }}>
            US · reference rates
          </span>
        </div>
        <p className="text-sm text-[hsl(0_0%_42%)]">
          Rough estimate of tax liability if you sold everything today. Not financial or tax advice — consult a CPA.
        </p>
      </div>

      {/* Income input */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
        <label className="block text-xs font-semibold text-[hsl(0_0%_45%)] uppercase tracking-wide mb-2">
          Your estimated annual income (USD)
        </label>
        <p className="text-xs text-[hsl(0_0%_35%)] mb-3 leading-relaxed">
          Used to determine which long-term and short-term tax brackets apply. Income-only, not including crypto gains.
        </p>
        <div className="relative max-w-xs">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[hsl(0_0%_45%)]">$</span>
          <input
            type="number"
            className="w-full pl-7 pr-4 py-2.5 rounded-xl text-sm text-white bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] outline-none focus:border-[#F7931A] transition-colors"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="100000"
            min={0}
            step={10000}
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Portfolio value", value: totalCurrentValue ? formatUSD(totalCurrentValue) : "—", color: "#F7931A" },
          { label: "Total cost basis", value: formatUSD(totalCostBasis), color: "white" },
          { label: "Unrealized gain", value: totalUnrealizedGain >= 0 ? `+${formatUSD(totalUnrealizedGain)}` : formatUSD(totalUnrealizedGain), color: totalUnrealizedGain >= 0 ? "#22c55e" : "#ef4444" },
          { label: "Est. tax if sold", value: totalTaxDue > 0 ? formatUSD(totalTaxDue) : "None", color: totalTaxDue > 0 ? "#f59e0b" : "#22c55e" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
            <p className="text-[10px] text-[hsl(0_0%_40%)] uppercase tracking-wide mb-1.5">{label}</p>
            <p className="text-lg font-semibold" style={{ color }}>{loading ? "…" : value}</p>
          </div>
        ))}
      </div>

      {/* Per-asset breakdown */}
      {assetRows.length > 0 && (
        <div className="rounded-2xl overflow-hidden mb-5" style={{ border: "1px solid hsl(0 0% 13%)" }}>
          <div className="px-5 py-3.5" style={{ background: "hsl(0 0% 7%)", borderBottom: "1px solid hsl(0 0% 11%)" }}>
            <p className="text-xs font-semibold text-white">Unrealized gains — if you sold today</p>
            <p className="text-[11px] text-[hsl(0_0%_38%)] mt-0.5">Assumes long-term (held &gt;1 year). {effectiveLtRate}% long-term capital gains rate at your income.</p>
          </div>
          <div style={{ background: "hsl(0 0% 6%)" }}>
            <div className="grid grid-cols-5 gap-3 px-5 py-2.5 text-[10px] text-[hsl(0_0%_35%)] uppercase tracking-wide" style={{ borderBottom: "1px solid hsl(0 0% 10%)" }}>
              <span>Asset</span><span>Current value</span><span>Gain / Loss</span><span>Rate</span><span>Est. Tax</span>
            </div>
            {assetRows.map((row) => (
              <div
                key={row.coingecko_id}
                className="grid grid-cols-5 gap-3 px-5 py-3 text-sm items-center"
                style={{ borderBottom: "1px solid hsl(0 0% 8%)" }}
              >
                <span className="font-semibold text-white">{row.symbol}</span>
                <span className="text-[hsl(0_0%_70%)]">{formatUSD(row.currentValue)}</span>
                <span style={{ color: row.unrealizedGain >= 0 ? "#22c55e" : "#ef4444" }}>
                  {row.unrealizedGain >= 0 ? "+" : ""}{formatUSD(row.unrealizedGain)}
                  <span className="text-xs ml-1 opacity-70">({row.gainPct.toFixed(1)}%)</span>
                </span>
                <span className="text-[hsl(0_0%_55%)]">{row.ltRate}%</span>
                <span className="font-semibold" style={{ color: row.taxDue > 0 ? "#f59e0b" : "#22c55e" }}>
                  {row.taxDue > 0 ? formatUSD(row.taxDue) : "None"}
                </span>
              </div>
            ))}
            <div className="grid grid-cols-5 gap-3 px-5 py-3 text-sm items-center" style={{ background: "hsl(0 0% 8%)", borderTop: "1px solid hsl(0 0% 12%)" }}>
              <span className="font-bold text-white col-span-2">Total</span>
              <span className="font-bold" style={{ color: totalUnrealizedGain >= 0 ? "#22c55e" : "#ef4444" }}>
                {totalUnrealizedGain >= 0 ? "+" : ""}{formatUSD(totalUnrealizedGain)}
              </span>
              <span />
              <span className="font-bold" style={{ color: "#f59e0b" }}>{formatUSD(totalTaxDue)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Realized gains from journal */}
      {journalEntries.filter((e) => e.type === "sell").length > 0 && (
        <div className="rounded-2xl p-5 mb-5" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          <p className="text-xs font-semibold text-[hsl(0_0%_45%)] uppercase tracking-wide mb-3">Realized gains — from your trade journal sells</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[hsl(0_0%_50%)]">Realized gain (approx.)</p>
              <p className="text-2xl font-semibold mt-0.5" style={{ color: realizedGain >= 0 ? "#22c55e" : "#ef4444" }}>
                {realizedGain >= 0 ? "+" : ""}{formatUSD(realizedGain)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[hsl(0_0%_50%)]">Short-term tax estimate</p>
              <p className="text-2xl font-semibold mt-0.5" style={{ color: "#f59e0b" }}>
                {realizedTaxEstimate > 0 ? formatUSD(realizedTaxEstimate) : "None"}
              </p>
              <p className="text-xs text-[hsl(0_0%_35%)] mt-0.5">at {stRate}% short-term rate</p>
            </div>
          </div>
        </div>
      )}

      {/* Tax brackets reference */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(0 0% 13%)" }}>
        <button
          onClick={() => setShowBrackets(!showBrackets)}
          className="w-full flex items-center justify-between px-5 py-3.5 text-left"
          style={{ background: "hsl(0 0% 7%)" }}
        >
          <p className="text-xs font-semibold text-[hsl(0_0%_45%)] uppercase tracking-wide">2024 US capital gains brackets</p>
          <ChevronDown className={`w-4 h-4 text-[hsl(0_0%_40%)] transition-transform ${showBrackets ? "rotate-180" : ""}`} />
        </button>
        {showBrackets && (
          <div className="p-5 space-y-5" style={{ background: "hsl(0 0% 6%)" }}>
            <div>
              <p className="text-xs font-semibold text-[hsl(0_0%_45%)] mb-2">Long-term (held &gt;1 year)</p>
              <div className="space-y-1.5">
                {TAX_BRACKETS_LT.map((b) => (
                  <TaxBand
                    key={b.rate}
                    label={b.max === Infinity ? `$${b.min.toLocaleString()}+` : `$${b.min.toLocaleString()} – $${b.max.toLocaleString()}`}
                    rate={b.label}
                    highlighted={effectiveLtRate === b.rate && totalUnrealizedGain > 0}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[hsl(0_0%_45%)] mb-2">Short-term (held &lt;1 year) — taxed as ordinary income</p>
              <div className="space-y-1.5">
                {TAX_BRACKETS_ST.map((b) => (
                  <TaxBand
                    key={b.rate}
                    label={b.max === Infinity ? `$${b.min.toLocaleString()}+` : `$${b.min.toLocaleString()} – $${b.max.toLocaleString()}`}
                    rate={b.label}
                    highlighted={stRate === b.rate && realizedGain > 0}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className="mt-5 rounded-xl px-4 py-3 flex items-start gap-2"
        style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
      >
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[hsl(0_0%_35%)]" />
        <p className="text-[11px] text-[hsl(0_0%_38%)] leading-relaxed">
          This estimator uses 2024 IRS single-filer brackets and simplified assumptions. It does not account for state taxes, wash sale rules, tax-loss harvesting, holding period per lot, or other factors. Always consult a qualified CPA or tax advisor before making decisions based on these figures.
        </p>
      </div>
    </PortalLayout>
  );
}
