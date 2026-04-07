// ── Curated Altcoin Universe ──────────────────────────────────────────────────
// Top 25 by market cap, filtered: no stablecoins, no meme coins, no BTC/ETH/SOL.
// Ordered by conviction rank (1 = highest). Each tier/risk gets the top N.

export type AltCategory =
  | "Layer 1"
  | "Payments"
  | "Infrastructure"
  | "DeFi"
  | "ETH Ecosystem"
  | "Exchange";

export interface CuratedAlt {
  name: string;
  symbol: string;
  coingecko_id: string;
  category: AltCategory;
  rationale: string;
  rank: number;
}

export const CURATED_ALTS: CuratedAlt[] = [
  {
    name: "XRP",
    symbol: "XRP",
    coingecko_id: "ripple",
    category: "Payments",
    rationale:
      "Legal clarity post-SEC. Remittance adoption, institutional settlement partnerships. Multi-cycle survivor with deep liquidity.",
    rank: 1,
  },
  {
    name: "BNB",
    symbol: "BNB",
    coingecko_id: "binancecoin",
    category: "Exchange",
    rationale:
      "Binance ecosystem token. CEX utility backing, consistent cycle performer, deep liquidity across all market conditions.",
    rank: 2,
  },
  {
    name: "Cardano",
    symbol: "ADA",
    coingecko_id: "cardano",
    category: "Layer 1",
    rationale:
      "Multi-cycle survivor. Peer-reviewed academic development, institutional L1, steady on-chain adoption with a long-term roadmap.",
    rank: 3,
  },
  {
    name: "Avalanche",
    symbol: "AVAX",
    coingecko_id: "avalanche-2",
    category: "Layer 1",
    rationale:
      "Subnet architecture enables enterprise-grade blockchain deployments. Strong institutional adoption and DeFi ecosystem.",
    rank: 4,
  },
  {
    name: "Chainlink",
    symbol: "LINK",
    coingecko_id: "chainlink",
    category: "Infrastructure",
    rationale:
      "Oracle monopoly — every smart contract needs external data. Critical DeFi infrastructure, cross-cycle survivor, expanding into CCIP.",
    rank: 5,
  },
  {
    name: "Polkadot",
    symbol: "DOT",
    coingecko_id: "polkadot",
    category: "Layer 1",
    rationale:
      "Cross-chain interoperability hub. Parachain ecosystem enables app-specific blockchains. Web3 Foundation backing, strong developer community.",
    rank: 6,
  },
  {
    name: "Litecoin",
    symbol: "LTC",
    coingecko_id: "litecoin",
    category: "Payments",
    rationale:
      "OG BTC fork — 4 halving cycles survived. Digital silver narrative. Proven cycle participant with consistent merchant adoption.",
    rank: 7,
  },
  {
    name: "NEAR Protocol",
    symbol: "NEAR",
    coingecko_id: "near",
    category: "Layer 1",
    rationale:
      "High-performance L1 with AI data layer narrative tailwind. Strong developer growth, sharded architecture for scale.",
    rank: 8,
  },
  {
    name: "TON",
    symbol: "TON",
    coingecko_id: "the-open-network",
    category: "Layer 1",
    rationale:
      "Telegram's blockchain — 900M user distribution pipeline. Unique mass adoption vector no other chain can replicate.",
    rank: 9,
  },
  {
    name: "Uniswap",
    symbol: "UNI",
    coingecko_id: "uniswap",
    category: "DeFi",
    rationale:
      "Dominant DEX by volume across all market conditions. Fee switch governance underway, regulatory clarity improving.",
    rank: 10,
  },
  {
    name: "Aave",
    symbol: "AAVE",
    coingecko_id: "aave",
    category: "DeFi",
    rationale:
      "Leading DeFi lending protocol by TVL. Institutional DeFi adoption tailwind, battle-tested across multiple market cycles.",
    rank: 11,
  },
  {
    name: "Arbitrum",
    symbol: "ARB",
    coingecko_id: "arbitrum",
    category: "ETH Ecosystem",
    rationale:
      "Dominant ETH L2 by TVL and transaction volume. Every wave of Ethereum adoption flows through Arbitrum first.",
    rank: 12,
  },
  {
    name: "Polygon",
    symbol: "POL",
    coingecko_id: "matic-network",
    category: "ETH Ecosystem",
    rationale:
      "ETH scaling with enterprise adoption. AggLayer multi-chain pivot positions it as the aggregation layer for all blockchains.",
    rank: 13,
  },
  {
    name: "Aptos",
    symbol: "APT",
    coingecko_id: "aptos",
    category: "Layer 1",
    rationale:
      "Move-based L1 with institutional backing (a16z, Multicoin). Strong developer activity and growing DeFi ecosystem.",
    rank: 14,
  },
  {
    name: "Optimism",
    symbol: "OP",
    coingecko_id: "optimism",
    category: "ETH Ecosystem",
    rationale:
      "ETH L2 powering the Superchain. Coinbase's Base is built on it — institutional distribution built in.",
    rank: 15,
  },
  {
    name: "Sui",
    symbol: "SUI",
    coingecko_id: "sui",
    category: "Layer 1",
    rationale:
      "High-throughput L1 with Move architecture. Strong 2024 cycle performance, growing gaming and DeFi ecosystem.",
    rank: 16,
  },
  {
    name: "Injective",
    symbol: "INJ",
    coingecko_id: "injective-protocol",
    category: "DeFi",
    rationale:
      "DeFi-native L1 built for financial applications. Derivatives focus, fast finality, growing institutional DeFi interest.",
    rank: 17,
  },
  {
    name: "Cosmos",
    symbol: "ATOM",
    coingecko_id: "cosmos",
    category: "Layer 1",
    rationale:
      "Interoperability hub — the internet of blockchains. Appchain infrastructure connects ecosystems without competing with them.",
    rank: 18,
  },
  {
    name: "Stellar",
    symbol: "XLM",
    coingecko_id: "stellar",
    category: "Payments",
    rationale:
      "Cross-border payments and institutional settlements. Multi-cycle survivor, IBM World Wire partnerships, regulated corridor focus.",
    rank: 19,
  },
];

