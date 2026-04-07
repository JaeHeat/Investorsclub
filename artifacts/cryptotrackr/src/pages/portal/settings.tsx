import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateClientSettings } from "@/lib/localStore";
import { INVESTMENT_GOALS } from "@/lib/portfolioPlans";
import PortalLayout from "@/components/layout/PortalLayout";
import { Settings, Check } from "lucide-react";

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

export default function SettingsPage() {
  const { clientProfile, user, refreshClientProfile } = useAuth();

  const [fullName,   setFullName]   = useState(clientProfile?.full_name   ?? "");
  const [country,    setCountry]    = useState(clientProfile?.country      ?? "");
  const [timezone,   setTimezone]   = useState(clientProfile?.timezone     ?? "America/New_York");
  const [risk,       setRisk]       = useState(clientProfile?.risk_tolerance ?? "moderate");
  const [goal,       setGoal]       = useState(clientProfile?.investment_goal ?? "5x");
  const [initValue,  setInitValue]  = useState(String(clientProfile?.initial_portfolio_value ?? ""));
  const [saved,      setSaved]      = useState(false);

  function handleSave() {
    if (!user) return;
    updateClientSettings(user.id, {
      full_name: fullName || null,
      country:   country  || null,
      timezone:  timezone || null,
      risk_tolerance: risk,
      investment_goal: goal,
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
        </div>
        <p className="text-sm text-[hsl(0_0%_42%)]">Update your profile, risk preference, and investment goal.</p>
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
          <InputRow label="Country">
            <input
              className={inputClass}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. United States"
            />
          </InputRow>
          <InputRow label="Timezone">
            <select
              className={inputClass}
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz.replace("_", " ")}</option>
              ))}
            </select>
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

          <InputRow label="Investment goal">
            <div className="grid grid-cols-2 gap-2">
              {INVESTMENT_GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className="rounded-xl px-3 py-2.5 text-left transition-all"
                  style={{
                    background: goal === g.value ? "rgba(247,147,26,0.08)" : "hsl(0 0% 10%)",
                    border: goal === g.value ? "1px solid #F7931A" : "1px solid hsl(0 0% 16%)",
                  }}
                >
                  <p className="text-sm font-semibold" style={{ color: goal === g.value ? "#F7931A" : "white" }}>{g.label}</p>
                  <p className="text-[10px] text-[hsl(0_0%_42%)]">{g.description}</p>
                </button>
              ))}
            </div>
          </InputRow>

          <InputRow label="Initial portfolio value ($)">
            <input
              type="number"
              className={inputClass}
              value={initValue}
              onChange={(e) => setInitValue(e.target.value)}
              placeholder="e.g. 150000"
              min={0}
            />
          </InputRow>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
          style={{
            background: saved ? "rgba(16,185,129,0.15)" : "#F7931A",
            color: saved ? "#10b981" : "#000",
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
