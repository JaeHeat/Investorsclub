import { useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getHoldings } from "@/lib/localStore";
import { useBtcPrice } from "@/hooks/useBtcPrice";
import { formatUSD } from "@/lib/utils";
import {
  getCurrentCyclePhase,
  getDaysUntil,
  CURRENT_CYCLE_PEAK_DATE,
} from "@/lib/cycleData";
import PortalLayout from "@/components/layout/PortalLayout";
import {
  TrendingUp, TrendingDown, Clock, AlertTriangle,
  CheckCircle2, ArrowRight, Zap, Shield, Target,
} from "lucide-react";
import { Link } from "wouter";

const NEXT_PEAKS = [
  { label: "Conservative", price: 200_000, color: "#10b981", prob: 0.25 },
  { label: "Base Case",    price: 250_000, color: "#F7931A", prob: 0.50 },
  { label: "Optimistic",  price: 350_000, color: "#a855f7", prob: 0.25 },
];
const EXPECTED_NEXT_PEAK = NEXT_PEAKS.reduce((s, x) => s + x.price * x.prob, 0);

const BEAR_BOTTOMS = [
  { label: "Already Bottomed",  price: 69_000, prob: 0.40, confirmed: true  },
  { label: "Conservative",      price: 50_500, prob: 0.15, confirmed: false },
  { label: "Base Case",         price: 41_700, prob: 0.30, confirmed: false },
  { label: "Aggressive",        price: 35_400, prob: 0.15, confirmed: false },
];
const EXPECTED_BOTTOM = BEAR_BOTTOMS.reduce((s, x) => s + x.price * x.prob, 0);
const WORST_BOTTOM    = Math.min(...BEAR_BOTTOMS.map((b) => b.price));

const PHASE_EV: Record<string, [number, number]> = {
  "1":    [92,  5],
  "2":    [62, 15],
  "3":    [82, 12],
  "4":    [68, 25],
  "5":    [20, 88],
  "bear": [38,  8],
};

const PHASE_VERDICTS: Record<string, { entry: string; exit: string }> = {
  "1":    { entry: "Optimal — Best entry of the cycle",      exit: "Worst possible — you're at the bottom"       },
  "2":    { entry: "Decent — Momentum in your favour",       exit: "Too early — main move hasn't started"        },
  "3":    { entry: "Good — Classic shakeout re-entry",       exit: "Trap — don't sell the dip"                   },
  "4":    { entry: "OK — Last accumulation window",          exit: "Premature — supply shock loading"            },
  "5":    { entry: "Poor — Late cycle, risk/reward flipped", exit: "Optimal — Execute your exit plan now"        },
  "bear": { entry: "Suboptimal — Wait for the buy zone",     exit: "Negative EV — locking in losses at the bottom" },
};

const BUY_ZONE_DATE = new Date("2026-10-01");

function scoreColor(s: number) {
  return s >= 70 ? "#10b981" : s >= 45 ? "#f59e0b" : "#ef4444";
}
function scoreLabel(s: number) {
  return s >= 70 ? "Strong EV" : s >= 45 ? "Neutral" : "Poor EV";
}

function EVGauge({ score, size = 88 }: { score: number; size?: number }) {
  const r     = size / 2 - 9;
  const c     = 2 * Math.PI * r;
  const color = scoreColor(score);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(0 0% 14%)" strokeWidth="7" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 - 3} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize="17" fontWeight="700" fontFamily="inherit">
        {score}
      </text>
      <text x={size / 2} y={size / 2 + 12} textAnchor="middle" dominantBaseline="middle"
        fill="hsl(0 0% 40%)" fontSize="9" fontFamily="inherit">
        /100
      </text>
    </svg>
  );
}