export const ALT_CATEGORY_COLORS: Record<AltCategory, string> = {
  "Layer 1": "#3b82f6",
  "Payments": "#10b981",
  "Infrastructure": "#f59e0b",
  "DeFi": "#8b5cf6",
  "ETH Ecosystem": "#6366f1",
  "Exchange": "#f97316",
};

// ── Allocation Grid ───────────────────────────────────────────────────────────

export interface PortfolioPlan {
  tier: "Starter" | "Core" | "Premium" | "Elite";
  risk: "Conservative" | "Moderate" | "Aggressive";
  btcPct: number;
  ethPct: number;
  solPct: number;
  altsPct: number;
  numAlts: number;
  rationale: string;
  bearPhaseNote: string;
}

type RiskKey = "conservative" | "moderate" | "aggressive";
type SizeKey = "starter" | "core" | "premium" | "elite";

const PLAN_MATRIX: Record<SizeKey, Record<RiskKey, Omit<PortfolioPlan, "tier" | "risk">>> = {
  starter: {
    conservative: {
      btcPct: 55, ethPct: 25, solPct: 10, altsPct: 10, numAlts: 2,
      rationale:
        "Foundation-first with a small top-25 allocation. BTC provides the anchor, ETH adds proven upside, SOL captures the next leg. The alt position is limited to the two highest-conviction picks only.",
      bearPhaseNote:
        "In the current bear phase, consider holding 15–20% in stablecoins and DCA'ing into your target allocation progressively. Full deployment into the target split at the confirmed bottom zone (~Oct 2026).",
    },
    moderate: {
      btcPct: 45, ethPct: 25, solPct: 15, altsPct: 15, numAlts: 4,
      rationale:
        "Balanced across the three foundation assets with meaningful alt exposure. Sized for asymmetric cycle returns — at this portfolio level, the risk/reward of a broader allocation is justified.",
      bearPhaseNote:
        "Hold 15–20% in stablecoins now. DCA into BTC and ETH first, then SOL, then alts as the bottom confirms. Don't deploy the full alt allocation until Phase 1 signals are clear.",
    },
    aggressive: {
      btcPct: 35, ethPct: 25, solPct: 15, altsPct: 25, numAlts: 5,
      rationale:
        "Maximum upside posture. SOL and top-25 alts are historically positioned to outperform BTC on a percentage basis in a strong cycle. BTC floor ensures the position doesn't go to zero.",
      bearPhaseNote:
        "20% stablecoin reserve recommended during the bear. DCA weekly into BTC and ETH. Wait until on-chain bottom signals confirm before deploying SOL and alt allocation in full.",
    },
  },
  core: {
    conservative: {
      btcPct: 60, ethPct: 25, solPct: 10, altsPct: 5, numAlts: 2,
      rationale:
        "BTC-heavy foundation with ETH and SOL for cycle participation. Small alt position limited to the two highest market-cap picks — conviction plays only, nothing speculative.",
      bearPhaseNote:
        "At this portfolio size, hold 10–15% in stablecoins. Prioritise BTC accumulation first. Alt allocation only deploys once the cycle bottom is confirmed.",
    },
    moderate: {
      btcPct: 50, ethPct: 25, solPct: 15, altsPct: 10, numAlts: 3,
      rationale:
        "Balanced across all three foundation assets. Alt allocation focused on the three highest market-cap picks by conviction rank. No speculation below top-10 alts by market cap.",
      bearPhaseNote:
        "Hold 10–15% stablecoins. DCA monthly into BTC/ETH through the bear. SOL and alts in the final accumulation quarter before Phase 1 kicks in.",
    },
    aggressive: {
      btcPct: 40, ethPct: 25, solPct: 15, altsPct: 20, numAlts: 4,
      rationale:
        "Leans into the upside cycle. ETH and SOL carry momentum — historically both outperform BTC percentage-wise in strong cycles. Four targeted alt picks, no dilution below rank 5.",
      bearPhaseNote:
        "Hold 15% stablecoins now. Deploy BTC and ETH through the bear DCA. Save the SOL and alt deployment for confirmed Phase 1 — buying too early costs you the lowest prices.",
    },
  },
  premium: {
    conservative: {
      btcPct: 70, ethPct: 20, solPct: 10, altsPct: 0, numAlts: 0,
      rationale:
        "Capital preservation mode. At this portfolio size, a -70% drawdown is $350K–$700K. BTC and ETH only — their cycle returns from bear bottom to peak are already life-changing without needing alt exposure.",
      bearPhaseNote:
        "Hold 15–20% in stablecoins or T-bills. Do not chase yield on idle capital. BTC DCA through the bear is the trade — no alt exposure at this tier for conservative risk tolerance.",
    },
    moderate: {
      btcPct: 60, ethPct: 25, solPct: 10, altsPct: 5, numAlts: 2,
      rationale:
        "Predominantly foundation assets. The small alt allocation is limited to the two absolute highest-conviction picks by market cap. Nothing below rank 2 in the curated list.",
      bearPhaseNote:
        "10–15% stablecoin reserve. BTC and ETH are the priority accumulation targets. Alt position deploys last, only after bottom confirmation signals are met.",
    },
    aggressive: {
      btcPct: 50, ethPct: 25, solPct: 15, altsPct: 10, numAlts: 2,
      rationale:
        "Active upside posture, but foundation dominates. Alt allocation capped at 10% with only two picks — the absolute dollar exposure at this tier makes going broader unnecessary.",
      bearPhaseNote:
        "Hold 10% stablecoins. DCA BTC and ETH monthly. SOL and alts reserved for the accumulation phase — patience here is the edge.",
    },
  },
  elite: {
    conservative: {
      btcPct: 80, ethPct: 15, solPct: 5, altsPct: 0, numAlts: 0,
      rationale:
        "BTC is the trade. At $1M+, BTC cycling from a $40K bear floor to $200K+ peak is already a 5x return on a seven-figure position. ETH adds secondary upside. No alt risk is needed or warranted.",
      bearPhaseNote:
        "20% stablecoin or T-bill reserve. Accumulate BTC monthly through the bear. Patience is the strategy — this tier wins by not losing, then compounding the cycle.",
    },
    moderate: {
      btcPct: 70, ethPct: 20, solPct: 5, altsPct: 5, numAlts: 1,
      rationale:
        "BTC-dominant with ETH for secondary upside. One single highest-conviction alt position only — the absolute dollar exposure at $1M+ makes diversifying across multiple alts unnecessary.",
      bearPhaseNote:
        "15% stablecoin reserve. BTC first, ETH second. The single alt position only deploys after bottom signals confirm — it's a small position, but it benefits from the same timing discipline.",
    },
    aggressive: {
      btcPct: 60, ethPct: 20, solPct: 10, altsPct: 10, numAlts: 2,
      rationale:
        "Still BTC-led. ETH and SOL add percentage upside. Alt allocation strictly capped at 10% — at this portfolio size, that's already a significant absolute position on two names.",
      bearPhaseNote:
        "Hold 10–15% stablecoins. DCA BTC and ETH on schedule. SOL and alts last — size into them slowly and only after the macro bottom is confirmed on-chain.",
    },
  },
};

