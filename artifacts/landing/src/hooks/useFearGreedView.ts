import { useEffect, useState } from "react";

export interface FearGreedView {
  value: number; // 0–100
  classification: string;
  zone: string;
  color: string;
  status: string;
  conviction: string;
}

// Maps the live Fear & Greed reading onto the marketing cycle-widget vocabulary.
function mapZone(v: number): Omit<FearGreedView, "value" | "classification"> {
  if (v <= 24) return { zone: "Accumulation Zone", color: "#34d399", status: "Buy", conviction: "High" };
  if (v <= 44) return { zone: "Accumulation Zone", color: "#34d399", status: "Buy", conviction: "Medium" };
  if (v <= 55) return { zone: "Neutral Range", color: "#fbbf24", status: "Hold", conviction: "Low" };
  if (v <= 74) return { zone: "Distribution Watch", color: "#fb923c", status: "Trim", conviction: "Medium" };
  return { zone: "Euphoria / Distribution", color: "#f87171", status: "Sell", conviction: "High" };
}

// Live Crypto Fear & Greed Index (alternative.me — free, no key, CORS-enabled).
// Returns null until loaded so the widget can show its static default first.
export function useFearGreedView(): FearGreedView | null {
  const [view, setView] = useState<FearGreedView | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("https://api.alternative.me/fng/?limit=1")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad response"))))
      .then((j: { data?: Array<{ value: string; value_classification: string }> }) => {
        const d = j?.data?.[0];
        const value = Number(d?.value);
        if (!d || !Number.isFinite(value)) return;
        if (!cancelled) setView({ value, classification: d.value_classification, ...mapZone(value) });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return view;
}
