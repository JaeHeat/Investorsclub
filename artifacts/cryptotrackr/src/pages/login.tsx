import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Bitcoin, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError);
      setLoading(false);
    }
  }

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
          <p className="text-sm text-[hsl(0_0%_45%)]">Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
          <div>
            <label className="block text-xs font-medium text-[hsl(0_0%_55%)] mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              data-testid="input-email"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-[hsl(0_0%_30%)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#F7931A] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(0,0%,4%)]"
              style={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 16%)" }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[hsl(0_0%_55%)] mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                data-testid="input-password"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm text-white placeholder-[hsl(0_0%_30%)] outline-none focus-visible:ring-2 focus-visible:ring-[#F7931A] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(0,0%,4%)]"
                style={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 16%)" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(0_0%_40%)] hover:text-[hsl(0_0%_65%)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7931A] rounded"
                data-testid="toggle-password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="px-3.5 py-2.5 rounded-xl text-sm text-red-400"
              style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)" }}
              data-testid="error-message"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            data-testid="button-signin"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7931A] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(0,0%,4%)]"
            style={{ background: "#F7931A", color: "#0A0A0A" }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-[hsl(0_0%_30%)] mt-6">
          Bitcoin cycle consultation platform
        </p>
      </div>
    </div>
  );
}