function sizeKey(portfolioValue: number): SizeKey {
  if (portfolioValue < 100_000) return "starter";
  if (portfolioValue < 500_000) return "core";
  if (portfolioValue < 1_000_000) return "premium";
  return "elite";
}

function riskKey(risk: string | null | undefined): RiskKey {
  if (risk === "conservative" || risk === "aggressive") return risk;
  return "moderate";
}

const TIER_LABELS: Record<SizeKey, PortfolioPlan["tier"]> = {
  starter: "Starter",
  core: "Core",
  premium: "Premium",
  elite: "Elite",
};

const RISK_LABELS: Record<RiskKey, PortfolioPlan["risk"]> = {
  conservative: "Conservative",
  moderate: "Moderate",
  aggressive: "Aggressive",
};

export function getPortfolioPlan(
  risk: string | null | undefined,
  portfolioValue: number
): PortfolioPlan {
  const sk = sizeKey(portfolioValue);
  const rk = riskKey(risk);
  const base = PLAN_MATRIX[sk][rk];
  return { ...base, tier: TIER_LABELS[sk], risk: RISK_LABELS[rk] };
}

export function getCuratedAlts(numAlts: number): CuratedAlt[] {
  return CURATED_ALTS.slice(0, numAlts);
}

// Asset display config shared across pages
export const ASSET_CONFIG = {
  BTC: { color: "#F7931A", label: "Bitcoin", key: "btcPct" as const },
  ETH: { color: "#627EEA", label: "Ethereum", key: "ethPct" as const },
  SOL: { color: "#9945FF", label: "Solana", key: "solPct" as const },
  ALTS: { color: "#10b981", label: "Top-25 Alts", key: "altsPct" as const },
} as const;

