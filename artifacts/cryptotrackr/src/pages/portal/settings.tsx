import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateClientSettings, getHoldings, setHoldings } from "@/lib/localStore";
import { syncProfileToServer } from "@/lib/profileApi";
import type { HoldingAsset } from "@/lib/types";
import PortalLayout from "@/components/layout/PortalLayout";
import { Settings, Check, AlertTriangle, Plus, X } from "lucide-react";

const RISK_OPTIONS = [
  { value: "conservative", label: "Conservative", desc: "Capital preservation first, lower alts exposure" },
  { value: "moderate",     label: "Moderate",     desc: "Balanced BTC/ETH core with selective alts" },
  { value: "aggressive",   label: "Aggressive",   desc: "Maximum cycle upside, higher alts allocation" },
];

const TIME_HORIZON_OPTIONS = [
  { value: "1_2_years",      label: "1–2 years",   desc: "Near-term exit around the cycle peak, capital preservation after" },
  { value: "2_3_years",      label: "2–3 years",   desc: "Full cycle play into 2026–2027 peak and bear recovery" },
  { value: "3_5_years_plus", label: "3–5+ years",  desc: "Multi-cycle compounding through multiple peaks" },
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

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Netherlands", "Switzerland", "Singapore", "Japan",
  "United Arab Emirates", "Brazil", "India", "South Korea", "Other",
];

const ASSET_OPTIONS = [
  { coingecko_id: "bitcoin",      symbol: "BTC",  name: "Bitcoin" },
  { coingecko_id: "ethereum",     symbol: "ETH",  name: "Ethereum" },
  { coingecko_id: "solana",       symbol: "SOL",  name: "Solana" },
  { coingecko_id: "ripple",       symbol: "XRP",  name: "XRP" },
  { coingecko_id: "cardano",      symbol: "ADA",  name: "Cardano" },
  { coingecko_id: "avalanche-2",  symbol: "AVAX", name: "Avalanche" },
  { coingecko_id: "chainlink",    symbol: "LINK", name: "Chainlink" },
  { coingecko_id: "polkadot",     symbol: "DOT",  name: "Polkadot" },
  { coingecko_id: "sui",          symbol: "SUI",  name: "Sui" },
  { coingecko_id: "uniswap",      symbol: "UNI",  name: "Uniswap" },
  { coingecko_id: "pepe",         symbol: "PEPE", name: "PEPE" },
  { coingecko_id: "tether",       symbol: "USDT", name: "Tether (USDT)" },
  { coingecko_id: "usd-coin",     symbol: "USDC", name: "USD Coin" },
];

type HoldingRow = {
  coingecko_id: string;
  symbol: string;
  name: string;
  amount: string;
  avg_cost: string;
  manual_price?: string;
};

function toRows(hs: HoldingAsset[]): HoldingRow[] {
  return hs.map((h) => ({
    coingecko_id: h.coingecko_id,
    symbol: h.symbol,
    name: h.name,
    amount: String(h.amount),
    avg_cost: String(h.avg_cost),
    manual_price: h.manual_price != null ? String(h.manual_price) : "",
  }));
}

