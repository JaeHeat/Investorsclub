import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { upsertClientProfile } from "@/lib/localStore";
import { Bitcoin, ChevronRight, ChevronLeft, Check, Loader2, AlertCircle, Calendar, ClipboardList, BarChart2 } from "lucide-react";
import { INVESTMENT_GOALS } from "@/lib/portfolioPlans";

const STEPS = 3;

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

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Netherlands", "Switzerland", "Singapore", "Japan",
  "United Arab Emirates", "Brazil", "India", "South Korea", "Other",
];

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
  const { user, refreshClientProfile } = useAuth();
  const [, setLocation] = useLocation();

  // step 0 = welcome, 1–3 = form steps, 4 = done
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    full_name: "",
    country: autoDetectCountry(),
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
    setStepErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validateStep(s: number): Record<string, string> {
    const errors: Record<string, string> = {};
    if (s === 1) {
      if (!form.full_name.trim()) errors.full_name = "Full name is required";
      if (!form.country.trim()) errors.country = "Country is required";
    }
    if (s === 2) {
      const btc = parseFloat(form.btc_holdings);
      if (!form.btc_holdings || isNaN(btc) || btc <= 0) {
        errors.btc_holdings = "Enter your BTC holdings (must be greater than 0)";
      }
      const cost = parseFloat(form.avg_cost_basis);
      if (!form.avg_cost_basis || isNaN(cost) || cost <= 0) {
        errors.avg_cost_basis = "Enter your average cost basis";
      }
    }
    if (s === 3) {
      if (!form.investment_goal) errors.investment_goal = "Select a return target";
      if (!form.risk_tolerance) errors.risk_tolerance = "Select a risk tolerance";
      if (!form.time_horizon) errors.time_horizon = "Select a time horizon";
    }
    return errors;
  }

  function handleNext() {
    const errors = validateStep(step);
    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      return;
    }
    setStepErrors({});
    setStep(step + 1);
  }

  function handleSubmit() {
    const errors = validateStep(step);
    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      return;
    }
    if (!user) return;
    setSubmitting(true);

    const btcHoldings = parseFloat(form.btc_holdings);
    const avgCostBasis = parseFloat(form.avg_cost_basis);
    const initialPortfolioValue = btcHoldings * avgCostBasis;

    upsertClientProfile({
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

    refreshClientProfile();
    setStep(4);
    setSubmitting(false);
  }

  const progress = step >= 1 && step <= 3 ? (step / STEPS) * 100 : step > 3 ? 100 : 0;

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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "hsl(0 0% 4%)" }}>
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 justify-center mb-10">
          <Bitcoin className="w-6 h-6" style={{ color: "#F7931A" }} />
          <span className="text-lg font-semibold tracking-tight text-white">CryptoTrackr</span>
        </div>

        {/* Progress bar — only visible on form steps */}
        {step >= 1 && step <= 3 && (
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

        <div className="rounded-2xl p-8" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>

          {/* ── STEP 0: Welcome ────────────────────────────────────────────── */}
          {step === 0 && (
            <div data-testid="onboarding-welcome">
              <h2 className="text-xl font-semibold text-white mb-2">Welcome to your client portal</h2>
              <p className="text-sm text-[hsl(0_0%_50%)] mb-8 leading-relaxed">
                Before your first audit call, let's set up your profile. This takes about 3 minutes and helps your consultant prepare a personalised strategy for you.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  { icon: ClipboardList, label: "Your details", desc: "Name, country, and timezone" },
                  { icon: BarChart2, label: "Your BTC position", desc: "Holdings and average cost basis" },
                  { icon: Calendar, label: "Your investment goals", desc: "Return target, risk, and time horizon" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl p-3.5" style={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 14%)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(247,147,26,0.1)" }}>
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
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{ background: "#F7931A", color: "#0A0A0A" }}
              >
                Get started
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP 1: Personal details ───────────────────────────────────── */}
          {step === 1 && (
            <div data-testid="onboarding-step-1">
              <h2 className="text-xl font-semibold text-white mb-1">Tell us about yourself</h2>
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
              </div>
            </div>
          )}

          {/* ── STEP 2: BTC holdings ───────────────────────────────────────── */}
          {step === 2 && (
            <div data-testid="onboarding-step-2">
              <h2 className="text-xl font-semibold text-white mb-1">Your BTC holdings</h2>
              <p className="text-sm text-[hsl(0_0%_50%)] mb-7">This helps us calculate your portfolio value and milestones</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-1.5 uppercase tracking-wide">
                    Total BTC holdings <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.btc_holdings}
                      onChange={(e) => update("btc_holdings", e.target.value)}
                      placeholder="0.5"
                      step="0.0001"
                      min="0.0001"
                      data-testid="input-btc-holdings"
                      className={`${inputClass} pr-14`}
                      style={stepErrors.btc_holdings ? errorStyle : inputStyle}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[hsl(0_0%_45%)]">BTC</span>
                  </div>
                  <FieldError field="btc_holdings" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-1.5 uppercase tracking-wide">
                    Average cost basis <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[hsl(0_0%_45%)]">$</span>
                    <input
                      type="number"
                      value={form.avg_cost_basis}
                      onChange={(e) => update("avg_cost_basis", e.target.value)}
                      placeholder="35000"
                      step="1"
                      min="1"
                      data-testid="input-avg-cost"
                      className={`${inputClass} pl-7 pr-14`}
                      style={stepErrors.avg_cost_basis ? errorStyle : inputStyle}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[hsl(0_0%_45%)]">USD</span>
                  </div>
                  <FieldError field="avg_cost_basis" />
                </div>
                {form.btc_holdings && form.avg_cost_basis && parseFloat(form.btc_holdings) > 0 && parseFloat(form.avg_cost_basis) > 0 && (
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

          {/* ── STEP 3: Investment strategy ────────────────────────────────── */}
          {step === 3 && (
            <div data-testid="onboarding-step-3">
              <h2 className="text-xl font-semibold text-white mb-1">Investment strategy</h2>
              <p className="text-sm text-[hsl(0_0%_50%)] mb-7">Help us understand your goals for this cycle</p>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-2.5 uppercase tracking-wide">
                    Return target this cycle <span className="text-red-400">*</span>
                  </label>
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
                          border: `1px solid ${form.investment_goal === g.value ? "rgba(247,147,26,0.4)" : stepErrors.investment_goal ? "rgba(239,68,68,0.4)" : "hsl(0 0% 16%)"}`,
                        }}
                      >
                        <p className="text-sm font-bold" style={{ color: form.investment_goal === g.value ? "#F7931A" : "white" }}>{g.label}</p>
                        <p className="text-[10px] text-[hsl(0_0%_45%)] mt-0.5">{g.description}</p>
                      </button>
                    ))}
                  </div>
                  <FieldError field="investment_goal" />
                </div>

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

                <div>
                  <label className="block text-xs font-medium text-[hsl(0_0%_60%)] mb-1.5 uppercase tracking-wide">
                    Questions for your consultant <span className="text-[hsl(0_0%_40%)] normal-case font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Anything you'd like to discuss on the first call..."
                    rows={3}
                    data-testid="input-notes"
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-[hsl(0_0%_30%)] outline-none resize-none"
                    style={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 16%)" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Done ───────────────────────────────────────────────── */}
          {step === 4 && (
            <div data-testid="onboarding-complete" className="text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(247,147,26,0.12)" }}>
                <Check className="w-7 h-7" style={{ color: "#F7931A" }} />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">You're all set!</h2>
              <p className="text-sm text-[hsl(0_0%_50%)] mb-8 leading-relaxed">
                Your profile is saved. Your consultant will review it before your first call and tailor the session to your portfolio and goals.
              </p>
              <div className="space-y-2 mb-8 text-left">
                {[
                  "Your consultant reviews your profile",
                  "You receive a calendar invite for the audit call",
                  "On the call: strategy, milestones, and cycle plan",
                  "Your portal is updated after each session",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: "hsl(0 0% 10%)" }}>
                    <span className="text-xs font-bold mt-0.5 shrink-0" style={{ color: "#F7931A" }}>{i + 1}</span>
                    <p className="text-sm text-[hsl(0_0%_65%)]">{item}</p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setLocation("/portal")}
                data-testid="button-go-to-portal"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{ background: "#F7931A", color: "#0A0A0A" }}
              >
                Go to my portal
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── Navigation buttons (steps 1–3 only) ───────────────────────── */}
          {step >= 1 && step <= 3 && (
            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => { setStepErrors({}); setStep(step - 1); }}
                data-testid="button-back"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{ background: "hsl(0 0% 11%)", color: "hsl(0 0% 75%)", border: "1px solid hsl(0 0% 16%)" }}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              {step < STEPS ? (
                <button
                  type="button"
                  onClick={handleNext}
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
          )}
        </div>
      </div>
    </div>
  );
}
