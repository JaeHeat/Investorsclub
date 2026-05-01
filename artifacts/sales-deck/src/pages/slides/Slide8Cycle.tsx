export default function Slide8Cycle() {
  const phases = [
    { name: "Accumulation", color: "#06b6d4", pct: 25, desc: "Bitcoin consolidates near cycle lows. Smart money builds positions." },
    { name: "Markup", color: "#F7931A", pct: 35, desc: "Price trends upward. Early adopters see significant unrealized gains." },
    { name: "Distribution", color: "#a855f7", pct: 20, desc: "Institutions exit. Retail euphoria peaks. Exit signals activate." },
    { name: "Markdown", color: "#ef4444", pct: 20, desc: "Bear market sets in. Capital preservation becomes the primary goal." },
  ];

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#0C0F1A", fontFamily: "'Inter', sans-serif", position: "relative", color: "#FFF", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "absolute", top: "10vh", left: "10vw", width: "45vw", height: "45vw", borderRadius: "50%", backgroundColor: "#7C6BF0", opacity: 0.06, filter: "blur(12vw)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "4vw 4vw", opacity: 0.5, pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: "5vh", left: "5vw", display: "flex", alignItems: "center", gap: "0.8vw", zIndex: 10 }}>
        <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#F7931A", borderRadius: "0.35vw", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1vw", fontWeight: 700, color: "#0C0F1A" }}>₿</div>
        <div style={{ fontSize: "1.1vw", fontWeight: 700 }}>CryptoTrackr</div>
      </div>
      <div style={{ position: "absolute", top: "5vh", right: "5vw", fontSize: "1vw", color: "rgba(255,255,255,0.45)" }}>2026</div>
      <div style={{ position: "absolute", bottom: "5vh", left: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>BITCOIN DAILY ADVISORY, LLC.</div>
      <div style={{ position: "absolute", bottom: "5vh", right: "5vw", fontSize: "0.85vw", color: "rgba(255,255,255,0.35)" }}>08 / 15</div>

      <div style={{ position: "relative", zIndex: 10, width: "82vw" }}>
        <div style={{ textAlign: "center", marginBottom: "5vh" }}>
          <div style={{ display: "inline-flex", padding: "0.5vh 1.2vw", backgroundColor: "rgba(247,147,26,0.12)", border: "1px solid rgba(247,147,26,0.3)", borderRadius: "2vw", color: "#F7931A", fontSize: "0.9vw", fontWeight: 600, marginBottom: "2vh", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>The Bitcoin Cycle</div>
          <h2 style={{ fontSize: "4.5vw", fontWeight: 800, margin: 0, lineHeight: 1.1, letterSpacing: "-0.03em" }}>Four phases.<br /><span style={{ color: "rgba(255,255,255,0.45)" }}>Four different strategies.</span></h2>
        </div>

        <div style={{ display: "flex", gap: "0", borderRadius: "1vw", overflow: "hidden", marginBottom: "3vh", height: "1vh" }}>
          {phases.map((p, i) => (
            <div key={i} style={{ flex: p.pct, backgroundColor: p.color, opacity: 0.8 }} />
          ))}
        </div>

        <div style={{ display: "flex", gap: "2vw" }}>
          {phases.map((p, i) => (
            <div key={i} style={{ flex: 1, backgroundColor: "#131726", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.8vw", padding: "2.5vh 1.8vw", borderTop: `3px solid ${p.color}` }}>
              <div style={{ fontSize: "0.9vw", fontWeight: 700, color: p.color, marginBottom: "1vh", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Phase {i + 1}</div>
              <h3 style={{ fontSize: "1.5vw", fontWeight: 700, margin: "0 0 1.2vh 0" }}>{p.name}</h3>
              <p style={{ fontSize: "1.1vw", fontWeight: 300, color: "rgba(255,255,255,0.55)", lineHeight: 1.55, margin: 0 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