// ── Cycle Projection Multipliers ──────────────────────────────────────────────
// "From current price to projected cycle peak" multipliers per asset class.
// Conservative = weak cycle (2022-style), Base = historical median, Optimistic = 2020-style run.
// Based on: BTC $200K-$400K peak projection from current ~$83K; ETH/SOL historically
// outperform BTC on % in strong cycles but underperform in weak ones.

export interface ScenarioMultipliers {
  btc: number;
  eth: number;
  sol: number;
  alts: number;
}

export interface CycleScenario {
  key: "conservative" | "base" | "optimistic";
  label: string;
  color: string;
  multipliers: ScenarioMultipliers;
  description: string;
}

export const CYCLE_SCENARIOS: CycleScenario[] = [
  {
    key: "conservative",
    label: "Conservative",
    color: "#10b981",
    multipliers: { btc: 2.5, eth: 2.0, sol: 3.0, alts: 2.0 },
    description: "Weak cycle — BTC reaches ~$200K, alts underperform. Similar to 2022–2025.",
  },
  {
    key: "base",
    label: "Base",
    color: "#F7931A",
    multipliers: { btc: 3.5, eth: 5.0, sol: 7.0, alts: 5.0 },
    description: "Historical median — BTC reaches ~$250K–$300K, ETH and SOL outperform.",
  },
  {
    key: "optimistic",
    label: "Optimistic",
    color: "#a855f7",
    multipliers: { btc: 5.0, eth: 8.0, sol: 12.0, alts: 8.0 },
    description: "Strong cycle — BTC reaches $350K–$400K. ETH and SOL run hard. 2020-style.",
  },
];

export function calculateProjection(
  currentPortfolioValue: number,
  plan: PortfolioPlan,
  scenario: CycleScenario
): number {
  const m = scenario.multipliers;
  return (
    currentPortfolioValue * (plan.btcPct / 100) * m.btc +
    currentPortfolioValue * (plan.ethPct / 100) * m.eth +
    currentPortfolioValue * (plan.solPct / 100) * m.sol +
    currentPortfolioValue * (plan.altsPct / 100) * m.alts
  );
}

// ── Investment Goal Targets ───────────────────────────────────────────────────

export interface InvestmentGoal {
  value: string;
  multiple: number;
  label: string;
  description: string;
}

export const INVESTMENT_GOALS: InvestmentGoal[] = [
  { value: "2x", multiple: 2, label: "2x Target", description: "Double my portfolio this cycle" },
  { value: "5x", multiple: 5, label: "5x Target", description: "5x return by the cycle peak" },
  { value: "10x", multiple: 10, label: "10x Target", description: "10x — life-changing returns" },
  { value: "25x", multiple: 25, label: "25x Target", description: "25x+ — maximum cycle upside" },
];

// ── Exit Strategy ─────────────────────────────────────────────────────────

export interface ExitTranche {
  phaseId: number;
  phaseLabel: string;
  btcSellPct: number;
  ethSellPct: number;
  solSellPct: number;
  altsSellPct: number;
  action: string;
  urgency: "hold" | "watch" | "reduce" | "exit";
}

