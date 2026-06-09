// Shared CoinGecko upstream fetch. When COINGECKO_API_KEY is set it attaches
// the demo-tier key header, which lifts the strict anonymous rate limits that
// otherwise throttle price/history under real client load. Without a key it
// falls back to the public endpoint (and the proxies still cache + serve stale).
export function cgFetch(url: string, timeoutMs: number): Promise<Response> {
  const key = process.env.COINGECKO_API_KEY;
  const headers: Record<string, string> = { accept: "application/json" };
  if (key) headers["x-cg-demo-api-key"] = key;
  return fetch(url, { headers, signal: AbortSignal.timeout(timeoutMs) });
}
