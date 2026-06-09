import type { SimplePriceMap } from "./priceFeed";
import type { PricePoint } from "./priceHistory";

// Free, no-key, CORS-enabled fallback when CoinGecko is rate-limited or down.
// Uses Coinbase's public Exchange API (api.exchange.coinbase.com) — globally
// reachable (incl. the US), spot + 24h via /stats, history via /candles.

// CoinGecko id → Coinbase trading symbol. Coins not listed on Coinbase simply
// have no fallback (we keep the last-known value instead).
const COIN_SYMBOL: Record<string, string> = {
  bitcoin: "BTC", ethereum: "ETH", solana: "SOL", ripple: "XRP", cardano: "ADA",
  "avalanche-2": "AVAX", chainlink: "LINK", polkadot: "DOT", uniswap: "UNI",
  dogecoin: "DOGE", litecoin: "LTC", "matic-network": "MATIC", aave: "AAVE",
  near: "NEAR", aptos: "APT", arbitrum: "ARB", optimism: "OP", sui: "SUI",
  "injective-protocol": "INJ", cosmos: "ATOM", stellar: "XLM", pepe: "PEPE",
  "usd-coin": "USDC", tether: "USDT",
};

const CB = "https://api.exchange.coinbase.com";

async function coinbaseSpot(id: string): Promise<{ usd: number; usd_24h_change?: number } | null> {
  const sym = COIN_SYMBOL[id];
  if (!sym) return null;
  try {
    const res = await fetch(`${CB}/products/${sym}-USD/stats`, { signal: AbortSignal.timeout(7_000) });
    if (!res.ok) return null;
    const d = (await res.json()) as { last?: string; open?: string };
    const last = Number(d.last);
    const open = Number(d.open);
    if (!Number.isFinite(last)) return null;
    const usd_24h_change = Number.isFinite(open) && open > 0 ? ((last - open) / open) * 100 : undefined;
    return { usd: last, usd_24h_change };
  } catch {
    return null;
  }
}

export async function fetchSpotFromCoinbase(ids: string[]): Promise<SimplePriceMap | null> {
  const entries = await Promise.all(ids.map(async (id) => [id, await coinbaseSpot(id)] as const));
  const map: SimplePriceMap = {};
  for (const [id, v] of entries) if (v) map[id] = v;
  return Object.keys(map).length ? map : null;
}

// Coinbase caps candles at 300 per request. Pick the finest granularity that
// fits the requested window in ≤300 points.
function granularityFor(days: number): number {
  const secs = days * 86_400;
  for (const g of [300, 3600, 21_600, 86_400]) {
    if (secs / g <= 300) return g;
  }
  return 86_400;
}

export async function fetchHistoryFromCoinbase(id: string, days: number | "max"): Promise<PricePoint[] | null> {
  const sym = COIN_SYMBOL[id];
  if (!sym) return null;
  const span = days === "max" ? 300 : days;
  const g = granularityFor(span);
  // Don't request a window wider than 300 candles at this granularity.
  const cappedDays = Math.min(span, (300 * g) / 86_400);
  const end = new Date();
  const start = new Date(Date.now() - cappedDays * 86_400_000);
  try {
    const url = `${CB}/products/${sym}-USD/candles?granularity=${g}&start=${start.toISOString()}&end=${end.toISOString()}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(9_000) });
    if (!res.ok) return null;
    const rows = (await res.json()) as [number, number, number, number, number, number][];
    if (!Array.isArray(rows) || rows.length === 0) return null;
    // rows: [time(sec), low, high, open, close, volume], newest first → close price, ascending.
    return rows
      .map((r) => ({ t: r[0] * 1000, price: r[4] }))
      .sort((a, b) => a.t - b.t);
  } catch {
    return null;
  }
}
