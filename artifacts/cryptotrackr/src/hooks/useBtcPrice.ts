import { useState, useEffect } from "react";
import { fetchSimplePrices } from "@/lib/priceFeed";

export function useBtcPrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPrice() {
      const data = await fetchSimplePrices(["bitcoin"]);
      if (cancelled) return;
      if (data?.bitcoin?.usd != null) {
        setPrice(data.bitcoin.usd);
        setError(null);
      } else {
        setError("Failed to fetch BTC price");
      }
      setLoading(false);
    }

    fetchPrice();
    const interval = setInterval(fetchPrice, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { price, loading, error };
}
