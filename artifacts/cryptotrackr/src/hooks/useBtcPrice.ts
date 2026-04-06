import { useState, useEffect } from "react";

export function useBtcPrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        );
        const data = await res.json();
        setPrice(data.bitcoin.usd);
      } catch {
        setError("Failed to fetch BTC price");
      } finally {
        setLoading(false);
      }
    }

    fetchPrice();
    const interval = setInterval(fetchPrice, 60_000);
    return () => clearInterval(interval);
  }, []);

  return { price, loading, error };
}
