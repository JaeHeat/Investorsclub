import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { upsertClientProfile, setHoldings } from "@/lib/localStore";
import { syncProfileToServer } from "@/lib/profileApi";
import type { HoldingAsset } from "@/lib/types";
import {
  Bitcoin, ChevronRight, ChevronLeft, Check, AlertCircle,
  Calendar, ClipboardList, BarChart2, Plus, X, Wallet,
  MessageCircle, Bell, Users, ExternalLink, Shield,
} from "lucide-react";
import { updateClientSettings } from "@/lib/localStore";

// ── Update this to your actual Discord server invite URL ──────────────────
const DISCORD_INVITE_URL = "https://discord.gg/your-invite-code";

const STEPS = 3;

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

const TIMEZONES = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Toronto", "America/Vancouver", "America/Sao_Paulo",
  "Europe/London", "Europe/Berlin", "Europe/Paris", "Europe/Amsterdam",
  "Europe/Madrid", "Europe/Rome", "Europe/Zurich",
  "Asia/Dubai", "Asia/Kolkata", "Asia/Singapore", "Asia/Tokyo",
  "Asia/Seoul", "Asia/Hong_Kong", "Asia/Shanghai",
  "Australia/Sydney", "Australia/Melbourne", "Pacific/Auckland",
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
  manual_price?: string;
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
  const [showMoreAssets,  setShowMoreAssets]  = useState(false);
  const [showCustomCoin,  setShowCustomCoin]  = useState(false);
  const [customCoinForm,  setCustomCoinForm]  = useState({ symbol: "", name: "", coingecko_id: "", manual_price: "" });
  const [discordJoined, setDiscordJoined] = useState(false);

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
    goal_conservative: "",
    goal_moderate: "",
    goal_moonshot: "",
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

  function addCustomCoin() {
    const sym = customCoinForm.symbol.trim().toUpperCase();
    if (!sym) return;
    const id = customCoinForm.coingecko_id.trim() || `custom_${sym.toLowerCase()}`;
    if (holdingRows.find((r) => r.coingecko_id === id)) { setShowCustomCoin(false); return; }
    setHoldingRows((prev) => [
      ...prev,
      { coingecko_id: id, symbol: sym, name: customCoinForm.name.trim() || sym, color: "hsl(0 0% 55%)", amount: "", avg_cost: "", manual_price: customCoinForm.manual_price || "" },
    ]);
    setCustomCoinForm({ symbol: "", name: "", coingecko_id: "", manual_price: "" });
    setShowCustomCoin(false);
  }

  function updateHoldingRow(id: string, field: "amount" | "avg_cost" | "manual_price", value: string) {
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
      const cv = parseFloat(form.goal_conservative);
      const mv = parseFloat(form.goal_moderate);
      const sv = parseFloat(form.goal_moonshot);
      if (!form.goal_conservative || isNaN(cv) || cv <= 0)
        errors.goal_conservative = "Enter your conservative target";
      if (!form.goal_moderate || isNaN(mv) || mv <= 0)
        errors.goal_moderate = "Enter your target goal";
      if (!form.goal_moonshot || isNaN(sv) || sv <= 0)
        errors.goal_moonshot = "Enter your moonshot target";
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
        ...(r.manual_price?.trim() ? { manual_price: parseFloat(r.manual_price) } : {}),
      }));

    if (validHoldings.length > 0) {
      setHoldings(user.id, validHoldings);
    }

    const profileData = {
      user_id: user.id,
      full_name: form.full_name,
      country: form.country,
      timezone: form.timezone,
      discord_username: form.discord_username || null,
      discord_role_claimed: false,
      btc_holdings: null,
      avg_cost_basis: null,
      investment_goal: form.goal_moderate,
      goal_conservative: form.goal_conservative || null,
      goal_moderate: form.goal_moderate || null,
      goal_moonshot: form.goal_moonshot || null,
      risk_tolerance: form.risk_tolerance,
      time_horizon: form.time_horizon,
      notes: form.notes,
      joined_at: new Date().toISOString(),
      onboarding_completed: true,
      initial_portfolio_value: portfolioTotal || null,
      high_water_mark: portfolioTotal || null,
    };

    upsertClientProfile(profileData);
    syncProfileToServer(profileData, validHoldings);

    refreshClientProfile();
    setStep(4); // Discord connect step
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

  function goalMultiple(val: string): string | null {
    const parsed = parseFloat(val);
    if (portfolioTotal <= 0 || isNaN(parsed) || parsed <= 0) return null;
    return (parsed / portfolioTotal).toFixed(1);
  }

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
                  { icon: ClipboardList, label: "Your details",         desc: "Name, country, timezone, and Discord handle" },
                  { icon: Wallet,        label: "Your holdings",        desc: "Each asset, quantity, avg entry price, and any cash / dry powder" },
                  { icon: Calendar,      label: "Investment goals",     desc: "Conservative, target, and moonshot exit values + risk and time horizon" },
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
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-85 active:opacity-70"
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
                  <select
                    value={TIMEZONES.includes(form.timezone) ? form.timezone : ""}
                    onChange={(e) => update("timezone", e.target.value)}
                    data-testid="input-timezone"
                    className={inputClass}
                    style={inputStyle}
                  >
                    {!TIMEZONES.includes(form.timezone) && form.timezone && (
                      <option value="">{form.timezone} (auto-detected)</option>
                    )}
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
                    ))}
                  </select>
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
                  <button
                    type="button"
                    onClick={() => { setShowCustomCoin(!showCustomCoin); setShowMoreAssets(false); }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: showCustomCoin ? "rgba(247,147,26,0.08)" : "hsl(0 0% 11%)",
                      border: `1px solid ${showCustomCoin ? "rgba(247,147,26,0.3)" : "hsl(0 0% 18%)"}`,
                      color: showCustomCoin ? "#F7931A" : "hsl(0 0% 70%)",
                    }}
                  >
                    <Plus className="w-3 h-3" /> Custom coin
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

              {/* Custom coin form */}
              {showCustomCoin && (
                <div className="mb-4 rounded-xl p-3" style={{ background: "hsl(0 0% 9%)", border: "1px solid hsl(0 0% 15%)" }}>
                  <p className="text-xs font-semibold text-[hsl(0_0%_50%)] mb-2.5 uppercase tracking-wide">Custom coin</p>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                        style={{ background: "hsl(0 0% 11%)", border: "1px solid hsl(0 0% 18%)" }}
                        placeholder="Ticker (e.g. DOGE)"
                        value={customCoinForm.symbol}
                        onChange={(e) => setCustomCoinForm((c) => ({ ...c, symbol: e.target.value }))}
                      />
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                        style={{ background: "hsl(0 0% 11%)", border: "1px solid hsl(0 0% 18%)" }}
                        placeholder="Name (e.g. Dogecoin)"
                        value={customCoinForm.name}
                        onChange={(e) => setCustomCoinForm((c) => ({ ...c, name: e.target.value }))}
                      />
                    </div>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                      style={{ background: "hsl(0 0% 11%)", border: "1px solid hsl(0 0% 18%)" }}
                      placeholder="CoinGecko ID (optional — enables live price)"
                      value={customCoinForm.coingecko_id}
                      onChange={(e) => setCustomCoinForm((c) => ({ ...c, coingecko_id: e.target.value }))}
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[hsl(0_0%_40%)]">$</span>
                      <input
                        type="number"
                        className="pl-8 pr-3 py-2 rounded-xl text-sm text-white placeholder-[hsl(0_0%_28%)] outline-none w-full"
                        style={{ background: "hsl(0 0% 11%)", border: "1px solid hsl(0 0% 18%)" }}
                        placeholder={customCoinForm.coingecko_id.trim() ? "Current price (optional if CoinGecko ID set)" : "Current price (USD) — required for valuation"}
                        value={customCoinForm.manual_price}
                        onChange={(e) => setCustomCoinForm((c) => ({ ...c, manual_price: e.target.value }))}
                        min="0"
                        step="any"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={addCustomCoin}
                        disabled={!customCoinForm.symbol.trim()}
                        className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          background: customCoinForm.symbol.trim() ? "#F7931A" : "hsl(0 0% 14%)",
                          color: customCoinForm.symbol.trim() ? "#000" : "hsl(0 0% 40%)",
                        }}
                      >
                        Add coin
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowCustomCoin(false); setCustomCoinForm({ symbol: "", name: "", coingecko_id: "", manual_price: "" }); }}
                        className="px-4 py-2 rounded-xl text-sm text-[hsl(0_0%_45%)] hover:text-white transition-colors"
                        style={{ background: "hsl(0 0% 12%)" }}
                      >
                        Cancel
                      </button>
                    </div>
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
                        {row.coingecko_id.startsWith("custom_") && (
                          <div className="relative mt-2">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[hsl(0_0%_40%)]">$</span>
                            <input
                              type="number"
                              value={row.manual_price ?? ""}
                              onChange={(e) => updateHoldingRow(row.coingecko_id, "manual_price", e.target.value)}
                              placeholder="Current price (USD) — for portfolio valuation"
                              step="any"
                              min="0"
                              className="pl-6 pr-2 py-2 rounded-lg text-sm text-white placeholder-[hsl(0_0%_28%)] outline-none w-full"
                              style={{ background: "hsl(0 0% 12%)", border: "1px solid hsl(0 0% 18%)" }}
                            />
                          </div>
                        )}
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

          {/* ── STEP 3: Investment goals ──────────────────────────────────── */}
          {step === 3 && (
            <div data-testid="onboarding-step-3">
              <h2 className="text-xl font-semibold text-white mb-1">Investment goals</h2>
              <p className="text-sm text-[hsl(0_0%_50%)] mb-6">Set three exit targets for this cycle</p>
              <div className="space-y-6">
                {/* 3 goal tiers */}
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] uppercase tracking-wide">
                    Exit targets <span className="text-red-400">*</span>
                  </label>
                  {(
                    [
                      { field: "goal_conservative" as const, label: "Conservative", badge: "Happy exit",    desc: "Minimum return you'd be satisfied with",        accent: "#10b981", placeholder: "200000",  testId: "input-goal-conservative" },
                      { field: "goal_moderate"     as const, label: "Target",       badge: "Realistic",     desc: "Your planned, realistic exit for this cycle",   accent: "#F7931A", placeholder: "500000",  testId: "input-goal-moderate"     },
                      { field: "goal_moonshot"     as const, label: "Moonshot",     badge: "Best case",     desc: "If everything goes perfectly this cycle",       accent: "#a855f7", placeholder: "1000000", testId: "input-goal-moonshot"     },
                    ]
                  ).map(({ field, label, badge, desc, accent, placeholder, testId }) => {
                    const multiple = goalMultiple(form[field]);
                    return (
                      <div key={field}>
                        <div
                          className="rounded-xl p-4"
                          style={{
                            background: "hsl(0 0% 9%)",
                            border: `1px solid ${stepErrors[field] ? "rgba(239,68,68,0.4)" : `${accent}22`}`,
                            borderLeft: `3px solid ${stepErrors[field] ? "rgba(239,68,68,0.7)" : accent}`,
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-white">{label}</span>
                            <span
                              className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                              style={{ background: `${accent}18`, color: accent }}
                            >
                              {badge}
                            </span>
                            {multiple && (
                              <span className="ml-auto text-xs font-bold" style={{ color: accent }}>
                                {multiple}×
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[hsl(0_0%_42%)] mb-3">{desc}</p>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[hsl(0_0%_45%)]">$</span>
                            <input
                              type="number"
                              value={form[field]}
                              onChange={(e) => update(field, e.target.value)}
                              placeholder={placeholder}
                              step="10000"
                              min="1"
                              data-testid={testId}
                              className={`${inputClass} pl-7 pr-14`}
                              style={stepErrors[field] ? errorStyle : { background: "hsl(0 0% 12%)", border: "1px solid hsl(0 0% 18%)" }}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[hsl(0_0%_45%)]">USD</span>
                          </div>
                        </div>
                        <FieldError field={field} />
                      </div>
                    );
                  })}
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

          {/* ── STEP 4: Discord connect ───────────────────────────────────── */}
          {step === 4 && (
            <div data-testid="onboarding-discord">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(88,101,242,0.15)", border: "1px solid rgba(88,101,242,0.25)" }}
                >
                  <MessageCircle className="w-5 h-5" style={{ color: "#5865F2" }} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Join the community</h2>
                  <p className="text-sm text-[hsl(0_0%_50%)]">Connect your Discord to claim your client role</p>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-2.5 mb-6">
                {[
                  { icon: Bell,   label: "Cycle alerts",        desc: "Real-time notifications at key BTC price levels" },
                  { icon: BarChart2, label: "Weekly updates",   desc: "On-chain analysis and market structure breakdowns" },
                  { icon: Shield, label: "#clients-only channel", desc: "Private access for verified consulting clients" },
                  { icon: Users,  label: "Community",           desc: "Connect with other serious Bitcoin investors" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-3"
                    style={{ background: "hsl(0 0% 9%)", border: "1px solid hsl(0 0% 14%)" }}
                  >
                    <Icon className="w-4 h-4 shrink-0" style={{ color: "#5865F2" }} />
                    <div>
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-xs text-[hsl(0_0%_45%)]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discord username reminder */}
              {form.discord_username && (
                <div
                  className="flex items-center gap-2 rounded-xl px-3.5 py-3 mb-5"
                  style={{ background: "rgba(88,101,242,0.07)", border: "1px solid rgba(88,101,242,0.2)" }}
                >
                  <MessageCircle className="w-4 h-4 shrink-0" style={{ color: "#5865F2" }} />
                  <p className="text-sm text-[hsl(0_0%_65%)]">
                    Your handle: <span className="text-white font-medium">@{form.discord_username}</span>
                    <span className="text-[hsl(0_0%_40%)] ml-1.5 text-xs">— mention this when prompted in the server</span>
                  </p>
                </div>
              )}

              {/* CTA */}
              {!discordJoined ? (
                <button
                  type="button"
                  data-testid="button-join-discord"
                  onClick={() => {
                    window.open(DISCORD_INVITE_URL, "_blank", "noopener,noreferrer");
                    if (user) {
                      updateClientSettings(user.id, { discord_role_claimed: true });
                    }
                    setDiscordJoined(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-85"
                  style={{ background: "#5865F2", color: "#fff" }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Join the Discord server
                </button>
              ) : (
                <div className="space-y-3">
                  <div
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
                    style={{ background: "rgba(88,101,242,0.12)", border: "1px solid rgba(88,101,242,0.3)", color: "#5865F2" }}
                  >
                    <Check className="w-4 h-4" />
                    Discord opened — welcome to the server!
                  </div>
                  <p className="text-xs text-center text-[hsl(0_0%_40%)]">
                    Find the <span className="text-[hsl(0_0%_60%)]">#role-claim</span> channel and follow the bot instructions to get your client role.
                  </p>
                  <button
                    type="button"
                    data-testid="button-discord-continue"
                    onClick={() => setStep(5)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold"
                    style={{ background: "#F7931A", color: "#0A0A0A" }}
                  >
                    Continue to my portal <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Skip */}
              {!discordJoined && (
                <button
                  type="button"
                  data-testid="button-skip-discord"
                  onClick={() => setStep(5)}
                  className="w-full mt-3 py-2 text-sm text-center transition-colors"
                  style={{ color: "hsl(0 0% 38%)" }}
                >
                  Skip for now
                </button>
              )}
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
