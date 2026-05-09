import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { upsertClientProfile, setHoldings } from "@/lib/localStore";
import type { HoldingAsset } from "@/lib/types";
import {
  Bitcoin, ChevronRight, ChevronLeft, Check, AlertCircle,
  Calendar, ClipboardList, BarChart2, Plus, X, Wallet,
} from "lucide-react";

const STEPS = 4;

const RISK_LEVELS = [
  { value: "conservative", label: "Conservative", description: "Capital preservation first" },
  { value: "moderate", label: "Moderate", description: "Balanced risk/reward" },
  { value: "aggressive", label: "Aggressive", description: "Maximum growth potential" },
];

const TIME_HORIZONS = [
  { value: "1_2_years", label: "1–2 years" },
  { value: "2_3_years", label: "2–3 years" },
  { value: "4_plus_years", label: "4+ years" },
];

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Netherlands", "Switzerland", "Singapore", "Japan",
  "United Arab Emirates", "Brazil", "India", "South Korea", "Other",
];

const QUICK_ADD_ASSETS = [
  { coingecko_id: "bitcoin",    symbol: "BTC",  name: "Bitcoin",   color: "#F7931A" },
  { coingecko_id: "ethereum",   symbol: "ETH",  name: "Ethereum",  color: "#627EEA" },
  { coingecko_id: "solana",     symbol: "SOL",  name: "Solana",    color: "#9945FF" },
];

const MORE_ASSETS = [
  { coingecko_id: "avalanche-2",      symbol: "AVAX", name: "Avalanche",  color: "#E84142" },
  { coingecko_id: "ripple",           symbol: "XRP",  name: "XRP",        color: "#00AAE4" },
  { coingecko_id: "cardano",          symbol: "ADA",  name: "Cardano",    color: "#0033AD" },
  { coingecko_id: "sui",              symbol: "SUI",  name: "Sui",        color: "#4DA2FF" },
  { coingecko_id: "chainlink",        symbol: "LINK", name: "Chainlink",  color: "#2A5ADA" },
  { coingecko_id: "polkadot",         symbol: "DOT",  name: "Polkadot",   color: "#E6007A" },
  { coingecko_id: "uniswap",          symbol: "UNI",  name: "Uniswap",    color: "#FF007A" },
  { coingecko_id: "pepe",             symbol: "PEPE", name: "Pepe",       color: "#4CAF50" },
  { coingecko_id: "tether",           symbol: "USDT", name: "USDT",       color: "#26A17B" },
  { coingecko_id: "usd-coin",         symbol: "USDC", name: "USDC",       color: "#2775CA" },
];

type HoldingRow = {
  coingecko_id: string;
  symbol: string;
  name: string;
  color: string;
  amount: string;
  avg_cost: string;
};

function autoDetectCountry(): string {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const region = locale.split("-")[1];
    if (!region) return "";
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    const countryName = names.of(region) ?? "";
    if (COUNTRIES.includes(countryName)) return countryName;
    return "";
  } catch {
    return "";
  }
}

