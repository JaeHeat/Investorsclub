import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Bitcoin, ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react";

const STEPS = 3;

const INVESTMENT_GOALS = [
  { value: "long_term_hold", label: "Long-term hold", description: "Hold through multiple cycles" },
  { value: "cycle_top_exit", label: "Cycle top exit", description: "Exit near cycle peak" },
  { value: "partial_exits", label: "Partial exits", description: "Take profits along the way" },
  { value: "other", label: "Other", description: "Custom strategy" },
];

const RISK_LEVELS = [
  { value: "conservative", label: "Conservative", description: "Capital preservation first" },
  { value: "moderate", label: "Moderate", description: "Balanced risk/reward" },
  { value: "aggressive", label: "Aggressive", description: "Maximum growth potential" },
];

const TIME_HORIZONS = [
  { value: "1_year", label: "1 year" },
  { value: "2_3_years", label: "2–3 years" },
  { value: "4_plus_years", label: "4+ years" },
];

export default function OnboardingPage() {
  const { user, refreshClientProfile } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    country: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    btc_holdings: "",
    avg_cost_basis: "",
    investment_goal: "",
    risk_tolerance: "",
    time_horizon: "",
    notes: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!user) return;
    setSubmitting(true);
    setError(null);

    const btcHoldings = parseFloat(form.btc_holdings);
    const avgCostBasis = parseFloat(form.avg_cost_basis);
    const initialPortfolioValue = btcHoldings * avgCostBasis;

    const { error: upsertError } = await supabase
      .from("client_profiles")
      .upsert({
        user_id: user.id,
        full_name: form.full_name,
        country: form.country,
        timezone: form.timezone,
        btc_holdings: btcHoldings || null,
        avg_cost_basis: avgCostBasis || null,
        investment_goal: form.investment_goal,
        risk_tolerance: form.risk_tolerance,
        time_horizon: form.time_horizon,
        notes: form.notes,
        onboarding_completed: true,
        initial_portfolio_value: initialPortfolioValue || null,
        high_water_mark: initialPortfolioValue || null,
      });

    if (upsertError) {
      setError("Failed to save your profile. Please try again.");
      setSubmitting(false);
      return;
    }

    await refreshClientProfile();
    setLocation("/portal");
  }

  const progress = (step / STEPS) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "hsl(0 0% 4%)" }}>
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 justify-center mb-10">
          <Bitcoin className="w-6 h-6" style={{ color: "#F7931A" }} />
          <span className="text-lg font-semibold tracking-tight text-white">CryptoTrackr</span>
        </div>

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

        <div className="rounded-2xl p-8" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          {step === 1 && (
            <div data-testid="onboarding-step-1">
              <h2 className="text-xl font-semibold text-white mb-1">Tell us about yourself</h2>
              <p className="text-sm text-[hsl(0_0%_50%)] mb-7">Basic info to personalize your portal</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-1.5 uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => update("full_name", e.target.value)}
                    placeholder="Jane Smith"
                    data-testid="input-full-name"
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-[hsl(0_0%_30%)] outline-none"
                    style={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 16%)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-1.5 uppercase tracking-wide">Country</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => update("country", e.target.value)}
                    placeholder="United States"
                    data-testid="input-country"
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-[hsl(0_0%_30%)] outline-none"
                    style={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 16%)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-1.5 uppercase tracking-wide">Timezone</label>
                  <input
                    type="text"
                    value={form.timezone}
                    onChange={(e) => update("timezone", e.target.value)}
                    data-testid="input-timezone"
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white outline-none"
                    style={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 16%)" }}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div data-testid="onboarding-step-2">
              <h2 className="text-xl font-semibold text-white mb-1">Your BTC holdings</h2>
              <p className="text-sm text-[hsl(0_0%_50%)] mb-7">This helps us calculate your portfolio value and milestones</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-1.5 uppercase tracking-wide">Total BTC holdings</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.btc_holdings}
                      onChange={(e) => update("btc_holdings", e.target.value)}
                      placeholder="0.5"
                      step="0.0001"
                      min="0"
                      data-testid="input-btc-holdings"
                      className="w-full px-3.5 py-2.5 pr-14 rounded-lg text-sm text-white placeholder-[hsl(0_0%_30%)] outline-none"
                      style={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 16%)" }}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[hsl(0_0%_45%)]">BTC</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-1.5 uppercase tracking-wide">Average cost basis</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[hsl(0_0%_45%)]">$</span>
                    <input
                      type="number"
                      value={form.avg_cost_basis}
                      onChange={(e) => update("avg_cost_basis", e.target.value)}
                      placeholder="35000"
                      step="1"
                      min="0"
                      data-testid="input-avg-cost"
                      className="w-full pl-7 pr-14 py-2.5 rounded-lg text-sm text-white placeholder-[hsl(0_0%_30%)] outline-none"
                      style={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 16%)" }}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[hsl(0_0%_45%)]">USD</span>
                  </div>
                </div>

                {form.btc_holdings && form.avg_cost_basis && (
                  <div className="rounded-xl p-4" style={{ background: "rgba(247,147,26,0.06)", border: "1px solid rgba(247,147,26,0.15)" }}>
                    <p className="text-xs text-[hsl(0_0%_55%)] mb-0.5">Initial portfolio value</p>
                    <p className="text-lg font-semibold" style={{ color: "#F7931A" }}>
                      ${(parseFloat(form.btc_holdings) * parseFloat(form.avg_cost_basis)).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div data-testid="onboarding-step-3">
              <h2 className="text-xl font-semibold text-white mb-1">Investment strategy</h2>
              <p className="text-sm text-[hsl(0_0%_50%)] mb-7">Help us understand your goals</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-2.5 uppercase tracking-wide">Investment goal</label>
                  <div className="grid grid-cols-2 gap-2">
                    {INVESTMENT_GOALS.map((g) => (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => update("investment_goal", g.value)}
                        data-testid={`goal-${g.value}`}
                        className="p-3 rounded-xl text-left transition-all"
                        style={{
                          background: form.investment_goal === g.value ? "rgba(247,147,26,0.1)" : "hsl(0 0% 10%)",
                          border: `1px solid ${form.investment_goal === g.value ? "rgba(247,147,26,0.4)" : "hsl(0 0% 16%)"}`,
                        }}
                      >
                        <p className="text-xs font-medium text-white">{g.label}</p>
                        <p className="text-[10px] text-[hsl(0_0%_45%)] mt-0.5">{g.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-2.5 uppercase tracking-wide">Risk tolerance</label>
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
                          border: `1px solid ${form.risk_tolerance === r.value ? "rgba(247,147,26,0.4)" : "hsl(0 0% 16%)"}`,
                        }}
                      >
                        <p className="text-xs font-medium text-white">{r.label}</p>
                        <p className="text-[10px] text-[hsl(0_0%_45%)] mt-0.5">{r.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-2.5 uppercase tracking-wide">Time horizon</label>
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
                          border: `1px solid ${form.time_horizon === t.value ? "rgba(247,147,26,0.4)" : "hsl(0 0% 16%)"}`,
                          color: form.time_horizon === t.value ? "#F7931A" : "hsl(0 0% 70%)",
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-1.5 uppercase tracking-wide">Notes (optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Any context you'd like to share..."
                    rows={3}
                    data-testid="input-notes"
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-[hsl(0_0%_30%)] outline-none resize-none"
                    style={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 16%)" }}
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 px-3.5 py-2.5 rounded-lg text-sm text-red-400" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                data-testid="button-back"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{ background: "hsl(0 0% 11%)", color: "hsl(0 0% 75%)", border: "1px solid hsl(0 0% 16%)" }}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            {step < STEPS ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                data-testid="button-next"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{ background: "#F7931A", color: "#0A0A0A" }}
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                data-testid="button-complete"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-60"
                style={{ background: "#F7931A", color: "#0A0A0A" }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Complete Setup
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
