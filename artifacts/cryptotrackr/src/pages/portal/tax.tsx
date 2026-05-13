import { useMemo, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getHoldings, getTradeJournal } from "@/lib/localStore";
import { usePrices } from "@/hooks/usePrices";
import { formatUSD } from "@/lib/utils";
import PortalLayout from "@/components/layout/PortalLayout";
import { Calculator, Info, ChevronDown } from "lucide-react";

// ── Tax bracket lookup ────────────────────────────────────────────────────────

type Bracket = { min: number; max: number; rate: number; label: string };

function bracketRate(brackets: Bracket[], amount: number): number {
  if (amount <= 0) return 0;
  for (const b of brackets) {
    if (amount >= b.min && amount < b.max) return b.rate;
  }
  return brackets[brackets.length - 1]?.rate ?? 0;
}

// ── Bracket data ──────────────────────────────────────────────────────────────

// US — 2026 estimated (TCJA extended; IRS inflation-adjusted from 2025 actuals ~+2.8%)
const US_LT: Bracket[] = [
  { min: 0,       max: 49550,   rate: 0,  label: "0%" },
  { min: 49550,   max: 546800,  rate: 15, label: "15%" },
  { min: 546800,  max: Infinity, rate: 20, label: "20%" },
];
const US_ST: Bracket[] = [
  { min: 0,       max: 12200,   rate: 10, label: "10%" },
  { min: 12200,   max: 49550,   rate: 12, label: "12%" },
  { min: 49550,   max: 106050,  rate: 22, label: "22%" },
  { min: 106050,  max: 202350,  rate: 24, label: "24%" },
  { min: 202350,  max: 404100,  rate: 32, label: "32%" },
  { min: 404100,  max: 513000,  rate: 35, label: "35%" },
  { min: 513000,  max: Infinity, rate: 37, label: "37%" },
];

// Canada — 2026 est. federal marginal rates (CAD → USD ~×0.73)
const CA_MARGINAL: Bracket[] = [
  { min: 0,       max: 43850,   rate: 15,   label: "15%" },
  { min: 43850,   max: 87700,   rate: 20.5, label: "20.5%" },
  { min: 87700,   max: 121500,  rate: 26,   label: "26%" },
  { min: 121500,  max: 168000,  rate: 29,   label: "29%" },
  { min: 168000,  max: Infinity, rate: 33,  label: "33%" },
];

// Australia — 2025/26 ATO rates post Stage 3 cuts (AUD → USD ~×0.64)
const AU_MARGINAL: Bracket[] = [
  { min: 0,       max: 12100,   rate: 0,    label: "0%" },
  { min: 12100,   max: 28800,   rate: 19,   label: "19%" },
  { min: 28800,   max: 86400,   rate: 32.5, label: "32.5%" },
  { min: 86400,   max: 121600,  rate: 37,   label: "37%" },
  { min: 121600,  max: Infinity, rate: 45,  label: "45%" },
];

// Japan — income tax + 10% local levy (JPY → USD ~÷155)
const JP_MARGINAL: Bracket[] = [
  { min: 0,       max: 12580,   rate: 15, label: "15%" },
  { min: 12580,   max: 21290,   rate: 20, label: "20%" },
  { min: 21290,   max: 44840,   rate: 30, label: "30%" },
  { min: 44840,   max: 58060,   rate: 33, label: "33%" },
  { min: 58060,   max: 116130,  rate: 43, label: "43%" },
  { min: 116130,  max: 258060,  rate: 50, label: "50%" },
  { min: 258060,  max: Infinity, rate: 55, label: "55%" },
];

// ── Country config ────────────────────────────────────────────────────────────

type CountryCode = "US" | "GB" | "CA" | "AU" | "DE" | "FR" | "SG" | "PT" | "JP" | "AE";

