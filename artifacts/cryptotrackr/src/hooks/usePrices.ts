import { useState, useEffect } from "react";
import { fetchSimplePrices } from "@/lib/priceFeed";

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

    let cancelled = false;

    async function fetchPrices() {
      const data = await fetchSimplePrices(coinIds);
      if (cancelled || !data) {
        setLoading(false);
        return;
      }
      const priceResult: Record<string, number> = {};
      const changeResult: Record<string, number> = {};
      for (const id of coinIds) {
        if (data[id]?.usd) priceResult[id] = data[id].usd;
        if (data[id]?.usd_24h_change != null) changeResult[id] = data[id].usd_24h_change!;
      }
      setPrices(priceResult);
      setChanges24h(changeResult);
      setLoading(false);
    }

    fetchPrices();
    const interval = setInterval(fetchPrices, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [coinIds.join(",")]);

  return { prices, changes24h, loading };
}