export default function SettingsPage() {
  const { clientProfile, user, refreshClientProfile } = useAuth();

  // ── Profile fields ──────────────────────────────────────────────────────────
  const [fullName,        setFullName]        = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [country,         setCountry]         = useState("");
  const [timezone,        setTimezone]        = useState("America/New_York");
  const [risk,            setRisk]            = useState("moderate");
  const [timeHorizon,     setTimeHorizon]     = useState("2_3_years");
  const [goalConservative, setGoalConservative] = useState("");
  const [goalModerate,     setGoalModerate]     = useState("");
  const [goalMoonshot,     setGoalMoonshot]     = useState("");
  const [initValue,       setInitValue]       = useState("");
  const [primaryObjective, setPrimaryObjective] = useState("");
  const [objectiveDetail,  setObjectiveDetail]  = useState("");
  const [drawdownReaction, setDrawdownReaction] = useState("");
  const [liquidityNeeds,   setLiquidityNeeds]   = useState("");

  // ── Holdings ────────────────────────────────────────────────────────────────
  const [holdingRows,    setHoldingRows]    = useState<HoldingRow[]>([]);
  const [showPicker,     setShowPicker]     = useState(false);
  const [showCustom,     setShowCustom]     = useState(false);
  const [customCoin,     setCustomCoin]     = useState({ symbol: "", name: "", coingecko_id: "", manual_price: "" });

  // ── UI state ────────────────────────────────────────────────────────────────
  const [profileLoaded,  setProfileLoaded]  = useState(false);
  const [isDirty,        setIsDirty]        = useState(false);
  const [saved,          setSaved]          = useState(false);

  useEffect(() => {
    document.title = "Settings — Bitcoin Daily";
    return () => { document.title = "Bitcoin Daily"; };
  }, []);

  // Sync profile fields once on first load
  useEffect(() => {
    if (clientProfile && !profileLoaded) {
      setFullName(clientProfile.full_name ?? "");
      setDiscordUsername(clientProfile.discord_username ?? "");
      setCountry(clientProfile.country ?? "");
      setTimezone(clientProfile.timezone ?? "America/New_York");
      setRisk(clientProfile.risk_tolerance ?? "moderate");
      setTimeHorizon(clientProfile.time_horizon ?? "2_3_years");
      const toGoalStr = (v: string | null | undefined) => {
        const n = parseFloat(v ?? "");
        return !isNaN(n) && n > 0 ? String(n) : "";
      };
      setGoalConservative(toGoalStr(clientProfile.goal_conservative ?? clientProfile.investment_goal));
      setGoalModerate(toGoalStr(clientProfile.goal_moderate ?? clientProfile.investment_goal));
      setGoalMoonshot(toGoalStr(clientProfile.goal_moonshot));
      setInitValue(
        clientProfile.initial_portfolio_value != null
          ? String(clientProfile.initial_portfolio_value)
          : ""
      );
      setPrimaryObjective(clientProfile.primary_objective ?? "");
      setObjectiveDetail(clientProfile.objective_detail ?? "");
      setDrawdownReaction(clientProfile.drawdown_reaction ?? "");
      setLiquidityNeeds(clientProfile.liquidity_needs ?? "");
      setProfileLoaded(true);
    }
  }, [clientProfile, profileLoaded]);

  // Load holdings once user is ready
  useEffect(() => {
    if (user && !profileLoaded) return;
    if (user) {
      setHoldingRows(toRows(getHoldings(user.id)));
    }
  }, [user, profileLoaded]);

  // Warn on browser/tab close if dirty
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  function markDirty() { setIsDirty(true); }

  function handleSave() {
    if (!user) return;
    updateClientSettings(user.id, {
      full_name:        fullName        || null,
      discord_username: discordUsername || null,
      country:   country  || null,
      timezone:  timezone || null,
      risk_tolerance: risk,
      time_horizon: timeHorizon,
      investment_goal: goalModerate || null,
      goal_conservative: goalConservative || null,
      goal_moderate: goalModerate || null,
      goal_moonshot: goalMoonshot || null,
      initial_portfolio_value: initValue ? Number(initValue) : undefined,
      primary_objective: primaryObjective || null,
      objective_detail: objectiveDetail || null,
      drawdown_reaction: drawdownReaction || null,
      liquidity_needs: liquidityNeeds || null,
    });

    const validHoldings: HoldingAsset[] = holdingRows
      .filter((r) => r.amount.trim() && r.avg_cost.trim())
      .map((r) => ({
        coingecko_id: r.coingecko_id,
        symbol:       r.symbol,
        name:         r.name,
        amount:       parseFloat(r.amount),
        avg_cost:     parseFloat(r.avg_cost),
        ...(r.manual_price?.trim() ? { manual_price: parseFloat(r.manual_price) } : {}),
      }));
    setHoldings(user.id, validHoldings);

    const profileForSync = {
      user_id: user.id,
      full_name: fullName || null,
      discord_username: discordUsername || null,
      country: country || null,
      timezone: timezone || null,
      risk_tolerance: risk,
      time_horizon: timeHorizon,
      investment_goal: goalModerate || null,
      goal_conservative: goalConservative || null,
      goal_moderate: goalModerate || null,
      goal_moonshot: goalMoonshot || null,
      initial_portfolio_value: initValue ? Number(initValue) : (clientProfile?.initial_portfolio_value ?? null),
      high_water_mark: clientProfile?.high_water_mark ?? null,
      btc_holdings: clientProfile?.btc_holdings ?? null,
      avg_cost_basis: clientProfile?.avg_cost_basis ?? null,
      notes: clientProfile?.notes ?? null,
      joined_at: clientProfile?.joined_at ?? null,
      onboarding_completed: clientProfile?.onboarding_completed ?? false,
      discord_role_claimed: clientProfile?.discord_role_claimed ?? false,
      experience_level: clientProfile?.experience_level ?? null,
      custody: clientProfile?.custody ?? null,
      monthly_dca_budget: clientProfile?.monthly_dca_budget ?? null,
      primary_objective: primaryObjective || null,
      objective_detail: objectiveDetail || null,
      drawdown_reaction: drawdownReaction || null,
      liquidity_needs: liquidityNeeds || null,
      team_note: clientProfile?.team_note ?? null,
    };
    syncProfileToServer(profileForSync, validHoldings);

    if (refreshClientProfile) refreshClientProfile();
    setIsDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function updateRow(idx: number, field: "amount" | "avg_cost" | "manual_price", val: string) {
    setHoldingRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r)));
    markDirty();
  }

  function removeRow(idx: number) {
    setHoldingRows((prev) => prev.filter((_, i) => i !== idx));
    markDirty();
  }

  function addAsset(asset: typeof ASSET_OPTIONS[number]) {
    if (holdingRows.find((r) => r.coingecko_id === asset.coingecko_id)) {
      setShowPicker(false);
      return;
    }
    setHoldingRows((prev) => [
      ...prev,
      { coingecko_id: asset.coingecko_id, symbol: asset.symbol, name: asset.name, amount: "", avg_cost: "" },
    ]);
    setShowPicker(false);
    markDirty();
  }

  function addCustomAsset() {
    const sym = customCoin.symbol.trim().toUpperCase();
    if (!sym) return;
    const id = customCoin.coingecko_id.trim() || `custom_${sym.toLowerCase()}`;
    if (holdingRows.find((r) => r.coingecko_id === id)) { setShowCustom(false); return; }
    setHoldingRows((prev) => [
      ...prev,
      { coingecko_id: id, symbol: sym, name: customCoin.name.trim() || sym, amount: "", avg_cost: "", manual_price: customCoin.manual_price || "" },
    ]);
    setCustomCoin({ symbol: "", name: "", coingecko_id: "", manual_price: "" });
    setShowCustom(false);
    setShowPicker(false);
    markDirty();
  }

  function InputRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div>
        <label className="block text-xs font-semibold text-[hsl(0_0%_55%)] uppercase tracking-wide mb-2">{label}</label>
        {children}
      </div>
    );
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl text-sm text-white bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] outline-none focus:border-[#F7931A] transition-colors";

  const usedIds = new Set(holdingRows.map((r) => r.coingecko_id));

  return (
    <PortalLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">Settings</h1>
          {isDirty && (
            <span
              className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A", border: "1px solid rgba(247,147,26,0.25)" }}
            >
              <AlertTriangle className="w-3 h-3" />
              Unsaved changes
            </span>
          )}
        </div>
        <p className="text-sm text-[hsl(0_0%_42%)]">Update your profile, holdings, risk preference, and investment goal.</p>
      </div>

      <div className="space-y-6 max-w-xl">
        {/* Profile */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(0_0%_35%)]">Profile</p>
          <InputRow label="Full name">
            <input
              className={inputClass}
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); markDirty(); }}
              placeholder="Your full name"
            />
          </InputRow>
          <InputRow label="Discord username">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[hsl(0_0%_40%)]">@</span>
              <input
                className={`${inputClass} pl-7`}
                value={discordUsername}
                onChange={(e) => { setDiscordUsername(e.target.value.replace(/^@/, "")); markDirty(); }}
                placeholder="yourhandle"
              />
            </div>
          </InputRow>
          <InputRow label="Country">
            <select
              className={inputClass}
              value={country}
              onChange={(e) => { setCountry(e.target.value); markDirty(); }}
            >
              <option value="">Select country...</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </InputRow>
          <InputRow label="Timezone">
            <select
              className={inputClass}
              value={timezone}
              onChange={(e) => { setTimezone(e.target.value); markDirty(); }}
            >
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>)}
            </select>
          </InputRow>
        </div>

        {/* Holdings */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(0_0%_35%)]">Holdings</p>
              <p className="text-xs text-[hsl(0_0%_40%)] mt-0.5">Your assets drive P&L, exit plans, and cycle projections.</p>
            </div>
            <button
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add asset
            </button>
          </div>

          {/* Asset picker */}
          {showPicker && (
            <div className="rounded-xl p-3" style={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 18%)" }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-[hsl(0_0%_55%)]">Select an asset</p>
                <button onClick={() => setShowPicker(false)} className="text-[hsl(0_0%_40%)] hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {ASSET_OPTIONS.map((asset) => {
                  const added = usedIds.has(asset.coingecko_id);
                  return (
                    <button
                      key={asset.coingecko_id}
                      onClick={() => !added && addAsset(asset)}
                      disabled={added}
                      className="px-2.5 py-2 rounded-lg text-xs font-semibold text-left transition-all"
                      style={{
                        background: added ? "hsl(0 0% 12%)" : "hsl(0 0% 14%)",
                        color: added ? "hsl(0 0% 35%)" : "white",
                        cursor: added ? "not-allowed" : "pointer",
                      }}
                    >
                      <p className="font-bold">{asset.symbol}</p>
                      <p className="text-[10px] opacity-70 truncate">{asset.name}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 pt-2" style={{ borderTop: "1px solid hsl(0 0% 15%)" }}>
                {!showCustom ? (
                  <button
                    type="button"
                    onClick={() => setShowCustom(true)}
                    className="flex items-center gap-1.5 w-full px-2.5 py-2 rounded-lg text-xs text-[hsl(0_0%_50%)] hover:text-white transition-colors"
                    style={{ background: "hsl(0 0% 12%)" }}
                  >
                    <Plus className="w-3 h-3" /> Custom coin
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-[hsl(0_0%_45%)] uppercase tracking-wide mb-1">Custom coin</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs text-white outline-none"
                        style={{ background: "hsl(0 0% 12%)", border: "1px solid hsl(0 0% 20%)" }}
                        placeholder="Ticker (e.g. DOGE)"
                        value={customCoin.symbol}
                        onChange={(e) => setCustomCoin((c) => ({ ...c, symbol: e.target.value }))}
                      />
                      <input
                        type="text"
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs text-white outline-none"
                        style={{ background: "hsl(0 0% 12%)", border: "1px solid hsl(0 0% 20%)" }}
                        placeholder="Name (e.g. Dogecoin)"
                        value={customCoin.name}
                        onChange={(e) => setCustomCoin((c) => ({ ...c, name: e.target.value }))}
                      />
                    </div>
                    <input
                      type="text"
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs text-white outline-none"
                      style={{ background: "hsl(0 0% 12%)", border: "1px solid hsl(0 0% 20%)" }}
                      placeholder="CoinGecko ID (optional — enables live price)"
                      value={customCoin.coingecko_id}
                      onChange={(e) => setCustomCoin((c) => ({ ...c, coingecko_id: e.target.value }))}
                    />
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[hsl(0_0%_40%)]">$</span>
                      <input
                        type="number"
                        className="w-full pl-6 pr-2.5 py-1.5 rounded-lg text-xs text-white outline-none"
                        style={{ background: "hsl(0 0% 12%)", border: "1px solid hsl(0 0% 20%)" }}
                        placeholder={customCoin.coingecko_id.trim() ? "Current price (optional if CoinGecko ID set)" : "Current price (USD) — required for valuation"}
                        value={customCoin.manual_price}
                        onChange={(e) => setCustomCoin((c) => ({ ...c, manual_price: e.target.value }))}
                        min="0"
                        step="any"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={addCustomAsset}
                        disabled={!customCoin.symbol.trim()}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{ background: customCoin.symbol.trim() ? "#F7931A" : "hsl(0 0% 14%)", color: customCoin.symbol.trim() ? "#000" : "hsl(0 0% 40%)" }}
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowCustom(false); setCustomCoin({ symbol: "", name: "", coingecko_id: "", manual_price: "" }); }}
                        className="px-3 py-1.5 rounded-lg text-xs text-[hsl(0_0%_40%)] hover:text-white transition-colors"
                        style={{ background: "hsl(0 0% 12%)" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {holdingRows.length === 0 ? (
            <p className="text-xs text-[hsl(0_0%_35%)] py-2">No assets added yet. Click "Add asset" to get started.</p>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(0_0%_35%)]">Asset</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(0_0%_35%)]">Quantity</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(0_0%_35%)]">Avg cost ($)</p>
                <span />
              </div>

              {holdingRows.map((row, idx) => {
                const rowAmt = parseFloat(row.amount) || 0;
                const rowCost = parseFloat(row.avg_cost) || 0;
                const rowValue = rowAmt * rowCost;
                return (
                  <div key={row.coingecko_id} className="space-y-1">
                    <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                      <div className="px-3 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 16%)" }}>
                        {row.symbol}
                      </div>
                      <input
                        type="number"
                        className={inputClass}
                        value={row.amount}
                        onChange={(e) => updateRow(idx, "amount", e.target.value)}
                        placeholder="0"
                        min="0"
                        step="any"
                      />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[hsl(0_0%_40%)]">$</span>
                        <input
                          type="number"
                          className={`${inputClass} pl-6`}
                          value={row.avg_cost}
                          onChange={(e) => updateRow(idx, "avg_cost", e.target.value)}
                          placeholder="0"
                          min="0"
                          step="any"
                        />
                      </div>
                      <button
                        onClick={() => removeRow(idx)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[hsl(0_0%_35%)] hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {row.coingecko_id.startsWith("custom_") && (
                      <div className="relative mt-1.5">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[hsl(0_0%_40%)]">$</span>
                        <input
                          type="number"
                          className={`${inputClass} pl-6`}
                          value={row.manual_price ?? ""}
                          onChange={(e) => updateRow(idx, "manual_price", e.target.value)}
                          placeholder="Current price (USD) — for portfolio valuation"
                          min="0"
                          step="any"
                        />
                      </div>
                    )}
                    {rowValue > 0 && (
                      <p className="text-[10px] text-[hsl(0_0%_40%)] pl-1">
                        ≈ <span className="text-[hsl(0_0%_55%)] font-medium">${rowValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span> total value
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[hsl(0_0%_55%)] uppercase tracking-wide">Portfolio value when you joined ($)</label>
              {holdingRows.some((r) => r.amount && r.avg_cost) && (
                <button
                  type="button"
                  onClick={() => {
                    const total = holdingRows.reduce((s, r) => {
                      const amt = parseFloat(r.amount) || 0;
                      const cost = parseFloat(r.avg_cost) || 0;
                      return s + amt * cost;
                    }, 0);
                    if (total > 0) { setInitValue(String(Math.round(total))); markDirty(); }
                  }}
                  className="text-[11px] font-semibold px-2 py-0.5 rounded transition-colors"
                  style={{ background: "rgba(247,147,26,0.08)", color: "#F7931A" }}
                >
                  Auto-calculate from holdings
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[hsl(0_0%_45%)]">$</span>
              <input
                type="number"
                className={`${inputClass} pl-7`}
                value={initValue}
                onChange={(e) => { setInitValue(e.target.value); markDirty(); }}
                placeholder="e.g. 150000"
                min={0}
              />
            </div>
            <p className="text-xs text-[hsl(0_0%_35%)] mt-1.5">Your portfolio's total market value on the day you joined — not your cost basis. Used for all milestone targets.</p>
          </div>
        </div>

        {/* Strategy */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(0_0%_35%)]">Strategy</p>

          <InputRow label="Risk tolerance">
            <div className="space-y-2">
              {RISK_OPTIONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => { setRisk(r.value); markDirty(); }}
                  className="w-full rounded-xl px-4 py-3 text-left transition-all"
                  style={{
                    background: risk === r.value ? "rgba(247,147,26,0.08)" : "hsl(0 0% 10%)",
                    border: risk === r.value ? "1px solid #F7931A" : "1px solid hsl(0 0% 16%)",
                  }}
                >
                  <p className="text-sm font-semibold" style={{ color: risk === r.value ? "#F7931A" : "white" }}>{r.label}</p>
                  <p className="text-xs text-[hsl(0_0%_45%)] mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
          </InputRow>

          <InputRow label="Time horizon">
            <div className="space-y-2">
              {TIME_HORIZON_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => { setTimeHorizon(t.value); markDirty(); }}
                  className="w-full rounded-xl px-4 py-3 text-left transition-all"
                  style={{
                    background: timeHorizon === t.value ? "rgba(247,147,26,0.08)" : "hsl(0 0% 10%)",
                    border: timeHorizon === t.value ? "1px solid #F7931A" : "1px solid hsl(0 0% 16%)",
                  }}
                >
                  <p className="text-sm font-semibold" style={{ color: timeHorizon === t.value ? "#F7931A" : "white" }}>{t.label}</p>
                  <p className="text-xs text-[hsl(0_0%_45%)] mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </InputRow>

          <InputRow label="What this capital is for">
            <div className="space-y-2">
              {[
                { value: "generational_wealth", label: "Generational wealth" },
                { value: "financial_freedom", label: "Financial freedom" },
                { value: "retirement", label: "Retirement" },
                { value: "major_purchase", label: "A specific goal" },
                { value: "income", label: "Income & growth" },
              ].map((o) => (
                <button key={o.value} onClick={() => { setPrimaryObjective(o.value); markDirty(); }}
                  className="w-full rounded-xl px-4 py-2.5 text-left transition-all"
                  style={{ background: primaryObjective === o.value ? "rgba(247,147,26,0.08)" : "hsl(0 0% 10%)", border: primaryObjective === o.value ? "1px solid #F7931A" : "1px solid hsl(0 0% 16%)" }}>
                  <p className="text-sm font-semibold" style={{ color: primaryObjective === o.value ? "#F7931A" : "white" }}>{o.label}</p>
                </button>
              ))}
            </div>
          </InputRow>

          <InputRow label="In your words">
            <textarea value={objectiveDetail} onChange={(e) => { setObjectiveDetail(e.target.value); markDirty(); }} rows={2}
              placeholder="What hitting your target would mean…"
              className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-[hsl(0_0%_30%)] outline-none resize-none"
              style={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 16%)" }} />
          </InputRow>

          <InputRow label="If BTC dropped 50%, you'd…">
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "buy_more", label: "Buy more" }, { value: "hold", label: "Hold steady" },
                { value: "trim", label: "Trim some" }, { value: "sell", label: "Protect capital" },
              ].map((o) => (
                <button key={o.value} onClick={() => { setDrawdownReaction(o.value); markDirty(); }}
                  className="rounded-xl px-3 py-2.5 text-center transition-all"
                  style={{ background: drawdownReaction === o.value ? "rgba(247,147,26,0.08)" : "hsl(0 0% 10%)", border: drawdownReaction === o.value ? "1px solid #F7931A" : "1px solid hsl(0 0% 16%)" }}>
                  <p className="text-xs font-semibold" style={{ color: drawdownReaction === o.value ? "#F7931A" : "white" }}>{o.label}</p>
                </button>
              ))}
            </div>
          </InputRow>

          <InputRow label="Liquidity timeline">
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "none", label: "Not for years" }, { value: "1_3yr", label: "1–3 years" },
                { value: "within_1yr", label: "Within 12 months" }, { value: "flexible", label: "Flexible" },
              ].map((o) => (
                <button key={o.value} onClick={() => { setLiquidityNeeds(o.value); markDirty(); }}
                  className="rounded-xl px-3 py-2.5 text-center transition-all"
                  style={{ background: liquidityNeeds === o.value ? "rgba(247,147,26,0.08)" : "hsl(0 0% 10%)", border: liquidityNeeds === o.value ? "1px solid #F7931A" : "1px solid hsl(0 0% 16%)" }}>
                  <p className="text-xs font-semibold" style={{ color: liquidityNeeds === o.value ? "#F7931A" : "white" }}>{o.label}</p>
                </button>
              ))}
            </div>
          </InputRow>

          {(
            [
              { label: "Conservative target ($)", val: goalConservative, set: setGoalConservative, placeholder: "e.g. 200000", accent: "#10b981" },
              { label: "Middle target ($)",        val: goalModerate,     set: setGoalModerate,     placeholder: "e.g. 500000", accent: "#F7931A" },
              { label: "Moonshot target ($)",      val: goalMoonshot,     set: setGoalMoonshot,     placeholder: "e.g. 1000000", accent: "#a855f7" },
            ] as { label: string; val: string; set: (v: string) => void; placeholder: string; accent: string }[]
          ).map(({ label, val, set, placeholder, accent }) => (
            <InputRow key={label} label={label}>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[hsl(0_0%_45%)]">$</span>
                <input
                  type="number"
                  className={`${inputClass} pl-7`}
                  value={val}
                  onChange={(e) => { set(e.target.value); markDirty(); }}
                  placeholder={placeholder}
                  min={0}
                  step={10000}
                />
              </div>
              {(() => {
                const target = parseFloat(val);
                const base = parseFloat(initValue);
                if (!isNaN(target) && target > 0 && !isNaN(base) && base > 0) {
                  return (
                    <p className="text-xs mt-1.5" style={{ color: accent }}>
                      {(target / base).toFixed(1)}× on your ${base.toLocaleString()} starting value
                    </p>
                  );
                }
                return null;
              })()}
            </InputRow>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
          style={{
            background: saved ? "rgba(16,185,129,0.15)" : isDirty ? "#F7931A" : "hsl(0 0% 12%)",
            color: saved ? "#10b981" : isDirty ? "#000" : "hsl(0 0% 50%)",
            border: isDirty && !saved ? "none" : "1px solid hsl(0 0% 16%)",
          }}
        >
          {saved ? (
            <><Check className="w-4 h-4" /> Saved</>
          ) : (
            "Save changes"
          )}
        </button>
      </div>

      {/* Sticky unsaved-changes footer — warns before in-app navigation */}
      {isDirty && (
        <div className="fixed bottom-0 inset-x-0 lg:left-60 z-50 p-4 pointer-events-none">
          <div className="max-w-xl mx-auto pointer-events-auto">
            <div
              className="rounded-xl px-4 py-3 flex items-center justify-between gap-3 shadow-lg"
              style={{ background: "hsl(0 0% 10%)", border: "1px solid rgba(247,147,26,0.4)" }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: "#F7931A" }} />
                <p className="text-sm font-medium text-white truncate">Unsaved changes</p>
                <p className="text-xs text-[hsl(0_0%_45%)] hidden sm:block shrink-0">— navigating away will lose them</p>
              </div>
              <button
                onClick={handleSave}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                style={{ background: "#F7931A", color: "#000" }}
              >
                Save now
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
