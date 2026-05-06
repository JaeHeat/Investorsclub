import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getBearChecklist, setBearChecklistItem } from "@/lib/localStore";
import { getCurrentCyclePhase } from "@/lib/cycleData";
import PortalLayout from "@/components/layout/PortalLayout";
import { Shield, CheckCircle2, Circle, AlertTriangle } from "lucide-react";

interface CheckItem {
  id: string;
  label: string;
  description: string;
  priority: "critical" | "high" | "medium";
}

const CHECKLIST: CheckItem[] = [
  {
    id: "reduce-alts",
    label: "Reduce alt exposure below plan target",
    description: "Trim altcoin positions to below your plan target weight. Alts fall 70–95% in bear markets. Rotate into BTC or stablecoin.",
    priority: "critical",
  },
  {
    id: "btc-floor",
    label: "Set BTC as primary store of value",
    description: "Ensure BTC is your dominant holding. In bear markets, BTC loses less than alts and recovers first.",
    priority: "critical",
  },
  {
    id: "take-profits",
    label: "Take profits on ETH and SOL positions",
    description: "ETH and SOL typically drop 80–90% from cycle highs. Sell into strength and preserve capital.",
    priority: "critical",
  },
  {
    id: "stop-dca-alts",
    label: "Stop DCA on alts — continue BTC only",
    description: "In bear conditions, dollar-cost averaging into alts accelerates losses. Only DCA into BTC at confirmed support levels.",
    priority: "high",
  },
  {
    id: "stablecoin-reserve",
    label: "Build stablecoin reserve for re-entry",
    description: "Accumulate USDC or USDT as dry powder. Bear market bottoms create generational buying opportunities.",
    priority: "high",
  },
  {
    id: "price-alerts",
    label: "Set BTC price alerts for re-entry levels",
    description: "Historical bear bottoms are 70–85% below the cycle high. Set alerts at $30K, $25K, $20K as watch levels.",
    priority: "high",
  },
  {
    id: "emergency-fund",
    label: "Verify emergency fund is in fiat — not crypto",
    description: "Keep 6 months of expenses in a bank account. Never rely on crypto for emergency needs during a bear market.",
    priority: "medium",
  },
  {
    id: "document-entries",
    label: "Document entry prices for next cycle",
    description: "Record your average cost basis and ideal re-entry levels now, while the data is fresh. Preparation beats panic.",
    priority: "medium",
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
  const currentPhase = useMemo(() => getCurrentCyclePhase(), []);

  useEffect(() => {
    if (user) setChecked(getBearChecklist(user.id));
  }, [user]);

  function toggle(id: string) {
    if (!user) return;
    const next = !checked[id];
    setBearChecklistItem(user.id, id, next);
    setChecked((prev) => ({ ...prev, [id]: next }));
  }

  const doneCount = CHECKLIST.filter((c) => checked[c.id]).length;
  const progress = Math.round((doneCount / CHECKLIST.length) * 100);

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
      {currentPhase.id >= 5 && (
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

          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className="w-full rounded-2xl p-4 text-left transition-all flex items-start gap-3"
              style={{
                background: done ? "hsl(0 0% 7%)" : "hsl(0 0% 7%)",
                border: done ? "1px solid rgba(16,185,129,0.25)" : "1px solid hsl(0 0% 13%)",
                opacity: done ? 0.7 : 1,
              }}
            >
              <div className="shrink-0 mt-0.5">
                {done ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#10b981] w-5 h-5" />
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
              </div>
            </button>
          );
        })}
      </div>
    </PortalLayout>
  );
}
