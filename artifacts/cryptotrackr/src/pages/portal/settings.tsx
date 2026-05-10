import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateClientSettings, getHoldings, setHoldings } from "@/lib/localStore";
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
};

function toRows(hs: HoldingAsset[]): HoldingRow[] {
  return hs.map((h) => ({
    coingecko_id: h.coingecko_id,
    symbol: h.symbol,
    name: h.name,
    amount: String(h.amount),
    avg_cost: String(h.avg_cost),
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
  const [goal,            setGoal]            = useState("");
  const [initValue,       setInitValue]       = useState("");

  // ── Holdings ────────────────────────────────────────────────────────────────
  const [holdingRows,    setHoldingRows]    = useState<HoldingRow[]>([]);
  const [showPicker,     setShowPicker]     = useState(false);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [profileLoaded,  setProfileLoaded]  = useState(false);
  const [isDirty,        setIsDirty]        = useState(false);
  const [saved,          setSaved]          = useState(false);

  useEffect(() => {
    document.title = "Settings — CryptoTrackr";
    return () => { document.title = "CryptoTrackr"; };
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
      // Goal is a dollar string from onboarding; handle legacy "Nx" values
      const g = clientProfile.investment_goal ?? "";
      const parsed = parseFloat(g);
      setGoal(!isNaN(parsed) && parsed > 0 ? String(parsed) : "");
      setInitValue(
        clientProfile.initial_portfolio_value != null
          ? String(clientProfile.initial_portfolio_value)
          : ""
      );
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
      investment_goal: goal || null,
      initial_portfolio_value: initValue ? Number(initValue) : undefined,
    });

    const validHoldings: HoldingAsset[] = holdingRows
      .filter((r) => r.amount.trim() && r.avg_cost.trim())
      .map((r) => ({
        coingecko_id: r.coingecko_id,
        symbol:       r.symbol,
        name:         r.name,
        amount:       parseFloat(r.amount),
        avg_cost:     parseFloat(r.avg_cost),
      }));
    setHoldings(user.id, validHoldings);

    if (refreshClientProfile) refreshClientProfile();
    setIsDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function updateRow(idx: number, field: "amount" | "avg_cost", val: string) {
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
              <label className="text-xs font-semibold text-[hsl(0_0%_55%)] uppercase tracking-wide">Starting portfolio value ($)</label>
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
            <p className="text-xs text-[hsl(0_0%_35%)] mt-1.5">Used as the baseline for milestone % return targets</p>
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

          <InputRow label="Target portfolio value this cycle ($)">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[hsl(0_0%_45%)]">$</span>
              <input
                type="number"
                className={`${inputClass} pl-7`}
                value={goal}
                onChange={(e) => { setGoal(e.target.value); markDirty(); }}
                placeholder="e.g. 500000"
                min={0}
                step={10000}
              />
            </div>
            {(() => {
              const target = parseFloat(goal);
              const base = parseFloat(initValue);
              if (!isNaN(target) && target > 0 && !isNaN(base) && base > 0) {
                const multiple = (target / base).toFixed(1);
                return (
                  <p className="text-xs text-[hsl(0_0%_40%)] mt-1.5">
                    That's a <span className="text-white font-medium">{multiple}×</span> return on your ${base.toLocaleString()} starting value
                  </p>
                );
              }
              return null;
            })()}
          </InputRow>
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
