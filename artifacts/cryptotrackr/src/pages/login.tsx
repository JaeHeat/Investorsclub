import { useAuth } from "@/contexts/AuthContext";
import { Bitcoin, Loader2, Check } from "lucide-react";

const FEATURES = [
  "Live portfolio P&L across all your assets",
  "6-phase Bitcoin cycle exit plan, personalised to your holdings",
  "Milestone tracker with tiered return targets",
  "Monthly cycle reports and direct consultant roadmap",
];

export default function LoginPage() {
  const { login, loading } = useAuth();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "hsl(0 0% 4%)" }}
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-2 mb-8">
            <Bitcoin className="w-7 h-7" style={{ color: "#F7931A" }} />
            <span className="text-xl font-semibold tracking-tight text-white">CryptoTrackr</span>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-1">Sign in</h1>
          <p className="text-sm text-[hsl(0_0%_45%)]">Access your Bitcoin consulting portal</p>
        </div>

        <button
          onClick={login}
          disabled={loading}
          data-testid="button-signin"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7931A] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(0,0%,4%)]"
          style={{ background: "#F7931A", color: "#0A0A0A" }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </>
          ) : (
            "Sign in"
          )}
        </button>

        <div className="mt-8 space-y-2.5">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-start gap-2.5">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "rgba(247,147,26,0.12)" }}
              >
                <Check className="w-2.5 h-2.5" style={{ color: "#F7931A" }} />
              </div>
              <span className="text-xs text-[hsl(0_0%_45%)] leading-relaxed">{f}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-[hsl(0_0%_25%)] mt-8">
          Bitcoin cycle consultation platform
        </p>
      </div>
    </div>
  );
}