export const EXIT_TRANCHES: ExitTranche[] = [
  {
    phaseId: 1,
    phaseLabel: "Accumulation",
    btcSellPct: 0,
    ethSellPct: 0,
    solSellPct: 0,
    altsSellPct: 0,
    action: "Hold all positions. DCA into BTC if below cost basis. Do not sell.",
    urgency: "hold",
  },
  {
    phaseId: 2,
    phaseLabel: "Early Bull",
    btcSellPct: 0,
    ethSellPct: 0,
    solSellPct: 0,
    altsSellPct: 0,
    action: "Hold all. Consider adding to alts with any free capital. Let the bull run develop.",
    urgency: "hold",
  },
  {
    phaseId: 3,
    phaseLabel: "Bull Run",
    btcSellPct: 0,
    ethSellPct: 0,
    solSellPct: 0,
    altsSellPct: 25,
    action: "Reduce high-risk alts by 25%. Rotate profits into BTC/ETH. Begin watching exit levels.",
    urgency: "watch",
  },
  {
    phaseId: 4,
    phaseLabel: "Late Bull",
    btcSellPct: 20,
    ethSellPct: 25,
    solSellPct: 25,
    altsSellPct: 50,
    action: "Sell 20% BTC, 25% ETH/SOL, 50% remaining alts. Move proceeds to stablecoin.",
    urgency: "reduce",
  },
  {
    phaseId: 5,
    phaseLabel: "Peak / Distribution",
    btcSellPct: 50,
    ethSellPct: 60,
    solSellPct: 60,
    altsSellPct: 100,
    action: "Exit all alts. Sell 50% BTC, 60% ETH/SOL. Protect capital — cycle top is near.",
    urgency: "exit",
  },
  {
    phaseId: 6,
    phaseLabel: "Bear Market",
    btcSellPct: 30,
    ethSellPct: 100,
    solSellPct: 100,
    altsSellPct: 100,
    action: "Exit remaining ETH/SOL/alts. Reduce BTC another 30%. Prepare stablecoin for re-entry.",
    urgency: "exit",
  },
];

export function getExitPlan(
  holdings: { btcValue: number; ethValue: number; solValue: number; altsValue: number },
  currentPhaseId: number
): Array<ExitTranche & { btcSellUsd: number; ethSellUsd: number; solSellUsd: number; altsSellUsd: number; totalSellUsd: number; cumulativeBtcSoldPct: number }> {
  let cumulativeBtcSold = 0;
  return EXIT_TRANCHES.map((t) => {
    const btcSellUsd = (holdings.btcValue * t.btcSellPct) / 100;
    const ethSellUsd = (holdings.ethValue * t.ethSellPct) / 100;
    const solSellUsd = (holdings.solValue * t.solSellPct) / 100;
    const altsSellUsd = (holdings.altsValue * t.altsSellPct) / 100;
    cumulativeBtcSold = Math.min(100, cumulativeBtcSold + t.btcSellPct);
    return {
      ...t,
      btcSellUsd,
      ethSellUsd,
      solSellUsd,
      altsSellUsd,
      totalSellUsd: btcSellUsd + ethSellUsd + solSellUsd + altsSellUsd,
      cumulativeBtcSoldPct: cumulativeBtcSold,
    };
  });
}

export function getInvestmentGoal(value: string | null | undefined): InvestmentGoal | null {
  return INVESTMENT_GOALS.find((g) => g.value === value) ?? null;
}

// Which scenario achieves the goal multiple?
export function assessGoal(
  currentValue: number,
  plan: PortfolioPlan,
  goalMultiple: number
): { achievedIn: CycleScenario["key"] | "none"; message: string; messageColor: string } {
  const targetValue = currentValue * goalMultiple;

  const conservative = calculateProjection(currentValue, plan, CYCLE_SCENARIOS[0]);
  const base = calculateProjection(currentValue, plan, CYCLE_SCENARIOS[1]);
  const optimistic = calculateProjection(currentValue, plan, CYCLE_SCENARIOS[2]);

  if (conservative >= targetValue) {
    return {
      achievedIn: "conservative",
      message: "Achievable even in a weak cycle.",
      messageColor: "#10b981",
    };
  }
  if (base >= targetValue) {
    return {
      achievedIn: "base",
      message: "On track under base scenario projections.",
      messageColor: "#F7931A",
    };
  }
  if (optimistic >= targetValue) {
    return {
      achievedIn: "optimistic",
      message: "Requires a strong cycle. Achievable but not guaranteed.",
      messageColor: "#a855f7",
    };
  }
  return {
    achievedIn: "none",
    message: "Target exceeds optimistic projections for this allocation.",
    messageColor: "#ef4444",
  };
}
