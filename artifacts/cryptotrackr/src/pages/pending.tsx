import { useAuth } from "@/contexts/AuthContext";
import { Bitcoin, Clock, Mail } from "lucide-react";

export default function PendingApprovalPage() {
  const { user, signOut } = useAuth();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "hsl(0 0% 4%)" }}
    >
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "rgba(247,147,26,0.12)", border: "1px solid rgba(247,147,26,0.3)" }}
          >
            <Clock size={28} style={{ color: "#F7931A" }} />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <Bitcoin size={18} style={{ color: "#F7931A" }} />
          <span className="text-sm font-medium tracking-wider uppercase" style={{ color: "#F7931A" }}>
            Bitcoin Daily Consulting
          </span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          Application Under Review
        </h1>

        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
          Your account has been received and is pending approval. Our team will
          review your application and grant access shortly.
        </p>

        {user?.email && (
          <div
            className="flex items-center gap-2 justify-center mb-8 px-4 py-3 rounded-lg"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Mail size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              {user.email}
            </span>
          </div>
        )}

        <p className="text-xs mb-6" style={{ color: "rgba(255,255,255,0.3)" }}>
          You will receive access once an administrator approves your account. This typically takes 1–2 business days.
        </p>

        <button
          onClick={signOut}
          className="text-sm transition-colors"
          style={{ color: "rgba(255,255,255,0.4)" }}
          data-testid="button-sign-out"
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
