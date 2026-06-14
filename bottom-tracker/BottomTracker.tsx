// BottomTracker.tsx — drop-in React widget for the CryptoTrackr portal.
// Computes everything client-side from the live BTC price (no backend required).
// Colors are inline constants — restyle to the portal theme / Tailwind as you like.
import { useEffect, useState } from "react";
import { computeBottomTracker, BottomTrackerState } from "./computeBottomTracker";

const C = {
  card: "#161b22", bd: "#2a2e39", fg: "#e6e6e6", mut: "#8b949e",
  acc: "#f7931a", grn: "#3fb950", red: "#f85149", blu: "#4aa3ff", amb: "#d29922", track: "#222834",
};
const fmt = (n: number) => "$" + Math.round(n).toLocaleString();
const SCALE_START = Date.UTC(2025, 5, 1), SCALE_END = Date.UTC(2027, 1, 1);
const pct = (isoDate: string) =>
  Math.max(0, Math.min(100, ((Date.parse(isoDate) - SCALE_START) / (SCALE_END - SCALE_START)) * 100));

// Prefer the portal's existing BTC price feed. Fallback to CoinGecko (CORS-enabled).
// If you hit CORS/rate limits, add a tiny cached Express route GET /api/btc-price and fetch that.
async function fetchBtcPrice(): Promise<number> {
  const r = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
  const j = await r.json();
  return j.bitcoin.usd as number;
}

export default function BottomTracker() {
  const [s, setS] = useState<BottomTrackerState | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    let on = true;
    const go = async () => {
      try { const p = await fetchBtcPrice(); if (on) setS(computeBottomTracker(p, Date.now(), "live")); }
      catch { if (on) setErr(true); }
    };
    go();
    const id = setInterval(go, 5 * 60 * 1000);
    return () => { on = false; clearInterval(id); };
  }, []);
  if (err) return <div style={{ color: C.mut }}>Cycle tracker unavailable.</div>;
  if (!s) return <div style={{ color: C.mut }}>Loading cycle tracker…</div>;

  const scenColor: Record<string, string> = { mean: C.blu, deep: C.amb, shock: C.red, shallow: C.mut };
  return (
    <div style={{ maxWidth: 760, color: C.fg, fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Bitcoin cycle-bottom tracker</div>
          <div style={{ fontSize: 12, color: C.mut }}>Satoshi clock + causal power-law spring · {s.asOf} · {s.source}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 30, fontWeight: 700 }}>{fmt(s.price)}</div>
          <div style={{ fontSize: 13, color: s.drawdownPct < 0 ? C.red : C.grn }}>{s.drawdownPct}% from peak {fmt(s.peak)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(165px,1fr))", gap: 12, margin: "16px 0" }}>
        <Card k="Clock" v={`${s.clockDays} days`} sub={`since halving · ${s.daysSinceTop}d since top`} />
        <Card k="Spring (power-law z)" v={s.spring > 0 ? `+${s.spring}` : `${s.spring}`} vColor={C.acc}
              sub={`past bottoms ${Object.values(s.pastBottomSprings).join(" / ")}`} />
        <Card k="Bottom window" v={s.daysToCenter > 0 ? `${s.daysToCenter} days` : "now"}
              sub={`${s.bottomWindow[0]} → ${s.bottomWindow[1]}`} />
      </div>

      <div style={{ fontSize: 12, color: C.mut, marginBottom: 4 }}>Timing — now (line) · top (red) · bottom window (amber)</div>
      <div style={{ position: "relative", height: 26, background: C.track, borderRadius: 8 }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${pct(s.bottomWindow[0])}%`,
          width: `${pct(s.bottomWindow[1]) - pct(s.bottomWindow[0])}%`, background: "rgba(247,147,26,.25)" }} />
        <div style={{ position: "absolute", top: -3, bottom: -3, left: `${pct(s.topDate)}%`, width: 2, background: C.red }} />
        <div style={{ position: "absolute", top: -3, bottom: -3, left: `${pct(s.asOf)}%`, width: 2, background: C.fg }} />
      </div>

      <div style={{ fontSize: 13, color: C.mut, margin: "16px 0 4px" }}>Bottom scenarios — power-law spring-implied price at the window center</div>
      <div style={{ background: C.card, border: `1px solid ${C.bd}`, borderRadius: 12, padding: "2px 14px" }}>
        {s.scenarios.map((sc, i) => (
          <div key={sc.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: i ? `1px solid ${C.bd}` : "none" }}>
            <div style={{ flex: 1 }}>{sc.label}<div style={{ fontSize: 12, color: C.mut }}>spring {sc.z}</div></div>
            <div style={{ width: 130 }}>
              <div style={{ height: 8, background: C.track, borderRadius: 5, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${sc.passed ? 100 : Math.round(sc.prob / 0.513 * 100)}%`, background: sc.passed ? "#3a3f4b" : (scenColor[sc.key] || C.blu) }} />
              </div>
            </div>
            <div style={{ width: 78, textAlign: "right", fontWeight: 600 }}>{fmt(sc.price)}</div>
            <div style={{ width: 54, textAlign: "right", fontWeight: 600, color: sc.passed ? C.mut : C.fg, fontSize: sc.passed ? 12 : 14 }}>
              {sc.passed ? "passed" : `${Math.round(sc.prob * 100)}%`}
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderLeft: `3px solid ${C.amb}`, padding: "8px 12px", marginTop: 14, background: C.card }}>
        <b>Read.</b> {s.state}. Blended expected bottom <b style={{ color: C.acc }}>{fmt(s.blendedBottom)}</b>{" "}
        (active range {fmt(s.bottomRange[0])}–{fmt(s.bottomRange[1])}), timing centered <b>{s.bottomCenter}</b>.
        Top amplitude is dying (spring {s.topSprings.join(" → ")}), so a deep crash is power-law-inconsistent.{" "}
        <span style={{ color: C.mut }}>n=3 cycles → scenario weights, not frequencies. Not financial advice.</span>
      </div>
    </div>
  );
}

function Card({ k, v, sub, vColor }: { k: string; v: string; sub: string; vColor?: string }) {
  return (
    <div style={{ background: "#161b22", border: "1px solid #2a2e39", borderRadius: 8, padding: 14 }}>
      <div style={{ fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", color: "#8b949e" }}>{k}</div>
      <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4, color: vColor || "#e6e6e6" }}>{v}</div>
      <div style={{ fontSize: 12, color: "#8b949e", marginTop: 2 }}>{sub}</div>
    </div>
  );
}