function MetricRow({
  label, value, sub, valueColor, highlight,
}: {
  label: string; value: string; sub?: string; valueColor?: string; highlight?: boolean;
}) {
  return (
    <div
      className="flex items-start justify-between py-2.5 px-3 rounded-lg gap-3"
      style={{ background: highlight ? "rgba(247,147,26,0.06)" : "transparent" }}
    >
      <span className="text-xs text-[hsl(0_0%_50%)] leading-relaxed shrink-0">{label}</span>
      <div className="text-right">
        <span className="text-sm font-semibold" style={{ color: valueColor ?? "white" }}>{value}</span>
        {sub && <p className="text-[10px] text-[hsl(0_0%_40%)] leading-tight mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function EVPage() {
  const { user } = useAuth();

  useEffect(() => {
    document.title = "EV Tool — Bitcoin Daily";
    return () => { document.title = "Bitcoin Daily"; };
  }, []);

  const holdings     = useMemo(() => (user ? getHoldings(user.id) : []), [user]);
  const { price: btcPrice, loading: priceLoading } = useBtcPrice();
  const currentPhase = useMemo(() => getCurrentCyclePhase(), []);

  const totalBtcAmt  = useMemo(
    () => holdings.filter((h) => h.coingecko_id === "bitcoin").reduce((s, h) => s + h.amount, 0),
    [holdings],
  );
  const portfolioNow = btcPrice ? totalBtcAmt * btcPrice : 0;
  const hasBtc       = totalBtcAmt > 0;

  const bearProgress = useMemo(() => {
    const peak    = CURRENT_CYCLE_PEAK_DATE.getTime();
    const buyZone = BUY_ZONE_DATE.getTime();
    return Math.max(0, Math.min(1, (Date.now() - peak) / (buyZone - peak)));
  }, []);

  const daysUntilBuyZone = getDaysUntil(BUY_ZONE_DATE);
  const phaseKey         = String(currentPhase.phase);
  const [baseEntry, baseExit] = PHASE_EV[phaseKey] ?? [50, 50];
  const verdicts         = PHASE_VERDICTS[phaseKey] ?? { entry: "", exit: "" };

  const entryScore = phaseKey === "bear"
    ? Math.round(baseEntry + bearProgress * 22)
    : baseEntry;
  const exitScore  = baseExit;

  const retNow          = btcPrice ? (EXPECTED_NEXT_PEAK / btcPrice - 1) * 100 : null;
  const retFromBottom   = (EXPECTED_NEXT_PEAK / EXPECTED_BOTTOM - 1) * 100;
  const patienceEdgePct = retNow != null ? retFromBottom - retNow : null;
  const drawdownRisk    = btcPrice && btcPrice > WORST_BOTTOM
    ? ((btcPrice - WORST_BOTTOM) / btcPrice) * 100
    : null;

  const projections = NEXT_PEAKS.map((s) => ({
    ...s,
    portfolioValue: totalBtcAmt * s.price,
    returnFromNow:  btcPrice ? (s.price / btcPrice - 1) * 100 : null,
  }));
  const expectedPortfolio = totalBtcAmt * EXPECTED_NEXT_PEAK;
  const forfeitedUpside   = portfolioNow > 0 ? expectedPortfolio - portfolioNow : 0;
  const forfeitedPct      = portfolioNow > 0 ? (forfeitedUpside / portfolioNow) * 100 : 0;

  return (
    <PortalLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">Expected Value Tool</h1>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}
          >
            EV Analysis
          </span>
        </div>
        <p className="text-sm text-[hsl(0_0%_42%)]">
          The probability-weighted math behind your next move — before emotion makes the decision for you.
        </p>
      </div>

      {/* Phase banner */}
      <div
        className="rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 14%)" }}
      >
        <div>
          <p className="text-xs text-[hsl(0_0%_40%)] uppercase tracking-wide mb-1">Current Cycle Phase</p>
          <p className="text-base font-semibold text-white">{currentPhase.name}</p>
          <p className="text-xs text-[hsl(0_0%_45%)] mt-0.5">{currentPhase.description}</p>
        </div>
        {phaseKey === "bear" && daysUntilBuyZone > 0 && (
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl shrink-0"
            style={{ background: "rgba(247,147,26,0.08)", border: "1px solid rgba(247,147,26,0.2)" }}
          >
            <Clock className="w-4 h-4" style={{ color: "#F7931A" }} />
            <div>
              <p className="text-[10px] text-[hsl(0_0%_50%)]">Buy zone opens in</p>
              <p className="text-sm font-bold" style={{ color: "#F7931A" }}>{daysUntilBuyZone} days</p>
            </div>
          </div>
        )}
      </div>

      {/* EV Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">

        {/* Entry EV */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
        >
          <div className="p-5 pb-0">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4" style={{ color: "#F7931A" }} />
                  <p className="text-sm font-semibold text-white">Entry EV</p>
                </div>
                <p className="text-xs text-[hsl(0_0%_42%)]">Should you buy right now?</p>
              </div>
              <EVGauge score={entryScore} />
            </div>
            <div
              className="flex items-start gap-2 px-3 py-2.5 rounded-xl mb-4"
              style={{
                background: `${scoreColor(entryScore)}12`,
                border: `1px solid ${scoreColor(entryScore)}28`,
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1" style={{ background: scoreColor(entryScore) }} />
              <span className="text-xs font-semibold leading-relaxed" style={{ color: scoreColor(entryScore) }}>
                {scoreLabel(entryScore)} — {verdicts.entry}
              </span>
            </div>
          </div>

          <div className="h-px mx-5" style={{ background: "hsl(0 0% 11%)" }} />

          <div className="p-4 space-y-0.5">
            <MetricRow
              label="Current BTC price"
              value={priceLoading || !btcPrice ? "Loading…" : `$${btcPrice.toLocaleString()}`}
            />
            <MetricRow
              label="Probability-weighted next peak"
              value={`$${EXPECTED_NEXT_PEAK.toLocaleString()}`}
              sub="Cons. $200K · Base $250K · Opt. $350K"
              valueColor="#F7931A"
            />
            <MetricRow
              label="Expected return buying NOW"
              value={retNow != null ? `+${retNow.toFixed(0)}%` : "—"}
              valueColor={retNow != null && retNow > 50 ? "#10b981" : "#f59e0b"}
            />
            <MetricRow
              label="Expected return from buy zone"
              value={`+${retFromBottom.toFixed(0)}%`}
              sub={`~$${Math.round(EXPECTED_BOTTOM / 1000)}K expected bottom (prob.-weighted)`}
              valueColor="#10b981"
            />
            {patienceEdgePct != null && (
              <MetricRow
                label="Extra return from patience"
                value={patienceEdgePct > 0 ? `+${patienceEdgePct.toFixed(0)}%` : `${patienceEdgePct.toFixed(0)}%`}
                sub="The cost of acting before the buy zone"
                valueColor="#F7931A"
                highlight
              />
            )}
            {drawdownRisk != null && (
              <MetricRow
                label="Max drawdown risk from here"
                value={`-${drawdownRisk.toFixed(0)}%`}
                sub={`If aggressive scenario hits ($${WORST_BOTTOM.toLocaleString()})`}
                valueColor="#ef4444"
              />
            )}

            {phaseKey === "bear" && daysUntilBuyZone > 0 && (
              <div
                className="flex items-start gap-2 mt-2 p-3 rounded-xl"
                style={{ background: "hsl(0 0% 10%)" }}
              >
                <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#F7931A" }} />
                <p className="text-[11px] text-[hsl(0_0%_45%)] leading-relaxed">
                  The buy zone opens in <span style={{ color: "white" }}>{daysUntilBuyZone} days</span>.
                  Each day of patience from here increases your expected return. DCA only on confirmed bottom signals.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Exit EV */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
        >
          <div className="p-5 pb-0">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="w-4 h-4" style={{ color: "#F7931A" }} />
                  <p className="text-sm font-semibold text-white">Exit EV</p>
                </div>
                <p className="text-xs text-[hsl(0_0%_42%)]">Should you sell right now?</p>
              </div>
              <EVGauge score={exitScore} />
            </div>
            <div
              className="flex items-start gap-2 px-3 py-2.5 rounded-xl mb-4"
              style={{
                background: `${scoreColor(exitScore)}12`,
                border: `1px solid ${scoreColor(exitScore)}28`,
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1" style={{ background: scoreColor(exitScore) }} />
              <span className="text-xs font-semibold leading-relaxed" style={{ color: scoreColor(exitScore) }}>
                {scoreLabel(exitScore)} — {verdicts.exit}
              </span>
            </div>
          </div>

          <div className="h-px mx-5" style={{ background: "hsl(0 0% 11%)" }} />

          <div className="p-4 space-y-0.5">
            {hasBtc && btcPrice ? (
              <>
                <MetricRow
                  label="Your BTC position now"
                  value={formatUSD(portfolioNow)}
                  sub={`${totalBtcAmt.toFixed(4)} BTC @ $${btcPrice.toLocaleString()}`}
                />
                {projections.map((s) => (
                  <MetricRow
                    key={s.label}
                    label={`${s.label} peak value`}
                    value={formatUSD(s.portfolioValue)}
                    sub={`BTC $${(s.price / 1000).toFixed(0)}K${s.returnFromNow != null ? ` · +${s.returnFromNow.toFixed(0)}% from today` : ""}`}
                    valueColor={s.color}
                  />
                ))}
                <MetricRow
                  label="Expected portfolio at next peak"
                  value={formatUSD(expectedPortfolio)}
                  sub="Probability-weighted across all 3 scenarios"
                  valueColor="#F7931A"
                />
                <MetricRow
                  label="Upside forfeited by selling now"
                  value={formatUSD(forfeitedUpside)}
                  sub={`+${forfeitedPct.toFixed(0)}% in unrealised future gains`}
                  valueColor="#ef4444"
                  highlight
                />
              </>
            ) : (
              <>
                <MetricRow
                  label="Next cycle peak (base case)"
                  value="$250,000 / BTC"
                  valueColor="#F7931A"
                />
                <MetricRow
                  label="Expected return from current price"
                  value={retNow != null ? `+${retNow.toFixed(0)}%` : "—"}
                  sub="Probability-weighted across all peak scenarios"
                  valueColor="#10b981"
                />
                <div
                  className="mt-2 p-3 rounded-xl flex items-start gap-2"
                  style={{ background: "hsl(0 0% 10%)" }}
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
                  <p className="text-[11px] text-[hsl(0_0%_45%)] leading-relaxed">
                    Add your BTC holdings in{" "}
                    <Link href="/portal/settings" style={{ color: "#F7931A" }}>Settings</Link>{" "}
                    to see your personalised exit EV with exact dollar projections.
                  </p>
                </div>
              </>
            )}

            {phaseKey === "bear" && (
              <div
                className="flex items-start gap-2 mt-2 p-3 rounded-xl"
                style={{ background: "hsl(0 0% 10%)" }}
              >
                <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
                <p className="text-[11px] text-[hsl(0_0%_45%)] leading-relaxed">
                  Every bear market has felt like "this time it won't recover." Every single one
                  recovered — and set a new all-time high. Selling here crystallises your loss at
                  the worst possible price in the cycle.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bear bottom scenarios */}
      {phaseKey === "bear" && (
        <div
          className="rounded-2xl p-5 mb-5"
          style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4" style={{ color: "#F7931A" }} />
            <p className="text-sm font-semibold text-white">Bear Bottom Scenarios</p>
            <span className="text-[10px] text-[hsl(0_0%_40%)]">— basis of the entry EV calculation</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BEAR_BOTTOMS.map((b) => (
              <div
                key={b.label}
                className="rounded-xl p-3"
                style={{
                  background: b.confirmed ? "rgba(6,182,212,0.07)" : "hsl(0 0% 10%)",
                  border: b.confirmed ? "1px solid rgba(6,182,212,0.2)" : "1px solid hsl(0 0% 14%)",
                }}
              >
                <p className="text-[10px] text-[hsl(0_0%_42%)] mb-1 leading-tight">{b.label}</p>
                <p className="text-sm font-bold" style={{ color: b.confirmed ? "#06b6d4" : "white" }}>
                  ${b.price.toLocaleString()}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: b.confirmed ? "#06b6d4" : "hsl(0 0% 42%)" }}>
                  {(b.prob * 100).toFixed(0)}% prob{b.confirmed ? " · confirmed" : ""}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid hsl(0 0% 11%)" }}>
            <p className="text-[10px] text-[hsl(0_0%_40%)]">Probability-weighted expected bottom price</p>
            <p className="text-sm font-bold" style={{ color: "#F7931A" }}>
              ${Math.round(EXPECTED_BOTTOM).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Next cycle peak scenarios */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <ArrowRight className="w-4 h-4" style={{ color: "#F7931A" }} />
          <p className="text-sm font-semibold text-white">Next Cycle Peak Scenarios</p>
          <span className="text-[10px] text-[hsl(0_0%_40%)]">— 5th cycle, projected ~2029</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {NEXT_PEAKS.map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-3"
              style={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 14%)" }}
            >
              <p className="text-[10px] text-[hsl(0_0%_42%)] mb-1">{s.label}</p>
              <p className="text-base font-bold" style={{ color: s.color }}>
                ${(s.price / 1000).toFixed(0)}K
              </p>
              {btcPrice && (
                <p className="text-[10px] font-semibold" style={{ color: s.color }}>
                  +{((s.price / btcPrice - 1) * 100).toFixed(0)}% from today
                </p>
              )}
              <p className="text-[10px] text-[hsl(0_0%_36%)] mt-0.5">{(s.prob * 100).toFixed(0)}% weight</p>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid hsl(0 0% 11%)" }}>
          <p className="text-[10px] text-[hsl(0_0%_40%)]">Probability-weighted expected peak</p>
          <p className="text-sm font-bold" style={{ color: "#F7931A" }}>
            ${EXPECTED_NEXT_PEAK.toLocaleString()}
            {btcPrice ? ` (+${((EXPECTED_NEXT_PEAK / btcPrice - 1) * 100).toFixed(0)}% from today)` : ""}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div
        className="rounded-xl px-4 py-3 flex items-start gap-2"
        style={{ background: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 13%)" }}
      >
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "hsl(0 0% 32%)" }} />
        <p className="text-[10px] text-[hsl(0_0%_36%)] leading-relaxed">
          EV scores are based on Bitcoin halving cycle analysis and historical phase data. Entry EV reflects the
          probability-weighted return advantage of patience vs. acting immediately. Exit EV reflects the expected
          upside cost of selling early relative to the next projected cycle peak. Not financial advice — always
          factor your personal risk tolerance, tax position, and exit plan before acting.
        </p>
      </div>
    </PortalLayout>
  );
}
