export default function Slide9ExitStrategy() {
  const tranches = [
    { phase: "Tranche 1", trigger: "BTC +80% from your cost basis", action: "Sell 10% of position", color: "#F7931A" },
    { phase: "Tranche 2", trigger: "BTC 2× from your cost basis", action: "Sell additional 15%", color: "#F7931A" },
    { phase: "Tranche 3", trigger: "Momentum indicators peak", action: "Sell 25% — move to stablecoins", color: "#a855f7" },
    { phase: "Tranche 4", trigger: "Cycle top signals confirmed", action: "Liquidate remaining 50%", color: "#ef4444" },
  ];

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#0C0F1A", fontFamily: "'Inter', sans-serif", position: "relative", color: "#FFF", display: "flex", alignItems: "center", gap: "6vw" }}>
      <div style={{ position: "absolute", top: "-10vh", right: "-5vw", width: "50vw", height: "50vw", borderRadius: "50%", backgroundColor: "#a855f7", opacity: 0.06, filter: "blur(12vw)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "4vw 4vw", opacity: 0.5, pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: "5vh", left: "5vw", display: "flex", alignItems: "center", gap: "0.8vw", zIndex: 10 }}>
        <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#F7931A", borderRadius: "0.35vw", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1vw", fontWeight: 700, color: "#0C0F1A" }}>₿</div>
        <div style={{ fontSize: "1.1vw", fontWeight: 700 }}>CryptoTrackr</div>
      </div>
      <div style={{ position: "absolute", top: "5vh", right: "5vw", fontSize: "1vw", color: "rgba(255,255,255,0.45)" }}>2026</div>
      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>BITCOIN DAILY CONSULTING, LLC.</div>
      <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)" }}>07 / 12</div>

      <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", gap: "3vh", paddingLeft: "7vw" }}>
        <div style={{ display: "inline-flex", padding: "0.5vh 1.2vw", backgroundColor: "rgba(247,147,26,0.12)", border: "1px solid rgba(247,147,26,0.3)", borderRadius: "2vw", color: "#F7931A", fontSize: "0.9vw", fontWeight: 600, alignSelf: "flex-start", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Your Exit Plan</div>
        <h2 style={{ fontSize: "4.5vw", fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
          Selling at<br /><span style={{ color: "rgba(255,255,255,0.45)" }}>the right time.</span>
        </h2>
        <p style={{ fontSize: "1.3vw", fontWeight: 300, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, maxWidth: "33vw", margin: 0 }}>
          We build your tranche-based exit strategy together — so you capture cycle highs without making emotional decisions in the heat of a bull run.
        </p>
      </div>

      <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", gap: "1.5vh", paddingRight: "7vw" }}>
        {tranches.map((t, i) => (
          <div key={i} style={{ backgroundColor: "#131726", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.8vw", padding: "2vh 2vw", display: "flex", alignItems: "center", gap: "2vw", borderLeft: `3px solid ${t.color}` }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontSize: "0.85vw", fontWeight: 700, color: t.color, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "0.4vh" }}>{t.phase}</div>
              <div style={{ fontSize: "1.2vw", fontWeight: 700 }}>{t.action}</div>
            </div>
            <div style={{ width: "1px", height: "3vh", backgroundColor: "rgba(255,255,255,0.07)", flexShrink: 0 }} />
            <div style={{ fontSize: "1.1vw", fontWeight: 300, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>Trigger: {t.trigger}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