export default function OnboardingPage() {
  const { user, clientProfile, loading, refreshClientProfile } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && clientProfile?.onboarding_completed) {
      setLocation("/portal");
    }
  }, [loading, clientProfile, setLocation]);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [showMoreAssets, setShowMoreAssets] = useState(false);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    full_name: "",
    country: autoDetectCountry(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    discord_username: "",
    in_crypto: true,
    cash_amount: "",
    experience_level: "",
    current_approach: "",
    tax_situation: "",
    custody: "",
    call_preference: "",
    investment_goal_usd: "",
    risk_tolerance: "",
    time_horizon: "",
    notes: "",
  });

  const [holdingRows, setHoldingRows] = useState<HoldingRow[]>([]);

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setStepErrors((prev) => ({ ...prev, [field]: "" }));
  }

  // ── Holdings helpers ────────────────────────────────────────────────────────
  function addAsset(asset: typeof QUICK_ADD_ASSETS[0]) {
    if (holdingRows.find((r) => r.coingecko_id === asset.coingecko_id)) return;
    setHoldingRows((prev) => [...prev, { ...asset, amount: "", avg_cost: "" }]);
  }

  function removeAsset(id: string) {
    setHoldingRows((prev) => prev.filter((r) => r.coingecko_id !== id));
  }

  function updateHoldingRow(id: string, field: "amount" | "avg_cost", value: string) {
    setHoldingRows((prev) =>
      prev.map((r) => (r.coingecko_id === id ? { ...r, [field]: value } : r))
    );
    setStepErrors((prev) => ({ ...prev, holdings: "" }));
  }

  const portfolioTotal = useMemo(() => {
    if (!form.in_crypto) return parseFloat(form.cash_amount) || 0;
    return holdingRows.reduce((s, r) => {
      const amt = parseFloat(r.amount) || 0;
      const cost = parseFloat(r.avg_cost) || 0;
      return s + amt * cost;
    }, 0);
  }, [holdingRows, form.in_crypto, form.cash_amount]);

  // ── Validation ──────────────────────────────────────────────────────────────
  function validateStep(s: number): Record<string, string> {
    const errors: Record<string, string> = {};
    if (s === 1) {
      if (!form.full_name.trim()) errors.full_name = "Full name is required";
      if (!form.country.trim()) errors.country = "Country is required";
    }
    if (s === 2) {
      if (!form.in_crypto) {
        const cash = parseFloat(form.cash_amount);
        if (!form.cash_amount || isNaN(cash) || cash < 0)
          errors.cash_amount = "Enter your total investable capital";
      }
    }
    if (s === 3) {
      const goalUsd = parseFloat(form.investment_goal_usd);
      if (!form.investment_goal_usd || isNaN(goalUsd) || goalUsd <= 0)
        errors.investment_goal_usd = "Enter your target portfolio value";
      if (!form.risk_tolerance) errors.risk_tolerance = "Select a risk tolerance";
      if (!form.time_horizon) errors.time_horizon = "Select a time horizon";
    }
    return errors;
  }

  function handleNext() {
    const errors = validateStep(step);
    if (Object.keys(errors).length > 0) { setStepErrors(errors); return; }
    setStepErrors({});
    setStep(step + 1);
  }

  function handleSubmit() {
    const errors = validateStep(step);
    if (Object.keys(errors).length > 0) { setStepErrors(errors); return; }
    if (!user) return;
    setSubmitting(true);

    // Build valid holdings
    const validHoldings: HoldingAsset[] = holdingRows
      .filter((r) => parseFloat(r.amount) > 0)
      .map((r) => ({
        coingecko_id: r.coingecko_id,
        symbol: r.symbol,
        name: r.name,
        amount: parseFloat(r.amount),
        avg_cost: parseFloat(r.avg_cost) || 0,
      }));

    if (validHoldings.length > 0) {
      setHoldings(user.id, validHoldings);
    }

    upsertClientProfile({
      user_id: user.id,
      full_name: form.full_name,
      country: form.country,
      timezone: form.timezone,
      discord_username: form.discord_username || null,
      btc_holdings: null,
      avg_cost_basis: null,
      investment_goal: form.investment_goal_usd,
      risk_tolerance: form.risk_tolerance,
      time_horizon: form.time_horizon,
      notes: form.notes,
      onboarding_completed: true,
      initial_portfolio_value: portfolioTotal || null,
      high_water_mark: portfolioTotal || null,
    });

    refreshClientProfile();
    setStep(5);
    setSubmitting(false);
  }

  const progress = step >= 1 && step <= STEPS ? (step / STEPS) * 100 : step > STEPS ? 100 : 0;

  const inputClass = "w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-[hsl(0_0%_30%)] outline-none transition-colors";
  const inputStyle = { background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 16%)" };
  const errorStyle = { background: "hsl(0 0% 10%)", border: "1px solid rgba(239,68,68,0.5)" };

  function FieldError({ field }: { field: string }) {
    if (!stepErrors[field]) return null;
    return (
      <div className="flex items-center gap-1.5 mt-1.5">
        <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
        <p className="text-xs text-red-400">{stepErrors[field]}</p>
      </div>
    );
  }

  const goalUsd = parseFloat(form.investment_goal_usd);
  const goalMultiple =
    portfolioTotal > 0 && !isNaN(goalUsd) && goalUsd > 0
      ? (goalUsd / portfolioTotal).toFixed(1)
      : null;

  const addedIds = new Set(holdingRows.map((r) => r.coingecko_id));

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "hsl(0 0% 4%)" }}
    >
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 justify-center mb-10">
          <Bitcoin className="w-6 h-6" style={{ color: "#F7931A" }} />
          <span className="text-lg font-semibold tracking-tight text-white">CryptoTrackr</span>
        </div>

        {step >= 1 && step <= STEPS && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-[hsl(0_0%_45%)]">Step {step} of {STEPS}</span>
              <span className="text-xs text-[hsl(0_0%_45%)]">{Math.round(progress)}%</span>
            </div>
            <div className="h-0.5 rounded-full" style={{ background: "hsl(0 0% 13%)" }}>
              <div
                className="h-0.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: "#F7931A" }}
              />
            </div>
          </div>
        )}

        <div
          className="rounded-2xl p-8"
          style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
        >
          {/* ── STEP 0: Welcome ───────────────────────────────────────────── */}
          {step === 0 && (
            <div data-testid="onboarding-welcome">
              <h2 className="text-xl font-semibold text-white mb-2">Welcome to your client portal</h2>
              <p className="text-sm text-[hsl(0_0%_50%)] mb-8 leading-relaxed">
                Before your first audit call, let's get you set up. This takes about 5 minutes and means your consultant can hit the ground running on day one.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  { icon: ClipboardList, label: "Your details",         desc: "Name, country, timezone, Discord" },
                  { icon: Wallet,        label: "Your holdings",        desc: "Each asset, quantity, and average entry price" },
                  { icon: BarChart2,     label: "Cash position",        desc: "Dry powder available for the next cycle" },
                  { icon: Calendar,      label: "Investment goals",     desc: "Target value, risk, and time horizon" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-xl p-3.5"
                    style={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 14%)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(247,147,26,0.1)" }}
                    >
                      <Icon className="w-4 h-4" style={{ color: "#F7931A" }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-xs text-[hsl(0_0%_45%)]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                data-testid="button-start"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold"
                style={{ background: "#F7931A", color: "#0A0A0A" }}
              >
                Get started <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP 1: Personal details ──────────────────────────────────── */}
          {step === 1 && (
            <div data-testid="onboarding-step-1">
              <h2 className="text-xl font-semibold text-white mb-1">Your details</h2>
              <p className="text-sm text-[hsl(0_0%_50%)] mb-7">Basic info to personalise your portal</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-1.5 uppercase tracking-wide">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => update("full_name", e.target.value)}
                    placeholder="Jane Smith"
                    data-testid="input-full-name"
                    className={inputClass}
                    style={stepErrors.full_name ? errorStyle : inputStyle}
                  />
                  <FieldError field="full_name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-1.5 uppercase tracking-wide">
                    Country <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.country}
                    onChange={(e) => update("country", e.target.value)}
                    data-testid="input-country"
                    className={inputClass}
                    style={stepErrors.country ? errorStyle : inputStyle}
                  >
                    <option value="">Select your country...</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <FieldError field="country" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-1.5 uppercase tracking-wide">Timezone</label>
                  <input
                    type="text"
                    value={form.timezone}
                    onChange={(e) => update("timezone", e.target.value)}
                    data-testid="input-timezone"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-1.5 uppercase tracking-wide">
                    Discord username{" "}
                    <span className="text-[hsl(0_0%_40%)] normal-case font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[hsl(0_0%_40%)]">@</span>
                    <input
                      type="text"
                      value={form.discord_username}
                      onChange={(e) => update("discord_username", e.target.value.replace(/^@/, ""))}
                      placeholder="yourhandle"
                      data-testid="input-discord"
                      className={`${inputClass} pl-8`}
                      style={inputStyle}
                    />
                  </div>
                  <p className="text-[10px] text-[hsl(0_0%_35%)] mt-1.5">Used to set up your private Discord channel</p>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Holdings ──────────────────────────────────────────── */}
          {step === 2 && (
            <div data-testid="onboarding-step-2">
              <h2 className="text-xl font-semibold text-white mb-1">Your holdings</h2>
              <p className="text-sm text-[hsl(0_0%_50%)] mb-6 leading-relaxed">
                Add each asset you hold with your quantity and average entry price. This powers your P&L, exit plan, and cycle projections.
              </p>

              {/* Quick-add chips */}
              <div className="mb-4">
                <p className="text-xs text-[hsl(0_0%_45%)] mb-2.5 uppercase tracking-wide font-medium">Quick add</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_ADD_ASSETS.map((asset) => {
                    const added = addedIds.has(asset.coingecko_id);
                    return (
                      <button
                        key={asset.coingecko_id}
                        type="button"
                        onClick={() => !added && addAsset(asset)}
                        disabled={added}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: added ? `${asset.color}18` : "hsl(0 0% 11%)",
                          border: `1px solid ${added ? asset.color + "50" : "hsl(0 0% 18%)"}`,
                          color: added ? asset.color : "hsl(0 0% 70%)",
                          opacity: added ? 0.7 : 1,
                        }}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ background: asset.color }} />
                        {asset.symbol}
                        {added && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setShowMoreAssets(!showMoreAssets)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: showMoreAssets ? "rgba(247,147,26,0.08)" : "hsl(0 0% 11%)",
                      border: `1px solid ${showMoreAssets ? "rgba(247,147,26,0.3)" : "hsl(0 0% 18%)"}`,
                      color: showMoreAssets ? "#F7931A" : "hsl(0 0% 70%)",
                    }}
                  >
                    <Plus className="w-3 h-3" /> More assets
                  </button>
                </div>
              </div>

              {/* More assets expanded */}
              {showMoreAssets && (
                <div
                  className="mb-4 rounded-xl p-3"
                  style={{ background: "hsl(0 0% 9%)", border: "1px solid hsl(0 0% 15%)" }}
                >
                  <div className="flex flex-wrap gap-2">
                    {MORE_ASSETS.map((asset) => {
                      const added = addedIds.has(asset.coingecko_id);
                      return (
                        <button
                          key={asset.coingecko_id}
                          type="button"
                          onClick={() => { if (!added) { addAsset(asset); } }}
                          disabled={added}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                          style={{
                            background: added ? `${asset.color}15` : "hsl(0 0% 12%)",
                            border: `1px solid ${added ? asset.color + "40" : "hsl(0 0% 19%)"}`,
                            color: added ? asset.color : "hsl(0 0% 65%)",
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: asset.color }} />
                          {asset.symbol}
                          {added && <Check className="w-2.5 h-2.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Holding rows */}
              {holdingRows.length > 0 && (
                <div className="space-y-2 mb-4">
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-1 mb-1">
                    <p className="text-[10px] text-[hsl(0_0%_38%)] uppercase tracking-wide">Amount held</p>
                    <p className="text-[10px] text-[hsl(0_0%_38%)] uppercase tracking-wide">Avg entry price</p>
                    <span className="w-7" />
                  </div>
                  {holdingRows.map((row) => {
                    const amt = parseFloat(row.amount) || 0;
                    const cost = parseFloat(row.avg_cost) || 0;
                    const value = amt * cost;
                    return (
                      <div
                        key={row.coingecko_id}
                        className="rounded-xl p-3"
                        style={{ background: "hsl(0 0% 9%)", border: "1px solid hsl(0 0% 15%)" }}
                      >
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: row.color }} />
                          <span className="text-sm font-semibold text-white">{row.symbol}</span>
                          <span className="text-xs text-[hsl(0_0%_40%)]">{row.name}</span>
                          {value > 0 && (
                            <span className="ml-auto text-xs font-medium" style={{ color: row.color }}>
                              ≈ ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                          <input
                            type="number"
                            value={row.amount}
                            onChange={(e) => updateHoldingRow(row.coingecko_id, "amount", e.target.value)}
                            placeholder={row.symbol === "BTC" ? "e.g. 1.5" : row.symbol === "ETH" ? "e.g. 12" : "0"}
                            step="any"
                            min="0"
                            className="px-3 py-2 rounded-lg text-sm text-white placeholder-[hsl(0_0%_28%)] outline-none w-full"
                            style={{ background: "hsl(0 0% 12%)", border: "1px solid hsl(0 0% 18%)" }}
                          />
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[hsl(0_0%_40%)]">$</span>
                            <input
                              type="number"
                              value={row.avg_cost}
                              onChange={(e) => updateHoldingRow(row.coingecko_id, "avg_cost", e.target.value)}
                              placeholder={row.symbol === "BTC" ? "38000" : row.symbol === "ETH" ? "2000" : "0"}
                              step="any"
                              min="0"
                              className="pl-6 pr-2 py-2 rounded-lg text-sm text-white placeholder-[hsl(0_0%_28%)] outline-none w-full"
                              style={{ background: "hsl(0 0% 12%)", border: "1px solid hsl(0 0% 18%)" }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAsset(row.coingecko_id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors text-[hsl(0_0%_35%)] hover:text-[#ef4444]"
                            style={{ background: "hsl(0 0% 13%)" }}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {holdingRows.length === 0 && (
                <div
                  className="rounded-xl p-5 text-center mb-4"
                  style={{ background: "hsl(0 0% 9%)", border: "1px dashed hsl(0 0% 18%)" }}
                >
                  <p className="text-sm text-[hsl(0_0%_38%)]">Add assets above to begin</p>
                  <p className="text-xs text-[hsl(0_0%_30%)] mt-1">Or skip if you're starting from cash</p>
                </div>
              )}

              {/* Portfolio total */}
              {portfolioTotal > 0 && (
                <div
                  className="rounded-xl px-4 py-3 flex items-center justify-between mb-4"
                  style={{ background: "rgba(247,147,26,0.06)", border: "1px solid rgba(247,147,26,0.15)" }}
                >
                  <div>
                    <p className="text-xs text-[hsl(0_0%_45%)]">Total portfolio at cost basis</p>
                    <p className="text-[10px] text-[hsl(0_0%_35%)] mt-0.5">Live value shown in your portal</p>
                  </div>
                  <p className="text-lg font-semibold" style={{ color: "#F7931A" }}>
                    ${portfolioTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </p>
                </div>
              )}

              {/* Cash / dry powder */}
              <div>
                <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-1.5 uppercase tracking-wide">
                  Cash / dry powder{" "}
                  <span className="text-[hsl(0_0%_40%)] normal-case font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[hsl(0_0%_45%)]">$</span>
                  <input
                    type="number"
                    value={form.cash_amount}
                    onChange={(e) => update("cash_amount", e.target.value)}
                    placeholder="e.g. 25000"
                    step="1000"
                    min="0"
                    data-testid="input-cash"
                    className={`${inputClass} pl-7 pr-14`}
                    style={inputStyle}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[hsl(0_0%_45%)]">USD</span>
                </div>
                <p className="text-[10px] text-[hsl(0_0%_35%)] mt-1.5">
                  Stablecoins, fiat reserves, or uninvested capital earmarked for the next cycle
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 3: Experience & context ─────────────────────────────── */}
          {step === 3 && (
            <div data-testid="onboarding-step-3">
              <h2 className="text-xl font-semibold text-white mb-1">Experience & context</h2>
              <p className="text-sm text-[hsl(0_0%_50%)] mb-7 leading-relaxed">
                Helps your consultant tailor the strategy and communication style for you.
              </p>
              <div className="space-y-6">
                {/* Experience level */}
                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-2.5 uppercase tracking-wide">
                    Crypto experience
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "new",      label: "New",      desc: "First cycle" },
                      { value: "some",     label: "Some",     desc: "1–2 cycles" },
                      { value: "veteran",  label: "Veteran",  desc: "3+ cycles" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => update("experience_level", opt.value)}
                        className="p-3 rounded-xl text-center transition-all"
                        style={{
                          background: form.experience_level === opt.value ? "rgba(247,147,26,0.1)" : "hsl(0 0% 10%)",
                          border: `1px solid ${form.experience_level === opt.value ? "rgba(247,147,26,0.4)" : "hsl(0 0% 16%)"}`,
                        }}
                      >
                        <p className="text-xs font-medium text-white">{opt.label}</p>
                        <p className="text-[10px] text-[hsl(0_0%_45%)] mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current approach */}
                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-2.5 uppercase tracking-wide">
                    Current approach
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "hold",       label: "Holding",       desc: "Waiting for the cycle" },
                      { value: "dca_in",     label: "DCA-ing in",    desc: "Regular buys" },
                      { value: "in_cash",    label: "In cash",       desc: "Waiting to deploy" },
                      { value: "active",     label: "Active trader", desc: "Buying & selling" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => update("current_approach", opt.value)}
                        className="p-3 rounded-xl text-left transition-all"
                        style={{
                          background: form.current_approach === opt.value ? "rgba(247,147,26,0.1)" : "hsl(0 0% 10%)",
                          border: `1px solid ${form.current_approach === opt.value ? "rgba(247,147,26,0.4)" : "hsl(0 0% 16%)"}`,
                        }}
                      >
                        <p className="text-xs font-medium text-white">{opt.label}</p>
                        <p className="text-[10px] text-[hsl(0_0%_45%)] mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tax situation */}
                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-2.5 uppercase tracking-wide">
                    Tax on crypto gains?
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: "yes",     label: "Yes",          desc: "Capital gains applies" },
                      { value: "no",      label: "No",           desc: "Tax-exempt jurisdiction" },
                      { value: "unsure",  label: "Not sure",     desc: "Will check" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => update("tax_situation", opt.value)}
                        className="flex-1 p-3 rounded-xl text-center transition-all"
                        style={{
                          background: form.tax_situation === opt.value ? "rgba(247,147,26,0.1)" : "hsl(0 0% 10%)",
                          border: `1px solid ${form.tax_situation === opt.value ? "rgba(247,147,26,0.4)" : "hsl(0 0% 16%)"}`,
                        }}
                      >
                        <p className="text-xs font-medium text-white">{opt.label}</p>
                        <p className="text-[10px] text-[hsl(0_0%_45%)] mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custody */}
                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-2.5 uppercase tracking-wide">
                    How do you hold your crypto?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "self_custody",  label: "Self-custody",  desc: "Hardware / software wallet" },
                      { value: "exchange",       label: "Exchange",      desc: "Centralized exchange" },
                      { value: "mix",            label: "Both",         desc: "Mix of self + exchange" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => update("custody", opt.value)}
                        className="p-3 rounded-xl text-center transition-all"
                        style={{
                          background: form.custody === opt.value ? "rgba(247,147,26,0.1)" : "hsl(0 0% 10%)",
                          border: `1px solid ${form.custody === opt.value ? "rgba(247,147,26,0.4)" : "hsl(0 0% 16%)"}`,
                        }}
                      >
                        <p className="text-xs font-medium text-white">{opt.label}</p>
                        <p className="text-[10px] text-[hsl(0_0%_45%)] mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred call time */}
                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-2.5 uppercase tracking-wide">
                    Best time for calls{" "}
                    <span className="text-[hsl(0_0%_40%)] normal-case font-normal">(optional)</span>
                  </label>
                  <div className="flex gap-2">
                    {["Morning", "Afternoon", "Evening"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => update("call_preference", t)}
                        className="flex-1 py-2.5 rounded-xl text-sm text-center transition-all"
                        style={{
                          background: form.call_preference === t ? "rgba(247,147,26,0.1)" : "hsl(0 0% 10%)",
                          border: `1px solid ${form.call_preference === t ? "rgba(247,147,26,0.4)" : "hsl(0 0% 16%)"}`,
                          color: form.call_preference === t ? "#F7931A" : "hsl(0 0% 70%)",
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Investment goals ──────────────────────────────────── */}
          {step === 4 && (
            <div data-testid="onboarding-step-4">
              <h2 className="text-xl font-semibold text-white mb-1">Investment goals</h2>
              <p className="text-sm text-[hsl(0_0%_50%)] mb-7">Your target for this cycle</p>
              <div className="space-y-6">
                {/* Dollar target */}
                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-1.5 uppercase tracking-wide">
                    Target portfolio value this cycle <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[hsl(0_0%_45%)]">$</span>
                    <input
                      type="number"
                      value={form.investment_goal_usd}
                      onChange={(e) => update("investment_goal_usd", e.target.value)}
                      placeholder="500000"
                      step="10000"
                      min="1"
                      data-testid="input-investment-goal"
                      className={`${inputClass} pl-7 pr-14`}
                      style={stepErrors.investment_goal_usd ? errorStyle : inputStyle}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[hsl(0_0%_45%)]">USD</span>
                  </div>
                  {goalMultiple && (
                    <p className="text-xs text-[hsl(0_0%_42%)] mt-1.5">
                      That's a{" "}
                      <span className="text-white font-medium">{goalMultiple}x</span>{" "}
                      return on your ${portfolioTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })} portfolio
                    </p>
                  )}
                  <FieldError field="investment_goal_usd" />
                </div>

                {/* Risk tolerance */}
                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-2.5 uppercase tracking-wide">
                    Risk tolerance <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    {RISK_LEVELS.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => update("risk_tolerance", r.value)}
                        data-testid={`risk-${r.value}`}
                        className="flex-1 p-3 rounded-xl text-center transition-all"
                        style={{
                          background: form.risk_tolerance === r.value ? "rgba(247,147,26,0.1)" : "hsl(0 0% 10%)",
                          border: `1px solid ${form.risk_tolerance === r.value ? "rgba(247,147,26,0.4)" : stepErrors.risk_tolerance ? "rgba(239,68,68,0.4)" : "hsl(0 0% 16%)"}`,
                        }}
                      >
                        <p className="text-xs font-medium text-white">{r.label}</p>
                        <p className="text-[10px] text-[hsl(0_0%_45%)] mt-0.5">{r.description}</p>
                      </button>
                    ))}
                  </div>
                  <FieldError field="risk_tolerance" />
                </div>

                {/* Time horizon */}
                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-2.5 uppercase tracking-wide">
                    Time horizon <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    {TIME_HORIZONS.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => update("time_horizon", t.value)}
                        data-testid={`horizon-${t.value}`}
                        className="flex-1 py-2.5 px-3 rounded-xl text-sm text-center transition-all"
                        style={{
                          background: form.time_horizon === t.value ? "rgba(247,147,26,0.1)" : "hsl(0 0% 10%)",
                          border: `1px solid ${form.time_horizon === t.value ? "rgba(247,147,26,0.4)" : stepErrors.time_horizon ? "rgba(239,68,68,0.4)" : "hsl(0 0% 16%)"}`,
                          color: form.time_horizon === t.value ? "#F7931A" : "hsl(0 0% 70%)",
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <FieldError field="time_horizon" />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-1.5 uppercase tracking-wide">
                    Questions for your consultant{" "}
                    <span className="text-[hsl(0_0%_40%)] normal-case font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Anything you'd like to cover on the first call..."
                    rows={3}
                    data-testid="input-notes"
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-[hsl(0_0%_30%)] outline-none resize-none"
                    style={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 16%)" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 5: Done ──────────────────────────────────────────────── */}
          {step === 5 && (
            <div data-testid="onboarding-complete" className="text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(247,147,26,0.12)" }}
              >
                <Check className="w-7 h-7" style={{ color: "#F7931A" }} />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">You're all set!</h2>
              <p className="text-sm text-[hsl(0_0%_50%)] mb-8 leading-relaxed">
                Your profile and holdings are saved. Your consultant will review everything before the first call.
              </p>
              <div className="space-y-2 mb-8 text-left">
                {[
                  "Your consultant reviews your profile and holdings",
                  "You receive a calendar invite for the audit call",
                  "On the call: strategy, cycle plan, and exit targets",
                  "Your portal updates automatically after each session",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl px-4 py-3"
                    style={{ background: "hsl(0 0% 10%)" }}
                  >
                    <span className="text-xs font-bold mt-0.5 shrink-0" style={{ color: "#F7931A" }}>{i + 1}</span>
                    <p className="text-sm text-[hsl(0_0%_65%)]">{item}</p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setLocation("/portal")}
                data-testid="button-go-to-portal"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold"
                style={{ background: "#F7931A", color: "#0A0A0A" }}
              >
                Go to my portal <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── Navigation ───────────────────────────────────────────────── */}
          {step >= 1 && step <= STEPS && (
            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => { setStepErrors({}); setStep(step - 1); }}
                data-testid="button-back"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{ background: "hsl(0 0% 11%)", color: "hsl(0 0% 75%)", border: "1px solid hsl(0 0% 16%)" }}
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              {step < STEPS ? (
                <button
                  type="button"
                  onClick={handleNext}
                  data-testid="button-next"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold"
                  style={{ background: "#F7931A", color: "#0A0A0A" }}
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  data-testid="button-submit"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
                  style={{ background: "#F7931A", color: "#0A0A0A" }}
                >
                  Complete setup <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
