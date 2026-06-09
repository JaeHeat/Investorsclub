// Historical price series for reconstructing a portfolio equity curve (the way
// Delta and other pro trackers do it). Tries the server proxy first, then falls
// back to calling CoinGecko's market_chart endpoint directly.

export interface PricePoint {
  t: number; // ms epoch
  price: number;
}

async function tryHistory(url: string): Promise<[number, number][] | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(9_000), credentials: "same-origin" });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) return null; // dev SPA fallback returns HTML
    const data = (await res.json()) as { prices?: unknown };
    return Array.isArray(data.prices) ? (data.prices as [number, number][]) : null;
  } catch {
    return null;
  }
}

export async function fetchCoinHistory(id: string, days: number | "max"): Promise<PricePoint[]> {
  const d = String(days);
  const viaProxy = await tryHistory(`/api/history?id=${encodeURIComponent(id)}&days=${d}`);
  const interval = (typeof days === "number" && days > 90) ? "&interval=daily" : "";
  const raw =
    viaProxy ??
    (await tryHistory(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${d}${interval}`));
  if (raw) return raw.map(([t, price]) => ({ t, price }));

  // Last resort: Coinbase candles (no key) for the listed majors.
  const { fetchHistoryFromCoinbase } = await import("./priceFallback");
  return (await fetchHistoryFromCoinbase(id, days)) ?? [];
}

// Last price at-or-before t (step lookup). Series must be ascending by t.
export function priceAt(series: PricePoint[], t: number): number | null {
  if (series.length === 0) return null;
  let lo = 0;
  let hi = series.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (series[mid].t <= t) { ans = mid; lo = mid + 1; } else hi = mid - 1;
  }
  return ans === -1 ? series[0].price : series[ans].price;
}

export interface EquityPoint {
  t: number;
  value: number;
}

interface HoldingLite {
  coingecko_id: string;
  amount: number;
  avg_cost: number;
  manual_price?: number;
}

export function buildEquityCurve(
  holdings: HoldingLite[],
  histories: Record<string, PricePoint[]>,
  grid: number[],
): EquityPoint[] {
  return grid.map((t) => ({
    t,
    value: holdings.reduce((sum, h) => {
      const series = histories[h.coingecko_id];
      const p = series && series.length ? priceAt(series, t) : null;
      const px = p ?? h.manual_price ?? h.avg_cost;
      return sum + h.amount * (px ?? 0);
    }, 0),
  }));
}

// Evenly-spaced shared time grid across the available histories (~120 points).
export function buildGrid(histories: Record<string, PricePoint[]>, points = 120): number[] {
  let min = Infinity;
  let max = -Infinity;
  for (const s of Object.values(histories)) {
    if (s.length) {
      min = Math.min(min, s[0].t);
      max = Math.max(max, s[s.length - 1].t);
    }
  }
  if (!isFinite(min) || !isFinite(max) || max <= min) return [];
  const step = (max - min) / (points - 1);
  return Array.from({ length: points }, (_, i) => Math.round(min + i * step));
}
