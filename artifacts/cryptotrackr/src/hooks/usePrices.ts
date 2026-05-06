import { useState, useEffect } from "react";

export function usePrices(coinIds: string[]): {
  prices: Record<string, number>;
  changes24h: Record<string, number>;
  loading: boolean;
} {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [changes24h, setChanges24h] = useState<Record<string, number>>({});
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
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (!res.ok) return;
        const data = await res.json();
        const priceResult: Record<string, number> = {};
        const changeResult: Record<string, number> = {};
        for (const id of coinIds) {
          if (data[id]?.usd) priceResult[id] = data[id].usd;
          if (data[id]?.usd_24h_change != null) changeResult[id] = data[id].usd_24h_change;
        }
        setPrices(priceResult);
        setChanges24h(changeResult);
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

  return { prices, changes24h, loading };
}
