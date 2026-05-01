export default function Slide11Watchlist() {
  const signals = [
    { name: "Pi Cycle Top Indicator", status: "Neutral", color: "#06b6d4", desc: "Moving average convergence nearing historical peak zone." },
    { name: "MVRV Z-Score", status: "Elevated", color: "#F7931A", desc: "Market value vs. realized value approaching caution territory." },
    { name: "Fear & Greed Index", status: "Greed", color: "#a855f7", desc: "Sentiment elevated — historically precedes distribution phase." },
    { name: "Hash Rate Trend", status: "Bullish", color: "#22c55e", desc: "Network security at all-time highs, supporting price floor." },
    { name: "Exchange Reserves", status: "Declining", color: "#22c55e", desc: "BTC moving off exchanges — typical accumulation behavior." },
  ];

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#0C0F1A", fontFamily: "'Inter', sans-serif", position: "relative", color: "#FFF", display: "flex", alignItems: "center", gap: "6vw" }}>
      <div style={{ position: "absolute", top: "-15vh", right: "-5vw", width: "50vw", height: "50vw", borderRadius: "50%", backgroundColor: "#06b6d4", opacity: 0.05, filter: "blur(12vw)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "4vw 4vw", opacity: 0.5, pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: "5vh", left: "5vw", display: "flex", alignItems: "center", gap: "0.8vw", zIndex: 10 }}>
        <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#F7931A", borderRadius: "0.35vw", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1vw", fontWeight: 700, color: "#0C0F1A" }}>₿</div>
        <div style={{ fontSize: "1.1vw", fontWeight: 700 }}>CryptoTrackr</div>
      </div>
      <div style={{ position: "absolute", top: "5vh", right: "5vw", fontSize: "1vw", color: "rgba(255,255,255,0.45)" }}>2026</div>
      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>BITCOIN DAILY CONSULTING, LLC.</div>
      <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)" }}>11 / 15</div>

      <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", gap: "3vh", paddingLeft: "7vw" }}>
        <div style={{ display: "inline-flex", padding: "0.5vh 1.2vw", backgroundColor: "rgba(247,147,26,0.12)", border: "1px solid rgba(247,147,26,0.3)", borderRadius: "2vw", color: "#F7931A", fontSize: "0.9vw", fontWeight: 600, alignSelf: "flex-start", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Signal Monitoring</div>
        <h2 style={{ fontSize: "4.5vw", fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
          We watch<br /><span style={{ color: "rgba(255,255,255,0.45)" }}>so you don't have to.</span>
        </h2>
        <p style={{ fontSize: "1.3vw", fontWeight: 300, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, maxWidth: "33vw", margin: 0 }}>
          Your consultant monitors 20+ on-chain metrics and market signals — and interprets them in plain language for your specific portfolio context.
        </p>
        <div style={{ display: "flex", gap: "1.5vw" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3vw", fontWeight: 900, color: "#F7931A" }}>20+</div>
            <div style={{ fontSize: "0.9vw", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Metrics tracked</div>
          </div>
          <div style={{ width: "1px", backgroundColor: "rgba(255,255,255,0.07)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3vw", fontWeight: 900, color: "#F7931A" }}>24h</div>
            <div style={{ fontSize: "0.9vw", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Response time</div>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", gap: "1.2vh", paddingRight: "7vw" }}>
        {signals.map((s, i) => (
          <div key={i} style={{ backgroundColor: "#131726", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.8vw", padding: "1.8vh 2vw", display: "flex", alignItems: "center", gap: "2vw" }}>
            <div style={{ flexShrink: 0, width: "0.8vw", height: "0.8vw", borderRadius: "50%", backgroundColor: s.color, boxShadow: `0 0 0.5vw ${s.color}88` }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "1.2vw", fontWeight: 700, marginBottom: "0.3vh" }}>{s.name}</div>
              <div style={{ fontSize: "0.95vw", fontWeight: 300, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>{s.desc}</div>
            </div>
            <div style={{ flexShrink: 0, fontSize: "0.9vw", fontWeight: 600, color: s.color, padding: "0.4vh 1vw", backgroundColor: `${s.color}18`, border: `1px solid ${s.color}44`, borderRadius: "0.4vw" }}>{s.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
