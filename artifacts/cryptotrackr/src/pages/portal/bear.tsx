import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getBearChecklist, setBearChecklistItem } from "@/lib/localStore";
import { getCurrentCyclePhase } from "@/lib/cycleData";
import PortalLayout from "@/components/layout/PortalLayout";
import { Shield, CheckCircle2, Circle, AlertTriangle } from "lucide-react";

const CHECKLIST = [
  {
    id: "reduce-alts",
    label: "Reduce or exit speculative altcoin positions",
    description: "Alts bleed hardest in bear markets. Prioritise exiting rank 20+ positions first. Liquidity dries up fast.",
    priority: "critical" as const,
  },
  {
    id: "btc-floor",
    label: "Establish a BTC floor (minimum hold)",
    description: "Decide your minimum BTC allocation you will not sell regardless of price. Write it down. This is your cycle re-entry anchor.",
    priority: "critical" as const,
  },
  {
    id: "stablecoin-reserve",
    label: "Convert 20–40% to stablecoins",
    description: "USDC or USDT held on-chain or on a regulated exchange. This is your dry powder for the next cycle bottom.",
    priority: "critical" as const,
  },
  {
    id: "hardware-wallet",
    label: "Move long-term holds to cold storage",
    description: "Any asset you plan to hold through the full bear market should be off exchanges. Hardware wallet (Ledger, Trezor) is the standard.",
    priority: "high" as const,
  },
  {
    id: "tax-review",
    label: "Review tax-loss harvesting opportunities",
    description: "Selling at a loss can offset capital gains from earlier in the cycle. Consult a tax professional before year-end.",
    priority: "high" as const,
  },
  {
    id: "stop-dca",
    label: "Pause DCA into volatile assets",
    description: "Catching a falling knife destroys cost basis. Wait for confirmed bottom signals (12-month MA reclaim, on-chain accumulation) before resuming DCA.",
    priority: "high" as const,
  },
  {
    id: "track-on-chain",
    label: "Set price alerts for re-entry levels",
    description: "Define your re-entry prices now, before emotion takes over. Use TradingView or CryptoTrackr alerts. The best buys come at the worst headlines.",
    priority: "medium" as const,
  },
  {
    id: "document-entries",
    label: "Document entry prices for next cycle",
    description: "Record your average cost basis and ideal re-entry levels now, while the data is fresh. Preparation beats panic.",
    priority: "medium" as const,
  },
];

const PRIORITY_CONFIG = {
  critical: { color: "#ef4444", label: "Critical" },
  high:     { color: "#f59e0b", label: "High" },
  medium:   { color: "#6b7280", label: "Medium" },
};

export default function BearProtectionPage() {
  useEffect(() => {
    document.title = "Bear Protection — CryptoTrackr";
    return () => { document.title = "CryptoTrackr"; };
  }, []);
  const { user } = useAuth();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [checkedAt, setCheckedAt] = useState<Record<string, string>>({});
  const currentPhase = useMemo(() => getCurrentCyclePhase(), []);

  useEffect(() => {
    if (user) {
      setChecked(getBearChecklist(user.id));
      try {
        const raw = localStorage.getItem(`ct-bear-checklist-at-${user.id}`);
        setCheckedAt(raw ? JSON.parse(raw) : {});
      } catch {
        setCheckedAt({});
      }
    }
  }, [user]);

  function toggle(id: string) {
    if (!user) return;
    const next = !checked[id];
    setBearChecklistItem(user.id, id, next);
    setChecked((prev) => ({ ...prev, [id]: next }));
    if (next) {
      const ts = new Date().toISOString();
      const newAt = { ...checkedAt, [id]: ts };
      setCheckedAt(newAt);
      localStorage.setItem(`ct-bear-checklist-at-${user.id}`, JSON.stringify(newAt));
    } else {
      const newAt = { ...checkedAt };
      delete newAt[id];
      setCheckedAt(newAt);
      localStorage.setItem(`ct-bear-checklist-at-${user.id}`, JSON.stringify(newAt));
    }
  }

  const doneCount = CHECKLIST.filter((c) => checked[c.id]).length;
  const progress = Math.round((doneCount / CHECKLIST.length) * 100);

  function formatCheckedAt(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <PortalLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">Bear Protection</h1>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "hsl(0 0% 12%)", color: "hsl(0 0% 60%)" }}
          >
            {doneCount}/{CHECKLIST.length}
          </span>
        </div>
        <p className="text-sm text-[hsl(0_0%_42%)]">
          Capital protection checklist for navigating a bear market. Check each item as you complete it.
        </p>
      </div>

      {/* Phase context */}
      {currentPhase.phase === "bear" && (
        <div
          className="rounded-2xl p-4 mb-6 flex items-start gap-3"
          style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#ef4444]" />
          <div>
            <p className="text-sm font-semibold text-[#ef4444]">Bear market conditions active</p>
            <p className="text-xs text-[hsl(0_0%_52%)] mt-0.5">
              Current phase: {currentPhase.name}. Capital protection should be your primary focus. Work through this checklist now.
            </p>
          </div>
        </div>
      )}

      {/* Progress */}
      <div
        className="rounded-2xl p-4 mb-6"
        style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-[hsl(0_0%_45%)] uppercase tracking-wide">Protection score</p>
          <p className="text-sm font-bold" style={{ color: progress >= 75 ? "#10b981" : progress >= 40 ? "#F7931A" : "#ef4444" }}>
            {progress}%
          </p>
        </div>
        <div className="h-2 rounded-full" style={{ background: "hsl(0 0% 13%)" }}>
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background: progress >= 75 ? "#10b981" : progress >= 40 ? "#F7931A" : "#ef4444",
            }}
          />
        </div>
        <p className="text-[10px] text-[hsl(0_0%_38%)] mt-2">
          {doneCount === CHECKLIST.length
            ? "All items complete. Your portfolio is well-protected for bear conditions."
            : `${CHECKLIST.length - doneCount} items remaining. Focus on critical items first.`}
        </p>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {CHECKLIST.map((item) => {
          const done = !!checked[item.id];
          const pCfg = PRIORITY_CONFIG[item.priority];
          const completedDate = checkedAt[item.id];

          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className="w-full rounded-2xl p-4 text-left transition-all flex items-start gap-3"
              style={{
                background: "hsl(0 0% 7%)",
                border: done ? "1px solid rgba(16,185,129,0.25)" : "1px solid hsl(0 0% 13%)",
                opacity: done ? 0.75 : 1,
              }}
            >
              <div className="shrink-0 mt-0.5">
                {done ? (
                  <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                ) : (
                  <Circle className="w-5 h-5 text-[hsl(0_0%_30%)]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: done ? "hsl(0 0% 45%)" : "white", textDecoration: done ? "line-through" : "none" }}
                  >
                    {item.label}
                  </p>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: `${pCfg.color}18`, color: pCfg.color }}
                  >
                    {pCfg.label}
                  </span>
                </div>
                <p className="text-xs text-[hsl(0_0%_42%)] leading-relaxed">{item.description}</p>
                {done && completedDate && (
                  <p className="text-[10px] text-[#10b981] mt-1.5">
                    Completed {formatCheckedAt(completedDate)}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </PortalLayout>
  );
}
