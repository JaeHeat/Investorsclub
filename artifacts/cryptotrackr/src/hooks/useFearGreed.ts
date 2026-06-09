import { useEffect, useState } from "react";

export interface FearGreed {
  value: number; // 0–100
  classification: string; // e.g. "Extreme Fear", "Greed"
  updatedAt: Date;
}

// Live Crypto Fear & Greed Index from alternative.me — free, no API key,
// CORS-enabled, refreshed daily. This is the one cycle signal with a public
// real-time source; the on-chain metrics (MVRV/NUPL/Puell) are paywalled, so
// they stay manually-curated and clearly labelled as such.
export function useFearGreed(): { data: FearGreed | null; loading: boolean; error: boolean } {
  const [data, setData] = useState<FearGreed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("https://api.alternative.me/fng/?limit=1")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<{ data?: Array<{ value: string; value_classification: string; timestamp: string }> }>;
      })
      .then((json) => {
        const d = json?.data?.[0];
        if (!d) throw new Error("no data");
        const value = Number(d.value);
        if (!Number.isFinite(value)) throw new Error("bad value");
        if (!cancelled) {
          setData({
            value,
            classification: d.value_classification,
            updatedAt: new Date(Number(d.timestamp) * 1000),
          });
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}

export type FearGreedStatus = "healthy" | "caution" | "danger" | "fear";

// Map the 0–100 index onto the panel's status vocabulary. Low = fear = a
// historically favourable accumulation zone; high = greed = distribution risk.
export function fearGreedStatus(value: number): FearGreedStatus {
  if (value <= 45) return "fear";
  if (value <= 60) return "caution";
  if (value < 80) return "caution";
  return "danger";
}

export function fearGreedDetail(value: number): string {
  if (value <= 24)
    return "Extreme Fear — historically one of the strongest accumulation windows. Buying here and selling into Greed has outperformed most timing strategies over 12+ months.";
  if (value <= 44)
    return "Fear — holders are cautious and near break-even. Often a favourable accumulation zone, though not yet full capitulation.";
  if (value <= 55) return "Neutral — sentiment is balanced with no strong directional edge.";
  if (value <= 75) return "Greed — momentum is hot and crowds are leaning long. Trim into strength rather than chase.";
  return "Extreme Greed — euphoria. Historically a distribution / profit-taking zone, not a place to add risk.";
}
