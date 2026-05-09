import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { updateClientSettings } from "@/lib/localStore";
import PortalLayout from "@/components/layout/PortalLayout";
import { Settings, Check, AlertTriangle } from "lucide-react";

const RISK_OPTIONS = [
  { value: "conservative", label: "Conservative", desc: "Capital preservation first, lower alts exposure" },
  { value: "moderate",     label: "Moderate",     desc: "Balanced BTC/ETH core with selective alts" },
  { value: "aggressive",   label: "Aggressive",   desc: "Maximum cycle upside, higher alts allocation" },
];

const TIMEZONES = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Berlin", "Europe/Paris", "Asia/Dubai",
  "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney",
];

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Netherlands", "Switzerland", "Singapore", "Japan",
  "United Arab Emirates", "Brazil", "India", "South Korea", "Other",
];

export default function SettingsPage() {
  const { clientProfile, user, refreshClientProfile } = useAuth();
  const [, setLocation] = useLocation();

  const initial = {
    fullName:        clientProfile?.full_name        ?? "",
    discordUsername: clientProfile?.discord_username ?? "",
    country:    clientProfile?.country      ?? "",
    timezone:   clientProfile?.timezone     ?? "America/New_York",
    risk:       clientProfile?.risk_tolerance ?? "moderate",
    goal:       clientProfile?.investment_goal ?? "5x",
    btcHoldings: clientProfile?.btc_holdings != null ? String(clientProfile.btc_holdings) : "",
    avgCost:    clientProfile?.avg_cost_basis != null ? String(clientProfile.avg_cost_basis) : "",
    initValue:  clientProfile?.initial_portfolio_value != null ? String(clientProfile.initial_portfolio_value) : "",
  };

  const [fullName,        setFullName]        = useState(initial.fullName);
  const [discordUsername, setDiscordUsername] = useState(initial.discordUsername);
  const [country,         setCountry]         = useState(initial.country);
  const [timezone,    setTimezone]    = useState(initial.timezone);
  const [risk,        setRisk]        = useState(initial.risk);
  const [goal,        setGoal]        = useState(initial.goal);
  const [btcHoldings, setBtcHoldings] = useState(initial.btcHoldings);
  const [avgCost,     setAvgCost]     = useState(initial.avgCost);
  const [initValue,   setInitValue]   = useState(initial.initValue);
  const [saved,       setSaved]       = useState(false);

  const isDirty =
    fullName !== initial.fullName ||
    discordUsername !== initial.discordUsername ||
    country !== initial.country ||
    timezone !== initial.timezone ||
    risk !== initial.risk ||
    goal !== initial.goal ||
    btcHoldings !== initial.btcHoldings ||
    avgCost !== initial.avgCost ||
    initValue !== initial.initValue;

  useEffect(() => {
    document.title = "Settings — CryptoTrackr";
    return () => { document.title = "CryptoTrackr"; };
  }, []);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  function handleSave() {
    if (!user) return;
    const btc = btcHoldings ? parseFloat(btcHoldings) : undefined;
    const cost = avgCost ? parseFloat(avgCost) : undefined;
    updateClientSettings(user.id, {
      full_name:        fullName        || null,
      discord_username: discordUsername || null,
      country:   country  || null,
      timezone:  timezone || null,
      risk_tolerance: risk,
      investment_goal: goal,
      btc_holdings: btc != null && !isNaN(btc) ? btc : undefined,
      avg_cost_basis: cost != null && !isNaN(cost) ? cost : undefined,
      initial_portfolio_value: initValue ? Number(initValue) : undefined,
    });
    if (refreshClientProfile) refreshClientProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function InputRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div>
        <label className="block text-xs font-semibold text-[hsl(0_0%_55%)] uppercase tracking-wide mb-2">{label}</label>
        {children}
      </div>
    );
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm text-white bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] outline-none focus:border-[#F7931A] transition-colors";

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
        <p className="text-sm text-[hsl(0_0%_42%)]">Update your profile, BTC holdings, risk preference, and investment goal.</p>
      </div>

      <div className="space-y-6 max-w-xl">
        {/* Profile */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(0_0%_35%)]">Profile</p>
          <InputRow label="Full name">
            <input
              className={inputClass}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </InputRow>
          <InputRow label="Discord username">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[hsl(0_0%_40%)]">@</span>
              <input
                className={`${inputClass} pl-7`}
                value={discordUsername}
                onChange={(e) => setDiscordUsername(e.target.value.replace(/^@/, ""))}
                placeholder="yourhandle"
              />
            </div>
          </InputRow>
          <InputRow label="Country">
            <select
              className={inputClass}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="">Select country...</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </InputRow>
          <InputRow label="Timezone">
            <select
              className={inputClass}
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
              ))}
            </select>
          </InputRow>
        </div>

        {/* BTC Holdings */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(0_0%_35%)]">BTC Holdings</p>
          <p className="text-xs text-[hsl(0_0%_40%)] -mt-1">These values drive all portfolio calculations across the app.</p>
          <InputRow label="Total BTC holdings">
            <div className="relative">
              <input
                type="number"
                className={`${inputClass} pr-14`}
                value={btcHoldings}
                onChange={(e) => setBtcHoldings(e.target.value)}
                placeholder="e.g. 1.8"
                step="0.0001"
                min="0"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[hsl(0_0%_45%)]">BTC</span>
            </div>
          </InputRow>
          <InputRow label="Average cost basis">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[hsl(0_0%_45%)]">$</span>
              <input
                type="number"
                className={`${inputClass} pl-7 pr-14`}
                value={avgCost}
                onChange={(e) => setAvgCost(e.target.value)}
                placeholder="e.g. 35000"
                step="1"
                min="0"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[hsl(0_0%_45%)]">USD</span>
            </div>
          </InputRow>
          <InputRow label="Initial portfolio value ($)">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[hsl(0_0%_45%)]">$</span>
              <input
                type="number"
                className={`${inputClass} pl-7`}
                value={initValue}
                onChange={(e) => setInitValue(e.target.value)}
                placeholder="e.g. 150000"
                min={0}
              />
            </div>
          </InputRow>
        </div>

        {/* Strategy */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(0_0%_35%)]">Strategy</p>

          <InputRow label="Risk tolerance">
            <div className="space-y-2">
              {RISK_OPTIONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRisk(r.value)}
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

          <InputRow label="Target portfolio value this cycle ($)">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[hsl(0_0%_45%)]">$</span>
              <input
                type="number"
                className={`${inputClass} pl-7`}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
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
                    That's a <span className="text-white font-medium">{multiple}x</span> return on your ${base.toLocaleString()} portfolio
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
            <>
              <Check className="w-4 h-4" />
              Saved
            </>
          ) : (
            "Save changes"
          )}
        </button>
      </div>
    </PortalLayout>
  );
}
