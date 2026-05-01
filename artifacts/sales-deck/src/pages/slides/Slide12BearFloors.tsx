export default function Slide12BearFloors() {
  const scenarios = [
    { label: "Bear Floor", name: "Already Bottomed", price: "$74,500", drop: "-41% from ATH", color: "#06b6d4", badge: "Floor confirmed", note: "Cycle bottom established. Accumulation phase active." },
    { label: "Mild Bear", name: "Soft Landing", price: "$62,000", drop: "-51% from ATH", color: "#22c55e", badge: "Possible", note: "Orderly correction with healthy on-chain demand." },
    { label: "Standard Bear", name: "Historical Average", price: "$48,000", drop: "-62% from ATH", color: "#F7931A", badge: "Base case", note: "Aligns with 2017-style correction. Full cycle reset." },
    { label: "Deep Bear", name: "Capitulation", price: "$28,000", drop: "-78% from ATH", color: "#ef4444", badge: "Tail risk", note: "Black swan event required. Full position protection mode." },
  ];

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#0C0F1A", fontFamily: "'Inter', sans-serif", position: "relative", color: "#FFF", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "absolute", bottom: "-10vh", left: "-5vw", width: "50vw", height: "50vw", borderRadius: "50%", backgroundColor: "#ef4444", opacity: 0.05, filter: "blur(12vw)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "4vw 4vw", opacity: 0.5, pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: "5vh", left: "5vw", display: "flex", alignItems: "center", gap: "0.8vw", zIndex: 10 }}>
        <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#F7931A", borderRadius: "0.35vw", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1vw", fontWeight: 700, color: "#0C0F1A" }}>₿</div>
        <div style={{ fontSize: "1.1vw", fontWeight: 700 }}>CryptoTrackr</div>
      </div>
      <div style={{ position: "absolute", top: "5vh", right: "5vw", fontSize: "1vw", color: "rgba(255,255,255,0.45)" }}>2026</div>
      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>BITCOIN DAILY ADVISORY, LLC.</div>
      <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)" }}>12 / 15</div>

      <div style={{ position: "relative", zIndex: 10, width: "82vw" }}>
        <div style={{ textAlign: "center", marginBottom: "4vh" }}>
          <div style={{ display: "inline-flex", padding: "0.5vh 1.2vw", backgroundColor: "rgba(247,147,26,0.12)", border: "1px solid rgba(247,147,26,0.3)", borderRadius: "2vw", color: "#F7931A", fontSize: "0.9vw", fontWeight: 600, marginBottom: "2vh", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Bear Scenario Analysis</div>
          <h2 style={{ fontSize: "4.5vw", fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: "-0.03em" }}>Plan for every<br /><span style={{ color: "rgba(255,255,255,0.45)" }}>downside scenario.</span></h2>
        </div>
        <div style={{ display: "flex", gap: "2vw" }}>
          {scenarios.map((s, i) => (
            <div key={i} style={{ flex: 1, backgroundColor: "#131726", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1vw", padding: "2.5vh 1.8vw", borderTop: `3px solid ${s.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2vh" }}>
                <div style={{ fontSize: "0.85vw", fontWeight: 700, color: s.color, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>{s.label}</div>
                <div style={{ fontSize: "0.8vw", fontWeight: 600, color: s.color, padding: "0.3vh 0.8vw", backgroundColor: `${s.color}18`, border: `1px solid ${s.color}44`, borderRadius: "0.3vw" }}>{s.badge}</div>
              </div>
              <div style={{ fontSize: "1.4vw", fontWeight: 700, marginBottom: "0.5vh" }}>{s.name}</div>
              <div style={{ fontSize: "2.5vw", fontWeight: 900, color: s.color, marginBottom: "0.5vh" }}>{s.price}</div>
              <div style={{ fontSize: "1vw", fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: "1.5vh" }}>{s.drop}</div>
              <p style={{ fontSize: "1.05vw", fontWeight: 300, color: "rgba(255,255,255,0.45)", lineHeight: 1.55, margin: 0 }}>{s.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
