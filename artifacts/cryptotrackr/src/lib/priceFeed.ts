// Unified price fetch: prefer the server-side proxy (/api/prices, cached and
// rate-limit-friendly), and fall back to calling CoinGecko directly when the
// backend isn't reachable (e.g. local dev with no API server). The proxy and
// CoinGecko share the same response shape, so callers don't care which won.

export interface SimplePrice {
  usd: number;
  usd_24h_change?: number;
}
export type SimplePriceMap = Record<string, SimplePrice>;

async function tryFetch(url: string, timeoutMs: number): Promise<SimplePriceMap | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), credentials: "same-origin" });
    if (!res.ok) return null;
    // A dev server's SPA fallback answers /api/prices with index.html (200);
    // the content-type guard rejects that so we cleanly fall through.
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return null;
    const data = (await res.json()) as unknown;
    if (!data || typeof data !== "object") return null;
    return data as SimplePriceMap;
  } catch {
    return null;
  }
}

export async function fetchSimplePrices(ids: string[]): Promise<SimplePriceMap | null> {
  if (ids.length === 0) return {};
  const list = encodeURIComponent(ids.join(","));

  const viaProxy = await tryFetch(`/api/prices?ids=${list}`, 8_000);
  if (viaProxy && ids.some((id) => viaProxy[id])) return viaProxy;

  const direct = await tryFetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${list}&vs_currencies=usd&include_24hr_change=true`,
    8_000,
  );
  if (direct && ids.some((id) => direct[id])) return direct;

  // Last resort: Coinbase (no key, no rate-limit issues) for the listed majors.
  const { fetchSpotFromCoinbase } = await import("./priceFallback");
  return fetchSpotFromCoinbase(ids);
}
