import { useState, useEffect } from "react";

// Fetches live USD prices for an arbitrary list of CoinGecko coin IDs.
// Returns a Record<coingecko_id, usd_price>. Refreshes every 60s.
export function usePrices(coinIds: string[]): {
  prices: Record<string, number>;
  loading: boolean;
} {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (coinIds.length === 0) {
      setLoading(false);
      return;
    }

    const ids = coinIds.join(",");

    async function fetchPrices() {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (!res.ok) return;
        const data = await res.json();
        const result: Record<string, number> = {};
        for (const id of coinIds) {
          if (data[id]?.usd) result[id] = data[id].usd;
        }
        setPrices(result);
      } catch {
        // silently keep last known prices
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
    const interval = setInterval(fetchPrices, 60_000);
    return () => clearInterval(interval);
  }, [coinIds.join(",")]);

  return { prices, loading };
}
