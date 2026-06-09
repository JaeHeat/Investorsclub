import { useState, useEffect, useMemo } from "react";
import {
  fetchCoinHistory, buildEquityCurve, buildGrid,
  type PricePoint, type EquityPoint,
} from "@/lib/priceHistory";
import type { HoldingAsset } from "@/lib/types";

export type ChartRange = "24H" | "1W" | "1M" | "3M" | "1Y" | "ALL";

export const CHART_RANGES: ChartRange[] = ["24H", "1W", "1M", "3M", "1Y", "ALL"];

const RANGE_DAYS: Record<ChartRange, number | "max"> = {
  "24H": 1, "1W": 7, "1M": 30, "3M": 90, "1Y": 365, ALL: "max",
};

// Reconstructs the portfolio equity curve for the selected range from each
// holding's price history. The final point is pinned to the live value so the
// curve always ends exactly at the current balance.
export function usePortfolioHistory(holdings: HoldingAsset[], range: ChartRange, currentValue: number | null) {
  const [rawPoints, setRawPoints] = useState<EquityPoint[]>([]);
  const [perCoin, setPerCoin] = useState<Record<string, PricePoint[]>>({});
  const [loading, setLoading] = useState(true);

  const ids = useMemo(() => [...new Set(holdings.map((h) => h.coingecko_id))].sort().join(","), [holdings]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const days = RANGE_DAYS[range];
    const uniqueIds = ids ? ids.split(",") : [];

    (async () => {
      const results = await Promise.all(
        uniqueIds.map(async (id) => [id, await fetchCoinHistory(id, days)] as const),
      );
      if (cancelled) return;
      const histories: Record<string, PricePoint[]> = {};
      for (const [id, series] of results) histories[id] = series;
      const grid = buildGrid(histories);
      setPerCoin(histories);
      setRawPoints(grid.length ? buildEquityCurve(holdings, histories, grid) : []);
      setLoading(false);
    })();

    return () => { cancelled = true; };
    // holdings intentionally excluded — `ids` captures the relevant change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, range]);

  // Pin the last point to the live value without re-fetching on every price tick.
  const points = useMemo(() => {
    if (!rawPoints.length) return rawPoints;
    if (currentValue == null || currentValue <= 0) return rawPoints;
    return [...rawPoints.slice(0, -1), { t: Date.now(), value: currentValue }];
  }, [rawPoints, currentValue]);

  return { points, perCoin, loading };
}
