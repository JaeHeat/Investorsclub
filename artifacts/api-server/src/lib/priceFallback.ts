// Free, no-key fallback when CoinGecko fails (rate limit / outage). Uses
// Coinbase's public Exchange API. Returns CoinGecko-shaped data so the proxies
// can serve it transparently. Cached upstream by the proxy.

const COIN_SYMBOL: Record<string, string> = {
  bitcoin: "BTC", ethereum: "ETH", solana: "SOL", ripple: "XRP", cardano: "ADA",
  "avalanche-2": "AVAX", chainlink: "LINK", polkadot: "DOT", uniswap: "UNI",
  dogecoin: "DOGE", litecoin: "LTC", "matic-network": "MATIC", aave: "AAVE",
  near: "NEAR", aptos: "APT", arbitrum: "ARB", optimism: "OP", sui: "SUI",
  "injective-protocol": "INJ", cosmos: "ATOM", stellar: "XLM", pepe: "PEPE",
  "usd-coin": "USDC", tether: "USDT",
};

const CB = "https://api.exchange.coinbase.com";
const UA = "BitcoinDaily/1.0";

interface SpotEntry { usd: number; usd_24h_change?: number }

async function spotOne(id: string, timeoutMs: number): Promise<SpotEntry | null> {
  const sym = COIN_SYMBOL[id];
  if (!sym) return null;
  try {
    const res = await fetch(`${CB}/products/${sym}-USD/stats`, {
      headers: { "user-agent": UA, accept: "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    const d = (await res.json()) as { last?: string; open?: string };
    const last = Number(d.last);
    const open = Number(d.open);
    if (!Number.isFinite(last)) return null;
    return { usd: last, usd_24h_change: Number.isFinite(open) && open > 0 ? ((last - open) / open) * 100 : undefined };
  } catch {
    return null;
  }
}

export async function coinbaseSpot(ids: string[], timeoutMs = 7_000): Promise<Record<string, SpotEntry> | null> {
  const entries = await Promise.all(ids.map(async (id) => [id, await spotOne(id, timeoutMs)] as const));
  const out: Record<string, SpotEntry> = {};
  for (const [id, v] of entries) if (v) out[id] = v;
  return Object.keys(out).length ? out : null;
}

function granularityFor(days: number): number {
  const secs = days * 86_400;
  for (const g of [300, 3600, 21_600, 86_400]) if (secs / g <= 300) return g;
  return 86_400;
}

// Returns CoinGecko-style [ [ms, price], ... ] ascending, or null.
export async function coinbaseHistory(id: string, days: number, timeoutMs = 9_000): Promise<[number, number][] | null> {
  const sym = COIN_SYMBOL[id];
  if (!sym) return null;
  const g = granularityFor(days);
  const cappedDays = Math.min(days, (300 * g) / 86_400);
  const end = new Date();
  const start = new Date(Date.now() - cappedDays * 86_400_000);
  try {
    const url = `${CB}/products/${sym}-USD/candles?granularity=${g}&start=${start.toISOString()}&end=${end.toISOString()}`;
    const res = await fetch(url, { headers: { "user-agent": UA, accept: "application/json" }, signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    const rows = (await res.json()) as [number, number, number, number, number, number][];
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows.map((r) => [r[0] * 1000, r[4]] as [number, number]).sort((a, b) => a[0] - b[0]);
  } catch {
    return null;
  }
}