interface CountryConfig {
  code: CountryCode;
  name: string;
  flag: string;
  needsIncome: boolean;
  annualExempt: number; // USD equivalent annual gains exempt
  getLtRate: (income: number, gain: number) => number;
  getStRate: (income: number, gain: number) => number;
  ltDisplay: { label: string; rate: string }[];
  stDisplay: { label: string; rate: string }[];
  ltSectionLabel: string;
  stSectionLabel: string;
  note: string;
}

const COUNTRIES: CountryConfig[] = [
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    needsIncome: true,
    annualExempt: 0,
    getLtRate: (income, gain) => bracketRate(US_LT, income + Math.max(0, gain)),
    getStRate: (income, gain) => bracketRate(US_ST, income + Math.max(0, gain)),
    ltDisplay: US_LT.map((b) => ({
      label: b.max === Infinity ? `$${b.min.toLocaleString()}+` : `$${b.min.toLocaleString()} – $${b.max.toLocaleString()}`,
      rate: b.label,
    })),
    stDisplay: US_ST.map((b) => ({
      label: b.max === Infinity ? `$${b.min.toLocaleString()}+` : `$${b.min.toLocaleString()} – $${b.max.toLocaleString()}`,
      rate: b.label,
    })),
    ltSectionLabel: "Long-term capital gains (held >1 year)",
    stSectionLabel: "Short-term / ordinary income (held <1 year)",
    note: "2026 est. rates — TCJA extended, inflation-adjusted from 2025 IRS actuals. Single filer. State taxes, NIIT, and AMT not included.",
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    needsIncome: true,
    annualExempt: 3800, // £3,000 at ~1.27 USD/GBP
    getLtRate: (income) => (income < 63800 ? 18 : 24),
    getStRate: (income) => (income < 63800 ? 18 : 24),
    ltDisplay: [
      { label: "Basic rate taxpayer (income < ~$63.8k USD)", rate: "18%" },
      { label: "Higher/additional rate taxpayer (income ≥ ~$63.8k USD)", rate: "24%" },
    ],
    stDisplay: [],
    ltSectionLabel: "Capital gains rate (no LT/ST distinction in UK)",
    stSectionLabel: "",
    note: "2025/26 HMRC rates. CGT raised from 10%/20% to 18%/24% in Oct 2024 Autumn Budget. £3,000 annual exempt applied. Basic rate threshold £50,270 frozen (→ ~$63.8k USD). Scottish rates not included.",
  },
  {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    needsIncome: true,
    annualExempt: 0,
    getLtRate: (income, gain) => bracketRate(CA_MARGINAL, income + Math.max(0, gain) * 0.5) * 0.5,
    getStRate: (income, gain) => bracketRate(CA_MARGINAL, income + Math.max(0, gain) * 0.5) * 0.5,
    ltDisplay: CA_MARGINAL.map((b) => ({
      label: b.max === Infinity ? `$${b.min.toLocaleString()}+ USD eq.` : `$${b.min.toLocaleString()} – $${b.max.toLocaleString()} USD eq.`,
      rate: `${b.rate}% marginal × 50% = ${(b.rate * 0.5).toFixed(1)}%`,
    })),
    stDisplay: [],
    ltSectionLabel: "Capital gains — 50% inclusion rate (federal only)",
    stSectionLabel: "",
    note: "2026 est. CRA federal rates. 50% inclusion rate (proposed 2/3 rate was withdrawn Mar 2025). Provincial tax (typically 5–25%) not included. CAD thresholds shown as USD equiv (×0.73).",
  },
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    needsIncome: true,
    annualExempt: 0,
    getLtRate: (income, gain) => bracketRate(AU_MARGINAL, income + Math.max(0, gain) * 0.5) * 0.5,
    getStRate: (income, gain) => bracketRate(AU_MARGINAL, income + Math.max(0, gain)),
    ltDisplay: AU_MARGINAL.map((b) => ({
      label: b.max === Infinity ? `$${b.min.toLocaleString()}+ USD eq.` : `$${b.min.toLocaleString()} – $${b.max.toLocaleString()} USD eq.`,
      rate: `${b.rate}% × 50% discount = ${(b.rate * 0.5).toFixed(1)}%`,
    })),
    stDisplay: AU_MARGINAL.map((b) => ({
      label: b.max === Infinity ? `$${b.min.toLocaleString()}+ USD eq.` : `$${b.min.toLocaleString()} – $${b.max.toLocaleString()} USD eq.`,
      rate: b.label,
    })),
    ltSectionLabel: "Long-term (held >1 year, 50% CGT discount applies)",
    stSectionLabel: "Short-term (held <1 year, no discount)",
    note: "2025/26 ATO rates — Stage 3 tax cuts in effect from Jul 2024. Long-term gains receive 50% discount. AUD thresholds converted to USD (×0.64). Medicare levy (2%) and low-income offsets not included.",
  },
  {
    code: "DE",
    name: "Germany",
    flag: "🇩🇪",
    needsIncome: false,
    annualExempt: 1090, // €1,000 at ~1.09 USD/EUR
    getLtRate: () => 0,
    getStRate: () => 26.375,
    ltDisplay: [{ label: "Held > 1 year — tax-free (Spekulationsfrist)", rate: "0%" }],
    stDisplay: [{ label: "Held ≤ 1 year (Abgeltungsteuer + Solidaritätszuschlag)", rate: "26.375%" }],
    ltSectionLabel: "Long-term (held >1 year) — exempt",
    stSectionLabel: "Short-term (held ≤1 year)",
    note: "German tax law 2026. Crypto held >1 year is completely tax-free (Spekulationsfrist). €1,000 annual gains allowance (~$1,090 USD). Kirchensteuer (church tax) not included.",
  },
  {
    code: "FR",
    name: "France",
    flag: "🇫🇷",
    needsIncome: false,
    annualExempt: 0,
    getLtRate: () => 30,
    getStRate: () => 30,
    ltDisplay: [{ label: "All gains — flat PFU (12.8% income tax + 17.2% social charges)", rate: "30%" }],
    stDisplay: [],
    ltSectionLabel: "Capital gains rate (no LT/ST distinction in France)",
    stSectionLabel: "",
    note: "2026 French Prélèvement Forfaitaire Unique (PFU): 12.8% income tax + 17.2% social charges. Progressive option (barème) may be more favourable for low earners — consult an expert.",
  },
  {
    code: "SG",
    name: "Singapore",
    flag: "🇸🇬",
    needsIncome: false,
    annualExempt: 0,
    getLtRate: () => 0,
    getStRate: () => 0,
    ltDisplay: [{ label: "Capital gains — not taxed", rate: "0%" }],
    stDisplay: [],
    ltSectionLabel: "Capital gains — no tax",
    stSectionLabel: "",
    note: "Singapore has no capital gains tax. Crypto gains are generally exempt for investors (not professional traders). GST may apply to business transactions.",
  },
  {
    code: "PT",
    name: "Portugal",
    flag: "🇵🇹",
    needsIncome: false,
    annualExempt: 0,
    getLtRate: () => 0,
    getStRate: () => 28,
    ltDisplay: [{ label: "Held > 1 year — exempt (Lei n.º 24-D/2022)", rate: "0%" }],
    stDisplay: [{ label: "Held ≤ 1 year — flat rate", rate: "28%" }],
    ltSectionLabel: "Long-term (held >365 days) — exempt",
    stSectionLabel: "Short-term (held ≤365 days)",
    note: "Portuguese crypto tax law since 2023. Assets held over 365 days are tax-free. Non-habitual resident (NHR) regime not reflected.",
  },
  {
    code: "JP",
    name: "Japan",
    flag: "🇯🇵",
    needsIncome: true,
    annualExempt: 0,
    getLtRate: (income, gain) => bracketRate(JP_MARGINAL, income + Math.max(0, gain)),
    getStRate: (income, gain) => bracketRate(JP_MARGINAL, income + Math.max(0, gain)),
    ltDisplay: JP_MARGINAL.map((b) => ({
      label: b.max === Infinity ? `$${b.min.toLocaleString()}+ USD eq.` : `$${b.min.toLocaleString()} – $${b.max.toLocaleString()} USD eq.`,
      rate: b.label,
    })),
    stDisplay: [],
    ltSectionLabel: "All gains — taxed as miscellaneous income (雑所得)",
    stSectionLabel: "",
    note: "Japan taxes crypto as miscellaneous income (雑所得) up to 55%. Rates include 10% local inhabitant tax. JPY thresholds converted to USD (÷155). Strongly recommended to consult a Japanese tax accountant (税理士).",
  },
  {
    code: "AE",
    name: "UAE",
    flag: "🇦🇪",
    needsIncome: false,
    annualExempt: 0,
    getLtRate: () => 0,
    getStRate: () => 0,
    ltDisplay: [{ label: "No personal income or capital gains tax", rate: "0%" }],
    stDisplay: [],
    ltSectionLabel: "Capital gains — no tax",
    stSectionLabel: "",
    note: "UAE has no personal income tax or CGT for individuals. Corporate tax (9%) applies to qualifying businesses. DIFC/ADGM entities follow separate rules.",
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

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

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TaxPage() {
  const { user } = useAuth();
  const [income, setIncome] = useState("");
  const [showBrackets, setShowBrackets] = useState(false);
  const [selectedCode, setSelectedCode] = useState<CountryCode>("US");

  const country = COUNTRIES.find((c) => c.code === selectedCode)!;

  useEffect(() => {
    document.title = "Tax Estimator — CryptoTrackr";
    return () => { document.title = "CryptoTrackr"; };
  }, []);

  // Reset income when switching to a country that doesn't need it
  useEffect(() => {
    if (!country.needsIncome) setIncome("");
  }, [country.needsIncome]);

  const holdings = useMemo(() => (user ? getHoldings(user.id) : []), [user]);
  const journalEntries = useMemo(() => (user ? getTradeJournal(user.id) : []), [user]);

  const coinIds = useMemo(() => holdings.map((h) => h.coingecko_id), [holdings]);
  const { prices, loading } = usePrices(coinIds.length ? coinIds : ["bitcoin"]);

  const annualIncome = parseFloat(income) || 0;

  // Per-asset unrealized gain rows
  const assetRows = useMemo(() => {
    return holdings.map((h) => {
      const currentPrice = prices[h.coingecko_id] ?? h.manual_price ?? h.avg_cost;
      const costBasis = h.amount * h.avg_cost;
      const currentValue = h.amount * currentPrice;
      const unrealizedGain = currentValue - costBasis;
      const gainPct = costBasis > 0 ? (unrealizedGain / costBasis) * 100 : 0;
      const ltRate = country.getLtRate(annualIncome, Math.max(0, unrealizedGain));
      const taxDue = unrealizedGain > 0 ? unrealizedGain * (ltRate / 100) : 0;
      return { ...h, currentPrice, costBasis, currentValue, unrealizedGain, gainPct, ltRate, taxDue };
    });
  }, [holdings, prices, annualIncome, country]);

  const totalUnrealizedGain = assetRows.reduce((s, r) => s + r.unrealizedGain, 0);
  const totalCurrentValue = assetRows.reduce((s, r) => s + r.currentValue, 0);
  const totalCostBasis = assetRows.reduce((s, r) => s + r.costBasis, 0);

  // Apply annual exempt to total tax estimate
  const rawTaxDue = assetRows.reduce((s, r) => s + r.taxDue, 0);
  const effectiveLtRate = country.getLtRate(annualIncome, Math.max(0, totalUnrealizedGain));
  const exemptSaving = country.annualExempt > 0 ? Math.min(rawTaxDue, country.annualExempt * (effectiveLtRate / 100)) : 0;
  const totalTaxDue = Math.max(0, rawTaxDue - exemptSaving);

  // Realized gains from journal sells
  const realizedGain = useMemo(() => {
    return journalEntries
      .filter((e) => e.type === "sell")
      .reduce((s, e) => {
        const holding = holdings.find((h) => h.symbol === e.asset_symbol);
        if (!holding) return s;
        return s + (e.total_usd - e.amount * holding.avg_cost);
      }, 0);
  }, [journalEntries, holdings]);

  const stRate = country.getStRate(annualIncome, Math.max(0, realizedGain));
  const realizedTaxEstimate = realizedGain > 0 ? realizedGain * (stRate / 100) : 0;

  const hasSellJournal = journalEntries.some((e) => e.type === "sell");

  return (
    <PortalLayout>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">Tax Estimator</h1>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "hsl(0 0% 12%)", color: "hsl(0 0% 55%)" }}>
            reference rates
          </span>
        </div>
        <p className="text-sm text-[hsl(0_0%_42%)]">
          Rough estimate of tax liability if you sold everything today. Not financial or tax advice — consult a local tax professional.
        </p>
      </div>

      {/* ── Country selector ────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-4 mb-5" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
        <p className="text-xs font-semibold text-[hsl(0_0%_45%)] uppercase tracking-wide mb-3">Your country</p>
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map((c) => {
            const active = c.code === selectedCode;
            return (
              <button
                key={c.code}
                onClick={() => setSelectedCode(c.code)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: active ? "rgba(247,147,26,0.1)" : "hsl(0 0% 10%)",
                  border: active ? "1px solid rgba(247,147,26,0.35)" : "1px solid hsl(0 0% 16%)",
                  color: active ? "#F7931A" : "hsl(0 0% 60%)",
                }}
              >
                <span>{c.flag}</span>
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Income input (bracket countries only) ───────────────────────────── */}
      {country.needsIncome && (
        <div className="rounded-2xl p-5 mb-5" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          <label className="block text-xs font-semibold text-[hsl(0_0%_45%)] uppercase tracking-wide mb-1">
            Your annual income (USD equivalent)
          </label>
          <p className="text-xs text-[hsl(0_0%_35%)] mb-3 leading-relaxed">
            Used to determine which tax bracket applies. Income only — do not include crypto gains.
            {selectedCode !== "US" && " Enter your local income converted to USD for a rough bracket match."}
          </p>
          <div className="relative max-w-xs">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[hsl(0_0%_45%)]">$</span>
            <input
              type="number"
              className="w-full pl-7 pr-4 py-2.5 rounded-xl text-sm text-white bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] outline-none focus:border-[#F7931A] transition-colors"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="e.g. 80000"
              min={0}
              step={10000}
            />
          </div>
        </div>
      )}

      {/* ── Annual exempt notice ─────────────────────────────────────────────── */}
      {country.annualExempt > 0 && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-5 text-xs"
          style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}
        >
          <span className="font-semibold" style={{ color: "#22c55e" }}>Annual exempt:</span>
          <span style={{ color: "hsl(0 0% 60%)" }}>
            ~{formatUSD(country.annualExempt)} of gains are exempt each tax year in {country.name}. Applied to the total below.
          </span>
        </div>
      )}

      {/* ── Summary cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Portfolio value",  value: totalCurrentValue ? formatUSD(totalCurrentValue) : "—", color: "#F7931A" },
          { label: "Total cost basis", value: formatUSD(totalCostBasis), color: "white" },
          { label: "Unrealized gain",  value: totalUnrealizedGain >= 0 ? `+${formatUSD(totalUnrealizedGain)}` : formatUSD(totalUnrealizedGain), color: totalUnrealizedGain >= 0 ? "#22c55e" : "#ef4444" },
          { label: "Est. tax if sold", value: totalTaxDue > 0 ? formatUSD(totalTaxDue) : "None", color: totalTaxDue > 0 ? "#f59e0b" : "#22c55e" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
            <p className="text-[10px] text-[hsl(0_0%_40%)] uppercase tracking-wide mb-1.5">{label}</p>
            <p className="text-lg font-semibold" style={{ color }}>{loading ? "…" : value}</p>
          </div>
        ))}
      </div>

      {/* ── Per-asset breakdown ──────────────────────────────────────────────── */}
      {assetRows.length > 0 && (
        <div className="rounded-2xl overflow-hidden mb-5" style={{ border: "1px solid hsl(0 0% 13%)" }}>
          <div className="px-5 py-3.5" style={{ background: "hsl(0 0% 7%)", borderBottom: "1px solid hsl(0 0% 11%)" }}>
            <p className="text-xs font-semibold text-white">Unrealized gains — if you sold today</p>
            <p className="text-[11px] text-[hsl(0_0%_38%)] mt-0.5">
              Assumes long-term holding (&gt;1 yr simplification).
              {effectiveLtRate > 0 ? ` ${effectiveLtRate}% long-term rate at your income.` : " Tax-free at long-term rate."}
            </p>
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
                <span className="text-[hsl(0_0%_55%)]">{row.ltRate > 0 ? `${row.ltRate}%` : "0%"}</span>
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
              <span className="font-bold" style={{ color: "#f59e0b" }}>
                {totalTaxDue > 0 ? formatUSD(totalTaxDue) : "None"}
                {exemptSaving > 0 && <span className="text-[10px] text-[hsl(0_0%_40%)] block font-normal">incl. exempt</span>}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Realized gains from journal ──────────────────────────────────────── */}
      {hasSellJournal && (
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
              <p className="text-sm text-[hsl(0_0%_50%)]">Tax estimate on realized</p>
              <p className="text-2xl font-semibold mt-0.5" style={{ color: "#f59e0b" }}>
                {realizedTaxEstimate > 0 ? formatUSD(realizedTaxEstimate) : "None"}
              </p>
              <p className="text-xs text-[hsl(0_0%_35%)] mt-0.5">at {stRate}% rate</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tax brackets reference ───────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(0 0% 13%)" }}>
        <button
          onClick={() => setShowBrackets(!showBrackets)}
          className="w-full flex items-center justify-between px-5 py-3.5 text-left"
          style={{ background: "hsl(0 0% 7%)" }}
        >
          <p className="text-xs font-semibold text-[hsl(0_0%_45%)] uppercase tracking-wide">
            {country.flag} {country.name} — tax rate reference
          </p>
          <ChevronDown className={`w-4 h-4 text-[hsl(0_0%_40%)] transition-transform ${showBrackets ? "rotate-180" : ""}`} />
        </button>
        {showBrackets && (
          <div className="p-5 space-y-5" style={{ background: "hsl(0 0% 6%)" }}>
            {country.ltDisplay.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[hsl(0_0%_45%)] mb-2">{country.ltSectionLabel}</p>
                <div className="space-y-1.5">
                  {country.ltDisplay.map((b, i) => (
                    <TaxBand
                      key={i}
                      label={b.label}
                      rate={b.rate}
                      highlighted={effectiveLtRate > 0 && totalUnrealizedGain > 0 && i === country.ltDisplay.findIndex((d) => d.rate.startsWith(String(effectiveLtRate)))}
                    />
                  ))}
                </div>
              </div>
            )}
            {country.stDisplay.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[hsl(0_0%_45%)] mb-2">{country.stSectionLabel}</p>
                <div className="space-y-1.5">
                  {country.stDisplay.map((b, i) => (
                    <TaxBand
                      key={i}
                      label={b.label}
                      rate={b.rate}
                      highlighted={stRate > 0 && realizedGain > 0 && i === country.stDisplay.findIndex((d) => d.rate.startsWith(String(stRate)))}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Disclaimer ───────────────────────────────────────────────────────── */}
      <div
        className="mt-5 rounded-xl px-4 py-3 flex items-start gap-2"
        style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
      >
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[hsl(0_0%_35%)]" />
        <p className="text-[11px] text-[hsl(0_0%_38%)] leading-relaxed">
          {country.note} This tool uses simplified assumptions and does not account for state/provincial/local taxes, holding period per lot, wash sale rules, tax-loss harvesting, or other jurisdiction-specific rules. Always consult a qualified tax professional before making decisions.
        </p>
      </div>
    </PortalLayout>
  );
}
